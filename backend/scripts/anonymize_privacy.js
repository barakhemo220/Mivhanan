import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { EmployeeModel, ExamResultModel, SavedPdfModel } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMPLOYEES_FILE = path.join(__dirname, '../data/employees.json');
const RESULTS_FILE = path.join(__dirname, '../data/exam_results.json');
const SAVED_EXAMS_PDF_DIR = path.join(__dirname, '../data/saved_exams_pdf');

// Function to generate high-security unique passwords (e.g. Miv#4829!, Sec@7123$)
function generateStrongPassword(index) {
  const prefixes = ['Miv', 'Sec', 'Aut', 'Pro', 'Con', 'Saf', 'Tek', 'Ctl', 'Ind', 'Opt'];
  const specials = ['!', '#', '$', '@', '&'];
  const prefix = prefixes[index % prefixes.length];
  const s1 = specials[index % specials.length];
  const s2 = specials[(index + 2) % specials.length];
  const num = 1000 + ((index * 389 + 631) % 8999);
  return `${prefix}${s1}${num}${s2}`;
}

async function runAnonymization() {
  console.log('🔒 Starting PII & Privacy Protection Anonymization Process...');

  const rawEmployees = fs.readFileSync(EMPLOYEES_FILE, 'utf-8');
  const employees = JSON.parse(rawEmployees);

  const rawResults = fs.readFileSync(RESULTS_FILE, 'utf-8');
  const results = JSON.parse(rawResults);

  const idMap = new Map(); // oldId -> newId
  const nameMap = new Map(); // oldName -> newName

  // 1. Transform Employees
  const updatedEmployees = employees.map((emp, index) => {
    const isPrimaryAdmin = emp.isAdmin || String(emp.id).trim() === '9999';

    if (isPrimaryAdmin) {
      idMap.set(String(emp.id).trim(), 'admin');
      nameMap.set(emp.name, 'מנהל מערכת');
      return {
        id: 'admin',
        name: 'מנהל מערכת',
        username: 'מנהל מערכת',
        password: process.env.ADMIN_PASSWORD || '',
        department: emp.department || 'הנהלת מכשור ובקרה',
        role: emp.role || 'מנהל מערכת ראשי (Admin)',
        level: emp.level || 3,
        isAdmin: true,
        email: 'admin@mivhanan.internal',
        nextExamDate: null,
        scheduleNotes: '',
        scheduleUpdatedAt: new Date().toISOString()
      };
    }

    const parts = emp.name.trim().split(/\s+/);
    const first = parts[0];
    const lastInitial = parts.length > 1 ? parts[1][0] + "'" : "";
    const anonName = lastInitial ? `${first} ${lastInitial}` : first;
    const anonId = `emp_${String(index + 1).padStart(2, '0')}`;
    const strongPassword = generateStrongPassword(index);

    idMap.set(String(emp.id).trim(), anonId);
    nameMap.set(emp.name, anonName);

    return {
      id: anonId,
      name: anonName,
      username: anonName,
      password: strongPassword,
      department: emp.department,
      role: emp.role,
      level: emp.level || 2,
      isAdmin: false,
      email: `${anonId}@mivhanan.internal`,
      nextExamDate: emp.nextExamDate || null,
      scheduleNotes: emp.scheduleNotes || '',
      scheduleUpdatedAt: emp.scheduleUpdatedAt || null
    };
  });

  // 2. Transform Exam Results
  const updatedResults = results.map(res => {
    const oldEmpId = String(res.employeeId).trim();
    const newEmpId = idMap.get(oldEmpId) || (oldEmpId === '1001' ? 'emp_01' : 'emp_02');
    const newEmpName = nameMap.get(res.employeeName) || 'עובד מוסמך';

    return {
      ...res,
      employeeId: newEmpId,
      employeeName: newEmpName
    };
  });

  // 3. Save to local JSON files
  fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(updatedEmployees, null, 2), 'utf-8');
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(updatedResults, null, 2), 'utf-8');
  console.log('✅ Local JSON files updated with anonymized data and strong passwords.');

  // 4. Update MongoDB Atlas
  const uri = process.env.MONGODB_URI;
  if (uri) {
    console.log('🌐 Connecting to MongoDB Atlas to synchronize anonymized records...');
    await mongoose.connect(uri);

    // Overwrite Atlas employees
    await EmployeeModel.deleteMany({});
    await EmployeeModel.insertMany(updatedEmployees);
    console.log(`✅ MongoDB Atlas: Replaced with ${updatedEmployees.length} anonymized employee records.`);

    // Overwrite Atlas results
    await ExamResultModel.deleteMany({});
    await ExamResultModel.insertMany(updatedResults);
    console.log(`✅ MongoDB Atlas: Replaced with ${updatedResults.length} anonymized result records.`);

    // Update Saved PDFs employeeId if matched
    const pdfs = await SavedPdfModel.find({});
    for (const pdf of pdfs) {
      if (pdf.employeeId && idMap.has(pdf.employeeId)) {
        pdf.employeeId = idMap.get(pdf.employeeId);
        await pdf.save();
      }
    }
    console.log(`✅ MongoDB Atlas: Updated PDF records.`);
    await mongoose.disconnect();
  }

  console.log('\n--- Sample of Anonymized Employees ---');
  updatedEmployees.slice(0, 10).forEach(e => {
    console.log(`${e.id} | ${e.name.padEnd(12)} | Username: ${e.username.padEnd(12)} | Password: [PROTECTED]`);
  });
  console.log('admin  | מנהל מערכת   | Username: מנהל מערכת   | Password: [PROTECTED]');
  console.log('\n🔒 Privacy Anonymization Completed Successfully!');
}

runAnonymization().catch(err => {
  console.error('Anonymization error:', err);
  process.exit(1);
});
