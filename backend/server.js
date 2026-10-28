import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import AdmZip from 'adm-zip';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { 
  connectToMongoDB, 
  isDbConnected, 
  EmployeeModel, 
  QuestionModel, 
  ExamResultModel, 
  SavedPdfModel,
  syncAtlasToLocalDisk
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initiate MongoDB Atlas cloud connection (with local fallback) and rotate/migrate keys
connectToMongoDB()
  .then(() => migratePlainPasswordsToEncrypted())
  .catch(err => console.error('MongoDB Atlas init error:', err));

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const LEGACY_ENCRYPTION_KEY = crypto.createHash('sha256').update('mivhanan_salt_key_2026_industrial').digest();
const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET
  ? crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET).digest()
  : LEGACY_ENCRYPTION_KEY;

if (!process.env.JWT_SECRET || !process.env.ENCRYPTION_SECRET) {
  console.warn('⚠️ Warning: JWT_SECRET or ENCRYPTION_SECRET is not set in .env! Configure them in production environment variables.');
}

// Security Headers & Express hardening (SEC-13: Tailored Content-Security-Policy)
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.disable('x-powered-by');

// Restrict CORS origins (SEC-10)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5000,http://127.0.0.1:5000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin / server-to-server requests (!origin) or explicitly whitelisted origins
    if (!origin || allowedOrigins.includes(origin) || /\.onrender\.com$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('חסום על ידי מדיניות האבטחה (CORS)'));
  },
  credentials: true
}));

// Rate Limiting (Brute-Force & DoS Protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 login attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'בוצעו יותר מדי ניסיונות התחברות. אנא המתן מספר דקות ונסה שוב.'
  }
});

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 600, // max 600 requests per IP per 5 min
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// -------------------------------------------------------------
// Security & Cryptography Helper Utilities
// -------------------------------------------------------------

// Constant-time string comparison (SEC-11: Prevents Timing Side-Channel Attacks)
export function safeCompareStrings(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB) && a.length === b.length;
}

// Helper to attempt AES-256-GCM decryption with a specific key
function tryDecryptWithKey(cipherText, keyBuffer) {
  const parts = String(cipherText).trim().split(':');
  if (parts.length !== 4 || parts[0] !== 'enc') return null;
  try {
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const encryptedText = parts[3];
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

// AES-256-GCM Password Encryption (always encrypts with current ENCRYPTION_KEY)
export function encryptPassword(plainText) {
  if (!plainText) return '';
  const str = String(plainText).trim();
  if (str.startsWith('enc:')) {
    // If already encrypted with current key, keep it; if encrypted with legacy key, re-encrypt with current key
    if (tryDecryptWithKey(str, ENCRYPTION_KEY) !== null) return str;
    const legacyPlain = tryDecryptWithKey(str, LEGACY_ENCRYPTION_KEY);
    if (legacyPlain === null) return str;
    return encryptPassword(legacyPlain);
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(str, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

// AES-256-GCM Password Decryption (supports current key + transparent legacy key fallback)
export function decryptPassword(cipherText) {
  if (!cipherText) return '';
  const str = String(cipherText).trim();
  if (!str.startsWith('enc:')) return str; // fallback for plain text
  const currentDecrypted = tryDecryptWithKey(str, ENCRYPTION_KEY);
  if (currentDecrypted !== null) return currentDecrypted;
  const legacyDecrypted = tryDecryptWithKey(str, LEGACY_ENCRYPTION_KEY);
  if (legacyDecrypted !== null) return legacyDecrypted;
  return '—';
}

// Compare user-supplied password with stored password in constant time
export function verifyPassword(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) return false;
  const decrypted = decryptPassword(storedPassword);
  if (!decrypted || decrypted === '—') return false;
  return safeCompareStrings(decrypted, String(inputPassword).trim());
}

// Generate cryptographically strong employee password (SEC-11)
export function generateSecureEmployeePassword() {
  const prefixes = ['Miv', 'Sec', 'Aut', 'Pro', 'Con', 'Saf', 'Tek', 'Ctl', 'Ind', 'Opt'];
  const specials = ['!', '#', '$', '@', '&'];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const prefix = prefixes[crypto.randomInt(0, prefixes.length)];
  const s1 = specials[crypto.randomInt(0, specials.length)];
  const s2 = specials[crypto.randomInt(0, specials.length)];
  let mid = '';
  for (let i = 0; i < 6; i++) {
    mid += chars[crypto.randomInt(0, chars.length)];
  }
  return `${prefix}${s1}${mid}${s2}`;
}

// HTML Entity Escaping (Prevents Stored & Reflected XSS)
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// CSV Cell Sanitization (Neutralizes CSV Formula Injection CWE-1236)
export function sanitizeCsvCell(val) {
  let str = String(val === null || val === undefined ? '' : val);
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'` + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

// Safe PDF Path Resolver (Neutralizes Path Traversal CWE-22)
export function getSafePdfPath(id) {
  if (!id) return null;
  const safeId = path.basename(String(id).trim()).replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeId) return null;
  const resolvedBase = path.resolve(SAVED_EXAMS_PDF_DIR);
  const resolvedTarget = path.resolve(SAVED_EXAMS_PDF_DIR, `${safeId}.pdf`);
  if (!resolvedTarget.startsWith(resolvedBase)) return null;
  return { safeId, targetPath: resolvedTarget };
}

// SVG Content Validator (SEC-08: Strict multi-vector XSS & XML entity blocker for SVG uploads)
export function validateSvgContent(bufferOrString) {
  const text = typeof bufferOrString === 'string' ? bufferOrString : bufferOrString.toString('utf8');
  const dangerousPatterns = [
    /<\s*script\b/i,
    /<\s*foreignObject\b/i,
    /<\s*iframe\b/i,
    /<\s*embed\b/i,
    /<\s*object\b/i,
    /<\s*applet\b/i,
    /<\s*meta\b/i,
    /<\s*link\b/i,
    /<\s*set\b/i,
    /<\s*animate\w*\b/i,
    /<!ENTITY\b/i,
    /\bon[a-z]+\s*=/i,
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /data\s*:\s*text\/html/i,
    /data\s*:\s*image\/svg\+xml/i,
    /&#x0*[0-9a-f]+;?/i
  ];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      throw new Error('קובץ SVG מכיל קוד סקריפט או רכיב פעיל לא מורשה ונחסם מטעמי אבטחה');
    }
  }
  return true;
}

// -------------------------------------------------------------
// Authentication & Authorization Middleware (JWT)
// -------------------------------------------------------------
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null) || req.query.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'נדרשת הזדהות במערכת (טוקן חסר)' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'תוקף ההתחברות פג או שהטוקן אינו תקין' });
    }
    req.user = user;
    next();
  });
}

export function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'גישה נדחתה: פעולה זו מורשית למנהל מערכת בלבד' });
    }
    next();
  });
}

// Ensure upload directory exists
const QUESTIONS_IMAGES_DIR = path.join(__dirname, 'public/images/questions');
const FRONTEND_IMAGES_DIR = path.join(__dirname, '../frontend/public/images/questions');

if (!fs.existsSync(QUESTIONS_IMAGES_DIR)) {
  fs.mkdirSync(QUESTIONS_IMAGES_DIR, { recursive: true });
}

// Ensure saved exams PDF directory exists
const SAVED_EXAMS_PDF_DIR = path.join(__dirname, 'data/saved_exams_pdf');
if (!fs.existsSync(SAVED_EXAMS_PDF_DIR)) {
  fs.mkdirSync(SAVED_EXAMS_PDF_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, QUESTIONS_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\u0590-\u05FF-]/g, '_');
    const safeName = `q_upload_${Date.now()}_${cleanBase}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedExts = /^(jpeg|jpg|png|webp|svg|gif)$/;
    const allowedMimes = /^image\/(jpeg|jpg|png|webp|svg\+xml|gif)$/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype;
    if (allowedExts.test(ext) && allowedMimes.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('סוג קובץ לא נתמך. נא להעלות תמונה תקינה מסוג JPG, PNG, WebP, SVG בלבד.'));
    }
  }
});

// Multer config for ZIP restore upload
const TEMP_UPLOADS_DIR = path.join(__dirname, 'data/temp_uploads');
if (!fs.existsSync(TEMP_UPLOADS_DIR)) {
  fs.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
}

const zipUpload = multer({
  dest: TEMP_UPLOADS_DIR,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Serve static images with strict sandbox CSP header (SEC-08)
app.use('/images', (req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}, express.static(path.join(__dirname, 'public/images')));

// Health check endpoint (for keep-alive pings and status inspection)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    database: isDbConnected() ? 'connected (MongoDB Atlas)' : 'local JSON fallback'
  });
});

const EMPLOYEES_FILE = path.join(__dirname, 'data/employees.json');
const QUESTIONS_FILE = path.join(__dirname, 'data/questions.json');
const RESULTS_FILE = path.join(__dirname, 'data/exam_results.json');

// In-memory last-known-good JSON cache & serialized MongoDB sync queues (SEC-01 & SEC-12)
const jsonMemoryCache = new Map();
const corruptedFiles = new Set();
const syncQueues = new Map();

function enqueueCloudSync(key, taskFn) {
  const prev = syncQueues.get(key) || Promise.resolve();
  const next = prev.then(() => taskFn()).catch(err => {
    console.error(`Atlas sync error (${key}):`, err.message);
  });
  syncQueues.set(key, next);
}

async function atomicCollectionSync(Model, data) {
  if (!Array.isArray(data)) return;
  const validItems = data.filter(item => item && item.id);
  const validIds = validItems.map(item => item.id);

  if (validItems.length > 0) {
    const ops = validItems.map(item => ({
      replaceOne: {
        filter: { id: item.id },
        replacement: item,
        upsert: true
      }
    }));
    await Model.bulkWrite(ops, { ordered: false });
    await Model.deleteMany({ id: { $nin: validIds } });
  } else {
    await Model.deleteMany({});
  }
}

// Helper to read JSON file safely with corruption recovery (SEC-01)
const readJson = (filePath, fallback = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      jsonMemoryCache.set(filePath, fallback);
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '').trim();
    const parsed = JSON.parse(raw);
    corruptedFiles.delete(filePath);
    jsonMemoryCache.set(filePath, parsed);
    return parsed;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    corruptedFiles.add(filePath);
    if (jsonMemoryCache.has(filePath)) {
      console.warn(`⚠️ Using cached in-memory state for corrupted file ${path.basename(filePath)}`);
      return jsonMemoryCache.get(filePath);
    }
    return fallback;
  }
};

// Helper to write JSON file atomically and synchronize safely to MongoDB Atlas (SEC-01 & SEC-12)
const writeJson = (filePath, data) => {
  try {
    // Guard against accidentally wiping Employees or Questions with an empty array due to a prior read error
    if ((filePath === EMPLOYEES_FILE || filePath === QUESTIONS_FILE) && Array.isArray(data) && data.length === 0) {
      if (corruptedFiles.has(filePath) || (fs.existsSync(filePath) && fs.statSync(filePath).size > 50)) {
        console.error(`🛑 Blocked destructive empty write to ${path.basename(filePath)} to prevent data loss!`);
        return false;
      }
    }

    const serialized = JSON.stringify(data, null, 2);
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, serialized, 'utf-8');
    fs.renameSync(tempPath, filePath);

    corruptedFiles.delete(filePath);
    jsonMemoryCache.set(filePath, data);

    // Serialized Atomic Cloud Sync to MongoDB Atlas
    if (isDbConnected()) {
      if (filePath === EMPLOYEES_FILE) {
        enqueueCloudSync('employees', () => atomicCollectionSync(EmployeeModel, data));
      } else if (filePath === QUESTIONS_FILE) {
        enqueueCloudSync('questions', () => atomicCollectionSync(QuestionModel, data));
      } else if (filePath === RESULTS_FILE) {
        enqueueCloudSync('results', () => atomicCollectionSync(ExamResultModel, data));
      }
    }
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

// Cryptographically strong shuffle array utility (Fisher-Yates with crypto.randomInt)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatDateHe(dateInput) {
  if (!dateInput) return '';
  try {
    const parts = String(dateInput).trim().split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return String(dateInput);
  } catch (e) {
    return String(dateInput);
  }
}

// -------------------------------------------------------------
// Helper: Check Exam Eligibility based on 4-Month Schedule Window
// -------------------------------------------------------------
function checkExamEligibility(employee) {
  if (!employee) {
    return { canTakeExam: false, reason: 'NOT_FOUND', message: 'עובד לא נמצא במערכת' };
  }

  if (employee.isAdmin) {
    return { 
      canTakeExam: false, 
      reason: 'ADMIN_USER', 
      message: 'מנהל מערכת אינו נדרש לבצע מבחנים תקופתיים.' 
    };
  }

  if (!employee.nextExamDate || String(employee.nextExamDate).trim() === '') {
    return {
      canTakeExam: false,
      reason: 'NO_SCHEDULED_EXAM',
      message: 'אין עבורך מבחן מתוזמן במערכת. יש לפנות למנהל לתיאום מועד מבחן.'
    };
  }

  const parts = String(employee.nextExamDate).trim().split('-');
  if (parts.length !== 3) {
    return {
      canTakeExam: false,
      reason: 'INVALID_DATE',
      message: 'מועד המבחן המתוזמן אינו תקין. יש לפנות למנהל המערכת.'
    };
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const target = new Date(year, month, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Difference in calendar days
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Exam window opens 30 days (1 month) before the scheduled target date
  const windowOpenDate = new Date(target);
  windowOpenDate.setDate(windowOpenDate.getDate() - 30);

  const targetDateFormatted = target.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const windowOpenDateFormatted = windowOpenDate.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // If more than 30 days before the scheduled date: cannot take exam yet
  if (diffDays > 30) {
    const daysUntilOpen = diffDays - 30;
    return {
      canTakeExam: false,
      reason: 'TOO_EARLY',
      nextExamDate: employee.nextExamDate,
      targetDateFormatted,
      windowOpenDate: windowOpenDate.toISOString().split('T')[0],
      windowOpenDateFormatted,
      diffDays,
      daysUntilOpen,
      message: `המבחן שלך מתוזמן לתאריך ${targetDateFormatted}. חלון הבחינה ייפתח עד חודש לפני המועד (החל מ-${windowOpenDateFormatted}). נותרו עוד ${daysUntilOpen} ימים לפתיחת המבחן.`
    };
  }

  // Eligible to take the exam (diffDays <= 30, whether in 30-day window or overdue)
  return {
    canTakeExam: true,
    reason: 'ELIGIBLE',
    nextExamDate: employee.nextExamDate,
    targetDateFormatted,
    diffDays,
    isOverdue: diffDays < 0,
    message: diffDays < 0
      ? `המבחן שלך היה מתוזמן לתאריך ${targetDateFormatted} (באיחור של ${Math.abs(diffDays)} ימים). הנך רשאי לבצע את המבחן כעת.`
      : `המבחן שלך מתוזמן לתאריך ${targetDateFormatted}. חלון הבחינה פתוח כעת.`
  };
}

// Automatically migrate plain passwords in employees.json to AES-256-GCM
function migratePlainPasswordsToEncrypted() {
  try {
    const employees = readJson(EMPLOYEES_FILE, []);
    let count = 0;
    const migrated = employees.map(emp => {
      if (emp.password && !String(emp.password).startsWith('enc:')) {
        count++;
        return {
          ...emp,
          password: encryptPassword(emp.password)
        };
      }
      return emp;
    });

    if (count > 0) {
      writeJson(EMPLOYEES_FILE, migrated);
      console.log(`🔒 Encrypted ${count} plain-text employee passwords with AES-256-GCM.`);
    }
  } catch (err) {
    console.error('Password migration error:', err);
  }
}
migratePlainPasswordsToEncrypted();

// In-memory store for active exam sessions to prevent score manipulation & replay (SEC-04)
const activeExamSessions = new Map();

function pruneExpiredExamSessions() {
  const now = Date.now();
  const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  for (const [id, session] of activeExamSessions.entries()) {
    if (now - session.createdAt > TTL_MS) {
      activeExamSessions.delete(id);
    }
  }
}

// -------------------------------------------------------------
// 1. Authentication / Employee Verification
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { name, username: reqUsername, employeeId, password } = req.body;
  const username = String(reqUsername || name || '').trim();
  const credential = String(password || employeeId || '').trim();

  if (!username || !credential) {
    return res.status(400).json({ success: false, message: 'נא להזין שם משתמש וסיסמה' });
  }

  const cleanUser = username.toLowerCase();
  const employees = readJson(EMPLOYEES_FILE, []);

  // 1. Direct Admin Login Check
  const isAdminAttempt = (
    cleanUser === 'admin' || 
    cleanUser === 'מנהל מערכת' || 
    cleanUser === 'מנהל' ||
    cleanUser === '9999'
  );

  if (isAdminAttempt) {
    const adminMatch = employees.find(e => e.isAdmin || String(e.id).trim() === 'admin' || String(e.id).trim() === '9999') || {
      id: 'admin',
      name: 'מנהל מערכת',
      username: 'מנהל מערכת',
      department: 'הנהלת מכשור ובקרה',
      role: 'מנהל מערכת ראשי (Admin)',
      level: 3,
      isAdmin: true
    };

    const isValidAdminPass = (ADMIN_PASSWORD && safeCompareStrings(credential, ADMIN_PASSWORD)) ||
      (adminMatch.password && verifyPassword(credential, adminMatch.password));

    if (!isValidAdminPass) {
      return res.status(401).json({
        success: false,
        message: 'סיסמת מנהל מערכת שגויה. הגישה נדחתה.'
      });
    }

    const adminEmployee = {
      id: adminMatch.id,
      name: adminMatch.name,
      username: adminMatch.username || adminMatch.name,
      department: adminMatch.department,
      role: adminMatch.role,
      level: adminMatch.level || 3,
      isAdmin: true,
      nextExamDate: null,
      scheduleNotes: ''
    };

    const token = jwt.sign(
      { id: adminEmployee.id, username: adminEmployee.username, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      success: true,
      token,
      employee: adminEmployee,
      eligibility: { canTakeExam: false, reason: 'ADMIN_USER', message: 'מנהל מערכת אינו נדרש לבצע מבחנים תקופתיים.' }
    });
  }

  // 2. Regular Employee Login Check (Strong Password & Anonymized Username)
  const normalizeHebrew = (str) => String(str || '').trim().toLowerCase().replace(/['"״׳]/g, '');
  const normUser = normalizeHebrew(username);

  const match = employees.find(emp => {
    if (emp.isAdmin) return false;
    const empUser = normalizeHebrew(emp.username || emp.name);
    const empName = normalizeHebrew(emp.name);
    const empId = String(emp.id).trim().toLowerCase();

    // Flexible username match (e.g. "ניר א", "ניר א'", "ברק ח", "ברק א", "עדי מ", "עדיאל מ", "אדי ר", "אדוארד ר")
    const userMatches = (
      empUser === normUser ||
      empName === normUser ||
      empId === cleanUser ||
      (normUser === 'ברק א' && empName === 'ברק ח') ||
      (normUser === 'עדיאל מ' && empName === 'עדי מ') ||
      (normUser === 'אדוארד ר' && empName === 'אדי ר')
    );

    // Secure constant-time encrypted password verification
    const passMatches = verifyPassword(credential, emp.password);

    return userMatches && passMatches;
  });

  if (!match) {
    return res.status(401).json({
      success: false,
      message: 'פרטי הזיהוי אינם תואמים. אנא ודא ששם המשתמש והסיסמה הוזנו נכון.'
    });
  }

  const eligibility = checkExamEligibility(match);

  const employeeData = {
    id: match.id,
    name: match.name,
    username: match.username || match.name,
    department: match.department,
    role: match.role,
    level: match.level || 2,
    isAdmin: Boolean(match.isAdmin),
    nextExamDate: match.nextExamDate || null,
    scheduleNotes: match.scheduleNotes || ''
  };

  const token = jwt.sign(
    { id: employeeData.id, username: employeeData.username, isAdmin: false },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({
    success: true,
    token,
    employee: employeeData,
    eligibility
  });
});

// Check employee exam eligibility anytime (SEC-07: Requires authentication & ownership check)
app.get('/api/exam/eligibility', authenticateToken, (req, res) => {
  const requestedId = req.query.employeeId ? String(req.query.employeeId).trim() : String(req.user.id).trim();
  if (!req.user.isAdmin && requestedId !== String(req.user.id).trim()) {
    return res.status(403).json({ success: false, message: 'אין לך הרשאה לצפות בנתוני עובד אחר' });
  }

  const employees = readJson(EMPLOYEES_FILE, []);
  const emp = employees.find(e => String(e.id).trim() === requestedId);

  if (!emp) {
    return res.status(404).json({ success: false, message: 'העובד לא נמצא במערכת' });
  }

  const eligibility = checkExamEligibility(emp);
  res.json({
    success: true,
    employee: {
      id: emp.id,
      name: emp.name,
      department: emp.department,
      role: emp.role,
      level: emp.level || 2,
      isAdmin: Boolean(emp.isAdmin),
      nextExamDate: emp.nextExamDate || null,
      scheduleNotes: emp.scheduleNotes || ''
    },
    ...eligibility
  });
});

// -------------------------------------------------------------
// 2. Exam Generation (Randomized, Secure: filtered by employee level & schedule)
// -------------------------------------------------------------
app.get('/api/exam/questions', authenticateToken, (req, res) => {
  // If not admin, strictly enforce caller's own ID
  const targetEmployeeId = req.user.isAdmin 
    ? (req.query.employeeId || req.user.id) 
    : req.user.id;

  // Strict enforcement: employee must have a valid scheduled exam within the 30-day window (bypassed for practice mode)
  const isPractice = req.query.mode === 'practice' || req.query.practice === 'true';
  const employees = readJson(EMPLOYEES_FILE, []);
  const emp = employees.find(e => String(e.id).trim() === String(targetEmployeeId).trim());
  let eligibility = null;
  if (emp) {
    eligibility = checkExamEligibility(emp);
    if (!isPractice && !emp.isAdmin && !eligibility.canTakeExam) {
      return res.status(403).json({
        success: false,
        ...eligibility
      });
    }
  }

  const questions = readJson(QUESTIONS_FILE, []);
  const requestedCount = parseInt(req.query.count, 10) || 20;
  const count = Math.min(Math.max(requestedCount, 1), 20);
  const level = req.query.level ? parseInt(req.query.level, 10) : (emp?.level || 2);

  if (!questions.length) {
    return res.status(500).json({ success: false, message: 'בנק השאלות ריק' });
  }

  // Filter or prioritize by level if specified
  let candidateQuestions = questions;
  if (level && [1, 2, 3].includes(level)) {
    const matching = questions.filter(q => q.level === level);
    if (matching.length >= count) {
      candidateQuestions = matching;
    } else if (matching.length > 0) {
      const others = questions.filter(q => q.level !== level);
      candidateQuestions = [...matching, ...others];
    }
  }

  // Shuffle and pick requested number of questions
  const shuffled = shuffleArray(candidateQuestions);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Sanitize: strip correctAnswer & explanation so candidates cannot cheat
  const clientQuestions = selected.map(q => ({
    id: q.id,
    topic: q.topic,
    level: q.level || 2,
    question: q.question,
    image: q.image,
    options: q.options
  }));

  const examId = `exam-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;

  pruneExpiredExamSessions();
  activeExamSessions.set(examId, {
    examId,
    employeeId: String(targetEmployeeId).trim(),
    questionIds: clientQuestions.map(q => q.id),
    totalQuestions: clientQuestions.length,
    isPractice: Boolean(isPractice),
    createdAt: Date.now(),
    submitted: false
  });

  res.json({
    success: true,
    isPractice,
    examId,
    examLevel: level || 2,
    totalQuestions: clientQuestions.length,
    questions: clientQuestions,
    ...(eligibility ? {
      nextExamDate: eligibility.nextExamDate || null,
      targetDateFormatted: eligibility.targetDateFormatted || (emp?.nextExamDate ? formatDateHe(emp.nextExamDate) : null),
      isOverdue: Boolean(eligibility.isOverdue),
      diffDays: eligibility.diffDays || 0
    } : (emp ? {
      nextExamDate: emp.nextExamDate || null,
      targetDateFormatted: emp.nextExamDate ? formatDateHe(emp.nextExamDate) : null
    } : {}))
  });
});

// -------------------------------------------------------------
// 3. Exam Submission, Scoring & Comprehensive Feedback (SEC-04 & SEC-06)
// -------------------------------------------------------------
app.post('/api/exam/submit', authenticateToken, (req, res) => {
  const { examId, answers = {}, questionIds, timeSpentSeconds } = req.body;
  // Non-admins can only submit for themselves
  const employeeId = req.user.isAdmin ? (req.body.employeeId || req.user.id) : req.user.id;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'נתוני הגשה חסרים (מספר אישי נדרש)' });
  }

  const employees = readJson(EMPLOYEES_FILE, []);
  const empIndex = employees.findIndex(e => String(e.id).trim() === String(employeeId).trim());
  const empRecord = empIndex !== -1 ? employees[empIndex] : null;

  // SEC-06: Use server-verified employeeName and department instead of trusting client payload
  const employeeName = req.user.isAdmin
    ? (req.body.employeeName || empRecord?.name || req.user.username)
    : (empRecord?.name || req.user.username || 'עובד');
  const department = req.user.isAdmin
    ? (req.body.department || empRecord?.department || 'מכשור ובקרה')
    : (empRecord?.department || 'מכשור ובקרה');

  const allQuestions = readJson(QUESTIONS_FILE, []);
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));
  const standardExamSize = Math.min(20, allQuestions.length || 20);

  let isPractice = Boolean(req.body.isPractice);
  let examQuestionIds = [];
  let totalQuestions = standardExamSize;

  // SEC-04: Validate against server-side active exam session if available
  const session = examId ? activeExamSessions.get(String(examId).trim()) : null;
  if (session) {
    if (!req.user.isAdmin && session.employeeId !== String(employeeId).trim()) {
      return res.status(403).json({ success: false, message: 'מזהה המבחן אינו שייך למשתמש זה' });
    }
    if (session.submitted) {
      return res.status(400).json({ success: false, message: 'מבחן זה כבר הוגש ונשמר במערכת' });
    }
    session.submitted = true;
    isPractice = session.isPractice;
    examQuestionIds = session.questionIds;
    totalQuestions = session.totalQuestions;
  } else {
    // Fallback if server restarted mid-exam: enforce eligibility & strict question count (min 20, max 20)
    if (!isPractice && !req.user.isAdmin && empRecord) {
      const eligibility = checkExamEligibility(empRecord);
      if (!eligibility.canTakeExam) {
        return res.status(403).json({ success: false, ...eligibility });
      }
    }

    const rawIds = Array.isArray(questionIds) && questionIds.length > 0
      ? questionIds
      : Object.keys(answers);
    // Deduplicate, keep only valid question IDs, and cap at 20 to prevent bulk answer harvesting
    examQuestionIds = [...new Set(rawIds.map(id => String(id).trim()).filter(id => questionMap.has(id)))].slice(0, 20);
    // Never allow client to shrink denominator below standardExamSize (prevents 1-question 100% exploit)
    totalQuestions = Math.max(standardExamSize, examQuestionIds.length);
  }

  let correctCount = 0;

  const review = examQuestionIds.map(qId => {
    const qData = questionMap.get(qId);
    if (!qData) {
      return { id: qId, isCorrect: false, selectedAnswer: -1 };
    }

    const selectedIndex = answers[qId];
    const hasAnswered = selectedIndex !== null && selectedIndex !== undefined && selectedIndex !== -1;
    const isCorrect = hasAnswered && selectedIndex === qData.correctAnswer;
    if (isCorrect) correctCount++;

    return {
      id: qData.id,
      topic: qData.topic,
      question: qData.question,
      image: qData.image,
      options: qData.options,
      selectedAnswer: hasAnswered ? selectedIndex : -1,
      correctAnswer: qData.correctAnswer,
      isCorrect,
      explanation: qData.explanation
    };
  });

  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= 70; // 70% passing threshold

  // Practice mode: Return full score and technical review, but DO NOT save to history or clear employee schedule
  if (isPractice) {
    return res.json({
      success: true,
      isPractice: true,
      resultId: `practice-${Date.now()}`,
      score,
      correctCount,
      totalQuestions,
      status: passed ? 'passed' : 'failed',
      timeSpentSeconds: timeSpentSeconds || 0,
      submittedAt: new Date().toISOString(),
      review,
      hasPdf: false,
      pdfUrl: null
    });
  }

  const resultId = `result-${Date.now()}`;
  const resultRecord = {
    id: resultId,
    employeeId: String(employeeId),
    employeeName,
    department,
    submittedAt: new Date().toISOString(),
    score,
    totalQuestions,
    correctCount,
    timeSpentSeconds: timeSpentSeconds || 0,
    status: passed ? 'passed' : 'failed',
    answers,
    questionIds: examQuestionIds,
    review,
    hasPdf: false,
    pdfUrl: `/api/results/${resultId}/pdf`
  };

  // Save to history
  const results = readJson(RESULTS_FILE, []);
  results.unshift(resultRecord);
  writeJson(RESULTS_FILE, results);

  // Clear scheduled exam date since the exam was fulfilled and submitted
  if (empIndex !== -1) {
    const todayFormatted = new Date().toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    employees[empIndex].nextExamDate = null;
    employees[empIndex].scheduleNotes = `מבחן בוצע ב-${todayFormatted} (ציון: ${score}%)`;
    employees[empIndex].scheduleUpdatedAt = new Date().toISOString();
    writeJson(EMPLOYEES_FILE, employees);
  }

  res.json({
    success: true,
    resultId: resultRecord.id,
    score,
    correctCount,
    totalQuestions,
    status: resultRecord.status,
    timeSpentSeconds: resultRecord.timeSpentSeconds,
    submittedAt: resultRecord.submittedAt,
    review,
    hasPdf: false,
    pdfUrl: resultRecord.pdfUrl
  });
});

// Helper function to reconstruct review for any existing or new result
function populateResultReview(resultRecord) {
  if (resultRecord.review && Array.isArray(resultRecord.review) && resultRecord.review.length > 0) {
    return resultRecord.review;
  }
  const allQuestions = readJson(QUESTIONS_FILE, []);
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));
  const answers = resultRecord.answers || {};

  let qIds = Array.isArray(resultRecord.questionIds) && resultRecord.questionIds.length > 0
    ? resultRecord.questionIds
    : Object.keys(answers);

  if (qIds.length === 0) {
    return [];
  }

  return qIds.map(qId => {
    const qData = questionMap.get(qId);
    if (!qData) {
      return {
        id: qId,
        topic: 'מכשור ובקרה',
        level: 2,
        question: `שאלה מזהה ${qId}`,
        image: null,
        options: ['תשובה 1', 'תשובה 2', 'תשובה 3', 'תשובה 4'],
        selectedAnswer: answers[qId] ?? -1,
        correctAnswer: 0,
        isCorrect: false,
        explanation: 'שאלה מהיסטוריית המערכת'
      };
    }
    const selectedIndex = answers[qId];
    const hasAnswered = selectedIndex !== null && selectedIndex !== undefined && selectedIndex !== -1;
    const isCorrect = hasAnswered && selectedIndex === qData.correctAnswer;

    return {
      id: qData.id,
      topic: qData.topic,
      level: qData.level || 2,
      question: qData.question,
      image: qData.image,
      options: qData.options,
      selectedAnswer: hasAnswered ? selectedIndex : -1,
      correctAnswer: qData.correctAnswer,
      isCorrect,
      explanation: qData.explanation
    };
  });
}

// -------------------------------------------------------------
// 3.1 Saved Exam Inspection & PDF Management
// -------------------------------------------------------------

// Get full details of a saved exam
app.get('/api/results/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const results = readJson(RESULTS_FILE, []);
  const record = results.find(r => String(r.id).trim() === String(id).trim());

  if (!record) {
    return res.status(404).json({ success: false, message: 'רשומת מבחן לא נמצאה' });
  }

  // Authorization: must be admin or the exam taker
  if (!req.user.isAdmin && req.user.id !== record.employeeId) {
    return res.status(403).json({ success: false, message: 'אין לך הרשאה לצפות בתוצאה זו' });
  }

  const review = populateResultReview(record);
  res.json({
    success: true,
    result: {
      ...record,
      review
    }
  });
});

// Upload and save generated PDF for an exam (SEC-05: Ownership & Magic Bytes validation)
app.post('/api/results/:id/pdf', authenticateToken, (req, res) => {
  const safePdf = getSafePdfPath(req.params.id);
  if (!safePdf) {
    return res.status(400).json({ success: false, message: 'מזהה מבחן לא חוקי' });
  }
  const { safeId, targetPath } = safePdf;
  const { pdfBase64 } = req.body;

  if (!pdfBase64) {
    return res.status(400).json({ success: false, message: 'נתוני PDF חסרים (נדרש pdfBase64)' });
  }

  const results = readJson(RESULTS_FILE, []);
  const idx = results.findIndex(r => String(r.id).trim() === safeId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'רשומת מבחן לא נמצאה' });
  }

  // SEC-05: Strict ownership check (must be admin or the exam taker)
  if (!req.user.isAdmin && String(req.user.id).trim() !== String(results[idx].employeeId).trim()) {
    return res.status(403).json({ success: false, message: 'אין לך הרשאה לעדכן קובץ PDF עבור מבחן זה' });
  }

  try {
    const base64Index = pdfBase64.indexOf('base64,');
    const cleanBase64 = base64Index !== -1 ? pdfBase64.substring(base64Index + 7) : pdfBase64;
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Validate PDF magic header (%PDF-)
    if (buffer.length < 5 || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      return res.status(400).json({ success: false, message: 'קובץ ה-PDF שנשלח אינו תקין' });
    }

    fs.writeFileSync(targetPath, buffer);

    results[idx].hasPdf = true;
    results[idx].pdfUrl = `/api/results/${safeId}/pdf`;
    results[idx].pdfSavedAt = new Date().toISOString();
    writeJson(RESULTS_FILE, results);

    // Persist PDF in MongoDB Atlas for permanent cloud availability
    if (isDbConnected()) {
      SavedPdfModel.findOneAndUpdate(
        { filename: `${safeId}.pdf` },
        { 
          filename: `${safeId}.pdf`, 
          employeeId: results[idx].employeeId, 
          dataBase64: cleanBase64, 
          sizeBytes: buffer.length 
        },
        { upsert: true }
      ).catch(e => console.error('Atlas PDF save error:', e.message));
    }

    res.json({ success: true, message: 'קובץ ה-PDF נשמר בהצלחה בשרת ובענן', pdfUrl: `/api/results/${safeId}/pdf` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'שגיאה בשמירת קובץ ה-PDF: ' + err.message });
  }
});

// Download / stream saved PDF (with MongoDB Atlas cloud recovery)
app.get('/api/results/:id/pdf', authenticateToken, async (req, res) => {
  const safePdf = getSafePdfPath(req.params.id);
  if (!safePdf) {
    return res.status(400).json({ success: false, message: 'מזהה מבחן לא חוקי' });
  }
  const { safeId, targetPath } = safePdf;
  const results = readJson(RESULTS_FILE, []);
  const record = results.find(r => String(r.id).trim() === safeId);

  if (record && !req.user.isAdmin && req.user.id !== record.employeeId) {
    return res.status(403).json({ success: false, message: 'אין לך הרשאה לצפות בקובץ זה' });
  }

  const employeeName = record?.employeeName || 'עובד';

  if (fs.existsSync(targetPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="mivhan_${encodeURIComponent(employeeName)}_${safeId}.pdf"`);
    return fs.createReadStream(targetPath).pipe(res);
  }

  // If missing from local disk, retrieve from MongoDB Atlas
  if (isDbConnected()) {
    try {
      const pdfDoc = await SavedPdfModel.findOne({ filename: `${safeId}.pdf` });
      if (pdfDoc && pdfDoc.dataBase64) {
        const buffer = Buffer.from(pdfDoc.dataBase64, 'base64');
        fs.writeFileSync(targetPath, buffer);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="mivhan_${encodeURIComponent(employeeName)}_${safeId}.pdf"`);
        return res.send(buffer);
      }
    } catch (err) {
      console.error('Atlas PDF retrieval error:', err.message);
    }
  }

  // Redirect to printable report if static PDF is not yet saved
  const tokenParam = req.query.token ? `&token=${encodeURIComponent(req.query.token)}` : '';
  res.redirect(`/api/results/${safeId}/report?print=1${tokenParam}`);
});

// Standalone Printable Exam Report (styled for A4 printing with complete XSS protection)
app.get('/api/results/:id/report', authenticateToken, (req, res) => {
  const { id } = req.params;
  const results = readJson(RESULTS_FILE, []);
  const record = results.find(r => String(r.id).trim() === String(id).trim());

  if (!record) {
    return res.status(404).send('<h2>רשומת מבחן לא נמצאה</h2>');
  }

  if (!req.user.isAdmin && req.user.id !== record.employeeId) {
    return res.status(403).send('<h2>אין לך הרשאה לצפות בדוח זה</h2>');
  }

  const review = populateResultReview(record);
  const passed = record.score >= 70;
  const dateFormatted = new Date(record.submittedAt).toLocaleString('he-IL', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  const durationMins = record.timeSpentSeconds ? `${Math.floor(record.timeSpentSeconds / 60)} דקות ו-${record.timeSpentSeconds % 60} שניות` : 'לא נמדד';

  const shouldPrint = req.query.print === '1';

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title>דוח מבחן - ${escapeHtml(record.employeeName)} (${escapeHtml(record.employeeId)})</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #1e293b;
      background: #f8fafc;
      direction: rtl;
    }
    .report-card {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .logo-area h1 { margin: 0; font-size: 24px; color: #0284c7; }
    .logo-area p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
    .status-badge {
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 16px;
      font-weight: bold;
      display: inline-block;
    }
    .status-pass { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .status-fail { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background: #f1f5f9;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .meta-item { font-size: 13px; }
    .meta-item strong { display: block; color: #475569; margin-bottom: 2px; }
    .score-banner {
      display: flex;
      justify-content: space-around;
      align-items: center;
      background: #f8fafc;
      border: 2px solid ${passed ? '#22c55e' : '#ef4444'};
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 28px;
      text-align: center;
    }
    .score-num { font-size: 32px; font-weight: 800; color: ${passed ? '#15803d' : '#b91c1c'}; }
    .score-label { font-size: 12px; color: #64748b; }
    .question-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .q-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
    .q-topic { color: #0284c7; }
    .q-title { font-size: 15px; font-weight: 700; margin: 8px 0 12px; line-height: 1.4; }
    .options-list { margin: 10px 0; display: flex; flex-direction: column; gap: 6px; }
    .opt-item {
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      border: 1px solid #e2e8f0;
    }
    .opt-correct { background: #dcfce7; border-color: #86efac; font-weight: 600; color: #166534; }
    .opt-selected-wrong { background: #fee2e2; border-color: #fca5a5; font-weight: 600; color: #991b1b; text-decoration: line-through; }
    .explanation-box {
      background: #eff6ff;
      border-right: 4px solid #3b82f6;
      padding: 10px 14px;
      border-radius: 4px;
      margin-top: 10px;
      font-size: 12px;
      color: #1e40af;
      line-height: 1.4;
    }
    .action-bar { margin-bottom: 20px; text-align: left; }
    .btn-print {
      background: #0284c7;
      color: #fff;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .report-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .action-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="action-bar no-print">
      <button class="btn-print" onclick="window.print()">🖨️ הדפס / שמור כ-PDF</button>
    </div>

    <div class="header-bar">
      <div class="logo-area">
        <h1>מִבְחָנָן • דוח תוצאות ותחקיר מבחן</h1>
        <p>מערכת מבחנים תקופתיים במכשור ובקרה | תקני ISA-5.1 ו-IEC 61508</p>
      </div>
      <div>
        <span class="status-badge ${passed ? 'status-pass' : 'status-fail'}">
          ${passed ? '✓ עבר בהצלחה' : '✗ נכשל'}
        </span>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><strong>שם הנבחן:</strong> ${escapeHtml(record.employeeName)}</div>
      <div class="meta-item"><strong>מספר אישי:</strong> ${escapeHtml(record.employeeId)}</div>
      <div class="meta-item"><strong>מחלקה:</strong> ${escapeHtml(record.department)}</div>
      <div class="meta-item"><strong>תאריך ושעה:</strong> ${escapeHtml(dateFormatted)}</div>
      <div class="meta-item"><strong>משך בחינה:</strong> ${escapeHtml(durationMins)}</div>
      <div class="meta-item"><strong>מזהה תוצאה:</strong> ${escapeHtml(record.id)}</div>
    </div>

    <div class="score-banner">
      <div>
        <div class="score-num">${record.score}%</div>
        <div class="score-label">ציון סופי</div>
      </div>
      <div>
        <div class="score-num">${record.correctCount} / ${record.totalQuestions}</div>
        <div class="score-label">תשובות נכונות</div>
      </div>
      <div>
        <div class="score-num">${record.totalQuestions - record.correctCount}</div>
        <div class="score-label">שאלות שגויות/שלא נענו</div>
      </div>
    </div>

    <h3 style="margin-bottom: 14px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">תחקיר שאלות המבחן (${review.length})</h3>

    ${review.map((q, idx) => {
      const letters = ['א', 'ב', 'ג', 'ד'];
      const isCorrect = q.isCorrect;
      return `
        <div class="question-box">
          <div class="q-header">
            <span>שאלה ${idx + 1} מתוך ${review.length}</span>
            <span class="q-topic">${escapeHtml(q.topic || 'מכשור ובקרה')}</span>
            <span style="color: ${isCorrect ? '#16a34a' : '#dc2626'}">
              ${isCorrect ? '✓ תשובה נכונה' : '✗ תשובה שגויה'}
            </span>
          </div>

          <div class="q-title">${escapeHtml(q.question)}</div>

          <div class="options-list">
            ${(q.options || []).map((opt, optIdx) => {
              const isSelected = q.selectedAnswer === optIdx;
              const isAnswerCorrect = q.correctAnswer === optIdx;
              let cls = 'opt-item';
              let badge = '';

              if (isAnswerCorrect) {
                cls += ' opt-correct';
                badge = ' <strong style="color:#15803d">(תשובה נכונה ✓)</strong>';
              }
              if (isSelected && !isAnswerCorrect) {
                cls += ' opt-selected-wrong';
                badge = ' <strong style="color:#b91c1c">(תשובתך - שגויה ✗)</strong>';
              } else if (isSelected && isAnswerCorrect) {
                badge += ' <strong style="color:#15803d">(בחירתך)</strong>';
              }

              return `<div class="${cls}"><strong>${letters[optIdx]}.</strong> ${escapeHtml(opt)} ${badge}</div>`;
            }).join('')}
          </div>

          ${q.explanation ? `
            <div class="explanation-box">
              <strong>💡 הסבר טכני מקצועי:</strong> ${escapeHtml(q.explanation)}
            </div>
          ` : ''}
        </div>
      `;
    }).join('')}
  </div>

  ${shouldPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };</script>' : ''}
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// -------------------------------------------------------------
// 4. Admin API - Exam Results & Analytics (Strict Admin Only)
// -------------------------------------------------------------
app.get('/api/admin/results', requireAdmin, (req, res) => {
  const results = readJson(RESULTS_FILE, []);
  res.json({ success: true, results });
});

// Export Results as Excel-friendly CSV with UTF-8 BOM & Formula Injection Protection
app.get('/api/admin/export-csv', requireAdmin, (req, res) => {
  const results = readJson(RESULTS_FILE, []);

  let csv = '\uFEFFמזהה תוצאה,מזהה עובד,שם עובד,מחלקה,תאריך ושעה,ציון,שאלות נכונות,סה"כ שאלות,סטטוס,זמן בשניות\n';

  results.forEach(r => {
    const dateFormatted = new Date(r.submittedAt).toLocaleString('he-IL');
    const statusHe = r.status === 'passed' ? 'עבר' : 'נכשל';
    csv += `${sanitizeCsvCell(r.id)},${sanitizeCsvCell(r.employeeId)},${sanitizeCsvCell(r.employeeName)},${sanitizeCsvCell(r.department)},${sanitizeCsvCell(dateFormatted)},${r.score},${r.correctCount},${r.totalQuestions},${sanitizeCsvCell(statusHe)},${r.timeSpentSeconds}\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="mivhanan_results.csv"');
  res.send(csv);
});

// Export Employee Login Credentials (Username & Decrypted Password list for Admin Distribution)
app.get('/api/admin/export-credentials-csv', requireAdmin, (req, res) => {
  const employees = readJson(EMPLOYEES_FILE, []);

  let csv = '\uFEFFמזהה פנימי,שם עובד,שם משתמש,סיסמה,מחלקה,תפקיד,רמת מבחן,תפקיד ניהולי\n';

  employees.forEach(emp => {
    const isAdminStr = emp.isAdmin ? 'מנהל מערכת' : 'עובד מוסמך';
    const pwd = decryptPassword(emp.password) || (emp.isAdmin ? ADMIN_PASSWORD : '');
    csv += `${sanitizeCsvCell(emp.id)},${sanitizeCsvCell(emp.name)},${sanitizeCsvCell(emp.username || emp.name)},${sanitizeCsvCell(pwd)},${sanitizeCsvCell(emp.department || '')},${sanitizeCsvCell(emp.role || '')},${emp.level || 2},${sanitizeCsvCell(isAdminStr)}\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="mivhanan_credentials.csv"');
  res.send(csv);
});

// -------------------------------------------------------------
// Full System Backup (ZIP) - All JSON files + all saved PDF reports
// -------------------------------------------------------------
app.get('/api/admin/backup-zip', requireAdmin, (req, res) => {
  try {
    const zip = new AdmZip();
    if (fs.existsSync(EMPLOYEES_FILE)) zip.addLocalFile(EMPLOYEES_FILE, '', 'employees.json');
    if (fs.existsSync(RESULTS_FILE)) zip.addLocalFile(RESULTS_FILE, '', 'exam_results.json');
    if (fs.existsSync(QUESTIONS_FILE)) zip.addLocalFile(QUESTIONS_FILE, '', 'questions.json');
    if (fs.existsSync(SAVED_EXAMS_PDF_DIR)) zip.addLocalFolder(SAVED_EXAMS_PDF_DIR, 'saved_exams_pdf');

    const dateStr = new Date().toISOString().split('T')[0];
    const buffer = zip.toBuffer();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="mivhanan_full_backup_${dateStr}.zip"`);
    res.send(buffer);
  } catch (err) {
    console.error('Backup ZIP error:', err);
    res.status(500).json({ success: false, message: 'שגיאה ביצירת קובץ גיבוי ZIP: ' + err.message });
  }
});

// Full System Restore from uploaded ZIP (SEC-14: Zip Slip, Zip Bomb & Schema validation)
app.post('/api/admin/restore-zip', requireAdmin, zipUpload.single('backupZip'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'לא נבחר קובץ ZIP לשחזור' });
  }

  try {
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();

    const MAX_ENTRIES = 500;
    const MAX_SINGLE_ENTRY_BYTES = 25 * 1024 * 1024; // 25MB max per entry
    const MAX_TOTAL_UNCOMPRESSED_BYTES = 150 * 1024 * 1024; // 150MB max total uncompressed
    let totalUncompressedBytes = 0;

    if (zipEntries.length > MAX_ENTRIES) {
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(400).json({ success: false, message: 'קובץ ה-ZIP מכיל כמות קבצים חריגה ונחסם מטעמי אבטחה' });
    }

    // 1. Validate against Zip Slip & Zip Bomb (uncompressed header sizes)
    for (const entry of zipEntries) {
      const entryName = entry.entryName.replace(/\\/g, '/');
      if (entryName.includes('..') || entryName.startsWith('/')) {
        try { fs.unlinkSync(req.file.path); } catch {}
        return res.status(400).json({ success: false, message: 'קובץ ה-ZIP מכיל נתיבים לא חוקיים (Zip Slip נחסם)' });
      }
      const declaredSize = entry.header?.size ?? 0;
      if (declaredSize < 0 || declaredSize > MAX_SINGLE_ENTRY_BYTES) {
        try { fs.unlinkSync(req.file.path); } catch {}
        return res.status(400).json({ success: false, message: 'קובץ בתוך ה-ZIP חורג ממגבלת הגודל המותרת (Zip Bomb נחסם)' });
      }
      totalUncompressedBytes += declaredSize;
      if (totalUncompressedBytes > MAX_TOTAL_UNCOMPRESSED_BYTES) {
        try { fs.unlinkSync(req.file.path); } catch {}
        return res.status(400).json({ success: false, message: 'נפח הפריסה הכולל של קובץ ה-ZIP חורג מהמותר (Zip Bomb נחסם)' });
      }
    }

    // 2. Validate and stage JSON files with item-level schema checks before overwriting
    let stagedEmployees = null;
    let stagedResults = null;
    let stagedQuestions = null;
    const stagedPdfs = [];
    let actualTotalBytes = 0;

    for (const entry of zipEntries) {
      const entryName = entry.entryName.replace(/\\/g, '/');
      if (entry.isDirectory) continue;

      const dataBuf = entry.getData();
      actualTotalBytes += dataBuf.length;
      if (dataBuf.length > MAX_SINGLE_ENTRY_BYTES || actualTotalBytes > MAX_TOTAL_UNCOMPRESSED_BYTES) {
        throw new Error('נפח הנתונים בפועל בקובץ ה-ZIP חורג מהמותר');
      }

      if (entryName === 'employees.json') {
        const parsed = JSON.parse(dataBuf.toString('utf8'));
        if (!Array.isArray(parsed) || !parsed.every(e => e && typeof e === 'object' && e.id && e.name)) {
          throw new Error('מבנה employees.json בגיבוי אינו תקין');
        }
        stagedEmployees = parsed;
      } else if (entryName === 'exam_results.json') {
        const parsed = JSON.parse(dataBuf.toString('utf8'));
        if (!Array.isArray(parsed) || !parsed.every(r => r && typeof r === 'object' && r.id && r.employeeId)) {
          throw new Error('מבנה exam_results.json בגיבוי אינו תקין');
        }
        stagedResults = parsed;
      } else if (entryName === 'questions.json') {
        const parsed = JSON.parse(dataBuf.toString('utf8'));
        if (!Array.isArray(parsed) || !parsed.every(q => q && typeof q === 'object' && q.id && q.question && Array.isArray(q.options))) {
          throw new Error('מבנה questions.json בגיבוי אינו תקין');
        }
        stagedQuestions = parsed;
      } else if (entryName.startsWith('saved_exams_pdf/')) {
        const filename = path.basename(entryName);
        if (filename && filename.endsWith('.pdf')) {
          if (dataBuf.length >= 5 && dataBuf.subarray(0, 5).toString('ascii') === '%PDF-') {
            const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '');
            stagedPdfs.push({ filename: safeName, data: dataBuf });
          }
        }
      }
    }

    let restoredCount = 0;
    if (stagedEmployees) {
      // Ensure passwords remain encrypted
      const encryptedEmployees = stagedEmployees.map(emp => ({
        ...emp,
        password: encryptPassword(emp.password)
      }));
      writeJson(EMPLOYEES_FILE, encryptedEmployees);
      restoredCount++;
    }
    if (stagedResults) {
      writeJson(RESULTS_FILE, stagedResults);
      restoredCount++;
    }
    if (stagedQuestions) {
      writeJson(QUESTIONS_FILE, stagedQuestions);
      restoredCount++;
    }
    stagedPdfs.forEach(pdf => {
      fs.writeFileSync(path.join(SAVED_EXAMS_PDF_DIR, pdf.filename), pdf.data);
      restoredCount++;
    });

    try { fs.unlinkSync(req.file.path); } catch {}

    res.json({
      success: true,
      message: `השחזור הושלם בהצלחה! שוחזרו ${restoredCount} קובצי נתונים ומסמכי PDF.`,
      restoredCount
    });
  } catch (err) {
    console.error('Restore ZIP error:', err);
    try { fs.unlinkSync(req.file.path); } catch {}
    res.status(500).json({ success: false, message: 'שגיאה בפריקת קובץ הגיבוי: ' + err.message });
  }
});

// Export 4-Month Periodic Exam Compliance Report to CSV with UTF-8 BOM
app.get('/api/admin/export-schedules-csv', requireAdmin, (req, res) => {
  const employees = readJson(EMPLOYEES_FILE, []);
  const results = readJson(RESULTS_FILE, []);

  const latestResultMap = new Map();
  results.forEach(r => {
    const cleanId = String(r.employeeId).trim();
    const existing = latestResultMap.get(cleanId);
    if (!existing || new Date(r.submittedAt) > new Date(existing.submittedAt)) {
      latestResultMap.set(cleanId, r);
    }
  });

  const now = new Date();
  let csv = '\uFEFFמספר אישי,שם עובד,מחלקה,תפקיד,רמת מבחן,תאריך מבחן אחרון,ציון אחרון,תוצאה אחרונה,תאריך יעד למבחן הבא (מחזור 4 חודשים),סטטוס ביצוע,ימים שנותרו/באיחור,הערות תזמון\n';

  employees.forEach(emp => {
    const cleanId = String(emp.id).trim();
    const lastResult = latestResultMap.get(cleanId);
    
    let lastExamStr = 'טרם נבחן';
    let lastScoreStr = '—';
    let lastStatusStr = '—';
    let targetDate = null;

    if (lastResult && lastResult.submittedAt) {
      lastExamStr = new Date(lastResult.submittedAt).toLocaleDateString('he-IL');
      lastScoreStr = `${lastResult.score}%`;
      lastStatusStr = lastResult.status === 'passed' ? 'עבר' : 'נכשל';
    }

    if (emp.nextExamDate) {
      targetDate = new Date(emp.nextExamDate);
    } else if (lastResult && lastResult.submittedAt) {
      targetDate = new Date(lastResult.submittedAt);
      targetDate.setMonth(targetDate.getMonth() + 4);
    }

    let statusHebrew = 'טרם נבחן';
    let daysStr = 'נדרש לתאם';
    let targetDateStr = emp.nextExamDate || (targetDate ? targetDate.toISOString().split('T')[0] : 'טרם נקבע');

    if (targetDate) {
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        statusHebrew = 'באיחור / פג תוקף';
        daysStr = `באיחור של ${Math.abs(diffDays)} ימים`;
      } else if (diffDays <= 30) {
        statusHebrew = 'נדרש לתאם בקרוב (פחות מ-30 יום)';
        daysStr = `נותרו ${diffDays} ימים`;
      } else {
        statusHebrew = 'בתוקף';
        daysStr = `נותרו ${diffDays} ימים`;
      }
    }

    const notes = emp.scheduleNotes || '';
    csv += `${sanitizeCsvCell(emp.id)},${sanitizeCsvCell(emp.name)},${sanitizeCsvCell(emp.department)},${sanitizeCsvCell(emp.role)},${emp.level || 2},${sanitizeCsvCell(lastExamStr)},${sanitizeCsvCell(lastScoreStr)},${sanitizeCsvCell(lastStatusStr)},${sanitizeCsvCell(targetDateStr)},${sanitizeCsvCell(statusHebrew)},${sanitizeCsvCell(daysStr)},${sanitizeCsvCell(notes)}\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="mivhanan_4_months_tracking.csv"');
  res.send(csv);
});

// Delete Exam Result by ID
app.delete('/api/admin/results/:id', requireAdmin, (req, res) => {
  const cleanId = String(req.params.id || '').trim();
  const results = readJson(RESULTS_FILE, []);
  const initialLen = results.length;
  const filtered = results.filter(r => String(r.id).trim() !== cleanId);

  if (filtered.length === initialLen) {
    return res.status(404).json({ success: false, message: 'רשומת המבחן לא נמצאה במערכת' });
  }

  writeJson(RESULTS_FILE, filtered);

  // Clean up PDF file safely
  const safePdf = getSafePdfPath(cleanId);
  if (safePdf && fs.existsSync(safePdf.targetPath)) {
    try { fs.unlinkSync(safePdf.targetPath); } catch {}
  }
  if (isDbConnected()) {
    SavedPdfModel.deleteOne({ filename: `${cleanId}.pdf` }).catch(() => {});
  }

  res.json({ success: true, message: 'רשומת המבחן נמחקה בהצלחה', remainingCount: filtered.length });
});

// -------------------------------------------------------------
// 5. Admin API - Question & Employee Management + Image Upload
// -------------------------------------------------------------

// Upload & auto-optimize question image (Protected by requireAdmin and SVG validation)
app.post('/api/admin/upload-image', requireAdmin, upload.single('image'), (req, res) => {
  try {
    let filename = '';

    if (req.file) {
      filename = req.file.filename;
      // If SVG, check for malicious script tags
      if (req.file.mimetype === 'image/svg+xml' || path.extname(filename).toLowerCase() === '.svg') {
        const content = fs.readFileSync(req.file.path, 'utf8');
        try {
          validateSvgContent(content);
        } catch (svgErr) {
          try { fs.unlinkSync(req.file.path); } catch {}
          return res.status(400).json({ success: false, message: svgErr.message });
        }
      }
    } else if (req.body.imageBase64) {
      const { imageBase64, mimeType } = req.body;
      const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(imageBase64, 'base64');
      const ext = mimeType ? (mimeType.includes('svg') ? '.svg' : mimeType.includes('webp') ? '.webp' : mimeType.includes('jpeg') ? '.jpg' : '.png') : '.png';
      
      if (ext === '.svg') {
        try {
          validateSvgContent(buffer);
        } catch (svgErr) {
          return res.status(400).json({ success: false, message: svgErr.message });
        }
      }

      filename = `q_upload_${Date.now()}_optimized${ext}`;
      fs.writeFileSync(path.join(QUESTIONS_IMAGES_DIR, filename), buffer);
    } else {
      return res.status(400).json({ success: false, message: 'לא נשלחה תמונה להעלאה' });
    }

    // Sync to frontend directory if available
    if (fs.existsSync(FRONTEND_IMAGES_DIR)) {
      try {
        fs.copyFileSync(
          path.join(QUESTIONS_IMAGES_DIR, filename),
          path.join(FRONTEND_IMAGES_DIR, filename)
        );
      } catch (copyErr) {
        console.warn('Could not sync image to frontend directory:', copyErr);
      }
    }

    res.json({
      success: true,
      imageUrl: `/images/questions/${filename}`,
      filename
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'שגיאה בשמירת התמונה' });
  }
});

app.get('/api/admin/questions', requireAdmin, (req, res) => {
  const questions = readJson(QUESTIONS_FILE, []);
  res.json({ success: true, questions });
});

app.post('/api/admin/questions', requireAdmin, (req, res) => {
  const { topic, question, options, correctAnswer, explanation, image, level } = req.body;
  if (!question || !options || options.length !== 4 || correctAnswer === undefined) {
    return res.status(400).json({ success: false, message: 'פרטי שאלה לא מלאים (נדרשות 4 אפשרויות ותשובה נכונה)' });
  }

  const questions = readJson(QUESTIONS_FILE, []);
  const newQuestion = {
    id: `q${Date.now()}`,
    topic: topic || 'מכשור ובקרה כללי',
    level: level ? parseInt(level) : 2,
    question,
    image: image || '/images/questions/q1_orifice_dp.svg',
    options,
    correctAnswer: parseInt(correctAnswer),
    explanation: explanation || 'אין הסבר נוסף.'
  };

  questions.push(newQuestion);
  writeJson(QUESTIONS_FILE, questions);
  res.json({ success: true, question: newQuestion });
});

// Delete question by ID
app.delete('/api/admin/questions/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const questions = readJson(QUESTIONS_FILE, []);
  const initialLen = questions.length;
  const filtered = questions.filter(q => String(q.id) !== String(id));

  if (filtered.length === initialLen) {
    return res.status(404).json({ success: false, message: 'השאלה לא נמצאה במערכת' });
  }

  writeJson(QUESTIONS_FILE, filtered);
  res.json({ success: true, message: 'השאלה נמחקה בהצלחה', remainingCount: filtered.length });
});

app.get('/api/admin/employees', requireAdmin, (req, res) => {
  const employees = readJson(EMPLOYEES_FILE, []);
  // Decrypt passwords for the authenticated manager only
  const formatted = employees.map(emp => ({
    ...emp,
    password: decryptPassword(emp.password)
  }));
  res.json({ success: true, employees: formatted });
});

app.post('/api/admin/employees', requireAdmin, (req, res) => {
  const { id, name, username, password, department, role, level, isAdmin } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'נדרש שם עובד' });
  }

  const employees = readJson(EMPLOYEES_FILE, []);
  const cleanName = String(name).trim();
  const cleanUser = username ? String(username).trim() : cleanName;

  // Generate anonymous ID if not provided (emp_01, emp_02, etc.)
  let assignedId = id ? String(id).trim() : '';
  if (!assignedId) {
    const nextNum = employees.length + 1;
    assignedId = `emp_${String(nextNum).padStart(2, '0')}`;
  }

  // Generate cryptographically strong password if not provided (SEC-11)
  let assignedPass = password ? String(password).trim() : '';
  if (!assignedPass) {
    assignedPass = generateSecureEmployeePassword();
  }

  if (employees.some(e => String(e.id).trim() === assignedId)) {
    return res.status(400).json({ success: false, message: 'מזהה עובד זה כבר קיים במערכת' });
  }

  const newEmp = {
    id: assignedId,
    name: cleanName,
    username: cleanUser,
    password: encryptPassword(assignedPass),
    department: department || 'מכשיריית חומר גלם',
    role: role || 'מכשירן',
    level: level ? parseInt(level, 10) : 2,
    isAdmin: Boolean(isAdmin),
    email: `${assignedId}@mivhanan.internal`,
    nextExamDate: null,
    scheduleNotes: ''
  };

  employees.push(newEmp);
  writeJson(EMPLOYEES_FILE, employees);
  res.json({ 
    success: true, 
    employee: { 
      ...newEmp, 
      password: assignedPass 
    } 
  });
});

// Update employee level
app.patch('/api/admin/employees/:id/level', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { level } = req.body;

  const parsedLevel = parseInt(level, 10);
  if (![1, 2, 3].includes(parsedLevel)) {
    return res.status(400).json({ success: false, message: 'רמת מבחן לא חוקית (נדרש 1, 2 או 3)' });
  }

  const employees = readJson(EMPLOYEES_FILE, []);
  const empIndex = employees.findIndex(e => String(e.id).trim() === String(id).trim());

  if (empIndex === -1) {
    return res.status(404).json({ success: false, message: 'העובד לא נמצא במערכת' });
  }

  employees[empIndex].level = parsedLevel;
  writeJson(EMPLOYEES_FILE, employees);

  res.json({
    success: true,
    message: `רמת העובד עודכנה בהצלחה לרמה ${parsedLevel}`,
    employee: {
      ...employees[empIndex],
      password: decryptPassword(employees[empIndex].password)
    }
  });
});

// Update full employee details
app.put('/api/admin/employees/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, username, password, department, role, level, isAdmin } = req.body;

  const employees = readJson(EMPLOYEES_FILE, []);
  const empIndex = employees.findIndex(e => String(e.id).trim() === String(id).trim());

  if (empIndex === -1) {
    return res.status(404).json({ success: false, message: 'העובד לא נמצא במערכת' });
  }

  if (name !== undefined) {
    employees[empIndex].name = String(name).trim();
    if (!employees[empIndex].username) employees[empIndex].username = String(name).trim();
  }
  if (username !== undefined && String(username).trim() !== '') {
    employees[empIndex].username = String(username).trim();
  }
  if (password !== undefined && String(password).trim() !== '') {
    employees[empIndex].password = encryptPassword(String(password).trim());
  }
  if (department !== undefined) employees[empIndex].department = department;
  if (role !== undefined) employees[empIndex].role = role;
  if (level !== undefined) employees[empIndex].level = parseInt(level, 10);
  if (isAdmin !== undefined) employees[empIndex].isAdmin = Boolean(isAdmin);

  writeJson(EMPLOYEES_FILE, employees);

  res.json({
    success: true,
    message: 'פרטי העובד עודכנו בהצלחה',
    employee: {
      ...employees[empIndex],
      password: decryptPassword(employees[empIndex].password)
    }
  });
});

// Update employee exam schedule (4-month tracking target date & notes)
app.patch('/api/admin/employees/:id/schedule', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { nextExamDate, scheduleNotes } = req.body;

  const employees = readJson(EMPLOYEES_FILE, []);
  const empIndex = employees.findIndex(e => String(e.id).trim() === String(id).trim());

  if (empIndex === -1) {
    return res.status(404).json({ success: false, message: 'העובד לא נמצא במערכת' });
  }

  // Update or clear scheduled date
  employees[empIndex].nextExamDate = nextExamDate ? String(nextExamDate).trim() : null;
  if (scheduleNotes !== undefined) {
    employees[empIndex].scheduleNotes = String(scheduleNotes).trim();
  }
  employees[empIndex].scheduleUpdatedAt = new Date().toISOString();

  writeJson(EMPLOYEES_FILE, employees);

  res.json({
    success: true,
    message: 'מועד המבחן עודכן בהצלחה',
    employee: {
      ...employees[empIndex],
      password: decryptPassword(employees[empIndex].password)
    }
  });
});

// Auto-schedule next 4-month exam date for employees
app.post('/api/admin/employees/auto-schedule', requireAdmin, (req, res) => {
  const { employeeIds } = req.body || {};
  const employees = readJson(EMPLOYEES_FILE, []);
  const results = readJson(RESULTS_FILE, []);

  // Map each employee to their latest exam result
  const latestResultMap = new Map();
  results.forEach(r => {
    const cleanId = String(r.employeeId).trim();
    const existing = latestResultMap.get(cleanId);
    if (!existing || new Date(r.submittedAt) > new Date(existing.submittedAt)) {
      latestResultMap.set(cleanId, r);
    }
  });

  const now = new Date();
  let updatedCount = 0;

  employees.forEach(emp => {
    const cleanId = String(emp.id).trim();
    if (employeeIds && Array.isArray(employeeIds) && !employeeIds.includes(cleanId)) {
      return;
    }

    const lastResult = latestResultMap.get(cleanId);
    let target = new Date();

    if (lastResult && lastResult.submittedAt) {
      // 4 months from last exam
      const lastDate = new Date(lastResult.submittedAt);
      target = new Date(lastDate);
      target.setMonth(target.getMonth() + 4);
      // If that target is in the past, schedule for 2 weeks from now
      if (target < now) {
        target = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      }
    } else {
      // Never took an exam: schedule within 14 days from now
      target = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    }

    emp.nextExamDate = target.toISOString().split('T')[0];
    emp.scheduleNotes = emp.scheduleNotes || 'תזמון אוטומטי (מחזור 4 חודשים)';
    emp.scheduleUpdatedAt = new Date().toISOString();
    updatedCount++;
  });

  writeJson(EMPLOYEES_FILE, employees);

  res.json({
    success: true,
    message: `תוזמנו מועדי מבחן עבור ${updatedCount} עובדים`,
    employees: employees.map(emp => ({
      ...emp,
      password: decryptPassword(emp.password)
    }))
  });
});

// Delete Employee by ID
app.delete('/api/admin/employees/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const cleanId = String(id).trim();

  // Prevent accidental deletion of primary System Administrator (9999 or admin)
  if (cleanId === '9999' || cleanId === 'admin') {
    return res.status(403).json({ success: false, message: 'לא ניתן למחוק את מנהל המערכת הראשי (Admin)' });
  }

  const employees = readJson(EMPLOYEES_FILE, []);
  const initialLen = employees.length;
  const filtered = employees.filter(e => String(e.id).trim() !== cleanId);

  if (filtered.length === initialLen) {
    return res.status(404).json({ success: false, message: 'העובד לא נמצא במערכת' });
  }

  writeJson(EMPLOYEES_FILE, filtered);
  res.json({ success: true, message: 'העובד הוסר בהצלחה מהמערכת', remainingCount: filtered.length });
});

// -------------------------------------------------------------
// Serve Frontend static assets in Production (Single Origin / Single URL)
// -------------------------------------------------------------
const FRONTEND_DIST_DIR = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(FRONTEND_DIST_DIR)) {
  app.use(express.static(FRONTEND_DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/images')) {
      return next();
    }
    res.sendFile(path.join(FRONTEND_DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Mivhanan Server running on http://localhost:${PORT}`);
});
