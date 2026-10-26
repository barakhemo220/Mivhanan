import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Hanan4343!';

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

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
    const allowed = /jpeg|jpg|png|webp|svg|gif/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype;
    if (allowed.test(ext) || allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('סוג קובץ לא נתמך. נא להעלות תמונה מסוג JPG, PNG, WebP, SVG בלבד.'));
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

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

const EMPLOYEES_FILE = path.join(__dirname, 'data/employees.json');
const QUESTIONS_FILE = path.join(__dirname, 'data/questions.json');
const RESULTS_FILE = path.join(__dirname, 'data/exam_results.json');

// Helper to read JSON file safely
const readJson = (filePath, fallback = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
};

// Helper to write JSON file safely
const writeJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

// Shuffle array utility (Fisher-Yates)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

// -------------------------------------------------------------
// 1. Authentication / Employee Verification
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { name, employeeId, password } = req.body;

  if (!name || !employeeId) {
    return res.status(400).json({ success: false, message: 'נא להזין שם ומספר אישי' });
  }

  const cleanId = String(employeeId).trim();
  const cleanName = String(name).trim().toLowerCase();

  const employees = readJson(EMPLOYEES_FILE, []);

  // Match by ID and verify name
  const match = employees.find(emp => {
    const empId = String(emp.id).trim();
    const empName = String(emp.name).trim().toLowerCase();
    return empId === cleanId && (empName === cleanName || empName.includes(cleanName) || cleanName.includes(empName));
  });

  if (!match) {
    return res.status(401).json({
      success: false,
      message: 'פרטי הזיהוי אינם תואמים לרשימת העובדים. אנא ודא שהמספר האישי והשם הוזנו נכון או פנה למנהל.'
    });
  }

  // Security enforcement: Admin login requires password
  if (match.isAdmin || cleanId === '9999') {
    if (!password) {
      return res.status(401).json({
        success: false,
        isAdminRequired: true,
        message: 'כניסת מנהל מערכת דורשת סיסמת Admin.'
      });
    }
    if (String(password).trim() !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        isAdminRequired: true,
        message: 'סיסמת מנהל מערכת שגויה. הגישה נדחתה.'
      });
    }
  }

  const eligibility = checkExamEligibility(match);

  res.json({
    success: true,
    employee: {
      id: match.id,
      name: match.name,
      department: match.department,
      role: match.role,
      level: match.level || 2,
      isAdmin: Boolean(match.isAdmin),
      nextExamDate: match.nextExamDate || null,
      scheduleNotes: match.scheduleNotes || ''
    },
    eligibility
  });
});

// Check employee exam eligibility anytime
app.get('/api/exam/eligibility', (req, res) => {
  const { employeeId } = req.query;
  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'מספר אישי נדרש' });
  }

  const employees = readJson(EMPLOYEES_FILE, []);
  const emp = employees.find(e => String(e.id).trim() === String(employeeId).trim());

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
app.get('/api/exam/questions', (req, res) => {
  const { employeeId } = req.query;

  // Strict enforcement: employee must have a valid scheduled exam within the 30-day window
  if (employeeId) {
    const employees = readJson(EMPLOYEES_FILE, []);
    const emp = employees.find(e => String(e.id).trim() === String(employeeId).trim());
    if (emp && !emp.isAdmin) {
      const eligibility = checkExamEligibility(emp);
      if (!eligibility.canTakeExam) {
        return res.status(403).json({
          success: false,
          ...eligibility
        });
      }
    }
  }

  const questions = readJson(QUESTIONS_FILE, []);
  const count = parseInt(req.query.count) || 20;
  const level = req.query.level ? parseInt(req.query.level) : null;

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
      // Top up with other questions if not enough
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

  const examId = `exam-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  res.json({
    success: true,
    examId,
    examLevel: level || 2,
    totalQuestions: clientQuestions.length,
    questions: clientQuestions
  });
});

// -------------------------------------------------------------
// 3. Exam Submission, Scoring & Comprehensive Feedback
// -------------------------------------------------------------
app.post('/api/exam/submit', (req, res) => {
  const { employeeId, employeeName, department, answers = {}, questionIds, totalQuestions: clientTotalQuestions, timeSpentSeconds } = req.body;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'נתוני הגשה חסרים (מספר אישי נדרש)' });
  }

  const allQuestions = readJson(QUESTIONS_FILE, []);
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));

  // Determine the full list of question IDs that were part of this exam
  let examQuestionIds = [];
  if (Array.isArray(questionIds) && questionIds.length > 0) {
    examQuestionIds = questionIds;
  } else {
    examQuestionIds = Object.keys(answers);
  }

  // The score must be calculated out of the full exam questions count (e.g. 20)
  const totalQuestions = clientTotalQuestions && clientTotalQuestions >= examQuestionIds.length 
    ? clientTotalQuestions 
    : (examQuestionIds.length > 0 ? examQuestionIds.length : 20);

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

  const resultId = `result-${Date.now()}`;
  const resultRecord = {
    id: resultId,
    employeeId: String(employeeId),
    employeeName: employeeName || 'עובד',
    department: department || 'מכשור ובקרה',
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
  const employees = readJson(EMPLOYEES_FILE, []);
  const empIndex = employees.findIndex(e => String(e.id).trim() === String(employeeId).trim());
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

// Get full details of a saved exam (including complete review with questions and explanations)
app.get('/api/results/:id', (req, res) => {
  const { id } = req.params;
  const results = readJson(RESULTS_FILE, []);
  const record = results.find(r => String(r.id).trim() === String(id).trim());

  if (!record) {
    return res.status(404).json({ success: false, message: 'רשומת מבחן לא נמצאה' });
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

// Upload and save generated PDF for an exam
app.post('/api/results/:id/pdf', (req, res) => {
  const { id } = req.params;
  const { pdfBase64 } = req.body;

  if (!pdfBase64) {
    return res.status(400).json({ success: false, message: 'נתוני PDF חסרים (נדרש pdfBase64)' });
  }

  try {
    const base64Index = pdfBase64.indexOf('base64,');
    const cleanBase64 = base64Index !== -1 ? pdfBase64.substring(base64Index + 7) : pdfBase64;
    const buffer = Buffer.from(cleanBase64, 'base64');
    const filePath = path.join(SAVED_EXAMS_PDF_DIR, `${id}.pdf`);
    fs.writeFileSync(filePath, buffer);

    const results = readJson(RESULTS_FILE, []);
    const idx = results.findIndex(r => String(r.id).trim() === String(id).trim());
    if (idx !== -1) {
      results[idx].hasPdf = true;
      results[idx].pdfUrl = `/api/results/${id}/pdf`;
      results[idx].pdfSavedAt = new Date().toISOString();
      writeJson(RESULTS_FILE, results);
    }

    res.json({ success: true, message: 'קובץ ה-PDF נשמר בהצלחה בשרת', pdfUrl: `/api/results/${id}/pdf` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'שגיאה בשמירת קובץ ה-PDF: ' + err.message });
  }
});

// Download / stream saved PDF
app.get('/api/results/:id/pdf', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(SAVED_EXAMS_PDF_DIR, `${id}.pdf`);
  const results = readJson(RESULTS_FILE, []);
  const record = results.find(r => String(r.id).trim() === String(id).trim());
  const employeeName = record?.employeeName || 'עובד';

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="mivhan_${encodeURIComponent(employeeName)}_${id}.pdf"`);
    return fs.createReadStream(filePath).pipe(res);
  }

  // Redirect to printable report if static PDF is not yet saved
  res.redirect(`/api/results/${id}/report?print=1`);
});

// Standalone Printable Exam Report (styled for A4 printing and browser Save-to-PDF)
app.get('/api/results/:id/report', (req, res) => {
  const { id } = req.params;
  const results = readJson(RESULTS_FILE, []);
  const record = results.find(r => String(r.id).trim() === String(id).trim());

  if (!record) {
    return res.status(404).send('<h2>רשומת מבחן לא נמצאה</h2>');
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
  <title>דוח מבחן - ${record.employeeName} (${record.employeeId})</title>
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
      <div class="meta-item"><strong>שם הנבחן:</strong> ${record.employeeName}</div>
      <div class="meta-item"><strong>מספר אישי:</strong> ${record.employeeId}</div>
      <div class="meta-item"><strong>מחלקה:</strong> ${record.department}</div>
      <div class="meta-item"><strong>תאריך ושעה:</strong> ${dateFormatted}</div>
      <div class="meta-item"><strong>משך בחינה:</strong> ${durationMins}</div>
      <div class="meta-item"><strong>מזהה תוצאה:</strong> ${record.id}</div>
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
            <span class="q-topic">${q.topic || 'מכשור ובקרה'}</span>
            <span style="color: ${isCorrect ? '#16a34a' : '#dc2626'}">
              ${isCorrect ? '✓ תשובה נכונה' : '✗ תשובה שגויה'}
            </span>
          </div>

          <div class="q-title">${q.question}</div>

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

              return `<div class="${cls}"><strong>${letters[optIdx]}.</strong> ${opt} ${badge}</div>`;
            }).join('')}
          </div>

          ${q.explanation ? `
            <div class="explanation-box">
              <strong>💡 הסבר טכני מקצועי:</strong> ${q.explanation}
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
// 4. Admin API - Exam Results & Analytics
// -------------------------------------------------------------
app.get('/api/admin/results', (req, res) => {
  const results = readJson(RESULTS_FILE, []);
  res.json({ success: true, results });
});

// Export Results as Excel-friendly CSV with UTF-8 BOM
app.get('/api/admin/export-csv', (req, res) => {
  const results = readJson(RESULTS_FILE, []);

  // UTF-8 BOM header so Hebrew opens without mojibake in Microsoft Excel
  let csv = '\uFEFFמזהה תוצאה,מספר אישי,שם עובד,מחלקה,תאריך ושעה,ציון,שאלות נכונות,סה"כ שאלות,סטטוס,זמן בשניות\n';

  results.forEach(r => {
    const dateFormatted = new Date(r.submittedAt).toLocaleString('he-IL');
    const statusHe = r.status === 'passed' ? 'עבר' : 'נכשל';
    csv += `"${r.id}","${r.employeeId}","${r.employeeName}","${r.department}","${dateFormatted}",${r.score},${r.correctCount},${r.totalQuestions},"${statusHe}",${r.timeSpentSeconds}\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="mivhanan_results.csv"');
  res.send(csv);
});

// -------------------------------------------------------------
// Full System Backup (ZIP) - All JSON files + all saved PDF reports
// -------------------------------------------------------------
app.get('/api/admin/backup-zip', (req, res) => {
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

// Full System Restore from uploaded ZIP (restores JSON files and all PDF reports)
app.post('/api/admin/restore-zip', zipUpload.single('backupZip'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'לא נבחר קובץ ZIP לשחזור' });
  }

  try {
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();
    let restoredCount = 0;

    zipEntries.forEach(entry => {
      const entryName = entry.entryName.replace(/\\/g, '/');
      if (entryName === 'employees.json') {
        fs.writeFileSync(EMPLOYEES_FILE, entry.getData());
        restoredCount++;
      } else if (entryName === 'exam_results.json') {
        fs.writeFileSync(RESULTS_FILE, entry.getData());
        restoredCount++;
      } else if (entryName === 'questions.json') {
        fs.writeFileSync(QUESTIONS_FILE, entry.getData());
        restoredCount++;
      } else if (entryName.startsWith('saved_exams_pdf/') && !entry.isDirectory) {
        const filename = path.basename(entryName);
        if (filename) {
          fs.writeFileSync(path.join(SAVED_EXAMS_PDF_DIR, filename), entry.getData());
          restoredCount++;
        }
      }
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
app.get('/api/admin/export-schedules-csv', (req, res) => {
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

    const notes = (emp.scheduleNotes || '').replace(/"/g, '""');
    csv += `"${emp.id}","${emp.name}","${emp.department}","${emp.role}",${emp.level || 2},"${lastExamStr}","${lastScoreStr}","${lastStatusStr}","${targetDateStr}","${statusHebrew}","${daysStr}","${notes}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="mivhanan_4_months_tracking.csv"');
  res.send(csv);
});

// Delete Exam Result by ID
app.delete('/api/admin/results/:id', (req, res) => {
  const cleanId = String(req.params.id || '').trim();
  const results = readJson(RESULTS_FILE, []);
  const initialLen = results.length;
  const filtered = results.filter(r => String(r.id).trim() !== cleanId);

  if (filtered.length === initialLen) {
    return res.status(404).json({ success: false, message: 'רשומת המבחן לא נמצאה במערכת' });
  }

  writeJson(RESULTS_FILE, filtered);

  // Clean up PDF file if it exists
  const pdfPath = path.join(SAVED_EXAMS_PDF_DIR, `${cleanId}.pdf`);
  if (fs.existsSync(pdfPath)) {
    try { fs.unlinkSync(pdfPath); } catch {}
  }

  res.json({ success: true, message: 'רשומת המבחן נמחקה בהצלחה', remainingCount: filtered.length });
});

// -------------------------------------------------------------
// 5. Admin API - Question & Employee Management + Image Upload
// -------------------------------------------------------------

// Upload & auto-optimize question image
app.post('/api/admin/upload-image', upload.single('image'), (req, res) => {
  try {
    let filename = '';

    if (req.file) {
      filename = req.file.filename;
    } else if (req.body.imageBase64) {
      const { imageBase64, mimeType } = req.body;
      const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(imageBase64, 'base64');
      const ext = mimeType ? (mimeType.includes('svg') ? '.svg' : mimeType.includes('webp') ? '.webp' : mimeType.includes('jpeg') ? '.jpg' : '.png') : '.png';
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

app.get('/api/admin/questions', (req, res) => {
  const questions = readJson(QUESTIONS_FILE, []);
  res.json({ success: true, questions });
});

app.post('/api/admin/questions', (req, res) => {
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
app.delete('/api/admin/questions/:id', (req, res) => {
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

app.get('/api/admin/employees', (req, res) => {
  const employees = readJson(EMPLOYEES_FILE, []);
  res.json({ success: true, employees });
});

app.post('/api/admin/employees', (req, res) => {
  const { id, name, department, role, level, isAdmin } = req.body;
  if (!id || !name) {
    return res.status(400).json({ success: false, message: 'נדרש מספר אישי ושם עובד' });
  }

  const employees = readJson(EMPLOYEES_FILE, []);
  if (employees.some(e => String(e.id).trim() === String(id).trim())) {
    return res.status(400).json({ success: false, message: 'מספר אישי זה כבר קיים במערכת' });
  }

  const newEmp = {
    id: String(id).trim(),
    name: String(name).trim(),
    department: department || 'מכשיריית חומר גלם',
    role: role || 'מכשירן',
    level: level ? parseInt(level, 10) : 2,
    isAdmin: Boolean(isAdmin),
    email: `${String(id).trim()}@company.com`
  };

  employees.push(newEmp);
  writeJson(EMPLOYEES_FILE, employees);
  res.json({ success: true, employee: newEmp });
});

// Update employee level
app.patch('/api/admin/employees/:id/level', (req, res) => {
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
    employee: employees[empIndex]
  });
});

// Update full employee details
app.put('/api/admin/employees/:id', (req, res) => {
  const { id } = req.params;
  const { name, department, role, level, isAdmin } = req.body;

  const employees = readJson(EMPLOYEES_FILE, []);
  const empIndex = employees.findIndex(e => String(e.id).trim() === String(id).trim());

  if (empIndex === -1) {
    return res.status(404).json({ success: false, message: 'העובד לא נמצא במערכת' });
  }

  if (name !== undefined) employees[empIndex].name = name;
  if (department !== undefined) employees[empIndex].department = department;
  if (role !== undefined) employees[empIndex].role = role;
  if (level !== undefined) employees[empIndex].level = parseInt(level, 10);
  if (isAdmin !== undefined) employees[empIndex].isAdmin = Boolean(isAdmin);

  writeJson(EMPLOYEES_FILE, employees);

  res.json({
    success: true,
    message: 'פרטי העובד עודכנו בהצלחה',
    employee: employees[empIndex]
  });
});

// Update employee exam schedule (4-month tracking target date & notes)
app.patch('/api/admin/employees/:id/schedule', (req, res) => {
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
    employee: employees[empIndex]
  });
});

// Auto-schedule next 4-month exam date for employees
app.post('/api/admin/employees/auto-schedule', (req, res) => {
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
    employees
  });
});

// Delete Employee by ID
app.delete('/api/admin/employees/:id', (req, res) => {
  const { id } = req.params;
  const cleanId = String(id).trim();

  // Prevent accidental deletion of primary System Administrator (9999)
  if (cleanId === '9999') {
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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
