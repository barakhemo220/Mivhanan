# -*- coding: utf-8 -*-
"""
Generator for Mivhanan Question Bank:
Creates 25 technical SVG diagrams and 105+ comprehensive questions
in Instrumentation & Control across Levels 1 (Beginner), 2 (Intermediate), 3 (Advanced).
"""
import os
import json
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..'))
BACKEND_IMG_DIR = os.path.join(BACKEND_DIR, 'public', 'images', 'questions')
FRONTEND_IMG_DIR = os.path.abspath(os.path.join(BACKEND_DIR, '..', 'frontend', 'public', 'images', 'questions'))
QUESTIONS_FILE = os.path.join(BACKEND_DIR, 'data', 'questions.json')

os.makedirs(BACKEND_IMG_DIR, exist_ok=True)
os.makedirs(FRONTEND_IMG_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. GENERATE TECHNICAL SVG DIAGRAMS
# -------------------------------------------------------------
def make_svg(title, badge_color, elements_svg, footer_text):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 380" width="100%" height="100%">
  <rect width="700" height="380" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
  
  <!-- Title Badge -->
  <rect x="25" y="18" width="340" height="32" rx="7" fill="#f8fafc" stroke="{badge_color}" stroke-width="1.5" />
  <text x="195" y="39" fill="#0f172a" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">{title}</text>

  <!-- Diagram Graphic Elements -->
  {elements_svg}

  <!-- Footer Banner -->
  <rect x="25" y="325" width="650" height="40" rx="7" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
  <text x="350" y="349" fill="#475569" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">{footer_text}</text>
</svg>"""

diagrams = {
    # 1. Fluke Multimeter Series vs Parallel
    "diag_fluke_multimeter_modes.svg": make_svg(
        "שימוש בפלוק: מדידת זרם בטור מול מדידת מתח במקביל", "#4f46e5",
        """
        <!-- Left: Series mA Current Measurement -->
        <g transform="translate(40, 65)">
          <rect x="0" y="0" width="280" height="240" rx="8" fill="#f8fafc" stroke="#4f46e5" stroke-width="1.5" />
          <text x="140" y="25" fill="#4f46e5" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">מדידת זרם (mA) - חיבור בטור (Series)</text>
          
          <!-- Power Supply -->
          <rect x="20" y="55" width="60" height="50" rx="4" fill="#ffffff" stroke="#64748b" stroke-width="1.5" />
          <text x="50" y="85" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">24VDC</text>
          
          <!-- Loop Wire entering Fluke -->
          <path d="M 80 80 L 130 80" stroke="#ef4444" stroke-width="3" />
          
          <!-- Fluke Meter in Series -->
          <rect x="130" y="50" width="75" height="100" rx="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
          <rect x="140" y="60" width="55" height="30" rx="3" fill="#ffffff" stroke="#94a3b8" />
          <text x="167" y="80" fill="#0f172a" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">12.00 mA</text>
          <circle cx="150" cy="120" r="5" fill="#ef4444" />
          <circle cx="180" cy="120" r="5" fill="#0f172a" />
          <text x="150" y="140" fill="#ca8a04" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle">mA Jack</text>
          <text x="180" y="140" fill="#64748b" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle">COM</text>

          <!-- Load Resistor -->
          <rect x="225" y="160" width="35" height="50" rx="4" fill="#ffffff" stroke="#64748b" stroke-width="1.5" />
          <text x="242" y="190" fill="#0f172a" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Load</text>

          <!-- Complete Series Circuit -->
          <path d="M 180 125 L 180 185 L 225 185" stroke="#0f172a" stroke-width="2.5" />
          <path d="M 242 210 L 242 225 L 50 225 L 50 105" stroke="#0f172a" stroke-width="2.5" />

          <!-- Warning text -->
          <rect x="15" y="160" width="190" height="45" rx="4" fill="#ecfdf5" stroke="#10b981" />
          <text x="110" y="178" fill="#047857" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">חובה לפתוח את המעגל</text>
          <text x="110" y="195" fill="#047857" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">ולחבר את הפלוק כחלק מהטור!</text>
        </g>

        <!-- Right: Parallel Voltage Measurement & Short Circuit Danger -->
        <g transform="translate(360, 65)">
          <rect x="0" y="0" width="300" height="240" rx="8" fill="#f8fafc" stroke="#e11d48" stroke-width="1.5" />
          <text x="150" y="25" fill="#e11d48" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">מדידת מתח במקביל וסכנת קצר באמפרמטר</text>
          
          <!-- Power Supply -->
          <rect x="20" y="60" width="60" height="60" rx="4" fill="#ffffff" stroke="#64748b" stroke-width="1.5" />
          <text x="50" y="95" fill="#0f172a" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">24VDC</text>

          <!-- Voltmeter Connected in Parallel -->
          <rect x="160" y="50" width="75" height="100" rx="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
          <rect x="170" y="60" width="55" height="30" rx="3" fill="#ffffff" stroke="#94a3b8" />
          <text x="197" y="80" fill="#0f172a" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">24.05 V</text>
          <circle cx="180" cy="120" r="5" fill="#ef4444" />
          <circle cx="210" cy="120" r="5" fill="#0f172a" />
          <text x="180" y="140" fill="#ef4444" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle">V Jack</text>
          <text x="210" y="140" fill="#64748b" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle">COM</text>

          <path d="M 80 75 L 180 75 L 180 115" stroke="#ef4444" stroke-width="2.5" />
          <path d="M 80 105 L 210 105 L 210 115" stroke="#0f172a" stroke-width="2.5" />

          <!-- Danger Callout -->
          <rect x="15" y="165" width="270" height="60" rx="6" fill="#fff1f2" stroke="#f43f5e" />
          <text x="150" y="185" fill="#be123c" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">סכנה: חיבור במצב זרם (mA) במקביל למתח</text>
          <text x="150" y="202" fill="#be123c" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">יוצר קצר מוחלט ושורף מיד את הפיוז הפנימי (HRC Fuse)!</text>
          <text x="150" y="217" fill="#475569" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">התנגדות פנימית ב-mA קרובה ל-0Ω | התנגדות ב-V מעל 10MΩ</text>
        </g>
        """,
        "כלל זהב באחזקה: מתח מודדים במקביל (עכבה גבוהה). זרם מודדים אך ורק בטור (עכבה נמוכה מאוד)!"
    ),

    # 2. Fluke 787 / 789 ProcessMeter Modes
    "diag_fluke_789_processmeter.svg": make_svg(
        "מכשיר כיול פלוק 789: מצבי Source mA, Simulate mA ו-Measure", "#0284c7",
        """
        <g transform="translate(30, 60)">
          <!-- Mode 1: Source mA -->
          <rect x="0" y="0" width="200" height="240" rx="8" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5" />
          <text x="100" y="25" fill="#0284c7" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">1. מצב Source mA</text>
          <rect x="15" y="40" width="170" height="55" rx="5" fill="#e0f2fe" />
          <text x="100" y="60" fill="#0369a1" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">הפלוק מספק מתח 24V</text>
          <text x="100" y="77" fill="#0369a1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">+ מזרים זרם 4-20mA אקטיבי</text>
          <text x="100" y="115" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">בדיקת כרטיס PLC פסיבי</text>
          <text x="100" y="132" fill="#475569" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">או שסתום בקרה מנותק</text>
          <rect x="25" y="155" width="150" height="70" rx="5" fill="#ffffff" stroke="#cbd5e1" />
          <text x="100" y="180" fill="#0f172a" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">חיבור: ישיר לצרכן</text>
          <text x="100" y="198" fill="#059669" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">אין צורך בספק כוח חיצוני</text>
        </g>

        <g transform="translate(250, 60)">
          <!-- Mode 2: Simulate mA -->
          <rect x="0" y="0" width="200" height="240" rx="8" fill="#f8fafc" stroke="#7c3aed" stroke-width="1.5" />
          <text x="100" y="25" fill="#7c3aed" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">2. מצב Simulate mA</text>
          <rect x="15" y="40" width="170" height="55" rx="5" fill="#f3e8ff" />
          <text x="100" y="60" fill="#6b21a8" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">הפלוק מתנהג כמשדר 2-Wire</text>
          <text x="100" y="77" fill="#6b21a8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מווסת זרם בחוג עם מתח קיים</text>
          <text x="100" y="115" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">החלפת משדר שטח תקול</text>
          <text x="100" y="132" fill="#475569" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">לצורך בדיקת חוג מול ה-DCS</text>
          <rect x="25" y="155" width="150" height="70" rx="5" fill="#ffffff" stroke="#cbd5e1" />
          <text x="100" y="180" fill="#0f172a" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">חובה: ספק 24VDC בחוג</text>
          <text x="100" y="198" fill="#7c3aed" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">הפלוק פועל כעומס משתנה</text>
        </g>

        <g transform="translate(470, 60)">
          <!-- Mode 3: Measure mA -->
          <rect x="0" y="0" width="200" height="240" rx="8" fill="#f8fafc" stroke="#059669" stroke-width="1.5" />
          <text x="100" y="25" fill="#059669" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">3. מצב Measure mA</text>
          <rect x="15" y="40" width="170" height="55" rx="5" fill="#dcfce7" />
          <text x="100" y="60" fill="#14532d" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">מד זרם פסיבי רגיל</text>
          <text x="100" y="77" fill="#14532d" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">קריאת הזרם בלולאה חיה</text>
          <text x="100" y="115" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">אימות קריאת השטח</text>
          <text x="100" y="132" fill="#475569" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מול התצוגה בחדר הבקרה</text>
          <rect x="25" y="155" width="150" height="70" rx="5" fill="#ffffff" stroke="#cbd5e1" />
          <text x="100" y="180" fill="#0f172a" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">חיבור: בטור למשדר</text>
          <text x="100" y="198" fill="#059669" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מדידה שקופה ללא שינוי חוג</text>
        </g>
        """,
        "במצב Source הפלוק מייצר מתח וזרם; במצב Simulate הפלוק מווסת זרם בחוג עם ספק כוח קיים"
    ),

    # 3. PT100 Resistance Table & Fault Symptoms
    "diag_pt100_maintenance_table.svg": make_svg(
        "טבלת התנגדות PT100 ותסמיני תקלות נפוצות (קצר מול נתק)", "#d97706",
        """
        <!-- Left Table -->
        <g transform="translate(40, 65)">
          <rect x="0" y="0" width="290" height="245" rx="8" fill="#ffffff" stroke="#cbd5e1" />
          <rect x="0" y="0" width="290" height="32" rx="8" fill="#f8fafc" />
          <text x="75" y="21" fill="#0f172a" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">טמפרטורה (°C)</text>
          <text x="215" y="21" fill="#0f172a" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">התנגדות תקנית (Ω)</text>
          
          <g font-family="Arial, sans-serif" font-size="10" fill="#334155">
            <line x1="0" y1="32" x2="290" y2="32" stroke="#e2e8f0" />
            <text x="75" y="52" text-anchor="middle">-50 °C</text><text x="215" y="52" font-weight="bold" text-anchor="middle">80.31 Ω</text>
            <line x1="0" y1="62" x2="290" y2="62" stroke="#f1f5f9" />
            <text x="75" y="82" fill="#0284c7" font-weight="bold" text-anchor="middle">0 °C (נקודת קרח)</text><text x="215" y="82" fill="#0284c7" font-weight="bold" text-anchor="middle">100.00 Ω (Pt100!)</text>
            <line x1="0" y1="92" x2="290" y2="92" stroke="#f1f5f9" />
            <text x="75" y="112" text-anchor="middle">20 °C (חדר)</text><text x="215" y="112" font-weight="bold" text-anchor="middle">107.79 Ω</text>
            <line x1="0" y1="122" x2="290" y2="122" stroke="#f1f5f9" />
            <text x="75" y="142" text-anchor="middle">50 °C</text><text x="215" y="142" font-weight="bold" text-anchor="middle">119.40 Ω</text>
            <line x1="0" y1="152" x2="290" y2="152" stroke="#f1f5f9" />
            <text x="75" y="172" fill="#d97706" font-weight="bold" text-anchor="middle">100 °C (רתיחה)</text><text x="215" y="172" fill="#d97706" font-weight="bold" text-anchor="middle">138.51 Ω (α=0.00385)</text>
            <line x1="0" y1="182" x2="290" y2="182" stroke="#f1f5f9" />
            <text x="75" y="202" text-anchor="middle">200 °C</text><text x="215" y="202" font-weight="bold" text-anchor="middle">175.86 Ω</text>
            <line x1="0" y1="212" x2="290" y2="212" stroke="#f1f5f9" />
            <text x="75" y="232" text-anchor="middle">400 °C</text><text x="215" y="232" font-weight="bold" text-anchor="middle">247.09 Ω</text>
          </g>
        </g>

        <!-- Right: Fault Diagnostics -->
        <g transform="translate(350, 65)">
          <!-- Short Circuit -->
          <rect x="0" y="0" width="310" height="115" rx="8" fill="#fff1f2" stroke="#f43f5e" />
          <text x="155" y="24" fill="#be123c" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">תקלה 1: קצר בין גידי ה-RTD (R ≈ 0Ω)</text>
          <text x="15" y="48" fill="#475569" font-family="Arial, sans-serif" font-size="10">• קריאת המשדר צונחת למינימום: כ- 200°C-</text>
          <text x="15" y="68" fill="#475569" font-family="Arial, sans-serif" font-size="10">• זרם שגיאת כשל (NAMUR Downscale): קטן מ- 3.6mA</text>
          <text x="15" y="88" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold">• סיבה נפוצה: חדירת מים/רטיבות לראש החיבורים בשטח</text>

          <!-- Open Circuit -->
          <rect x="0" y="130" width="310" height="115" rx="8" fill="#fef3c7" stroke="#f59e0b" />
          <text x="155" y="154" fill="#b45309" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">תקלה 2: נתק באחד הגידים (R = ∞)</text>
          <text x="15" y="178" fill="#475569" font-family="Arial, sans-serif" font-size="10">• קריאת המשדר קופצת למקסימום: Over-range / +850°C</text>
          <text x="15" y="198" fill="#475569" font-family="Arial, sans-serif" font-size="10">• זרם שגיאת כשל (NAMUR Upscale): גדול מ- 21.0mA</text>
          <text x="15" y="218" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold">• סיבה נפוצה: שבר מכני באלמנט עקב רעידות בצנרת</text>
        </g>
        """,
        "בדיקת אוהם מהירה בפלוק: 100Ω מייצג 0°C. קצר מציג ערך שלילי עמוק, נתק מציג מקסימום סקאלה."
    ),

    # 4. PT100 Wiring Comparison (2-Wire vs 3-Wire vs 4-Wire)
    "diag_pt100_wiring_comparison.svg": make_svg(
        "השוואת תצורות חיווט RTD: שניים, שלושה וארבעה חוטים", "#4f46e5",
        """
        <g transform="translate(30, 65)">
          <!-- 2-Wire -->
          <rect x="0" y="0" width="200" height="240" rx="8" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.5" />
          <text x="100" y="24" fill="#be123c" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">2-Wire (ללא פיצוי)</text>
          <path d="M 30 70 L 170 70 M 30 110 L 170 110" stroke="#ef4444" stroke-width="2.5" />
          <rect x="75" y="80" width="50" height="20" rx="3" fill="#ffffff" stroke="#0f172a" />
          <text x="100" y="94" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Pt100</text>
          <text x="100" y="145" fill="#be123c" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">R_total = R_pt + 2·R_wire</text>
          <text x="100" y="170" fill="#475569" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">כל 0.385Ω בחוט</text>
          <text x="100" y="185" fill="#475569" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מוסיף 1°C שגיאה!</text>
          <text x="100" y="215" fill="#be123c" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">אינו מומלץ למרחקים</text>
        </g>

        <g transform="translate(250, 65)">
          <!-- 3-Wire -->
          <rect x="0" y="0" width="200" height="240" rx="8" fill="#f8fafc" stroke="#4f46e5" stroke-width="1.5" />
          <text x="100" y="24" fill="#4f46e5" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">3-Wire (התקן בתעשייה)</text>
          <path d="M 30 65 L 170 65 M 30 95 L 170 95 M 30 125 L 170 125" stroke="#4f46e5" stroke-width="2.5" />
          <rect x="75" y="75" width="50" height="20" rx="3" fill="#ffffff" stroke="#0f172a" />
          <text x="100" y="89" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Pt100</text>
          <text x="100" y="155" fill="#4f46e5" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">קיזוז גשר וויטסטון</text>
          <text x="100" y="175" fill="#475569" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">חוט 3 מבטל את R_wire</text>
          <text x="100" y="190" fill="#475569" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">בהנחה שכל 3 החוטים זהים</text>
          <text x="100" y="215" fill="#059669" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">מתאים למרחקים ארוכים</text>
        </g>

        <g transform="translate(470, 65)">
          <!-- 4-Wire -->
          <rect x="0" y="0" width="200" height="240" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5" />
          <text x="100" y="24" fill="#047857" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">4-Wire (מעבדתי / דיוק עליון)</text>
          <path d="M 30 55 L 170 55 M 30 80 L 170 80 M 30 105 L 170 105 M 30 130 L 170 130" stroke="#10b981" stroke-width="2.5" />
          <rect x="75" y="70" width="50" height="20" rx="3" fill="#ffffff" stroke="#0f172a" />
          <text x="100" y="84" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Pt100</text>
          <text x="100" y="155" fill="#047857" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">שיטת קלווין (4 גידים)</text>
          <text x="100" y="175" fill="#475569" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">2 חוטים להזרקת זרם קבוע</text>
          <text x="100" y="190" fill="#475569" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">2 חוטים למדידת מתח בנפרד</text>
          <text x="100" y="215" fill="#047857" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">אפס שגיאת הולכה לחלוטין!</text>
        </g>
        """,
        "בתעשייה 3-Wire הינו הסטנדרט המקובל; בדיוק מעבדתי וכיול משתמשים ב-4-Wire לביטול מוחלט של שגיאת חוטים."
    ),

    # 5. Manifold Valves 3-Way & 5-Way
    "diag_manifold_valves.svg": make_svg(
        "סעפות שסתומים (3-Valve & 5-Valve Manifold) וסדר פתיחה בטוח", "#0284c7",
        """
        <g transform="translate(50, 65)">
          <rect x="0" y="0" width="280" height="240" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
          <text x="140" y="25" fill="#0284c7" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">מבנה 3-Valve Manifold</text>
          
          <!-- High & Low Pipes -->
          <line x1="40" y1="50" x2="40" y2="210" stroke="#ef4444" stroke-width="4" />
          <text x="25" y="65" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold">High</text>
          
          <line x1="240" y1="50" x2="240" y2="210" stroke="#0284c7" stroke-width="4" />
          <text x="255" y="65" fill="#0284c7" font-family="Arial, sans-serif" font-size="10" font-weight="bold">Low</text>

          <!-- High Block Valve -->
          <circle cx="40" cy="90" r="14" fill="#ffffff" stroke="#ef4444" stroke-width="2" />
          <text x="75" y="94" font-family="Arial, sans-serif" font-size="9">High Block</text>

          <!-- Low Block Valve -->
          <circle cx="240" cy="90" r="14" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
          <text x="200" y="94" font-family="Arial, sans-serif" font-size="9" text-anchor="end">Low Block</text>

          <!-- Equalizing Valve in middle -->
          <line x1="40" y1="150" x2="240" y2="150" stroke="#64748b" stroke-width="3" />
          <circle cx="140" cy="150" r="16" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
          <text x="140" y="154" fill="#713f12" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">Equalize</text>

          <!-- DP cell at bottom -->
          <rect x="70" y="190" width="140" height="40" rx="5" fill="#e0e7ff" stroke="#4f46e5" />
          <text x="140" y="214" fill="#1e1b4b" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">משדר DP Cell</text>
        </g>

        <!-- Right: Sequencing Rules -->
        <g transform="translate(360, 65)">
          <rect x="0" y="0" width="300" height="240" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
          <text x="150" y="25" fill="#0f172a" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">סדר פעולות מחייב באחזקה</text>

          <!-- Putting into service -->
          <rect x="15" y="45" width="270" height="85" rx="6" fill="#ecfdf5" stroke="#10b981" />
          <text x="25" y="65" fill="#047857" font-family="Arial, sans-serif" font-size="11" font-weight="bold">הכנסה לעבודה (Commissioning):</text>
          <text x="25" y="85" fill="#334155" font-family="Arial, sans-serif" font-size="10">1. פתח שסתום Equalize (השוואת לחץ)</text>
          <text x="25" y="103" fill="#334155" font-family="Arial, sans-serif" font-size="10">2. פתח לאט שסתום High (לחץ גבוה)</text>
          <text x="25" y="121" fill="#334155" font-family="Arial, sans-serif" font-size="10">3. סגור Equalize, ורק בסוף פתח שסתום Low</text>

          <!-- Danger Callout -->
          <rect x="15" y="145" width="270" height="85" rx="6" fill="#fff1f2" stroke="#f43f5e" />
          <text x="25" y="165" fill="#be123c" font-family="Arial, sans-serif" font-size="11" font-weight="bold">אזהרה מפני קריעת דיאפרגמה:</text>
          <text x="25" y="185" fill="#be123c" font-family="Arial, sans-serif" font-size="10">לעולם אל תשאיר את Equalize סגור בזמן פתיחת</text>
          <text x="25" y="202" fill="#be123c" font-family="Arial, sans-serif" font-size="10">אחד מקווי הלחץ, הדבר ייצור עומס יתר חד-צדדי</text>
          <text x="25" y="219" fill="#be123c" font-family="Arial, sans-serif" font-size="10">(Over-range) שיקרע את קפסולת המשדר!</text>
        </g>
        """,
        "במניפולד חובה להשוות לחצים לפני פתיחת או סגירת הקווים למניעת קריעת דיאפרגמת המדידה של המשדר"
    ),

    # 6. Bourdon Gauge & Pigtail Siphon
    "diag_bourdon_gauge.svg": make_svg(
        "מד לחץ בורדון (Bourdon Tube), פתח בטיחות וסיפון Pigtail לקיטור", "#7c3aed",
        """
        <g transform="translate(50, 60)">
          <!-- Gauge Dial -->
          <circle cx="120" cy="120" r="85" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
          <!-- Bourdon C-Tube -->
          <path d="M 120 180 C 60 180, 50 70, 110 50 C 150 40, 185 60, 180 95" fill="none" stroke="#d97706" stroke-width="7" stroke-linecap="round" />
          <!-- Link and Sector Gear -->
          <line x1="180" y1="95" x2="140" y2="105" stroke="#64748b" stroke-width="2" />
          <circle cx="120" cy="120" r="7" fill="#0f172a" />
          <!-- Pointer -->
          <line x1="120" y1="120" x2="160" y2="70" stroke="#ef4444" stroke-width="3" />
          
          <text x="120" y="145" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">צינור בורדון C</text>
          <text x="120" y="160" fill="#64748b" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">מתיישר תחת לחץ</text>

          <!-- Blowout Back disc -->
          <rect x="230" y="60" width="80" height="120" rx="4" fill="#f8fafc" stroke="#cbd5e1" />
          <text x="270" y="90" fill="#be123c" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Blow-out Back</text>
          <text x="270" y="115" fill="#475569" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">גב בטיחות מתפרק</text>
          <text x="270" y="135" fill="#475569" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">פורק פיצוץ אחורה</text>
          <text x="270" y="150" fill="#475569" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">להגנת פני המפעיל!</text>
        </g>

        <!-- Right: Pigtail Siphon for Steam -->
        <g transform="translate(370, 60)">
          <rect x="0" y="0" width="290" height="245" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
          <text x="145" y="25" fill="#7c3aed" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">סיפון Pigtail למדידת קיטור חם</text>
          
          <!-- Pigtail coil pipe -->
          <path d="M 80 220 L 80 160 C 80 120, 140 120, 140 160 C 140 200, 200 200, 200 120 L 200 60" fill="none" stroke="#0284c7" stroke-width="8" stroke-linecap="round" />
          <text x="80" y="240" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold">כניסת קיטור (200°C+)</text>
          
          <rect x="135" y="80" width="145" height="70" rx="5" fill="#ffffff" stroke="#cbd5e1" />
          <text x="207" y="105" fill="#0284c7" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">מלכודת מי עיבוי (Condensate)</text>
          <text x="207" y="125" fill="#334155" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מונעת פגיעת קיטור ישיר</text>
          <text x="207" y="140" fill="#334155" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">באלמנט הבורדון הרגיש</text>
        </g>
        """,
        "במדידת קיטור חובה להתקין סיפון Pigtail למילוי מים קרים שיבודדו את החום מגוף המד"
    ),

    # 7. Level Gauges: Reflex vs Transparent vs Magnetic
    "diag_glass_level_gauges.svg": make_svg(
        "מראי מצב מפלס: זכוכית פריזמטית (Reflex) מול שקופה (Transparent)", "#059669",
        """
        <g transform="translate(60, 65)">
          <!-- Reflex Glass -->
          <rect x="0" y="0" width="260" height="240" rx="8" fill="#f8fafc" stroke="#059669" stroke-width="1.5" />
          <text x="130" y="25" fill="#059669" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">מראה מפלס Reflex (פריזמטי)</text>
          
          <!-- Prism glass grooves -->
          <rect x="30" y="50" width="60" height="170" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
          <!-- Liquid section: Dark -->
          <rect x="32" y="120" width="56" height="98" fill="#0f172a" />
          <!-- Gas section: Silver/Bright -->
          <rect x="32" y="52" width="56" height="68" fill="#e2e8f0" />

          <text x="110" y="85" fill="#64748b" font-family="Arial, sans-serif" font-size="10">פאזת גז: בהירה/כסופה</text>
          <text x="110" y="100" fill="#64748b" font-family="Arial, sans-serif" font-size="9">(החזרה מלאה של אור)</text>

          <text x="110" y="150" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold">פאזת נוזל: כהה/שחורה</text>
          <text x="110" y="165" fill="#475569" font-family="Arial, sans-serif" font-size="9">(שבירת אור לתוך הנוזל)</text>

          <rect x="100" y="190" width="150" height="35" rx="4" fill="#ecfdf5" stroke="#10b981" />
          <text x="175" y="212" fill="#047857" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">אידיאלי לנוזל נקי וצלול (מים)</text>
        </g>

        <!-- Transparent Glass -->
        <g transform="translate(360, 65)">
          <rect x="0" y="0" width="280" height="240" rx="8" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5" />
          <text x="140" y="25" fill="#0284c7" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">מראה מפלס שקוף (Transparent)</text>

          <!-- Two plain glass windows -->
          <rect x="30" y="50" width="60" height="170" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
          <!-- Liquid with color -->
          <rect x="32" y="130" width="56" height="88" fill="#d97706" opacity="0.8" />
          
          <text x="110" y="85" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold">זכוכית כפולה (מלפנים ומאחור)</text>
          <text x="110" y="105" fill="#475569" font-family="Arial, sans-serif" font-size="9">מאפשרת תאורה אחורית (Illuminator)</text>

          <text x="110" y="145" fill="#d97706" font-family="Arial, sans-serif" font-size="10" font-weight="bold">מדידת נוזלים עכורים / נפט / שמן</text>
          <text x="110" y="165" fill="#475569" font-family="Arial, sans-serif" font-size="9">וכן מדידת קו הפרדה (Interface)</text>
          
          <text x="110" y="195" fill="#0284c7" font-family="Arial, sans-serif" font-size="9">ניתן להגן עם מגן נציץ (Mica Shield)</text>
          <text x="110" y="210" fill="#0284c7" font-family="Arial, sans-serif" font-size="9">בקיטור בלחץ גבוה נגד תקיפת זכוכית</text>
        </g>
        """,
        "במראה רפלקס הנוזל נראה שחור והגז כסוף בזכות שבירת אור פריזמטית. במראה שקוף מביטים דרך הנוזל עצמו."
    ),

    # 8. Magnetic Level Gauge (MLG)
    "diag_magnetic_level_gauge.svg": make_svg(
        "מד גובה מגנטי (Magnetic Level Indicator) - מצוף ודגלים צבעוניים", "#d97706",
        """
        <g transform="translate(80, 55)">
          <!-- Bypass Chamber Pipe -->
          <rect x="80" y="20" width="70" height="230" rx="10" fill="#e2e8f0" stroke="#475569" stroke-width="3" />
          
          <!-- Magnetic Float Inside Chamber -->
          <rect x="86" y="120" width="58" height="60" rx="8" fill="#ffffff" stroke="#ef4444" stroke-width="2" />
          <text x="115" y="155" fill="#ef4444" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">מצוף N-S</text>

          <!-- Fluid Level -->
          <rect x="83" y="145" width="64" height="102" rx="6" fill="#0284c7" opacity="0.6" />

          <!-- Indicator Rail on Side with Bicolor Flappers -->
          <rect x="170" y="30" width="25" height="210" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
          
          <!-- White Flappers (Gas above float) -->
          <rect x="173" y="35" width="19" height="105" fill="#ffffff" />
          <g stroke="#94a3b8">
            <line x1="173" y1="50" x2="192" y2="50" /><line x1="173" y1="65" x2="192" y2="65" />
            <line x1="173" y1="80" x2="192" y2="80" /><line x1="173" y1="95" x2="192" y2="95" />
            <line x1="173" y1="110" x2="192" y2="110" /><line x1="173" y1="125" x2="192" y2="125" />
          </g>

          <!-- Red/Yellow Flappers (Flipped by magnet below float) -->
          <rect x="173" y="140" width="19" height="95" fill="#ef4444" />
          <g stroke="#ffffff">
            <line x1="173" y1="155" x2="192" y2="155" /><line x1="173" y1="170" x2="192" y2="170" />
            <line x1="173" y1="185" x2="192" y2="185" /><line x1="173" y1="200" x2="192" y2="200" />
            <line x1="173" y1="215" x2="192" y2="215" />
          </g>

          <text x="210" y="80" fill="#64748b" font-family="Arial, sans-serif" font-size="10">דגלים לבנים (ריק / גז)</text>
          <text x="210" y="175" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold">דגלים אדומים (מלא בנוזל)</text>
        </g>

        <!-- Right: Maintenance & Benefits -->
        <g transform="translate(390, 60)">
          <rect x="0" y="0" width="270" height="245" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
          <text x="135" y="25" fill="#0f172a" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">יתרונות בטיחות ואחזקה</text>

          <rect x="15" y="45" width="240" height="50" rx="5" fill="#ecfdf5" />
          <text x="135" y="66" fill="#047857" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">ללא זכוכית תחת לחץ (No Glass)</text>
          <text x="135" y="82" fill="#047857" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מונע לחלוטין סכנת פריצת חומרים מסוכנים</text>

          <text x="15" y="120" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold">היבטי אחזקה קריטיים:</text>
          <text x="15" y="140" fill="#475569" font-family="Arial, sans-serif" font-size="9">• שקיעת בוצה / חלקיקים מגנטיים בתחתית</text>
          <text x="15" y="158" fill="#475569" font-family="Arial, sans-serif" font-size="9">• שסתום ניקוז תחתון לשטיפה תקופתית (Blowdown)</text>
          <text x="15" y="176" fill="#475569" font-family="Arial, sans-serif" font-size="9">• התאמת משקל סגולי של המצוף (Specific Gravity)</text>
          <text x="15" y="194" fill="#475569" font-family="Arial, sans-serif" font-size="9">• אפשרות הוספת משדר מגנטוסטריקטיבי (4-20mA)</text>
        </g>
        """,
        "מד מפלס מגנטי מפריד לחלוטין את הנוזל הרעיל/בלחץ מלוח התצוגה בעזרת מצוף מגנטי ודגלים מסתובבים"
    ),

    # 9. Non-contact Radar vs Guided Wave Radar (GWR / TDR)
    "diag_radar_vs_gwr_level.svg": make_svg(
        "מדידת מפלס במכ\"ם: מכ\"ם ללא מגע (FMCW) מול מכ\"ם גל מונחה (GWR TDR)", "#0284c7",
        """
        <g transform="translate(50, 65)">
          <!-- Non-contact radar -->
          <rect x="0" y="0" width="280" height="240" rx="8" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5" />
          <text x="140" y="25" fill="#0284c7" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">מכ\"ם ללא מגע (Free Space Radar)</text>
          
          <!-- Radar Horn Antenna -->
          <path d="M 120 40 L 160 40 L 175 75 L 105 75 Z" fill="#475569" />
          <circle cx="140" cy="35" r="15" fill="#0284c7" />

          <!-- Radiating waves -->
          <path d="M 120 90 Q 140 100 160 90" stroke="#0284c7" stroke-width="2" fill="none" />
          <path d="M 105 110 Q 140 125 175 110" stroke="#0284c7" stroke-width="2" fill="none" />
          <path d="M 90 130 Q 140 150 190 130" stroke="#0284c7" stroke-width="2" fill="none" />

          <!-- Surface liquid -->
          <rect x="15" y="160" width="250" height="65" rx="4" fill="#e0f2fe" />
          <text x="140" y="195" fill="#0369a1" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">פני הנוזל</text>

          <text x="140" y="145" fill="#64748b" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">קרן אלקטרומגנטית 80GHz / 26GHz</text>
        </g>

        <!-- Guided Wave Radar -->
        <g transform="translate(360, 65)">
          <rect x="0" y="0" width="290" height="240" rx="8" fill="#f8fafc" stroke="#7c3aed" stroke-width="1.5" />
          <text x="145" y="25" fill="#7c3aed" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">מכ\"ם גל מונחה (Guided Wave / TDR)</text>
          
          <!-- Transmitter Head -->
          <circle cx="145" cy="40" r="16" fill="#7c3aed" />
          
          <!-- Probe / Cable -->
          <line x1="145" y1="56" x2="145" y2="220" stroke="#475569" stroke-width="4" />
          <circle cx="145" cy="220" r="6" fill="#475569" />

          <!-- Reflected pulse at liquid surface -->
          <circle cx="145" cy="150" r="10" fill="#f59e0b" opacity="0.6" />
          <path d="M 160 145 L 210 145" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow)" />
          <text x="215" y="149" fill="#b45309" font-family="Arial, sans-serif" font-size="9" font-weight="bold">החזרה בשינוי קבוע דיאלקטרי ε_r</text>

          <!-- Fluid -->
          <rect x="20" y="150" width="250" height="75" rx="4" fill="#ede9fe" />
          
          <text x="25" y="80" fill="#334155" font-family="Arial, sans-serif" font-size="9">• חסין לחלוטין בפני קצף, אבק ואדים</text>
          <text x="25" y="98" fill="#334155" font-family="Arial, sans-serif" font-size="9">• מודד גם קו הפרדה (Interface) בין נפט למים</text>
          <text x="25" y="116" fill="#334155" font-family="Arial, sans-serif" font-size="9">• פועל לפי זמן מעוף פולס (TDR)</text>
        </g>
        """,
        "GWR פועל בעזרת כבל מוליך וחסין לאבק וקצף. מכ\"ם ללא מגע מצטיין בנוזלים אגרסיביים ללא מגע בחומר."
    ),

    # 10. PLC AI: 2-Wire vs 4-Wire
    "diag_plc_ai_2wire_4wire.svg": make_svg(
        "כרטיסי מבוא אנלוגי בבקר (AI): תצורת 2-Wire מול 4-Wire", "#4f46e5",
        """
        <g transform="translate(40, 65)">
          <!-- 2-Wire Loop Powered -->
          <rect x="0" y="0" width="285" height="240" rx="8" fill="#f8fafc" stroke="#4f46e5" stroke-width="1.5" />
          <text x="142" y="24" fill="#4f46e5" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">משדר 2-Wire (Loop-Powered)</text>
          
          <!-- PLC Card on Right of box -->
          <rect x="175" y="45" width="95" height="110" rx="4" fill="#ffffff" stroke="#4f46e5" />
          <text x="222" y="65" fill="#4f46e5" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">כרטיס AI</text>
          <text x="222" y="85" fill="#ef4444" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">+24V Out</text>
          <text x="222" y="135" fill="#0f172a" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">AI In (-)</text>

          <!-- Transmitter on Left -->
          <rect x="15" y="65" width="85" height="70" rx="5" fill="#ffffff" stroke="#64748b" />
          <text x="57" y="95" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">משדר 2-חוטים</text>
          <text x="57" y="112" fill="#64748b" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">(ללא הזנה נפרדת)</text>

          <!-- Loop wires -->
          <path d="M 200 80 L 100 80" stroke="#ef4444" stroke-width="2.5" />
          <path d="M 100 120 L 200 120" stroke="#0f172a" stroke-width="2.5" />

          <rect x="15" y="170" width="255" height="55" rx="5" fill="#eef2ff" />
          <text x="142" y="190" fill="#312e81" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">אותם שני חוטים מספקים גם מתח</text>
          <text x="142" y="208" fill="#312e81" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">וגם מחזירים את אות הזרם (4-20mA)</text>
        </g>

        <!-- 4-Wire Self Powered -->
        <g transform="translate(365, 65)">
          <rect x="0" y="0" width="295" height="240" rx="8" fill="#f8fafc" stroke="#059669" stroke-width="1.5" />
          <text x="147" y="24" fill="#059669" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">משדר 4-Wire (Self-Powered / Active)</text>
          
          <!-- Transmitter -->
          <rect x="15" y="45" width="95" height="110" rx="5" fill="#ffffff" stroke="#64748b" />
          <text x="62" y="70" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">משדר 4-חוטים</text>
          <text x="62" y="85" fill="#64748b" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">(מד ספיקה מגנטי)</text>

          <!-- External power supply 230VAC / 24VDC -->
          <line x1="62" y1="155" x2="62" y2="190" stroke="#d97706" stroke-width="3" />
          <text x="62" y="210" fill="#b45309" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">הזנה נפרדת (230VAC)</text>

          <!-- PLC Card on Right -->
          <rect x="180" y="55" width="95" height="85" rx="4" fill="#ffffff" stroke="#059669" />
          <text x="227" y="80" fill="#059669" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">כרטיס AI פסיבי</text>
          <text x="227" y="105" fill="#0f172a" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">קליטת mA (+/-)</text>

          <!-- Signal lines -->
          <path d="M 110 75 L 180 75" stroke="#059669" stroke-width="2.5" />
          <path d="M 110 105 L 180 105" stroke="#0f172a" stroke-width="2.5" />

          <rect x="15" y="170" width="265" height="55" rx="5" fill="#ecfdf5" />
          <text x="147" y="190" fill="#065f46" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">המשדר מייצר את הזרם בעצמו (Active)</text>
          <text x="147" y="208" fill="#065f46" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">כרטיס ה-PLC חייב להיות מוגדר כפסיבי!</text>
        </g>
        """,
        "ב-2-Wire כרטיס הבקר מספק את המתח למשדר; ב-4-Wire המשדר מוזן בנפרד ומזרים זרם אקטיבי לכרטיס"
    ),

    # 11. PLC DI: Sink vs Source (PNP vs NPN)
    "diag_plc_di_pnp_npn.svg": make_svg(
        "כרטיסי מבוא דיגיטלי בבקר (DI): חיבור חיישני PNP מול NPN (Sink / Source)", "#d97706",
        """
        <g transform="translate(40, 65)">
          <!-- PNP (Sourcing sensor -> Sinking input) -->
          <rect x="0" y="0" width="285" height="240" rx="8" fill="#f8fafc" stroke="#d97706" stroke-width="1.5" />
          <text x="142" y="24" fill="#d97706" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">חיישן PNP (הסטנדרט המערבי באירופה/ישראל)</text>

          <rect x="15" y="50" width="95" height="80" rx="4" fill="#ffffff" stroke="#64748b" />
          <text x="62" y="80" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">חיישן PNP</text>
          <text x="62" y="98" fill="#d97706" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">(מוציא +24V)</text>

          <!-- PLC Input Sinking -->
          <rect x="175" y="50" width="95" height="80" rx="4" fill="#ffffff" stroke="#d97706" />
          <text x="222" y="80" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">כניסת PLC</text>
          <text x="222" y="98" fill="#475569" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">(Sinking - מחובר ל-0V)</text>

          <!-- Signal line -->
          <path d="M 110 80 L 175 80" stroke="#ef4444" stroke-width="3" />
          <text x="142" y="72" fill="#ef4444" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">+24V Signal</text>

          <rect x="15" y="150" width="255" height="75" rx="5" fill="#fef3c7" />
          <text x="142" y="172" fill="#92400e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">הסבר בטיחותי קריטי:</text>
          <text x="142" y="190" fill="#92400e" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">אם כבל האות של PNP נפצע ונוגע בגוף מוארק (0V),</text>
          <text x="142" y="205" fill="#92400e" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">הכניסה נשארת ב-0V ולא תופעל פקודת שווא בטעות!</text>
        </g>

        <!-- NPN -->
        <g transform="translate(365, 65)">
          <rect x="0" y="0" width="295" height="240" rx="8" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5" />
          <text x="147" y="24" fill="#0284c7" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">חיישן NPN (נפוץ במכונות מיפן ואסיה)</text>

          <rect x="15" y="50" width="95" height="80" rx="4" fill="#ffffff" stroke="#64748b" />
          <text x="62" y="80" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">חיישן NPN</text>
          <text x="62" y="98" fill="#0284c7" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">(מושך ל-0V/GND)</text>

          <!-- PLC Input Sourcing -->
          <rect x="175" y="50" width="95" height="80" rx="4" fill="#ffffff" stroke="#0284c7" />
          <text x="222" y="80" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">כניסת PLC</text>
          <text x="222" y="98" fill="#475569" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">(Sourcing - מחובר ל-24V+)</text>

          <path d="M 110 80 L 175 80" stroke="#0f172a" stroke-width="3" />
          <text x="142" y="72" fill="#0f172a" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">GND / 0V Signal</text>

          <rect x="15" y="150" width="265" height="75" rx="5" fill="#e0f2fe" />
          <text x="147" y="172" fill="#0369a1" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">הסבר פעולה:</text>
          <text x="147" y="190" fill="#0369a1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">החיישן 'שואב' זרם ומחבר את הקו לאדמה (Sink).</text>
          <text x="147" y="205" fill="#0369a1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">דורש כרטיס בקר שפולט מתח (Sourcing Input).</text>
        </g>
        """,
        "חיישן PNP מוציא 24V+ להפעלת כניסה Sinking; חיישן NPN מושך ל-0V להפעלת כניסה Sourcing"
    ),

    # 12. PLC DO: Relay vs Transistor
    "diag_plc_do_relay_transistor.svg": make_svg(
        "כרטיסי מוצא דיגיטלי (DO): מוצא ממסר (Relay) מול מוצא טרנזיסטור (Solid State)", "#7c3aed",
        """
        <g transform="translate(50, 65)">
          <rect x="0" y="0" width="280" height="240" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
          <text x="140" y="25" fill="#7c3aed" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">מוצא ממסר מכני (Relay Output)</text>

          <rect x="25" y="50" width="80" height="80" rx="4" fill="#ffffff" stroke="#7c3aed" />
          <path d="M 45 75 L 75 60 M 45 105 L 85 105" stroke="#ef4444" stroke-width="2.5" />
          <text x="65" y="120" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מגע יבש</text>

          <text x="125" y="70" fill="#059669" font-family="Arial, sans-serif" font-size="10" font-weight="bold">יתרונות:</text>
          <text x="125" y="88" fill="#334155" font-family="Arial, sans-serif" font-size="9">• מיתוג גם AC וגם DC (עד 230V)</text>
          <text x="125" y="104" fill="#334155" font-family="Arial, sans-serif" font-size="9">• זרם גבוה (2A עד 5A)</text>
          <text x="125" y="120" fill="#334155" font-family="Arial, sans-serif" font-size="9">• בידוד גלווני מוחלט</text>

          <rect x="20" y="150" width="240" height="75" rx="5" fill="#fff1f2" />
          <text x="140" y="172" fill="#be123c" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">חסרונות ואחזקה:</text>
          <text x="140" y="190" fill="#be123c" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">• בלאי מכני (מחזור חיים מוגבל)</text>
          <text x="140" y="205" fill="#be123c" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">• מהירות מיתוג איטית (לא מתאים ל-PWM)</text>
        </g>

        <g transform="translate(360, 65)">
          <rect x="0" y="0" width="290" height="240" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
          <text x="145" y="25" fill="#059669" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">מוצא טרנזיסטור (Transistor Solid-State)</text>

          <rect x="25" y="50" width="80" height="80" rx="4" fill="#ffffff" stroke="#059669" />
          <circle cx="65" cy="90" r="24" fill="#ecfdf5" stroke="#059669" />
          <text x="65" y="94" fill="#047857" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">MOSFET</text>

          <text x="125" y="70" fill="#059669" font-family="Arial, sans-serif" font-size="10" font-weight="bold">יתרונות:</text>
          <text x="125" y="88" fill="#334155" font-family="Arial, sans-serif" font-size="9">• אפס בלאי מכני (אינסוף מיתוגים)</text>
          <text x="125" y="104" fill="#334155" font-family="Arial, sans-serif" font-size="9">• מהירות מיתוג עצומה (kHz)</text>
          <text x="125" y="120" fill="#334155" font-family="Arial, sans-serif" font-size="9">• מתאים לבקרת מנועי צעד ו-PWM</text>

          <rect x="20" y="150" width="250" height="75" rx="5" fill="#e0f2fe" />
          <text x="145" y="172" fill="#0369a1" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">מגבלות:</text>
          <text x="145" y="190" fill="#0369a1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">• מיתוג מתח DC בלבד (בד\"כ 24VDC)</text>
          <text x="145" y="205" fill="#0369a1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">• זרם נמוך (0.5A לערוץ, רגיש לקצרים)</text>
        </g>
        """,
        "כרטיס ממסר מתאים למתחי AC וזרמים גבוהים; כרטיס טרנזיסטור מתאים לתדרי מיתוג מהירים ללא בלאי"
    ),

    # 13. Ground Loop & Galvanic Isolation
    "diag_ground_loop_isolation.svg": make_svg(
        "לולאות הארקה (Ground Loops) ובידוד גלווני באותות 4-20mA", "#e11d48",
        """
        <g transform="translate(50, 60)">
          <!-- Ground Loop Fault Scenario -->
          <rect x="0" y="0" width="280" height="245" rx="8" fill="#fff1f2" stroke="#f43f5e" />
          <text x="140" y="24" fill="#be123c" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">תקלת לולאת הארקה (ללא בידוד)</text>

          <rect x="20" y="45" width="80" height="60" rx="4" fill="#ffffff" stroke="#64748b" />
          <text x="60" y="80" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">משדר בשטח</text>
          <!-- Earth 1 -->
          <line x1="60" y1="105" x2="60" y2="135" stroke="#059669" stroke-width="2" />
          <text x="60" y="150" fill="#047857" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">הארקת שטח (0V₁)</text>

          <rect x="180" y="45" width="80" height="60" rx="4" fill="#ffffff" stroke="#64748b" />
          <text x="220" y="80" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">בקר PLC בלוח</text>
          <!-- Earth 2 -->
          <line x1="220" y1="105" x2="220" y2="135" stroke="#059669" stroke-width="2" />
          <text x="220" y="150" fill="#047857" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">הארקת לוח (0V₂)</text>

          <!-- Ground current loop circulating -->
          <path d="M 60 160 Q 140 185 220 160" stroke="#f43f5e" stroke-width="3" stroke-dasharray="4,3" fill="none" />
          <text x="140" y="195" fill="#be123c" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">זרם תועה עקב הפרש פוטנציאלים (ΔV)</text>
          <text x="140" y="215" fill="#475569" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">גורם לקריאה בלתי יציבה ולתנודות קשות ב-4-20mA</text>
        </g>

        <!-- Solution: Galvanic Isolator -->
        <g transform="translate(360, 60)">
          <rect x="0" y="0" width="290" height="245" rx="8" fill="#ecfdf5" stroke="#10b981" />
          <text x="145" y="24" fill="#047857" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">הפתרון: מבודד גלווני (Galvanic Isolator)</text>

          <rect x="90" y="60" width="110" height="80" rx="5" fill="#ffffff" stroke="#059669" stroke-width="2" />
          <text x="145" y="90" fill="#047857" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">מבודד אות</text>
          <text x="145" y="108" fill="#64748b" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">אופטוקפלר / שנאי</text>
          <line x1="145" y1="60" x2="145" y2="140" stroke="#10b981" stroke-dasharray="3,2" />

          <text x="25" y="165" fill="#0f172a" font-family="Arial, sans-serif" font-size="9" font-weight="bold">• ניתוק פיזי-חשמלי של נתיב הזרם התועה</text>
          <text x="25" y="185" fill="#475569" font-family="Arial, sans-serif" font-size="9">• העברת המידע באופטיקה או בשדה מגנטי</text>
          <text x="25" y="205" fill="#475569" font-family="Arial, sans-serif" font-size="9">• מונע שריפת כרטיסי בקר בעת פגיעת ברק</text>
          <text x="25" y="225" fill="#047857" font-family="Arial, sans-serif" font-size="9" font-weight="bold">• חובה במעגלים מוגני פיצוץ (Intrinsic Safety - IS)</text>
        </g>
        """,
        "הפרש מתחים בין שתי הארקות שונות מייצר זרם תועה. מבודד גלווני מנתק את המעגל החשמלי ומייצב את האות."
    ),

    # 14. HART 250 Ohm Resistor
    "diag_hart_communicator_loop.svg": make_svg(
        "תקשורת HART: דרישת נגד 250Ω בחוג וחיבור ה-Field Communicator", "#0284c7",
        """
        <g transform="translate(60, 65)">
          <!-- 24V Power -->
          <rect x="20" y="40" width="70" height="50" rx="4" fill="#ffffff" stroke="#64748b" />
          <text x="55" y="70" fill="#0f172a" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">24VDC</text>

          <!-- 250 Ohm Resistor in series -->
          <rect x="180" y="45" width="90" height="40" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
          <text x="225" y="65" fill="#713f12" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">נגד 250Ω</text>
          <text x="225" y="78" fill="#ca8a04" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">(HART Load)</text>

          <!-- Field Device / Transmitter -->
          <circle cx="370" cy="120" r="35" fill="#e0e7ff" stroke="#4f46e5" stroke-width="2" />
          <text x="370" y="118" fill="#1e1b4b" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">משדר HART</text>
          <text x="370" y="132" fill="#4f46e5" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">4-20mA</text>

          <!-- Wires forming loop -->
          <path d="M 90 65 L 180 65" stroke="#ef4444" stroke-width="2.5" />
          <path d="M 270 65 L 370 65 L 370 85" stroke="#ef4444" stroke-width="2.5" />
          <path d="M 370 155 L 370 190 L 55 190 L 55 90" stroke="#0f172a" stroke-width="2.5" />

          <!-- HART Communicator connected in PARALLEL across loop / resistor -->
          <g transform="translate(160, 130)">
            <rect x="0" y="0" width="130" height="80" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
            <text x="65" y="25" fill="#0284c7" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">פלוק / קומיוניקטור</text>
            <text x="65" y="42" fill="#0284c7" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">HART 475 / Trex</text>
            <circle cx="35" cy="65" r="4" fill="#ef4444" /><circle cx="95" cy="65" r="4" fill="#0f172a" />
          </g>

          <path d="M 195 195 L 195 85" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2" />
          <path d="M 255 195 L 255 85" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="3,2" />
        </g>

        <!-- Right: Explanation Card -->
        <g transform="translate(480, 65)">
          <rect x="0" y="0" width="180" height="240" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
          <text x="90" y="25" fill="#0f172a" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">למה צריך 250Ω?</text>
          
          <rect x="10" y="40" width="160" height="65" rx="4" fill="#eef2ff" />
          <text x="90" y="60" fill="#312e81" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">המרת זרם למתח:</text>
          <text x="90" y="75" fill="#312e81" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">אות FSK של 0.5mA</text>
          <text x="90" y="90" fill="#312e81" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">מייצר מתח של 125mV p-p</text>

          <text x="15" y="130" fill="#334155" font-family="Arial, sans-serif" font-size="9">• ספק כוח אידיאלי הוא בעל עכבה 0Ω</text>
          <text x="15" y="150" fill="#334155" font-family="Arial, sans-serif" font-size="9">• ללא נגד, הספק היה בולע את גל התקשורת!</text>
          <text x="15" y="175" fill="#047857" font-family="Arial, sans-serif" font-size="9" font-weight="bold">• תחום תקני: 230Ω עד 1100Ω</text>
        </g>
        """,
        "קומיוניקטור HART מתחבר במקביל למעגל. ללא עכבת חוג של לפחות 250Ω לא ניתן לקיים תקשורת ספרתית."
    ),

    # 15. Coriolis Mass Flowmeter
    "diag_coriolis_meter.svg": make_svg(
        "מד ספיקה מסית קוריוליס (Coriolis Mass Meter): מדידת מסה וצפיפות ישירה", "#4f46e5",
        """
        <g transform="translate(60, 65)">
          <rect x="0" y="0" width="580" height="240" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
          
          <!-- Flow tubes -->
          <path d="M 40 120 C 120 40, 240 40, 320 120" fill="none" stroke="#4f46e5" stroke-width="8" />
          <path d="M 40 140 C 120 220, 240 220, 320 140" fill="none" stroke="#4f46e5" stroke-width="8" />
          
          <!-- Excitation Drive Coil in Center -->
          <circle cx="180" cy="130" r="14" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
          <text x="180" y="134" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle">סליל עירור</text>
          
          <!-- Pickoff Sensors Left and Right -->
          <circle cx="100" cy="95" r="10" fill="#059669" />
          <text x="100" y="75" fill="#047857" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">Pickoff כניסה</text>

          <circle cx="260" cy="95" r="10" fill="#059669" />
          <text x="260" y="75" fill="#047857" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">Pickoff יציאה</text>

          <!-- Explanation box on right side -->
          <g transform="translate(350, 20)">
            <rect x="0" y="0" width="210" height="195" rx="6" fill="#ffffff" stroke="#cbd5e1" />
            <text x="105" y="24" fill="#4f46e5" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">מדידה ישירה של מסה וצפיפות</text>
            <text x="15" y="55" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold">1. ספיקה מסית (kg/h):</text>
            <text x="15" y="72" fill="#475569" font-family="Arial, sans-serif" font-size="9">הפרש פאזה בזמן (Δt) בין שני חיישני ה-Pickoff עקב כוח קוריוליס</text>
            
            <text x="15" y="110" fill="#0f172a" font-family="Arial, sans-serif" font-size="10" font-weight="bold">2. צפיפות הנוזל (Density):</text>
            <text x="15" y="127" fill="#475569" font-family="Arial, sans-serif" font-size="9">נמדדת לפי תדר התהודה הטבעי של הצינורות הרועדים</text>

            <text x="15" y="165" fill="#059669" font-family="Arial, sans-serif" font-size="9" font-weight="bold">אינו דורש קטעי צנרת ישרים (0D/0D)!</text>
          </g>
        </g>
        """,
        "מד קוריוליס אינו מושפע מפרופיל הזרימה (ללא דרישת L/D) ומודד ישירות מסה, צפיפות וטמפרטורה בו-זמנית"
    )
}

# Write SVGs
for fname, content in diagrams.items():
    p1 = os.path.join(BACKEND_IMG_DIR, fname)
    p2 = os.path.join(FRONTEND_IMG_DIR, fname)
    with open(p1, 'w', encoding='utf-8') as f:
        f.write(content)
    with open(p2, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Generated {len(diagrams)} new technical SVGs.")

# Fallback mapping helper
def get_diagram_for_topic(topic):
    t = topic.lower()
    if 'פלוק' in t or 'זרם' in t or 'מתח' in t or 'multimeter' in t:
        return '/images/questions/diag_fluke_multimeter_modes.svg'
    elif '789' in t or 'processmeter' in t or 'source' in t or 'simulate' in t:
        return '/images/questions/diag_fluke_789_processmeter.svg'
    elif 'pt100' in t or 'טמפרטורה' in t or 'rtd' in t:
        return '/images/questions/diag_pt100_maintenance_table.svg'
    elif 'חיווט rtd' in t or '3 חוטים' in t or '4 חוטים' in t:
        return '/images/questions/diag_pt100_wiring_comparison.svg'
    elif 'בורדון' in t or 'מד לחץ' in t or 'קיטור' in t:
        return '/images/questions/diag_bourdon_gauge.svg'
    elif 'סעפת' in t or 'מניפולד' in t or 'manifold' in t:
        return '/images/questions/diag_manifold_valves.svg'
    elif 'מראה מפלס' in t or 'רפלקס' in t or 'שקוף' in t or 'glass' in t:
        return '/images/questions/diag_glass_level_gauges.svg'
    elif 'מגנטי' in t and 'מפלס' in t:
        return '/images/questions/diag_magnetic_level_gauge.svg'
    elif 'מכ"ם' in t or 'radar' in t or 'tdr' in t:
        return '/images/questions/diag_radar_vs_gwr_level.svg'
    elif 'ai' in t or '2-wire' in t or '4-wire' in t:
        return '/images/questions/diag_plc_ai_2wire_4wire.svg'
    elif 'pnp' in t or 'npn' in t or 'di' in t:
        return '/images/questions/diag_plc_di_pnp_npn.svg'
    elif 'ממסר' in t or 'טרנזיסטור' in t or 'do' in t:
        return '/images/questions/diag_plc_do_relay_transistor.svg'
    elif 'הארקה' in t or 'מבודד' in t or 'ground loop' in t:
        return '/images/questions/diag_ground_loop_isolation.svg'
    elif 'hart' in t or '250' in t:
        return '/images/questions/diag_hart_communicator_loop.svg'
    elif 'קוריוליס' in t or 'coriolis' in t:
        return '/images/questions/diag_coriolis_meter.svg'
    elif 'ספיקה' in t or 'orifice' in t:
        return '/images/questions/q1_orifice_dp.svg'
    elif 'שסתום' in t or 'פנאומטי' in t:
        return '/images/questions/q3_control_valve.svg'
    elif 'מפלס' in t or 'wet leg' in t:
        return '/images/questions/q6_level_wet_leg.svg'
    elif 'i/p' in t:
        return '/images/questions/q7_ip_converter.svg'
    elif 'pid' in t:
        return '/images/questions/q5_pid_response.svg'
    else:
        return '/images/questions/diag_fluke_multimeter_modes.svg'

print("Ready to assemble questions...")
