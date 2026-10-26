# -*- coding: utf-8 -*-
"""
Balanced 250 Questions Generator:
Ensures each of the 20 requested topics has 12-13 comprehensive questions,
totaling EXACTLY 250 new questions.
Merged with the 111 existing questions -> Total 361 questions in database.
"""
import os
import json
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QUESTIONS_FILE = os.path.abspath(os.path.join(BASE_DIR, '..', 'data', 'questions.json'))
BACKUP_FILE = os.path.abspath(os.path.join(BASE_DIR, '..', 'data', 'questions_backup.json'))
FRONTEND_PUBLIC_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', '..', 'frontend', 'public'))

from questions_part1 import part1_questions
from questions_part2 import part2_questions
from questions_part3 import part3_questions
from questions_part4 import part4_questions

# Organize by topic
raw_all = part1_questions + part2_questions + part3_questions + part4_questions
by_topic = {}
for q in raw_all:
    t = q['topic']
    if t not in by_topic:
        by_topic[t] = []
    by_topic[t].append(q)

# Target per topic to reach exactly 250 questions:
# 10 topics with 13 questions (=130) + 10 topics with 12 questions (=120) = 250 questions
target_counts = {
    "חוקיות של אזורים נפיצים (ATEX / IECEx)": 13,
    "מצלמות IP, בדיקת כבלי רשת והגדרות": 12,
    "תקשורת רשתות (IP, Subnet, Gateway)": 12,
    "פרופיבס (Profibus DP & PA)": 12,
    "פרופינט ומתגי רשת L2 (Profinet / MRP)": 12,
    "אנטנות ותקשורת אלחוטית RADWIN": 12,
    "מכשור ובקרה כללי ושסתומי בקרה": 12,
    "סוגי מתכות של מכשור ועמידות כימית": 13,
    "בקרי שניידר - כרטיסי I/O וחיווט": 13,
    "תחום מדידת pH ואנליזה": 13,
    "מדי עכירות (Turbidity)": 12,
    "יחידות מדידה והמרות במכשור": 13,
    "חישובים פיזיקליים של מכשור": 13,
    "מדי ספיקה לגזים ושמנים": 13,
    "קרינה מייננת ובטיחות קרינה במכשור": 13,
    "בטיחות פונקציונלית (SIL 2 / SIL 3)": 13,
    "מתמרי שקילה (Load Cell)": 13,
    "בדיקת מתמרי משקל בשטח": 12,
    "שקילה בתנועה (Belt Scales)": 12,
    "אימות חיובי (PMI) וולידציית מערכות בקרה": 12
}

selected_new = []
for topic, target in target_counts.items():
    available = by_topic.get(topic, [])
    chosen = available[:target]
    selected_new.extend(chosen)

assert len(selected_new) == 250, f"Expected 250, got {len(selected_new)}"

# Load the original 111 existing questions from backup or clean source
with open(BACKUP_FILE, 'r', encoding='utf-8') as f:
    existing_questions = json.load(f)

# Reassign sequential IDs: q112 to q361
existing_ids = set(q['id'] for q in existing_questions)
next_index = 112

processed_new = []
for q in selected_new:
    new_id = f"q{next_index}"
    next_index += 1
    while new_id in existing_ids:
        new_id = f"q{next_index}"
        next_index += 1
    existing_ids.add(new_id)

    new_q = {
        "id": new_id,
        "topic": q["topic"].strip(),
        "level": q["level"],
        "question": q["question"].strip(),
        "image": q["image"].strip(),
        "options": [opt.strip() for opt in q["options"]],
        "correctAnswer": q["correctAnswer"],
        "explanation": q["explanation"].strip()
    }
    processed_new.append(new_q)

final_bank = existing_questions + processed_new

with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
    json.dump(final_bank, f, ensure_ascii=False, indent=2)

print(f"Successfully wrote {len(final_bank)} questions ({len(existing_questions)} existing + {len(processed_new)} new).")
