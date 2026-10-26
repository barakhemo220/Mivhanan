# -*- coding: utf-8 -*-
"""
Generate 19 High-Quality Industrial SVG Diagrams for New Exam Questions
All SVGs are created in frontend/public/images/questions/
"""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', '..', 'frontend', 'public', 'images', 'questions'))
os.makedirs(OUTPUT_DIR, exist_ok=True)

svgs = {}

# 1. Hazardous Zones (ATEX / IECEx)
svgs['diag_hazardous_zones_atex.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />
  
  <!-- Header -->
  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.2" />
  <text x="210" y="36" fill="#fbbf24" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">סיווג אזורים נפיצים (ATEX / IECEx) - Zone 0, 1, 2 בגזים</text>

  <!-- Tank & Process Area Graphic -->
  <g transform="translate(40, 70)">
    <!-- Zone 2 Outer Envelope (Amber Dotted) -->
    <path d="M 0,280 L 0,160 Q 150,60 300,60 Q 450,60 600,160 L 600,280 Z" fill="rgba(245, 158, 11, 0.08)" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,4" />
    <rect x="15" y="180" width="110" height="24" rx="4" fill="#1e293b" stroke="#f59e0b" />
    <text x="70" y="197" fill="#fbbf24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Zone 2 (&lt;10 שעות/שנה)</text>

    <!-- Zone 1 Surrounding Vent / Hatch (Orange Semi-circle) -->
    <path d="M 170,280 L 170,120 Q 300,90 430,120 L 430,280 Z" fill="rgba(234, 88, 12, 0.15)" stroke="#ea580c" stroke-width="2" stroke-dasharray="5,3" />
    <rect x="185" y="125" width="115" height="24" rx="4" fill="#1e293b" stroke="#ea580c" />
    <text x="242" y="142" fill="#fdba74" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Zone 1 (10-1000 שעות)</text>

    <!-- Storage Tank Body (Zone 0 Inside) -->
    <rect x="220" y="150" width="160" height="130" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" />
    <!-- Liquid Level inside Tank -->
    <rect x="223" y="200" width="154" height="78" rx="4" fill="#0284c7" opacity="0.6" />
    <!-- Vapor Space inside Tank = ZONE 0 -->
    <rect x="223" y="153" width="154" height="47" rx="4" fill="rgba(220, 38, 38, 0.35)" />
    <rect x="240" y="163" width="120" height="26" rx="4" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.2" />
    <text x="300" y="181" fill="#fee2e2" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Zone 0 (&gt;1000 שעות/שנה)</text>
    <text x="300" y="240" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">נוזל נדיף / דליק</text>

    <!-- Vent Pipe on top of Tank -->
    <rect x="285" y="105" width="30" height="45" fill="#334155" stroke="#38bdf8" stroke-width="1.5" />
    <path d="M 275,105 L 325,105 L 300,85 Z" fill="#475569" stroke="#38bdf8" />
    <!-- Gas Release Plume -->
    <path d="M 290,80 Q 260,50 300,25 Q 340,50 310,80 Z" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" stroke-dasharray="3,3" />

    <!-- Ground Level -->
    <line x1="-20" y1="280" x2="620" y2="280" stroke="#64748b" stroke-width="3" />
    <text x="50" y="300" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10">איזור בטוח / שטח פתוח (Non-Hazardous)</text>
  </g>

  <!-- Protection Concepts Legend Box -->
  <g transform="translate(510, 65)">
    <rect x="0" y="0" width="225" height="240" rx="8" fill="#1e293b" stroke="#475569" />
    <text x="112" y="24" fill="#38bdf8" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">שיטות הגנה וסימוני EX</text>
    <line x1="10" y1="34" x2="215" y2="34" stroke="#334155" />

    <!-- Ex ia -->
    <rect x="10" y="44" width="55" height="20" rx="3" fill="#991b1b" />
    <text x="37" y="58" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Ex ia</text>
    <text x="75" y="58" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">בטיחות פנימית (Zone 0,1,2)</text>

    <!-- Ex d -->
    <rect x="10" y="74" width="55" height="20" rx="3" fill="#c2410c" />
    <text x="37" y="88" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Ex d</text>
    <text x="75" y="88" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">חסין אש Flameproof (1,2)</text>

    <!-- Ex e -->
    <rect x="10" y="104" width="55" height="20" rx="3" fill="#b45309" />
    <text x="37" y="118" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Ex e</text>
    <text x="75" y="118" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">בטיחות מוגברת (Zone 1,2)</text>

    <!-- Gas Groups -->
    <text x="10" y="148" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold">קבוצות גזים:</text>
    <text x="10" y="168" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="10">• IIA - פרופאן (סיכון בסיסי)</text>
    <text x="10" y="186" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="10">• IIB - אתילן (בינוני)</text>
    <text x="10" y="204" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold">• IIC - מימן / אצטילן (הכי נפיץ!)</text>

    <!-- Temp Class -->
    <text x="10" y="228" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="10">טמפ' שטח: T6 (85°C) עד T1 (450°C)</text>
  </g>

  <!-- Bottom Explanatory Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">דגש מכשוראי:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">באזור Zone 0 מותר להתקין מכשור עם הגנת בטיחות פנימית בלבד (Ex ia) דרך מחסום זינר (IS Barrier) או מבודד גלווני.</text>
</svg>'''

# 2. IP Camera & Cable Testing
svgs['diag_ip_camera_poe_rj45.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="380" height="32" rx="6" fill="#1e293b" stroke="#06b6d4" stroke-width="1.2" />
  <text x="215" y="36" fill="#22d3ee" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">מצלמות IP, הזנת PoE ובדיקת כבילה (T568B / Fluke)</text>

  <!-- Left: IP Camera & PoE Switch -->
  <g transform="translate(30, 65)">
    <!-- PoE Switch -->
    <rect x="10" y="20" width="160" height="70" rx="6" fill="#1e293b" stroke="#0ea5e9" stroke-width="2" />
    <text x="90" y="45" fill="#38bdf8" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">PoE+ Switch (802.3at)</text>
    <text x="90" y="65" fill="#94a3b8" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">48-54V DC | 30W Max</text>
    <!-- RJ45 Port on Switch -->
    <rect x="145" y="70" width="18" height="15" fill="#0f172a" stroke="#22c55e" stroke-width="1.5" />

    <!-- Cat6 Cable (Blue Path) -->
    <path d="M 163,77 C 230,77 240,77 300,77" fill="none" stroke="#2563eb" stroke-width="6" />
    <text x="230" y="65" fill="#60a5fa" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">כבל רשת Cat6 (עד 100 מטר)</text>

    <!-- IP Camera -->
    <g transform="translate(305, 30)">
      <rect x="0" y="20" width="100" height="50" rx="8" fill="#1e293b" stroke="#22d3ee" stroke-width="2" />
      <circle cx="85" cy="45" r="14" fill="#0f172a" stroke="#22d3ee" stroke-width="2" />
      <circle cx="85" cy="45" r="6" fill="#06b6d4" />
      <text x="45" y="49" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">IP Camera</text>
      <!-- Subtitle -->
      <text x="50" y="88" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">ONVIF / RTSP: 554</text>
    </g>
  </g>

  <!-- Right: T568B Color Code & Cable Tester -->
  <g transform="translate(470, 65)">
    <rect x="0" y="0" width="265" height="245" rx="8" fill="#1e293b" stroke="#475569" />
    <text x="132" y="24" fill="#22d3ee" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">סדר גידים תקני T-568B</text>
    <line x1="10" y1="34" x2="255" y2="34" stroke="#334155" />

    <!-- 8 Wires -->
    <g transform="translate(15, 45)">
      <!-- 1 White-Orange -->
      <rect x="0" y="0" width="18" height="14" rx="2" fill="#fed7aa" stroke="#ea580c" />
      <text x="25" y="11" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">1. לבן-כתום (TX+)</text>

      <!-- 2 Orange -->
      <rect x="0" y="20" width="18" height="14" rx="2" fill="#ea580c" />
      <text x="25" y="31" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">2. כתום (TX-)</text>

      <!-- 3 White-Green -->
      <rect x="0" y="40" width="18" height="14" rx="2" fill="#bbf7d0" stroke="#16a34a" />
      <text x="25" y="51" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">3. לבן-ירוק (RX+)</text>

      <!-- 4 Blue -->
      <rect x="0" y="60" width="18" height="14" rx="2" fill="#2563eb" />
      <text x="25" y="71" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">4. כחול (PoE+)</text>

      <!-- 5 White-Blue -->
      <rect x="0" y="80" width="18" height="14" rx="2" fill="#bfdbfe" stroke="#2563eb" />
      <text x="25" y="91" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">5. לבן-כחול (PoE+)</text>

      <!-- 6 Green -->
      <rect x="0" y="100" width="18" height="14" rx="2" fill="#16a34a" />
      <text x="25" y="111" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">6. ירוק (RX-)</text>

      <!-- 7 White-Brown -->
      <rect x="0" y="120" width="18" height="14" rx="2" fill="#e7e5e4" stroke="#78716c" />
      <text x="25" y="131" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">7. לבן-חום (PoE-)</text>

      <!-- 8 Brown -->
      <rect x="0" y="140" width="18" height="14" rx="2" fill="#78716c" />
      <text x="25" y="151" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">8. חום (PoE-)</text>

      <rect x="0" y="165" width="235" height="26" rx="4" fill="#0f172a" stroke="#22c55e" stroke-width="1" />
      <text x="117" y="182" fill="#4ade80" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">בדיקת טסטר רשת: נורות 1-8 דולקות בסדר רץ</text>
    </g>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#22d3ee" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">איתור תקלות מצלמת IP:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">1. בדיקת PoE (מתח 48V). 2. בדיקת רציפות גידים בטסטר (Wiremap). 3. בדיקת Ping לכתובת ה-IP. 4. בדיקת פורט 554 (RTSP Video Stream).</text>
</svg>'''

# 3. Basic Networking: IP, Subnet, Default Gateway
svgs['diag_network_ip_subnet_gateway.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#6366f1" stroke-width="1.2" />
  <text x="210" y="36" fill="#a5b4fc" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">תקשורת רשת תעשייתית: IP, Subnet Mask ו-Default Gateway</text>

  <!-- Local Subnet Boundary -->
  <rect x="35" y="70" width="460" height="235" rx="10" fill="rgba(99, 102, 241, 0.06)" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="6,4" />
  <text x="50" y="95" fill="#818cf8" font-family="Arial, sans-serif" font-size="12" font-weight="bold">תת-רשת מקומית: 192.168.1.0/24 (Subnet: 255.255.255.0)</text>

  <!-- PLC Node -->
  <g transform="translate(60, 115)">
    <rect x="0" y="0" width="125" height="75" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8" />
    <text x="62" y="25" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">בקר PLC (M340)</text>
    <text x="62" y="45" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">IP: 192.168.1.10</text>
    <text x="62" y="62" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Mask: 255.255.255.0</text>
  </g>

  <!-- HMI Node -->
  <g transform="translate(60, 205)">
    <rect x="0" y="0" width="125" height="75" rx="6" fill="#1e293b" stroke="#a855f7" stroke-width="1.8" />
    <text x="62" y="25" fill="#c084fc" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">מסך HMI Magelis</text>
    <text x="62" y="45" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">IP: 192.168.1.20</text>
    <text x="62" y="62" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Mask: 255.255.255.0</text>
  </g>

  <!-- Industrial Switch -->
  <g transform="translate(240, 150)">
    <rect x="0" y="0" width="90" height="90" rx="8" fill="#1e293b" stroke="#22c55e" stroke-width="2" />
    <text x="45" y="35" fill="#4ade80" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">מתג Switch</text>
    <text x="45" y="55" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">L2 Managed</text>
    <!-- Switch LEDs -->
    <circle cx="25" cy="72" r="3" fill="#22c55e" />
    <circle cx="38" cy="72" r="3" fill="#22c55e" />
    <circle cx="51" cy="72" r="3" fill="#22c55e" />
    <circle cx="64" cy="72" r="3" fill="#22c55e" />
  </g>

  <!-- Lines inside Subnet -->
  <line x1="185" y1="152" x2="240" y2="185" stroke="#38bdf8" stroke-width="2" />
  <line x1="185" y1="242" x2="240" y2="205" stroke="#a855f7" stroke-width="2" />

  <!-- Default Gateway Router -->
  <g transform="translate(370, 150)">
    <rect x="0" y="0" width="110" height="90" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
    <text x="55" y="32" fill="#fbbf24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Default Gateway</text>
    <text x="55" y="52" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">192.168.1.1</text>
    <text x="55" y="72" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">נתב היציאה מהרשת</text>
  </g>
  <line x1="330" y1="195" x2="370" y2="195" stroke="#f59e0b" stroke-width="2.5" />

  <!-- Right: Outside Network / SCADA Server -->
  <g transform="translate(540, 90)">
    <rect x="0" y="0" width="180" height="200" rx="8" fill="#1e293b" stroke="#475569" />
    <text x="90" y="25" fill="#f8fafc" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">רשת עליונה (SCADA / WAN)</text>
    <line x1="10" y1="35" x2="170" y2="35" stroke="#334155" />

    <rect x="25" y="55" width="130" height="65" rx="6" fill="#0f172a" stroke="#ef4444" stroke-width="1.5" />
    <text x="90" y="80" fill="#fca5a5" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">שרת SCADA מרכזי</text>
    <text x="90" y="100" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">IP: 10.50.20.100</text>

    <!-- Communication Arrow through Gateway -->
    <path d="M -60,105 Q -20,105 25,87" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4,3" marker-end="url(#arrow)" />
    <text x="90" y="150" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">גישה לרשת חיצונית</text>
    <text x="90" y="168" fill="#fbbf24" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">מחייבת הגדרת Gateway!</text>
  </g>

  <!-- Bottom Explanatory Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#a5b4fc" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">כלל ברזל בתקשורת IP:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">רכיבים באותו Subnet מתקשרים ישירות דרך המתג (לפי ARP/MAC). כדי לדבר עם כתובת מחוץ ל-Subnet (למשל 10.x.x.x) חובה להגדיר Default Gateway.</text>
</svg>'''

# 4. Profibus DP & PA Topology
svgs['diag_profibus_dp_pa_topology.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#a855f7" stroke-width="1.2" />
  <text x="210" y="36" fill="#d8b4fe" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">טופולוגיית Profibus DP (סגול) ו-Profibus PA (כחול לאזור נפיץ)</text>

  <!-- DP Master -->
  <g transform="translate(40, 70)">
    <rect x="0" y="0" width="130" height="85" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    <text x="65" y="28" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Profibus DP Master</text>
    <text x="65" y="48" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">בקר PLC (כתובת 1 או 2)</text>
    <!-- Terminator ON label -->
    <rect x="15" y="58" width="100" height="20" rx="3" fill="#059669" />
    <text x="65" y="72" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">Terminator: ON (קצה קו)</text>
  </g>

  <!-- Purple Profibus DP Cable -->
  <path d="M 170,112 L 230,112 L 230,195 L 430,195" fill="none" stroke="#9333ea" stroke-width="7" />
  <text x="220" y="98" fill="#c084fc" font-family="Arial, sans-serif" font-size="10" font-weight="bold">כבל סגול RS-485 (עד 12Mbps)</text>

  <!-- DP Slave 1: Variable Frequency Drive (VFD) -->
  <g transform="translate(250, 70)">
    <rect x="0" y="0" width="120" height="85" rx="6" fill="#1e293b" stroke="#c084fc" stroke-width="1.8" />
    <text x="60" y="28" fill="#e9d5ff" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">וסת מהירות VFD</text>
    <text x="60" y="48" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">כתובת: 3</text>
    <rect x="10" y="58" width="100" height="20" rx="3" fill="#dc2626" />
    <text x="60" y="72" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">Terminator: OFF</text>
  </g>
  <line x1="310" y1="155" x2="310" y2="195" stroke="#9333ea" stroke-width="5" />

  <!-- DP/PA Coupler / Link -->
  <g transform="translate(430, 150)">
    <rect x="0" y="0" width="120" height="90" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
    <text x="60" y="25" fill="#60a5fa" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">DP/PA Link Coupler</text>
    <text x="60" y="45" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">המרת פרוטוקול והספק</text>
    <text x="60" y="60" fill="#93c5fd" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">31.25 kbit/s MBP</text>
    <rect x="10" y="67" width="100" height="18" rx="3" fill="#059669" />
    <text x="60" y="80" fill="#ffffff" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle">DP Term: ON (סיום DP)</text>
  </g>

  <!-- Blue Profibus PA Cable (Hazardous Area) -->
  <path d="M 550,195 L 670,195" fill="none" stroke="#2563eb" stroke-width="6" />
  <text x="610" y="185" fill="#60a5fa" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">כבל כחול PA</text>

  <!-- PA Transmitter 1 & 2 -->
  <g transform="translate(590, 70)">
    <rect x="0" y="0" width="130" height="85" rx="6" fill="#1e293b" stroke="#2563eb" stroke-width="1.8" />
    <text x="65" y="25" fill="#93c5fd" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">משדר לחץ PA (Ex ia)</text>
    <text x="65" y="45" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">כתובת: 12</text>
    <text x="65" y="65" fill="#facc15" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">מתח ומידע על אותו זוג גידים</text>
  </g>
  <line x1="655" y1="155" x2="655" y2="195" stroke="#2563eb" stroke-width="4" />

  <!-- Bottom Explanatory Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#d8b4fe" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">חוקי טרמינציה בפרופיבס:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">נגדי תיאום (220Ω) חייבים להיות מופעלים (ON) רק בשני הקצוות הפיזיים של הסגמנט. הפעלת טרמינטור באמצע הקו תנתק את כל הרכיבים הבאים!</text>
</svg>'''

# 5. Profinet MRP Ring & L2 Managed Switches
svgs['diag_profinet_mrp_ring.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.2" />
  <text x="210" y="36" fill="#34d399" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">טופולוגיית טבעת יתירה Profinet MRP (זמן התאוששות &lt;200ms)</text>

  <!-- Circular Ring Layout -->
  <g transform="translate(180, 75)">
    <!-- Main MRP Ring Path (Green Industrial Ethernet) -->
    <rect x="40" y="30" width="320" height="190" rx="20" fill="none" stroke="#10b981" stroke-width="6" />

    <!-- Ring Manager MRM (Top Center) -->
    <g transform="translate(140, 0)">
      <rect x="0" y="0" width="120" height="65" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
      <text x="60" y="22" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">PLC (MRM)</text>
      <text x="60" y="40" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Media Redundancy Manager</text>
      <rect x="20" y="47" width="80" height="14" rx="2" fill="#059669" />
      <text x="60" y="58" fill="#ffffff" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle">Blocked Port: חוסם לולאה</text>
    </g>

    <!-- Client 1 MRC (Right) -->
    <g transform="translate(300, 95)">
      <rect x="0" y="0" width="115" height="60" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2" />
      <text x="57" y="22" fill="#34d399" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ET200SP / I/O</text>
      <text x="57" y="42" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Ring Client (MRC)</text>
    </g>

    <!-- Client 2 MRC (Bottom Center) -->
    <g transform="translate(140, 190)">
      <rect x="0" y="0" width="120" height="60" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2" />
      <text x="60" y="22" fill="#34d399" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">מתג L2 Managed</text>
      <text x="60" y="42" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Ring Client (MRC)</text>
    </g>

    <!-- Client 3 MRC (Left) -->
    <g transform="translate(-15, 95)">
      <rect x="0" y="0" width="115" height="60" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2" />
      <text x="57" y="22" fill="#34d399" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">וסת מהירות VFD</text>
      <text x="57" y="42" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">Ring Client (MRC)</text>
    </g>

    <!-- Cable Cut Indicator -->
    <g transform="translate(355, 170)">
      <circle cx="5" cy="5" r="14" fill="#dc2626" />
      <text x="5" y="10" fill="#ffffff" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">✕</text>
      <text x="40" y="10" fill="#f87171" font-family="Arial, sans-serif" font-size="10" font-weight="bold">נתק בכבל!</text>
    </g>
  </g>

  <!-- Left Side Features Info -->
  <g transform="translate(35, 80)">
    <rect x="0" y="0" width="135" height="230" rx="6" fill="#1e293b" stroke="#334155" />
    <text x="67" y="22" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">תכונות מתג L2</text>
    <line x1="10" y1="30" x2="125" y2="30" stroke="#334155" />
    <text x="12" y="48" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• Port Mirroring ל-Wireshark</text>
    <text x="12" y="70" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• VLAN (802.1Q)</text>
    <text x="12" y="92" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• QoS לתעבורת RT</text>
    <text x="12" y="114" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• IGMP Snooping</text>
    <text x="12" y="136" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• כבלי Cat5e תעשייתיים</text>
    <text x="12" y="158" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• מחברי M12 D-coded</text>
    <text x="12" y="180" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• בדיקת CRC Errors</text>
    <text x="12" y="202" fill="#34d399" font-family="Arial, sans-serif" font-size="9" font-weight="bold">• התאוששות &lt;200ms</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#34d399" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">כיצד עובד מנגנון MRP ב-Profinet?</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">מנהל הטבעת (MRM) חוסם פורט אחד בשגרה כדי למנוע Broadcast Storm. בעת ניתוק כבל בכל נקודה בטבעת, ה-MRM מזהה זאת תוך מילישניות ופותח את הפורט החסום.</text>
</svg>'''

# 6. RADWIN Wireless Antennas & Alignment
svgs['diag_radwin_wireless_ptp.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#0284c7" stroke-width="1.2" />
  <text x="210" y="36" fill="#38bdf8" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">תקשורת אלחוטית RADWIN: עקרון Point-to-Point, כיוונון ו-RSSI</text>

  <!-- Left Mast (Site A) -->
  <g transform="translate(70, 75)">
    <!-- Tower / Mast -->
    <line x1="20" y1="210" x2="20" y2="40" stroke="#64748b" stroke-width="4" />
    <line x1="5" y1="210" x2="35" y2="210" stroke="#64748b" stroke-width="4" />
    <polygon points="10,210 20,40 30,210" fill="none" stroke="#475569" stroke-width="1.5" />
    <!-- RADWIN Antenna ODU -->
    <rect x="18" y="35" width="22" height="36" rx="4" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <text x="29" y="30" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">יחידת ODU A</text>
    <text x="29" y="85" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">אתר שאיבה / מאגר</text>
  </g>

  <!-- Right Mast (Site B) -->
  <g transform="translate(630, 75)">
    <!-- Tower -->
    <line x1="20" y1="210" x2="20" y2="40" stroke="#64748b" stroke-width="4" />
    <polygon points="10,210 20,40 30,210" fill="none" stroke="#475569" stroke-width="1.5" />
    <!-- RADWIN Antenna ODU -->
    <rect x="0" y="35" width="22" height="36" rx="4" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <text x="11" y="30" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">יחידת ODU B</text>
    <text x="11" y="85" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">חדר בקרה ראשי</text>
  </g>

  <!-- Line of Sight (LOS) and Fresnel Zone -->
  <g transform="translate(112, 75)">
    <!-- Direct Line of Sight -->
    <line x1="0" y1="53" x2="520" y2="53" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,3" />
    <!-- Fresnel Ellipse (Zone 1) -->
    <ellipse cx="260" cy="53" rx="250" ry="42" fill="rgba(56, 189, 248, 0.08)" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="6,4" />
    <text x="260" y="35" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">רדיוס פרנל (Fresnel Zone) - חייב להיות נקי ממכשולים (עצים, מבנים)</text>

    <!-- Ground Profile -->
    <path d="M -20,210 Q 150,195 260,180 Q 380,205 540,210" fill="none" stroke="#475569" stroke-width="2" />
  </g>

  <!-- Center RSSI Signal Gauge -->
  <g transform="translate(250, 185)">
    <rect x="0" y="0" width="260" height="95" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <text x="130" y="22" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">מד עוצמת אות RSSI (כיוונון אנטנות)</text>
    
    <!-- Signal Bars -->
    <rect x="30" y="38" width="200" height="18" rx="4" fill="#0f172a" />
    <rect x="30" y="38" width="160" height="18" rx="4" fill="#10b981" />
    <text x="130" y="52" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">-54 dBm (מצוין!)</text>

    <text x="130" y="75" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">תחום תדרים: 5GHz (MIMO 2x2 קיטוב כפול H+V)</text>
    <text x="130" y="88" fill="#94a3b8" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">קליטה גבולית: מתחת ל- -82 dBm | יחס אות לרעש SNR &gt; 25dB</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">עקרונות כיוונון (Alignment) אנטנות RADWIN:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">מכוונים עזרי אזימוט (אופקי) והגבהה (אנכי) לקבלת עוצמת RSSI מיטבית (ערך dBm קרוב יותר ל-0). חובה לוודא קו ראייה נקי (Line of Sight) ורדיוס פרנל פנוי.</text>
</svg>'''

# 7. Chemical Metals Compatibility Matrix
svgs['diag_chemical_metals_compatibility.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.2" />
  <text x="210" y="36" fill="#fbbf24" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">טבלת עמידות מתכות מכשור לכימיקלים קשים (כלור, ברום, סודה)</text>

  <!-- Chemical Matrix Table -->
  <g transform="translate(35, 65)">
    <!-- Header Row -->
    <rect x="0" y="0" width="690" height="32" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2" />
    <text x="70" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">סוג החומר / תהליך</text>
    <text x="210" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">נירוסטה 316L</text>
    <text x="340" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">הסטלוי C-276</text>
    <text x="470" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">טיטניום (Titanium)</text>
    <text x="600" y="21" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">טנטלום (Tantalum) / ציפוי</text>

    <!-- Row 1: כלור יבש (Dry Chlorine) -->
    <rect x="0" y="36" width="690" height="36" rx="3" fill="#1e293b" />
    <text x="70" y="58" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">כלור יבש (Dry Cl₂)</text>
    <text x="210" y="58" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ תקין (טמפ' חדר)</text>
    <text x="340" y="58" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ מצוין</text>
    <text x="470" y="58" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✗ אסור! שריפה ספונטנית!</text>
    <text x="600" y="58" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">✓ עמיד מאוד</text>

    <!-- Row 2: כלור רטוב / לח (Wet Chlorine) -->
    <rect x="0" y="76" width="690" height="36" rx="3" fill="#0f172a" />
    <text x="70" y="98" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">כלור רטוב (Wet Cl₂)</text>
    <text x="210" y="98" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✗ קורוזיה מהירה</text>
    <text x="340" y="98" fill="#eab308" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">○ בינוני (מוגבל)</text>
    <text x="470" y="98" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ מצוין (יוצר שכבת פסיבציה)</text>
    <text x="600" y="98" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ עמידות מושלמת</text>

    <!-- Row 3: ברום (Bromine Br₂) -->
    <rect x="0" y="116" width="690" height="36" rx="3" fill="#1e293b" />
    <text x="70" y="138" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">ברום (Bromine Br₂)</text>
    <text x="210" y="138" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✗ נהרס מיד</text>
    <text x="340" y="138" fill="#eab308" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">○ יבש בלבד / מוגבל</text>
    <text x="470" y="138" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✗ תקיפה חריפה</text>
    <text x="600" y="138" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ טנטלום / PTFE / PVDF</text>

    <!-- Row 4: סודה קאוסטית (NaOH Caustic Soda) -->
    <rect x="0" y="156" width="690" height="36" rx="3" fill="#0f172a" />
    <text x="70" y="178" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">סודה קאוסטית (NaOH)</text>
    <text x="210" y="178" fill="#eab308" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">○ שבירות קאוסטית מעל 60°C</text>
    <text x="340" y="178" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">✓ עמיד עד ריכוזים גבוהים</text>
    <text x="470" y="178" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">✗ פגיע בריכוז גבוה</text>
    <text x="600" y="178" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ ניקל 200 / Monel 400</text>

    <!-- Row 5: מגנזיום וכלורידים -->
    <rect x="0" y="196" width="690" height="36" rx="3" fill="#1e293b" />
    <text x="70" y="218" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">מגנזיום כלוריד (MgCl₂)</text>
    <text x="210" y="218" fill="#ef4444" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">✗ Stress Corrosion Cracking</text>
    <text x="340" y="218" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ Hastelloy עמיד מאוד</text>
    <text x="470" y="218" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">✓ תקין</text>
    <text x="600" y="218" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">✓ עמידות מלאה</text>
  </g>

  <!-- Bottom Warning Box -->
  <rect x="25" y="320" width="710" height="60" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1.2" />
  <text x="720" y="342" fill="#ef4444" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">אזהרת בטיחות חמורה במכשור:</text>
  <text x="720" y="362" fill="#f87171" font-family="Arial, sans-serif" font-size="10" text-anchor="end">אסור להשתמש בדיאפרגמות או צנרת טיטניום עם כלור יבש (פחות מ-0.5% לחות) עקב סכנת התלקחות אלימה! עבור ברום חובה להשתמש בדיאפרגמת טנטלום או ציפוי PTFE/PVDF.</text>
</svg>'''

# 8. Schneider PLC I/O Cards & Wiring
svgs['diag_schneider_plc_cards_wiring.svg'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" width="100%" height="100%">
  <rect width="760" height="400" rx="12" fill="#0f172a" />
  <rect x="1" y="1" width="758" height="398" rx="11" fill="none" stroke="#334155" stroke-width="1.5" />

  <rect x="25" y="15" width="370" height="32" rx="6" fill="#1e293b" stroke="#16a34a" stroke-width="1.2" />
  <text x="210" y="36" fill="#4ade80" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">בקרי שניידר (M340 / M580): תצורת כרטיסי I/O וחיווט</text>

  <!-- Panel 1: BMXAMI0810 (AI 4-20mA 2-wire vs 4-wire) -->
  <g transform="translate(35, 65)">
    <rect x="0" y="0" width="220" height="240" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <text x="110" y="24" fill="#38bdf8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">כרטיס מבוא אנלוגי BMXAMI0810</text>
    <line x1="10" y1="34" x2="210" y2="34" stroke="#334155" />

    <!-- 2-wire Loop Powered Transmitter -->
    <rect x="15" y="45" width="190" height="85" rx="5" fill="#0f172a" stroke="#0ea5e9" />
    <text x="110" y="63" fill="#7dd3fc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">משדר 2 חוטים (Loop Powered)</text>
    <text x="25" y="85" fill="#f8fafc" font-family="Arial, sans-serif" font-size="9">+24V DC מוזן מהבקר/ספק</text>
    <text x="25" y="103" fill="#f8fafc" font-family="Arial, sans-serif" font-size="9">אות 4-20mA חוזר לכניסת CH+</text>
    <text x="25" y="121" fill="#facc15" font-family="Arial, sans-serif" font-size="9">נגד פנימי 250Ω מובנה בכרטיס</text>

    <!-- 4-wire Active Transmitter -->
    <rect x="15" y="140" width="190" height="85" rx="5" fill="#0f172a" stroke="#6366f1" />
    <text x="110" y="158" fill="#a5b4fc" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">משדר 4 חוטים (Active 4-Wire)</text>
    <text x="25" y="178" fill="#f8fafc" font-family="Arial, sans-serif" font-size="9">הזנה 230VAC / 24VDC נפרדת</text>
    <text x="25" y="196" fill="#f8fafc" font-family="Arial, sans-serif" font-size="9">מוציא זרם אקטיבי מוגבר</text>
    <text x="25" y="214" fill="#ef4444" font-family="Arial, sans-serif" font-size="9">אסור להזין מתח במקביל!</text>
  </g>

  <!-- Panel 2: BMXART0814 (RTD / TC) -->
  <g transform="translate(270, 65)">
    <rect x="0" y="0" width="215" height="240" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" />
    <text x="107" y="24" fill="#fbbf24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">כרטיס טמפרטורה BMXART0814</text>
    <line x1="10" y1="34" x2="205" y2="34" stroke="#334155" />

    <text x="15" y="55" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold">• תמיכה ב-Pt100, Pt1000 וטרמוקפלים</text>
    <text x="15" y="75" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• חיווט 3 חוטים: חוט 1 ו-2 לזרם עירור,</text>
    <text x="25" y="92" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">חוט 3 לפיצוי התנגדות כבל המדידה</text>

    <!-- 4 Wire connection -->
    <rect x="15" y="105" width="185" height="55" rx="4" fill="#0f172a" stroke="#d97706" />
    <text x="107" y="123" fill="#fcd34d" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">חיווט 4 חוטים של Pt100</text>
    <text x="107" y="145" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" text-anchor="middle">דיוק מקסימלי: ללא תלות באורך כבל</text>

    <text x="15" y="180" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10" font-weight="bold">• טרמוקפלים (Type K, J, S):</text>
    <text x="25" y="200" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">מחייב פיצוי צומת קר (CJC - Cold</text>
    <text x="25" y="218" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">Junction Compensation) פנימי/חיצוני</text>
  </g>

  <!-- Panel 3: Discrete I/O (BMXDDI / BMXDRA / BMXAMO) -->
  <g transform="translate(500, 65)">
    <rect x="0" y="0" width="225" height="240" rx="8" fill="#1e293b" stroke="#a855f7" stroke-width="1.5" />
    <text x="112" y="24" fill="#d8b4fe" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">כרטיסי ספרתי ומוצא BMX</text>
    <line x1="10" y1="34" x2="215" y2="34" stroke="#334155" />

    <text x="12" y="55" fill="#38bdf8" font-family="Arial, sans-serif" font-size="10" font-weight="bold">BMXDDI1602 (DI 24V DC):</text>
    <text x="12" y="73" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• מבוא ספרתי Sink (משותף חיובי)</text>
    <text x="12" y="90" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• או Source (משותף שלילי 0V)</text>

    <text x="12" y="118" fill="#f59e0b" font-family="Arial, sans-serif" font-size="10" font-weight="bold">BMXDRA1605 (DO ממסרים):</text>
    <text x="12" y="136" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• מגעים יבשים מבודדים (Relay)</text>
    <text x="12" y="153" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• מיתוג 24VDC או 230VAC עד 2A</text>

    <text x="12" y="180" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold">BMXAMO0410 (AO מוצא אנלוגי):</text>
    <text x="12" y="198" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• פיקוד 4-20mA לפוזישיונר שסתום</text>
    <text x="12" y="215" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="9">• עומס מרבי נתמך: עד 600 אוהם</text>
  </g>

  <!-- Bottom Strip -->
  <rect x="25" y="325" width="710" height="55" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="720" y="347" fill="#4ade80" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="end">דגש חשוב בבקרי שניידר:</text>
  <text x="720" y="367" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="end">בחיבור משדר 2-חוטים לכרטיס BMXAMI, מתח ה-24VDC מוזן דרך הכרטיס. אם מחברים בטעות משדר 4-חוטים פעיל (Active) לכניסה המוזנת, נוצר קצר שעלול לשרוף את ערוץ הכרטיס!</text>
</svg>'''

# Write each SVG
for name, content in svgs.items():
    path = os.path.join(OUTPUT_DIR, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())
    print(f"Created SVG: {name} ({len(content)} bytes)")

print(f"Successfully generated {len(svgs)} diagrams in batch 1.")
