# -*- coding: utf-8 -*-
"""
Generate Batch 2 of Industrial SVG Diagrams for New Exam Questions
SVGs 9 to 19 created in frontend/public/images/questions/
"""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', '..', 'frontend', 'public', 'images', 'questions'))
os.makedirs(OUTPUT_DIR, exist_ok=True)

svgs = {}

# 9. pH Sensor & Nernst Equation
svgs['diag_ph_sensor_nernst.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#06b6d4" stroke-width="1.2" />
  <text x="210" y="36" fill="#22d3ee" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">עקרון מדידת pH: אלקטרודת שילוב, משוואת נרנסט וכיול</text>

  <!-- Left: Combination pH Electrode Construction -->
  <g transform="translate(40, 65)">
    <rect x="0" y="0" width="280" height="245" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <text x="140" y="24" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">מבנה אלקטרודת pH משולבת (Glass + Reference)</text>
    <line x1="10" y1="34" x2="270" y2="34" stroke="#334155" />

    <!-- Glass Stem -->
    <rect x="125" y="45" width="30" height="150" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
    <!-- Measuring Glass Bulb (Bottom) -->
    <path d="M 125,195 Q 120,225 140,225 Q 160,225 155,195 Z" fill="#38bdf8" opacity="0.7" stroke="#0284c7" stroke-width="2" />
    <text x="140" y="215" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">H⁺</text>

    <!-- Porous Ceramic Junction (Side) -->
    <circle cx="155" cy="175" r="4" fill="#f59e0b" stroke="#ffffff" />
    <text x="195" y="178" fill="#fbbf24" font-family="Arial, sans-serif" font-size="9">דיאפרגמה קרמית (Junction)</text>

    <!-- Internal Reference Ag/AgCl & KCl 3M -->
    <line x1="135" y1="50" x2="135" y2="185" stroke="#ef4444" stroke-width="2" />
    <text x="65" y="80" fill="#fca5a5" font-family="Arial, sans-serif" font-size="9">חוט כסף/כלוריד Ag/AgCl</text>
    <text x="65" y="125" fill="#93c5fd" font-family="Arial, sans-serif" font-size="9">אלקטרוליט KCl 3M (ג'ל)</text>
    <text x="75" y="235" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold">בועת זכוכית רגישה</text>
  </g>

  <!-- Right: Nernst Slope Voltage Curve -->
  <g transform="translate(340, 65)">
    <rect x="0" y="0" width="380" height="245" rx="8" fill="#1e293b" stroke="#475569" />
    <text x="190" y="24" fill="#22d3ee" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">עקומת מתח מול pH (משוואת נרנסט: 59.16mV ל-pH ב-25°C)</text>
    <line x1="10" y1="34" x2="370" y2="34" stroke="#334155" />

    <!-- Axes -->
    <line x1="50" y1="135" x2="350" y2="135" stroke="#64748b" stroke-width="1.5" /> <!-- X-axis (mV = 0) -->
    <line x1="200" y1="45" x2="200" y2="225" stroke="#64748b" stroke-width="1.5" /> <!-- Y-axis (pH = 7) -->

    <text x="355" y="139" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">pH</text>
    <text x="200" y="42" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">+mV (חומצי)</text>
    <text x="200" y="238" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">-mV (בסיסי)</text>

    <!-- Nernst Line: Slope -59.16 mV/pH -->
    <line x1="70" y1="55" x2="330" y2="215" stroke="#22d3ee" stroke-width="3" />

    <!-- Key Points -->
    <!-- Zero point pH 7 = 0mV -->
    <circle cx="200" cy="135" r="5" fill="#f59e0b" />
    <text x="205" y="125" fill="#fbbf24" font-family="Arial, sans-serif" font-size="10" font-weight="bold">pH 7.00 = 0 mV (נקודת אפס)</text>

    <!-- pH 4 = +177.5 mV -->
    <circle cx="140" cy="95" r="4" fill="#ef4444" />
    <text x="135" y="85" fill="#fca5a5" font-family="Arial, sans-serif" font-size="9" text-anchor="end">pH 4.0 (+177 mV)</text>

    <!-- pH 10 = -177.5 mV -->
    <circle cx="260" cy="175" r="4" fill="#3b82f6" />
    <text x="265" y="190" fill="#93c5fd" font-family="Arial, sans-serif" font-size="9">pH 10.0 (-177 mV)</text>

    <!-- ATC Note -->
    <rect x="25" y="185" width="160" height="45" rx="4" fill="#0f172a" stroke="#0ea5e9" />
    <text x="105" y="202" fill="#7dd3fc" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">פיצוי טמפ' ATC (Pt100):</text>
    <text x="105" y="218" fill="#ffffff" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">מפצה על שינוי שיפוע הנרנסט בטמפ'</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#22d3ee" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">כללי אחזקה וכיול אלקטרודת pH:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">כיול נעשה בשני בופרים (בופר 7 לאיפוס Zero Offset, ובופר 4 או 10 לשיפוע Slope). אסור לאחסן אלקטרודה יבשה או במים מזוקקים (רק בתמיסת KCl 3M!).</text>
</svg>'''

# 10. Turbidity Meters (Nephelometric 90°)
svgs['diag_turbidity_nephelometric_90.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#14b8a6" stroke-width="1.2" />
  <text x="210" y="36" fill="#2dd4bf" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">עקרון מדידת עכירות (Turbidity): שיטת פיזור אור 90° (NTU / FNU)</text>

  <!-- Main Diagram: Sample Chamber & Detectors -->
  <g transform="translate(60, 65)">
    <!-- Sample Cuvette / Flow Cell -->
    <rect x="180" y="50" width="140" height="150" rx="10" fill="rgba(20, 184, 166, 0.12)" stroke="#14b8a6" stroke-width="2" />
    <text x="250" y="40" fill="#2dd4bf" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">תא דגימה / זרימת מים</text>

    <!-- Suspended Particles inside Water -->
    <circle cx="220" cy="110" r="3.5" fill="#f59e0b" />
    <circle cx="260" cy="130" r="4.5" fill="#f59e0b" />
    <circle cx="235" cy="155" r="3" fill="#f59e0b" />
    <circle cx="280" cy="95" r="4" fill="#f59e0b" />
    <text x="250" y="180" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">חלקיקים מרחפים (Suspended Solids)</text>

    <!-- Light Source (LED NIR 860nm or Tungsten Lamp) on Left -->
    <rect x="40" y="105" width="75" height="40" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <text x="77" y="125" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">מקור אור NIR</text>
    <text x="77" y="138" fill="#94a3b8" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">860nm / ISO 7027</text>

    <!-- Incident Light Beam -->
    <path d="M 115,125 L 180,125" fill="none" stroke="#38bdf8" stroke-width="5" />
    <path d="M 180,125 L 320,125" fill="none" stroke="#38bdf8" stroke-width="4" stroke-opacity="0.6" />

    <!-- 180 Transmitted Light Detector (Right) -->
    <rect x="345" y="105" width="75" height="40" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="1.5" />
    <text x="382" y="123" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">גלאי העברה</text>
    <text x="382" y="137" fill="#94a3b8" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">Transmitted 180°</text>

    <!-- 90 Scattered Light Beam (Nephelometric Detector) Top -->
    <path d="M 250,125 L 250,2" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="4,2" />
    <rect x="210" y="-35" width="80" height="35" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
    <text x="250" y="-18" fill="#fbbf24" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">גלאי נפלומטרי 90°</text>
    <text x="250" y="-5" fill="#ffffff" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">מדידת אור מפוזר</text>
  </g>

  <!-- Right Side Info Box -->
  <g transform="translate(510, 65)">
    <rect x="0" y="0" width="225" height="245" rx="8" fill="#1e293b" stroke="#475569" />
    <text x="112" y="24" fill="#2dd4bf" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">מאפייני מד עכירות</text>
    <line x1="10" y1="34" x2="215" y2="34" stroke="#334155" />

    <text x="12" y="55" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold">יחידות מדידה:</text>
    <text x="12" y="73" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• NTU (Nephelometric Turbidity)</text>
    <text x="12" y="90" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• FNU (Formazin Nephelometric)</text>

    <text x="12" y="118" fill="#f59e0b" font-family="Arial, sans-serif" font-size="10" font-weight="bold">כיול תקני:</text>
    <text x="12" y="136" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• תמיסת פורמזין (Formazin)</text>
    <text x="12" y="153" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• תקן עבודה משני 20 / 100 NTU</text>

    <text x="12" y="180" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold">גורמי שגיאה נפוצים:</text>
    <text x="12" y="198" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• בועות אוויר (מזייפות כלפי מעלה!)</text>
    <text x="12" y="215" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• לכלוך זגוגית (חובה מגב Wiper)</text>
    <text x="12" y="232" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• חדירת אור סביבתי חיצוני</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#2dd4bf" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">עקרון נפלומטרי (Nephelometric):</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">אור הפוגע בחלקיקים במים מתפזר לכל הכיוונים. כמות האור הנקלטת בגלאי בזווית 90° ביחס לקרן ישרה פרופורציונלית ישירות לרמת העכירות (NTU).</text>
</svg>'''

# 11. Engineering Units & Conversion Formulas
svgs['diag_pressure_flow_conversions.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#ec4899" stroke-width="1.2" />
  <text x="210" y="36" fill="#f472b6" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">יחידות מדידה והמרות במכשור: לחץ, ספיקה וזרם 4-20mA</text>

  <!-- Left: Pressure Units Conversion -->
  <g transform="translate(35, 65)">
    <rect x="0" y="0" width="220" height="245" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <text x="110" y="24" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">המרות יחידות לחץ</text>
    <line x1="10" y1="34" x2="210" y2="34" stroke="#334155" />

    <rect x="15" y="45" width="190" height="35" rx="4" fill="#0f172a" />
    <text x="105" y="67" fill="#facc15" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">1 bar = 100 kPa = 0.1 MPa</text>

    <rect x="15" y="88" width="190" height="35" rx="4" fill="#0f172a" />
    <text x="105" y="110" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">1 bar = 14.504 psi</text>

    <rect x="15" y="131" width="190" height="35" rx="4" fill="#0f172a" />
    <text x="105" y="153" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">1 bar = 10,197 mmH₂O (~10m)</text>

    <rect x="15" y="174" width="190" height="35" rx="4" fill="#0f172a" />
    <text x="105" y="196" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">1 atm = 1.01325 bar = 760 mmHg</text>

    <text x="105" y="230" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">P_abs = P_gauge + P_atm (1 bar)</text>
  </g>

  <!-- Center: Flow Units & CFM -->
  <g transform="translate(270, 65)">
    <rect x="0" y="0" width="220" height="245" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
    <text x="110" y="24" fill="#34d399" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">המרות ספיקה (נוזל וגז)</text>
    <line x1="10" y1="34" x2="210" y2="34" stroke="#334155" />

    <rect x="15" y="45" width="190" height="35" rx="4" fill="#0f172a" />
    <text x="105" y="67" fill="#34d399" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">1 m³/h = 16.667 L/min</text>

    <rect x="15" y="88" width="190" height="35" rx="4" fill="#0f172a" />
    <text x="105" y="110" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">60 m³/h = 1,000 L/min</text>

    <rect x="15" y="131" width="190" height="35" rx="4" fill="#0f172a" />
    <text x="105" y="153" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">1 m³/h = 0.5886 CFM</text>

    <rect x="15" y="174" width="190" height="35" rx="4" fill="#0f172a" />
    <text x="105" y="196" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">1 CFM = 1.699 m³/h</text>

    <text x="105" y="230" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">CFM = Cubic Feet per Minute</text>
  </g>

  <!-- Right: Loop Current 4-20mA Scaling -->
  <g transform="translate(505, 65)">
    <rect x="0" y="0" width="220" height="245" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" />
    <text x="110" y="24" fill="#fbbf24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">סולם זרם 4-20mA</text>
    <line x1="10" y1="34" x2="210" y2="34" stroke="#334155" />

    <!-- Table of 4-20mA to % -->
    <rect x="15" y="42" width="190" height="26" rx="3" fill="#0f172a" />
    <text x="40" y="59" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold">4 mA</text>
    <text x="105" y="59" fill="#ffffff" font-family="Arial, sans-serif" font-size="10">0%</text>
    <text x="165" y="59" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9">LRV (אפס)</text>

    <rect x="15" y="73" width="190" height="26" rx="3" fill="#0f172a" />
    <text x="40" y="90" fill="#f59e0b" font-family="Arial, sans-serif" font-size="10" font-weight="bold">8 mA</text>
    <text x="105" y="90" fill="#ffffff" font-family="Arial, sans-serif" font-size="10">25%</text>
    <text x="165" y="90" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9">רבע סקלה</text>

    <rect x="15" y="104" width="190" height="26" rx="3" fill="#1e293b" stroke="#38bdf8" />
    <text x="40" y="121" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold">12 mA</text>
    <text x="105" y="121" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold">50%</text>
    <text x="165" y="121" fill="#38bdf8" font-family="Arial, sans-serif" font-size="9" font-weight="bold">אמצע תחום</text>

    <rect x="15" y="135" width="190" height="26" rx="3" fill="#0f172a" />
    <text x="40" y="152" fill="#10b981" font-family="Arial, sans-serif" font-size="10" font-weight="bold">16 mA</text>
    <text x="105" y="152" fill="#ffffff" font-family="Arial, sans-serif" font-size="10">75%</text>
    <text x="165" y="152" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9">שלושת-רבעי</text>

    <rect x="15" y="166" width="190" height="26" rx="3" fill="#0f172a" />
    <text x="40" y="183" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold">20 mA</text>
    <text x="105" y="183" fill="#ffffff" font-family="Arial, sans-serif" font-size="10">100%</text>
    <text x="165" y="183" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9">URV (מלא)</text>

    <text x="105" y="215" fill="#facc15" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">mA = 4 + (0.16 × אחוז)</text>
    <text x="105" y="232" fill="#94a3b8" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">0 mA = תקלת נתק בכבל (NAMUR NE43)</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#f472b6" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">נוסחת המרה מהירה:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">עבור כל קריאה במיליאמפר: אחוז = (I_mA - 4) / 16 × 100%. לדוגמה: 12mA מתאים ל- (12 - 4) / 16 = 50% מהתחום ההנדסי של המשדר.</text>
</svg>'''

# 12. Hydrostatic Level & dP Calculations
svgs['diag_hydrostatic_dp_calculations.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2" />
  <text x="210" y="36" fill="#38bdf8" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">חישובים פיזיקליים: לחץ הידרוסטטי וספיקת לחץ דיפרנציאלי</text>

  <!-- Left: Hydrostatic Level P = rho * g * h -->
  <g transform="translate(40, 65)">
    <rect x="0" y="0" width="320" height="245" rx="8" fill="#1e293b" stroke="#0ea5e9" stroke-width="1.5" />
    <text x="160" y="24" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">לחץ הידרוסטטי במכל: P = ρ · g · h</text>
    <line x1="10" y1="34" x2="310" y2="34" stroke="#334155" />

    <!-- Open Tank Graphic -->
    <rect x="40" y="55" width="100" height="130" fill="none" stroke="#38bdf8" stroke-width="2" />
    <rect x="42" y="105" width="96" height="78" fill="#0284c7" opacity="0.6" /> <!-- Liquid -->

    <!-- Height Arrow h -->
    <line x1="155" y1="105" x2="155" y2="183" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow)" />
    <text x="165" y="145" fill="#fbbf24" font-family="Arial, sans-serif" font-size="11" font-weight="bold">גובה נוזל h</text>

    <!-- DP Transmitter at Bottom -->
    <circle cx="90" cy="205" r="14" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
    <text x="90" y="209" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">LT</text>
    <line x1="90" y1="185" x2="90" y2="191" stroke="#38bdf8" stroke-width="2" />

    <!-- Formula Box -->
    <rect x="180" y="65" width="130" height="70" rx="4" fill="#0f172a" stroke="#0284c7" />
    <text x="245" y="85" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">P = ρ · g · h</text>
    <text x="245" y="105" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">עבור מים (ρ = 1000):</text>
    <text x="245" y="122" fill="#facc15" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">1 מטר מים = 100 mbar</text>

    <text x="160" y="228" fill="#fca5a5" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">אם צפיפות הנוזל משתנה - גובה המפלס יזייף!</text>
  </g>

  <!-- Right: Orifice Flow Q = K * sqrt(dP) -->
  <g transform="translate(390, 65)">
    <rect x="0" y="0" width="330" height="245" rx="8" fill="#1e293b" stroke="#a855f7" stroke-width="1.5" />
    <text x="165" y="24" fill="#d8b4fe" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ספיקה בלחץ דיפרנציאלי: Q = K · √ΔP</text>
    <line x1="10" y1="34" x2="320" y2="34" stroke="#334155" />

    <!-- Orifice Graphic -->
    <line x1="30" y1="75" x2="300" y2="75" stroke="#64748b" stroke-width="3" />
    <line x1="30" y1="125" x2="300" y2="125" stroke="#64748b" stroke-width="3" />
    <!-- Plate Restriction -->
    <line x1="160" y1="75" x2="160" y2="92" stroke="#a855f7" stroke-width="6" />
    <line x1="160" y1="108" x2="160" y2="125" stroke="#a855f7" stroke-width="6" />
    <text x="160" y="65" fill="#c084fc" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">צמצם Orifice</text>

    <!-- Quadratic vs Root Square Curve Box -->
    <rect x="30" y="145" width="270" height="85" rx="5" fill="#0f172a" stroke="#6366f1" />
    <text x="45" y="165" fill="#a5b4fc" font-family="Arial, sans-serif" font-size="10" font-weight="bold">השפעת שורש ריבועי על הספיקה:</text>
    <text x="45" y="185" fill="#ffffff" font-family="Arial, sans-serif" font-size="9">• הכפלת הספיקה פי 2 ⇐ הפרש לחץ (ΔP) גדל פי 4!</text>
    <text x="45" y="202" fill="#ffffff" font-family="Arial, sans-serif" font-size="9">• ב-50% ספיקה ⇐ הפרש הלחץ הוא רק 25% מהסקלה!</text>
    <text x="45" y="220" fill="#facc15" font-family="Arial, sans-serif" font-size="9" font-weight="bold">• חובה הוצאת שורש (Square Root) במשדר או בבקר</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">חישובים פיזיקליים מהירים:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">1. מפלס: P = 1000 kg/m³ × 9.81 m/s² × 5m = 49,050 Pa = 490.5 mbar. 2. ספיקה: Q₂/Q₁ = √(ΔP₂/ΔP₁). שגיאת %FS בספיקה נמוכה גורמת לשגיאת מדידה גדולה.</text>
</svg>'''

# 13. Flowmeter Selection for Gases vs Oils
svgs['diag_flowmeter_gas_oil_selection.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.2" />
  <text x="210" y="36" fill="#fbbf24" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">בחירת מדי ספיקה לגזים מול שמנים (התאמה טכנולוגית)</text>

  <!-- Comparison Matrix Table -->
  <g transform="translate(35, 65)">
    <!-- Header -->
    <rect x="0" y="0" width="690" height="32" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2" />
    <text x="90" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">טכנולוגיית מד ספיקה</text>
    <text x="260" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">גזים (אוויר, חנקן, גז טבעי)</text>
    <text x="440" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">שמנים (צמיגיים / פחמימנים)</text>
    <text x="600" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">הערות ותנאי תהליך</text>

    <!-- Row 1: מד מגנטי (Magnetic Flowmeter) -->
    <rect x="0" y="36" width="690" height="36" rx="3" fill="#1e293b" />
    <text x="90" y="58" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">מד מגנטי (Magmeter)</text>
    <text x="260" y="58" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✗ לא עובד! (אין מוליכות)</text>
    <text x="440" y="58" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✗ לא עובד! (שמן אינו מוליך)</text>
    <text x="600" y="58" fill="#fca5a5" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מחייב מוליכות &gt; 5 µS/cm</text>

    <!-- Row 2: קוריוליס (Coriolis Mass Meter) -->
    <rect x="0" y="76" width="690" height="36" rx="3" fill="#0f172a" />
    <text x="90" y="98" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">קוריוליס (Coriolis)</text>
    <text x="260" y="98" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ מצוין (בלחץ מספק)</text>
    <text x="440" y="98" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ מדויק ביותר (מסה וצפיפות)</text>
    <text x="600" y="98" fill="#86efac" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">אינו תלוי בצמיגות או זרימה</text>

    <!-- Row 3: מערבולות (Vortex Flowmeter) -->
    <rect x="0" y="116" width="690" height="36" rx="3" fill="#1e293b" />
    <text x="90" y="138" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">וורטקס (Vortex)</text>
    <text x="260" y="138" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ מעולה (גז וקיטור)</text>
    <text x="440" y="138" fill="#eab308" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">○ רק בשמנים קלים (דלילים)</text>
    <text x="600" y="138" fill="#fde047" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">צמיגות גבוהה משככת מערבולות</text>

    <!-- Row 4: תרמי מסה (Thermal Mass Flowmeter) -->
    <rect x="0" y="156" width="690" height="36" rx="3" fill="#0f172a" />
    <text x="90" y="178" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">תרמי מסה (Thermal)</text>
    <text x="260" y="178" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ אידיאלי לגזים נקיים</text>
    <text x="440" y="178" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✗ לא מיועד לשמנים</text>
    <text x="600" y="178" fill="#93c5fd" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מודד ספיקה מסית ללא פיצוי P/T</text>

    <!-- Row 5: גלגלי שיניים / תזוזה חיובית (Oval Gear / PD) -->
    <rect x="0" y="196" width="690" height="36" rx="3" fill="#1e293b" />
    <text x="90" y="218" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">תזוזה חיובית (PD / Oval)</text>
    <text x="260" y="218" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">✗ אינו מתאים לגז</text>
    <text x="440" y="218" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ מושלם לשמנים צמיגיים ודלק</text>
    <text x="600" y="218" fill="#86efac" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">ככל שצמיג יותר - כך מדויק יותר!</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#fbbf24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">שאלת מפתח במבחני הסמכה:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">האם ניתן למדוד ספיקת שמן הידראולי או סולר באמצעות מד ספיקה מגנטי? התשובה היא חד משמעית: לא! לשמנים ופחמימנים אין מוליכות חשמלית יונית הנדרשת לחוק פאראדיי.</text>
</svg>'''

# 14. Nuclear Radiation Gauges & Radiation Safety
svgs['diag_radiation_nuclear_gauge.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#eab308" stroke-width="1.2" />
  <text x="210" y="36" fill="#facc15" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">מכשור רדיומטרי (קרינה מייננת): מדידת מפלס, מונה גייגר ו-ALARA</text>

  <!-- Tank with Source Holder and Scintillation Detector -->
  <g transform="translate(60, 65)">
    <!-- Source Housing (Left of Tank) -->
    <rect x="20" y="80" width="85" height="95" rx="8" fill="#1e293b" stroke="#eab308" stroke-width="2" />
    <!-- Radiation Symbol -->
    <circle cx="62" cy="115" r="14" fill="#facc15" />
    <circle cx="62" cy="115" r="5" fill="#0f172a" />
    <text x="62" y="145" fill="#facc15" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">מקור Cs-137</text>
    <text x="62" y="162" fill="#ffffff" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">תריס Shutter מוגן עופרת</text>

    <!-- Thick Wall Process Vessel (Center) -->
    <rect x="155" y="40" width="130" height="180" rx="10" fill="#1e293b" stroke="#64748b" stroke-width="3" />
    <!-- Material / Slurry inside Tank -->
    <rect x="158" y="115" width="124" height="102" rx="6" fill="#475569" opacity="0.8" />
    <text x="220" y="165" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">בוצה / חומר בולע</text>

    <!-- Gamma Radiation Beam -->
    <path d="M 105,120 L 155,120" stroke="#facc15" stroke-width="4" stroke-dasharray="4,2" />
    <path d="M 155,120 L 285,120" stroke="#facc15" stroke-width="2" stroke-opacity="0.3" stroke-dasharray="3,3" />
    <path d="M 285,120 L 335,120" stroke="#facc15" stroke-width="2" stroke-opacity="0.4" stroke-dasharray="2,2" />

    <!-- Scintillation Detector (Right of Tank) -->
    <rect x="335" y="80" width="95" height="95" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    <text x="382" y="105" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">גלאי נצנוץ</text>
    <text x="382" y="125" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Scintillator + PMT</text>
    <text x="382" y="145" fill="#94a3b8" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">ספירות לשנייה (CPS)</text>
    <text x="382" y="162" fill="#4ade80" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">מוצא 4-20mA / HART</text>
  </g>

  <!-- Right: Radiation Safety & ALARA Box -->
  <g transform="translate(505, 65)">
    <rect x="0" y="0" width="225" height="245" rx="8" fill="#1e293b" stroke="#475569" />
    <text x="112" y="24" fill="#facc15" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">בטיחות קרינה ועקרון ALARA</text>
    <line x1="10" y1="34" x2="215" y2="34" stroke="#334155" />

    <text x="12" y="55" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold">3 עמודי התווך של הגנה:</text>
    <text x="12" y="73" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">1. זמן (Time) - צמצום משך השהייה</text>
    <text x="12" y="90" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">2. מרחק (Distance) - דעיכה לפי 1/r²</text>
    <text x="12" y="107" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">3. מיגון (Shielding) - עופרת ופלדה</text>

    <text x="12" y="132" fill="#f59e0b" font-family="Arial, sans-serif" font-size="10" font-weight="bold">מכשירי ניטור ובדיקה:</text>
    <text x="12" y="150" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• מונה גייגר: בדיקת עוצמת מנה ודליפות</text>
    <text x="12" y="167" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• יחידות: µSv/h או mSv/h</text>
    <text x="12" y="184" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• תג קרינה (TLD): ניטור אישי מצטבר</text>

    <text x="12" y="210" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold">חשיפה מותרת:</text>
    <text x="12" y="228" fill="#f87171" font-family="Arial, sans-serif" font-size="9">עובד קרינה: עד 20mSv בשנה | ציבור: 1mSv</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#facc15" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">נוהל עבודה בטוחה במכשור קרינה:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">לפני כל כניסה למכל או עבודה ליד הקורה, חובה לסגור ולנעול את תריס המקור (Shutter Lockout) ולוודא בעזרת מונה גייגר כי עוצמת הקרינה ברקע בטוחה.</text>
</svg>'''

# 15. SIL 2 vs SIL 3 Safety Architectures (1oo2, 2oo3)
svgs['diag_sil_safety_architectures.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1.2" />
  <text x="210" y="36" fill="#f87171" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">רמות בטיחות תהליכית: SIL 2 מול SIL 3 וארכיטקטורת הצבעה (Voting)</text>

  <!-- Left: SIF Loop (Sensors -> Safety PLC -> Final Element ESDV) -->
  <g transform="translate(35, 65)">
    <rect x="0" y="0" width="330" height="245" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" />
    <text x="165" y="24" fill="#fbbf24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">מבנה לולאת בטיחות (Safety Instrumented Function - SIF)</text>
    <line x1="10" y1="34" x2="320" y2="34" stroke="#334155" />

    <!-- 1. Sensor Stage -->
    <rect x="15" y="50" width="80" height="65" rx="6" fill="#0f172a" stroke="#38bdf8" />
    <text x="55" y="75" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">חיישנים</text>
    <text x="55" y="95" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">PT/LT/TT</text>

    <!-- Arrow -->
    <line x1="95" y1="82" x2="120" y2="82" stroke="#f59e0b" stroke-width="2" />

    <!-- 2. Logic Solver (Safety PLC) -->
    <rect x="120" y="50" width="90" height="65" rx="6" fill="#0f172a" stroke="#ef4444" stroke-width="2" />
    <text x="165" y="75" fill="#f87171" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Safety PLC</text>
    <text x="165" y="95" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Triconex / M580S</text>

    <!-- Arrow -->
    <line x1="210" y1="82" x2="235" y2="82" stroke="#f59e0b" stroke-width="2" />

    <!-- 3. Final Element -->
    <rect x="235" y="50" width="80" height="65" rx="6" fill="#0f172a" stroke="#22c55e" />
    <text x="275" y="75" fill="#4ade80" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">שסתום ניתוק</text>
    <text x="275" y="95" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">ESDV + SOV</text>

    <!-- PFD Formulas Table -->
    <rect x="15" y="130" width="300" height="100" rx="4" fill="#0f172a" stroke="#475569" />
    <text x="25" y="150" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold">רמת SIL 2:</text>
    <text x="90" y="150" fill="#ffffff" font-family="Arial, sans-serif" font-size="10">PFD_avg: 10⁻² עד 10⁻³ (זמינות 99.0% - 99.9%)</text>
    <text x="25" y="180" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold">רמת SIL 3:</text>
    <text x="90" y="180" fill="#ffffff" font-family="Arial, sans-serif" font-size="10">PFD_avg: 10⁻³ עד 10⁻⁴ (זמינות 99.9% - 99.99%)</text>
    <text x="25" y="212" fill="#facc15" font-family="Arial, sans-serif" font-size="9">רמת הפחתת סיכון (RRF) ב-SIL 3 גדולה פי 10 מ-SIL 2!</text>
  </g>

  <!-- Right: Voting Logic Architectures (1oo2 vs 2oo3) -->
  <g transform="translate(385, 65)">
    <rect x="0" y="0" width="340" height="245" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <text x="170" y="24" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">השוואת לוגיקת הצבעה (Voting Architectures)</text>
    <line x1="10" y1="34" x2="330" y2="34" stroke="#334155" />

    <!-- 1oo2 -->
    <rect x="15" y="45" width="310" height="55" rx="4" fill="#0f172a" stroke="#d97706" />
    <text x="30" y="65" fill="#f59e0b" font-family="Arial, sans-serif" font-size="11" font-weight="bold">1oo2 (אחד משניים):</text>
    <text x="30" y="85" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">בטיחות גבוהה מאוד (SIL 3), אך רגיש להשבתות שווא (Spurious Trip)</text>

    <!-- 2oo3 -->
    <rect x="15" y="110" width="310" height="60" rx="4" fill="#0f172a" stroke="#22c55e" />
    <text x="30" y="130" fill="#4ade80" font-family="Arial, sans-serif" font-size="11" font-weight="bold">2oo3 (שניים משלושה - TMR):</text>
    <text x="30" y="150" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">השילוב המושלם: בטיחות SIL 3 מרבית יחד עם זמינות תהליך מקסימלית</text>

    <!-- Proof Test Interval -->
    <rect x="15" y="180" width="310" height="50" rx="4" fill="#0f172a" stroke="#3b82f6" />
    <text x="30" y="200" fill="#60a5fa" font-family="Arial, sans-serif" font-size="10" font-weight="bold">בדיקת הוכחה תקופתית (Proof Test):</text>
    <text x="30" y="218" fill="#93c5fd" font-family="Arial, sans-serif" font-size="9">בדיקה ידנית שנתית לגילוי תקלות נסתרות (Dangerous Undetected)</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#f87171" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">תקני IEC 61508 / IEC 61511:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">שרשרת הבטיחות חזקה רק כמו החוליה החלשה שבה. רוב הכשלים ב-SIF (מעל 50%) מתרחשים בשסתום הניתוק הסופי (ESDV), ולכן נדרש בו מבחן תנועה חלקי (Partial Stroke Testing).</text>
</svg>'''

# 16. Load Cell Wheatstone Bridge & Excitation
svgs['diag_load_cell_wheatstone_bridge.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2" />
  <text x="210" y="36" fill="#38bdf8" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">מתמרי שקילה (Load Cell): גשר ויטסטון, רגישות mV/V וכבל 6 חוטים</text>

  <!-- Left: Wheatstone Bridge Circuit Diagram -->
  <g transform="translate(60, 65)">
    <rect x="0" y="0" width="280" height="245" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <text x="140" y="24" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">מעגל גשר ויטסטון עם Strain Gauges</text>
    <line x1="10" y1="34" x2="270" y2="34" stroke="#334155" />

    <!-- Diamond Bridge -->
    <polygon points="140,55 210,125 140,195 70,125" fill="none" stroke="#64748b" stroke-width="2.5" />

    <!-- 4 Resistors (Strain Gauges) -->
    <!-- R1 Tension -->
    <rect x="90" y="78" width="25" height="15" rx="2" fill="#ef4444" />
    <text x="80" y="72" fill="#fca5a5" font-family="Arial, sans-serif" font-size="9">+R1 (מתיחה)</text>

    <!-- R2 Compression -->
    <rect x="165" y="78" width="25" height="15" rx="2" fill="#3b82f6" />
    <text x="200" y="72" fill="#93c5fd" font-family="Arial, sans-serif" font-size="9">-R2 (לחיצה)</text>

    <!-- R3 Compression -->
    <rect x="90" y="150" width="25" height="15" rx="2" fill="#3b82f6" />
    <text x="80" y="178" fill="#93c5fd" font-family="Arial, sans-serif" font-size="9">-R3 (לחיצה)</text>

    <!-- R4 Tension -->
    <rect x="165" y="150" width="25" height="15" rx="2" fill="#ef4444" />
    <text x="200" y="178" fill="#fca5a5" font-family="Arial, sans-serif" font-size="9">+R4 (מתיחה)</text>

    <!-- Excitation Terminals -->
    <circle cx="140" cy="55" r="5" fill="#f59e0b" />
    <text x="140" y="47" fill="#fbbf24" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">+EXC (10V DC)</text>

    <circle cx="140" cy="195" r="5" fill="#f59e0b" />
    <text x="140" y="215" fill="#fbbf24" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">-EXC (0V GND)</text>

    <!-- Signal Output Terminals -->
    <circle cx="70" cy="125" r="5" fill="#22c55e" />
    <text x="58" y="115" fill="#4ade80" font-family="Arial, sans-serif" font-size="10" font-weight="bold">-SIG</text>

    <circle cx="210" cy="125" r="5" fill="#22c55e" />
    <text x="225" y="115" fill="#4ade80" font-family="Arial, sans-serif" font-size="10" font-weight="bold">+SIG (mV)</text>
    <text x="140" y="130" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ΔV (mV)</text>
  </g>

  <!-- Right: 4-Wire vs 6-Wire & Sensitivity Calculation -->
  <g transform="translate(370, 65)">
    <rect x="0" y="0" width="350" height="245" rx="8" fill="#1e293b" stroke="#475569" />
    <text x="175" y="24" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">רגישות מתמר וכבל 6 חוטים (Sense)</text>
    <line x1="10" y1="34" x2="340" y2="34" stroke="#334155" />

    <!-- mV/V Sensitivity Calculation -->
    <rect x="15" y="45" width="320" height="65" rx="5" fill="#0f172a" stroke="#0ea5e9" />
    <text x="30" y="65" fill="#7dd3fc" font-family="Arial, sans-serif" font-size="10" font-weight="bold">משמעות רגישות 2 mV/V:</text>
    <text x="30" y="85" fill="#ffffff" font-family="Arial, sans-serif" font-size="9">• במתח עירור של 10V DC ובעומס מקסימלי 100%:</text>
    <text x="30" y="100" fill="#facc15" font-family="Arial, sans-serif" font-size="9" font-weight="bold">מוצא האות הוא 20 mV בלבד! (10V × 2 mV/V = 20 mV)</text>

    <!-- 6-Wire Connection vs 4-Wire -->
    <rect x="15" y="120" width="320" height="110" rx="5" fill="#0f172a" stroke="#10b981" />
    <text x="30" y="140" fill="#34d399" font-family="Arial, sans-serif" font-size="10" font-weight="bold">מדוע מומלץ כבל 6 חוטים (+Sense / -Sense)?</text>
    <text x="30" y="160" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• זוג חוטי ה-Sense מודדים את המתח המדויק על גבי הגשר.</text>
    <text x="30" y="178" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• מפצים על מפלי מתח בכבלים ארוכים (מעל 10 מטר).</text>
    <text x="30" y="196" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• מנטרלים לחלוטין שגיאות הנגרמות משינויי טמפרטורה בכבל.</text>
    <text x="30" y="214" fill="#4ade80" font-family="Arial, sans-serif" font-size="9" font-weight="bold">בכבל 4-חוטים קצר: חובה לגשר בין +EXC ל-+SEN ובין -EXC ל--SEN</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">עקרון פעולת Strain Gauge:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">העומס המכני מעוות את פסי המתכת של מד המאמץ. מתיחה מאריכה את המוליך ומגדילה את התנגדותו, לחיצה מקצרת ומקטינה. יציאת הגשר מגיבה בהפרש מתח של מיליוולטים בודדים.</text>
</svg>'''

# 17. Load Cell Diagnostics & Troubleshooting
svgs['diag_load_cell_troubleshooting.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1.2" />
  <text x="210" y="36" fill="#f87171" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">בדיקת תקינות מתמרי משקל (Load Cell): התנגדות, אפס ובידוד</text>

  <!-- Diagnostic Steps 1, 2, 3 Table -->
  <g transform="translate(35, 65)">
    <!-- Header -->
    <rect x="0" y="0" width="690" height="32" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2" />
    <text x="80" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">סוג הבדיקה</text>
    <text x="230" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">כיצד בודקים? (מכשיר ונקודות)</text>
    <text x="440" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ערכים תקינים (מפרט יצרן)</text>
    <text x="610" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">משמעות תקלה / חריגה</text>

    <!-- Test 1: התנגדות מבוא ומוצא -->
    <rect x="0" y="36" width="690" height="50" rx="3" fill="#1e293b" />
    <text x="80" y="65" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">1. התנגדות הגשר</text>
    <text x="230" y="58" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מולטימטר Fluke באוהמים (Ω)</text>
    <text x="230" y="74" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">בין EXC+ ל-EXC- ובין SIG+ ל-SIG-</text>
    <text x="440" y="58" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">350Ω ±2Ω או 700Ω ±5Ω</text>
    <text x="440" y="74" fill="#86efac" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">קריאת המבוא גדולה במעט מהמוצא</text>
    <text x="610" y="65" fill="#ef4444" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">נתק (OL) או קצר בגשר</text>

    <!-- Test 2: בדיקת אפס (Zero Balance) -->
    <rect x="0" y="90" width="690" height="50" rx="3" fill="#0f172a" />
    <text x="80" y="119" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">2. איזון אפס (Zero)</text>
    <text x="230" y="112" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מתמר מוזן ב-10V DC ללא עומס</text>
    <text x="230" y="128" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מדידת מיליוולט (mV) בין SIG+ ל-SIG-</text>
    <text x="440" y="112" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">קרוב ל-0 mV (עד ±0.1% FS)</text>
    <text x="440" y="128" fill="#86efac" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">עבור מתמר 2mV/V: פחות מ-0.02mV</text>
    <text x="610" y="119" fill="#ef4444" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">מעל 0.1mV ⇐ עיוות פלסטי מעומס יתר!</text>

    <!-- Test 3: בדיקת בידוד במגר (Insulation Resistance) -->
    <rect x="0" y="144" width="690" height="50" rx="3" fill="#1e293b" />
    <text x="80" y="173" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">3. בידוד לאדמה</text>
    <text x="230" y="166" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מגר (Megohmmeter) ב-50V DC בלבד!</text>
    <text x="230" y="182" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">בין הגידים לגוף המתמר והסיכוך</text>
    <text x="440" y="173" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">&gt; 5,000 MΩ (מגה-אוהם)</text>
    <text x="610" y="166" fill="#ef4444" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">חדירת רטיבות/קורוזיה לגוף המתמר</text>
    <text x="610" y="182" fill="#fca5a5" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">גורם לסחיפת משקל (Drift) בלתי מוסברת</text>

    <!-- Test 4: Corner Trimming (Junction Box) -->
    <rect x="0" y="198" width="690" height="45" rx="3" fill="#0f172a" />
    <text x="80" y="225" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">4. איזון פינות</text>
    <text x="230" y="225" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">הנחת משקולת בדיקה על 4 הפינות</text>
    <text x="440" y="225" fill="#22c55e" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">קריאה זהה בכל הפינות (הפרש &lt;0.05%)</text>
    <text x="610" y="225" fill="#f59e0b" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">כיוונון פוטנציומטר ב-Junction Box</text>
  </g>

  <!-- Bottom Warning Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1.2" />
  <text x="720" y="347" fill="#ef4444" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">אזהרת בדיקה קריטית:</text>
  <text x="720" y="367" fill="#fca5a5" font-family="Arial, sans-serif" font-size="10" text-anchor="end">בבדיקת בידוד במגר למתמר משקל, יש להשתמש במתח בדיקה של 50V DC בלבד! בדיקה ב-500V או 1000V תשרוף באופן בלתי הפיך את מבדדי ה-Strain Gauges ותהרוס את המתמר.</text>
</svg>'''

# 18. Conveyor Belt Scales & Weigh-in-Motion
svgs['diag_belt_scale_weighing.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#0ea5e9" stroke-width="1.2" />
  <text x="210" y="36" fill="#38bdf8" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">שקילה בתנועה: עקרון שוקל סרט (Belt Scale) ואינטגרציית ספיקה</text>

  <!-- Belt Scale Mechanical Rig Graphic -->
  <g transform="translate(40, 65)">
    <!-- Conveyor Belt Loop -->
    <path d="M 60,90 L 420,90 Q 450,90 450,120 Q 450,150 420,150 L 60,150 Q 30,150 30,120 Q 30,90 60,90 Z" fill="none" stroke="#64748b" stroke-width="5" />

    <!-- Material Layer on Top of Belt -->
    <path d="M 80,85 L 400,85" stroke="#f59e0b" stroke-width="8" stroke-linecap="round" />
    <text x="240" y="70" fill="#fbbf24" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">חומר בתפזורת (פוספט/אשלג/מלט) - משקל רגעי W (kg/m)</text>

    <!-- Standard Idlers (Rollers) -->
    <circle cx="90" cy="100" r="10" fill="#334155" stroke="#94a3b8" />
    <circle cx="150" cy="100" r="10" fill="#334155" stroke="#94a3b8" />
    <circle cx="330" cy="100" r="10" fill="#334155" stroke="#94a3b8" />
    <circle cx="390" cy="100" r="10" fill="#334155" stroke="#94a3b8" />

    <!-- Weighing Idler on Load Cell (Center) -->
    <circle cx="240" cy="100" r="12" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
    <!-- Load Cell Bridge below Weigh Idler -->
    <rect x="225" y="115" width="30" height="20" rx="3" fill="#ef4444" stroke="#ffffff" />
    <text x="240" y="129" fill="#ffffff" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle">LC</text>
    <line x1="240" y1="135" x2="240" y2="185" stroke="#ef4444" stroke-width="2" />

    <!-- Speed Sensor (Tachometer / Encoder on Tail Pulley) -->
    <circle cx="420" cy="120" r="28" fill="#1e293b" stroke="#34d399" stroke-width="2" />
    <text x="420" y="124" fill="#34d399" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">מקודד</text>
    <text x="420" y="180" fill="#34d399" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מהירות V (m/s)</text>
    <line x1="420" y1="148" x2="420" y2="185" stroke="#34d399" stroke-width="2" />

    <!-- Direction Arrow -->
    <path d="M 220,100 L 260,100" stroke="#ffffff" stroke-width="2" marker-end="url(#arrow)" />
  </g>

  <!-- Right: Flow Integrator Box -->
  <g transform="translate(515, 65)">
    <rect x="0" y="0" width="215" height="245" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <text x="107" y="24" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">אינטגרטור שקילה (Weight Integrator)</text>
    <line x1="10" y1="34" x2="205" y2="34" stroke="#334155" />

    <!-- Formula 1: Flow Rate -->
    <rect x="15" y="45" width="185" height="45" rx="4" fill="#0f172a" stroke="#0ea5e9" />
    <text x="107" y="63" fill="#7dd3fc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">ספיקה רגעית Flow Rate:</text>
    <text x="107" y="80" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Rate (kg/s) = W × V</text>

    <!-- Formula 2: Totalizer -->
    <rect x="15" y="100" width="185" height="45" rx="4" fill="#0f172a" stroke="#10b981" />
    <text x="107" y="118" fill="#34d399" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">משקל מצטבר Totalizer:</text>
    <text x="107" y="135" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Total (Tons) = ∫ Rate · dt</text>

    <!-- Disturbances & Maintenance -->
    <text x="15" y="165" fill="#f59e0b" font-family="Arial, sans-serif" font-size="9" font-weight="bold">גורמי הפרעה וכיול:</text>
    <text x="15" y="182" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="8">• מתיחות הסרט וסטיות גובה גלילים</text>
    <text x="15" y="197" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="8">• רוחות חזקות (חובה מגן רוח!)</text>
    <text x="15" y="212" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="8">• כיול אפס (Zero) על סרט ריק ומסתובב</text>
    <text x="15" y="227" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="8">• כיול Span עם שרשרת כיול או משקולות</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">כיצד מחשב שוקל סרט את המשקל?</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">האינטגרטור מכפיל את העומס הרגעי (ק\"ג למטר) במהירות הסרט (מטר לשנייה) כדי לקבל ספיקה רגעית. אינטגרציה רציפה של המכפלה בזמן נותנת את המשקל המצטבר בטונות.</text>
</svg>'''

# 19. Positive Material Identification (PMI) & System Validation
svgs['diag_pmi_validation_process.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.2" />
  <text x="210" y="36" fill="#c4b5fd" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">אימות חיובי (PMI) וולידציית מערכות בקרה (IQ, OQ, PQ)</text>

  <!-- Left: PMI Handheld Analyzer -->
  <g transform="translate(40, 65)">
    <rect x="0" y="0" width="320" height="245" rx="8" fill="#1e293b" stroke="#a855f7" stroke-width="1.5" />
    <text x="160" y="24" fill="#d8b4fe" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">אימות חומר חיובי (Positive Material Identification - PMI)</text>
    <line x1="10" y1="34" x2="310" y2="34" stroke="#334155" />

    <!-- XRF Gun Graphic -->
    <rect x="25" y="55" width="70" height="50" rx="6" fill="#0f172a" stroke="#a855f7" stroke-width="2" />
    <rect x="40" y="105" width="22" height="40" rx="3" fill="#334155" />
    <text x="60" y="85" fill="#c084fc" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">אקדח XRF</text>

    <!-- Ray hitting pipe flange -->
    <path d="M 95,80 L 155,80" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3,2" />
    <!-- Pipe & Flange Section -->
    <rect x="155" y="50" width="25" height="80" rx="3" fill="#64748b" stroke="#94a3b8" />
    <rect x="180" y="65" width="80" height="50" fill="#475569" stroke="#64748b" />
    <text x="220" y="95" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">אוגן שסתום</text>

    <!-- Real-time Alloy Analysis Screen -->
    <rect x="20" y="155" width="280" height="75" rx="5" fill="#0f172a" stroke="#22c55e" />
    <text x="35" y="175" fill="#4ade80" font-family="Arial, sans-serif" font-size="10" font-weight="bold">תוצאת בדיקה לא-הרסנית (NDT):</text>
    <text x="35" y="195" fill="#ffffff" font-family="Arial, sans-serif" font-size="9">סגסוגת מאומתת: Hastelloy C-276 (Ni 57%, Mo 16%, Cr 15%)</text>
    <text x="35" y="215" fill="#facc15" font-family="Arial, sans-serif" font-size="9" font-weight="bold">אישור: מתאים למפרט צנרת קורוזיבית!</text>
  </g>

  <!-- Right: Computer System Validation (CSV - IQ, OQ, PQ) -->
  <g transform="translate(385, 65)">
    <rect x="0" y="0" width="340" height="245" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <text x="170" y="24" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ולידציית מערכות ממוחשבות (GAMP 5 / CSV)</text>
    <line x1="10" y1="34" x2="330" y2="34" stroke="#334155" />

    <!-- IQ Step -->
    <rect x="15" y="45" width="310" height="50" rx="4" fill="#0f172a" stroke="#38bdf8" />
    <text x="30" y="65" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold">IQ - Installation Qualification (אימות התקנה):</text>
    <text x="30" y="82" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="8">וידוא שהחומרה, הבקרים, הכבילה והגרסאות הותקנו לפי שרטוטי As-Made</text>

    <!-- OQ Step -->
    <rect x="15" y="105" width="310" height="50" rx="4" fill="#0f172a" stroke="#f59e0b" />
    <text x="30" y="125" fill="#fbbf24" font-family="Arial, sans-serif" font-size="10" font-weight="bold">OQ - Operational Qualification (אימות תפעולי):</text>
    <text x="30" y="142" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="8">בדיקת כיול חיישנים, השבתות חירום (ESD), לולאות בקרה והתראות</text>

    <!-- PQ Step -->
    <rect x="15" y="165" width="310" height="50" rx="4" fill="#0f172a" stroke="#22c55e" />
    <text x="30" y="185" fill="#4ade80" font-family="Arial, sans-serif" font-size="10" font-weight="bold">PQ - Performance Qualification (אימות ביצועים):</text>
    <text x="30" y="202" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="8">הוכחת פעולה יציבה, רציפה ובטוחה של המערכת בתנאי ייצור אמיתיים</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#c4b5fd" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">מהו אימות חיובי (Positive Validation)?</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">במכשור - בדיקת PMI לא-הרסנית (XRF) לווידוא מתכות צנרת ושסתומים למניעת התקנת מתכת שגויה. בבקרה - אימות מוחלט (Validation) באמצעות שלבי IQ, OQ ו-PQ מתועדים.</text>
</svg>'''

# Write each SVG
for name, content in svgs.items():
    path = os.path.join(OUTPUT_DIR, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())
    print(f"Created SVG: {name} ({len(content)} bytes)")

print(f"Successfully generated {len(svgs)} diagrams in batch 2.")
