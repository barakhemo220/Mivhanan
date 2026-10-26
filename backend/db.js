import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMPLOYEES_FILE = path.join(__dirname, 'data/employees.json');
const QUESTIONS_FILE = path.join(__dirname, 'data/questions.json');
const RESULTS_FILE = path.join(__dirname, 'data/exam_results.json');
const SAVED_EXAMS_PDF_DIR = path.join(__dirname, 'data/saved_exams_pdf');

// Schemas with strict: false to maintain 100% schema flexibility
const EmployeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: String,
  role: String,
  level: Number,
  isAdmin: { type: Boolean, default: false },
  email: String,
  nextExamDate: String,
  scheduleNotes: String,
  scheduleUpdatedAt: String
}, { strict: false, timestamps: true });

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  topic: String,
  level: Number,
  question: { type: String, required: true },
  image: String,
  options: [String],
  correctAnswer: Number,
  explanation: String
}, { strict: false, timestamps: true });

const ExamResultSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: String,
  submittedAt: String,
  score: Number,
  totalQuestions: Number,
  correctCount: Number,
  timeSpentSeconds: Number,
  status: String,
  answers: Array,
  questionIds: Array,
  review: Array,
  hasPdf: Boolean,
  pdfUrl: String,
  pdfSavedAt: String,
  pdfBase64: String
}, { strict: false, timestamps: true });

const SavedPdfSchema = new mongoose.Schema({
  filename: { type: String, required: true, unique: true },
  employeeId: String,
  dataBase64: { type: String, required: true },
  sizeBytes: Number,
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

export const EmployeeModel = mongoose.model('Employee', EmployeeSchema);
export const QuestionModel = mongoose.model('Question', QuestionSchema);
export const ExamResultModel = mongoose.model('ExamResult', ExamResultSchema);
export const SavedPdfModel = mongoose.model('SavedPdf', SavedPdfSchema);

let isConnected = false;

export async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI not set. Running in local JSON fallback mode.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 12000,
      retryWrites: true,
      w: 'majority'
    });
    isConnected = true;
    console.log(`✅ Connected to MongoDB Atlas! (Cluster Database: ${mongoose.connection.name})`);
    
    // Seed initial data from local files if Atlas collections are empty
    await seedAtlasFromLocalIfEmpty();

    // Ensure local filesystem has all files synced from Atlas (especially on fresh Render spin-up)
    await syncAtlasToLocalDisk();

    return true;
  } catch (err) {
    console.error('❌ MongoDB Atlas connection error:', err.message);
    console.warn('⚠️ Server will continue in local JSON fallback mode.');
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * If MongoDB Atlas collections are fresh/empty, seed them from local JSON files & PDFs
 */
async function seedAtlasFromLocalIfEmpty() {
  try {
    // 1. Employees
    const empCount = await EmployeeModel.countDocuments();
    if (empCount === 0 && fs.existsSync(EMPLOYEES_FILE)) {
      const raw = fs.readFileSync(EMPLOYEES_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        await EmployeeModel.insertMany(data);
        console.log(`🌱 [Seed] Migrated ${data.length} employees to MongoDB Atlas.`);
      }
    }

    // 2. Questions
    const qCount = await QuestionModel.countDocuments();
    if (qCount === 0 && fs.existsSync(QUESTIONS_FILE)) {
      const raw = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        await QuestionModel.insertMany(data);
        console.log(`🌱 [Seed] Migrated ${data.length} questions to MongoDB Atlas.`);
      }
    }

    // 3. Exam Results
    const resCount = await ExamResultModel.countDocuments();
    if (resCount === 0 && fs.existsSync(RESULTS_FILE)) {
      const raw = fs.readFileSync(RESULTS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        await ExamResultModel.insertMany(data);
        console.log(`🌱 [Seed] Migrated ${data.length} exam results to MongoDB Atlas.`);
      }
    }

    // 4. Saved PDFs
    if (fs.existsSync(SAVED_EXAMS_PDF_DIR)) {
      const files = fs.readdirSync(SAVED_EXAMS_PDF_DIR).filter(f => f.endsWith('.pdf'));
      for (const file of files) {
        const existing = await SavedPdfModel.findOne({ filename: file });
        if (!existing) {
          const filePath = path.join(SAVED_EXAMS_PDF_DIR, file);
          const buf = fs.readFileSync(filePath);
          await SavedPdfModel.create({
            filename: file,
            dataBase64: buf.toString('base64'),
            sizeBytes: buf.length
          });
          console.log(`🌱 [Seed] Migrated PDF document '${file}' to MongoDB Atlas.`);
        }
      }
    }
  } catch (err) {
    console.error('Error during initial seed to Atlas:', err.message);
  }
}

/**
 * On fresh spin-up (e.g. Render restart or cold start), sync Atlas data to local disk
 * so any local code/downloads/static serving work seamlessly.
 */
export async function syncAtlasToLocalDisk() {
  if (!isDbConnected()) return;

  try {
    // Sync Employees
    const employees = await EmployeeModel.find({}, '-_id -__v').lean();
    if (employees && employees.length > 0) {
      fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(employees, null, 2), 'utf-8');
    }

    // Sync Questions
    const questions = await QuestionModel.find({}, '-_id -__v').lean();
    if (questions && questions.length > 0) {
      fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf-8');
    }

    // Sync Results
    const results = await ExamResultModel.find({}, '-_id -__v').lean();
    if (results && results.length > 0) {
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');
    }

    // Sync PDFs
    if (!fs.existsSync(SAVED_EXAMS_PDF_DIR)) {
      fs.mkdirSync(SAVED_EXAMS_PDF_DIR, { recursive: true });
    }
    const pdfs = await SavedPdfModel.find({}).lean();
    for (const pdfDoc of pdfs) {
      const targetPath = path.join(SAVED_EXAMS_PDF_DIR, pdfDoc.filename);
      if (!fs.existsSync(targetPath) && pdfDoc.dataBase64) {
        fs.writeFileSync(targetPath, Buffer.from(pdfDoc.dataBase64, 'base64'));
      }
    }
    console.log(`🔄 Synced Atlas state to local disk cache (${employees.length} employees, ${questions.length} questions, ${results.length} results, ${pdfs.length} PDFs).`);
  } catch (err) {
    console.error('Error syncing Atlas to local disk:', err.message);
  }
}
