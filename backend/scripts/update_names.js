import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { EmployeeModel, ExamResultModel } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMPLOYEES_FILE = path.join(__dirname, '../data/employees.json');
const RESULTS_FILE = path.join(__dirname, '../data/exam_results.json');

async function updateNames() {
  console.log('🔄 Updating employee names: removing apostrophes and updating aliases...');

  const employees = JSON.parse(fs.readFileSync(EMPLOYEES_FILE, 'utf-8'));
  const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));

  const nameMap = new Map();

  const updatedEmployees = employees.map(emp => {
    if (emp.isAdmin || emp.id === 'admin' || emp.id === '9999') {
      return {
        ...emp,
        id: 'admin',
        name: 'מנהל מערכת',
        username: 'מנהל מערכת'
      };
    }

    // Remove apostrophes, quotes, etc.
    let clean = emp.name.replace(/['"״׳`]/g, '').trim();

    // Specific user requests
    if (clean.startsWith('עדיאל')) {
      clean = clean.replace('עדיאל', 'עדי');
    } else if (clean.startsWith('אדוארד')) {
      clean = clean.replace('אדוארד', 'אדי');
    }

    nameMap.set(emp.name, clean);
    nameMap.set(emp.id, clean);

    return {
      ...emp,
      name: clean,
      username: clean
    };
  });

  // Update Exam Results
  const updatedResults = results.map(res => {
    let cleanName = res.employeeName ? res.employeeName.replace(/['"״׳`]/g, '').trim() : 'עובד מוסמך';
    if (cleanName.startsWith('עדיאל')) cleanName = cleanName.replace('עדיאל', 'עדי');
    if (cleanName.startsWith('אדוארד')) cleanName = cleanName.replace('אדוארד', 'אדי');

    return {
      ...res,
      employeeName: cleanName
    };
  });

  // Save to JSON
  fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(updatedEmployees, null, 2), 'utf-8');
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(updatedResults, null, 2), 'utf-8');
  console.log('✅ Local JSON files updated successfully.');

  // Sync to MongoDB Atlas
  const uri = process.env.MONGODB_URI;
  if (uri) {
    console.log('🌐 Connecting to MongoDB Atlas to sync updated names...');
    await mongoose.connect(uri);
    await EmployeeModel.deleteMany({});
    await EmployeeModel.insertMany(updatedEmployees);
    await ExamResultModel.deleteMany({});
    await ExamResultModel.insertMany(updatedResults);
    console.log('✅ MongoDB Atlas synchronized with clean names.');
    await mongoose.disconnect();
  }

  console.log('\n--- Updated Employee Names and Usernames ---');
  updatedEmployees.forEach(e => {
    console.log(`${e.id.padEnd(8)} | ${e.name.padEnd(12)} | Username: ${e.username.padEnd(12)} | Password: ${e.password}`);
  });
}

updateNames().catch(err => {
  console.error('Error updating names:', err);
  process.exit(1);
});
