# -*- coding: utf-8 -*-
"""
Merge and Validate 250 New Exam Questions into questions.json
Total Questions will be 111 (existing) + 250 (new) = 361 questions.
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

all_new_questions = (part1_questions + part2_questions + part3_questions + part4_questions)[:250]
print(f"Total new questions selected: {len(all_new_questions)}")

# Load existing questions
with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
    existing_questions = json.load(f)

print(f"Existing questions in questions.json: {len(existing_questions)}")

# Create backup of questions.json
shutil.copyfile(QUESTIONS_FILE, BACKUP_FILE)
print(f"Backup created at: {BACKUP_FILE}")

# Assign unique IDs: q112 to q361
existing_ids = set(q['id'] for q in existing_questions)
next_index = 112

processed_new_questions = []
for i, q in enumerate(all_new_questions):
    new_id = f"q{next_index}"
    next_index += 1
    while new_id in existing_ids:
        new_id = f"q{next_index}"
        next_index += 1
    existing_ids.add(new_id)

    # Validate image path on disk
    image_rel = q['image'].lstrip('/')
    image_path = os.path.join(FRONTEND_PUBLIC_DIR, image_rel.replace('/', os.sep))
    if not os.path.exists(image_path):
        print(f"WARNING: Image not found on disk: {image_path}")

    # Validate options
    if not isinstance(q.get('options'), list) or len(q['options']) != 4:
        raise ValueError(f"Question {new_id} does not have exactly 4 options")

    # Validate correctAnswer
    if q.get('correctAnswer') not in [0, 1, 2, 3]:
        raise ValueError(f"Question {new_id} has invalid correctAnswer: {q.get('correctAnswer')}")

    # Validate level
    if q.get('level') not in [1, 2, 3]:
        raise ValueError(f"Question {new_id} has invalid level: {q.get('level')}")

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
    processed_new_questions.append(new_q)

# Merge
merged_questions = existing_questions + processed_new_questions
print(f"Merged total questions: {len(merged_questions)}")

# Write to questions.json
with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
    json.dump(merged_questions, f, ensure_ascii=False, indent=2)

print(f"Successfully saved {len(merged_questions)} questions to {QUESTIONS_FILE}!")

# Summary Statistics
topic_counts = {}
level_counts = {}
for q in merged_questions:
    t = q['topic']
    topic_counts[t] = topic_counts.get(t, 0) + 1
    lvl = q['level']
    level_counts[lvl] = level_counts.get(lvl, 0) + 1

print("\n--- Summary by Level ---")
print(f"Level 1 (מתחיל): {level_counts.get(1, 0)}")
print(f"Level 2 (בינוני): {level_counts.get(2, 0)}")
print(f"Level 3 (מתקדם): {level_counts.get(3, 0)}")

print("\n--- Summary by Topic (Top 25) ---")
for t, c in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:25]:
    print(f"- {t}: {c} questions")
