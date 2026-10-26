import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_IMG_DIR = path.join(__dirname, '../public/images/questions');
const FRONTEND_IMG_DIR = path.join(__dirname, '../../frontend/public/images/questions');
const QUESTIONS_FILE = path.join(__dirname, '../data/questions.json');

// Ensure directories exist
if (!fs.existsSync(BACKEND_IMG_DIR)) fs.mkdirSync(BACKEND_IMG_DIR, { recursive: true });
if (!fs.existsSync(FRONTEND_IMG_DIR)) fs.mkdirSync(FRONTEND_IMG_DIR, { recursive: true });

console.log('Generating technical diagrams and questions bank...');
