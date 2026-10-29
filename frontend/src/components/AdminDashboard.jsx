import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  FileSpreadsheet, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Download, 
  Plus, 
  TrendingUp, 
  Award, 
  Filter,
  Eye,
  FileDown,
  RefreshCw,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Maximize2,
  X,
  Calendar,
  CalendarClock,
  CalendarDays,
  CalendarCheck,
  AlertTriangle,
  Clock,
  Zap,
  Edit3,
  Archive,
  Copy,
  KeyRound,
  ShieldCheck,
  Power
} from 'lucide-react';
import ImageModal from './ImageModal';
import SavedExamModal from './SavedExamModal';
import EditEmployeeModal from './EditEmployeeModal';
import { getAuthHeaders, downloadAuthenticatedBlob, openAuthenticatedBlobInNewTab } from '../utils/authClient';

const DEFAULT_DEPARTMENTS = [
  'מכשיריית חומר גלם',
  "מכשיריית אשלג ב'",
  'מכשיריית ברום / כלור',
  'מכשיריית גלעון',
  'מכשיריית מלחים',
  'מכשיריית מקלף',
  'מכשיריית תחנת כוח',
  'הנדסת מכשור',
  'מסגריית מכשור',
  'הנהלת מכשור ובקרה'
];

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('results'); // results, questions, employees
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [selectedSavedExam, setSelectedSavedExam] = useState(null);

  const authFetch = async (url, options = {}) => {
    const headers = getAuthHeaders(user, options.headers || {});
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      showToast('פג תוקף ההתחברות או שההרשאה אינה תקפה', 'error');
      if (onLogout) onLogout();
    }
    return res;
  };

  // Question level filter state (all, 1, 2, 3)
  const [questionLevelFilter, setQuestionLevelFilter] = useState('all');

  // New question form state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newLevel, setNewLevel] = useState(2);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');

  // Image upload & auto-adjustment state
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // New & edit employee form state
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpUsername, setNewEmpUsername] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('מכשיריית חומר גלם');
  const [newEmpRole, setNewEmpRole] = useState('מכשירן חומר גלם');
  const [newEmpLevel, setNewEmpLevel] = useState(2);
  const [newEmpIsAdmin, setNewEmpIsAdmin] = useState(false);
  const [copiedEmpId, setCopiedEmpId] = useState(null);

  // Employee level update and filter state
  const [updatingEmpId, setUpdatingEmpId] = useState(null);
  const [togglingActiveId, setTogglingActiveId] = useState(null);
  const [recentlyUpdatedEmpId, setRecentlyUpdatedEmpId] = useState(null);
  const [empSearchTerm, setEmpSearchTerm] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('all');
  const [empLevelFilter, setEmpLevelFilter] = useState('all');

  // Schedule & 4-Month Periodic Exam Tracking State
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('all'); // all, overdue, due_soon, valid, never
  const [scheduleDeptFilter, setScheduleDeptFilter] = useState('all');
  const [schedulingEmp, setSchedulingEmp] = useState(null);
  const [scheduleTargetDate, setScheduleTargetDate] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [scheduleSuccessId, setScheduleSuccessId] = useState(null);

  // In-App Confirm Dialog & Toast Notification State (Prevents browser dialog blocking)
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const showToast = (text, type = 'success') => {
    setToastNotification({ text, type });
    setTimeout(() => {
      setToastNotification(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const handleRestoreZip = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setConfirmDialog({
      title: 'שחזור מערכת מקובץ גיבוי ZIP',
      message: `האם אתה בטוח שברצונך לשחזר את נתוני המערכת מתוך הקובץ "${file.name}"?`,
      details: `שם קובץ: ${file.name} • גודל: ${(file.size / 1024).toFixed(1)} KB`,
      warningNote: 'פעולה זו תעדכן את רשימות העובדים, בנק השאלות, הציונים וקובצי ה-PDF במערכת.',
      confirmText: 'שחזר נתונים כעת',
      confirmVariant: 'warning',
      onConfirm: async () => {
        setIsRestoring(true);
        const formData = new FormData();
        formData.append('backupZip', file);

        try {
          const res = await authFetch('/api/admin/restore-zip', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'שגיאה בשחזור הגיבוי');
          }

          showToast(data.message || 'השחזור הושלם בהצלחה!', 'success');
          await fetchDashboardData();
        } catch (err) {
          showToast(err.message || 'שגיאה בביצוע השחזור', 'error');
        } finally {
          setIsRestoring(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resResults, resQuestions, resEmployees] = await Promise.all([
        authFetch('/api/admin/results').then(r => r.json()),
        authFetch('/api/admin/questions').then(r => r.json()),
        authFetch('/api/admin/employees').then(r => r.json())
      ]);

      if (resResults.success) setResults(resResults.results);
      if (resQuestions.success) setQuestions(resQuestions.questions);
      if (resEmployees.success) setEmployees(resEmployees.employees);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticatedDownload = async (url, fallbackFilename) => {
    try {
      await downloadAuthenticatedBlob(url, fallbackFilename, user);
    } catch (err) {
      showToast(err.message || 'שגיאה בהורדת הקובץ', 'error');
    }
  };

  const handleOpenAuthenticatedPdf = async (resultId) => {
    try {
      await openAuthenticatedBlobInNewTab(`/api/results/${resultId}/pdf`, user);
    } catch (err) {
      showToast(err.message || 'שגיאה בפתיחת קובץ ה-PDF', 'error');
    }
  };

  const handleExportCsv = () => {
    handleAuthenticatedDownload('/api/admin/export-csv', 'mivhanan_results.csv');
  };

  // Smart client-side Image Auto-Resize & Format Optimization
  const handleImageProcess = (file) => {
    if (!file) return;

    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isSvg) {
      showToast('נא לבחור קובץ תמונה תקין (JPG, PNG, WebP, SVG)', 'warning');
      return;
    }

    setIsOptimizing(true);

    if (isSvg) {
      // SVGs are vector: keep original SVG perfectly
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImageFile(file);
        setImagePreview(event.target.result);
        setImageInfo({
          name: file.name,
          originalSize: `${(file.size / 1024).toFixed(1)} KB`,
          newSize: `${(file.size / 1024).toFixed(1)} KB`,
          dimensions: 'וקטורי (SVG)',
          format: 'SVG וקטורי חד ברזולוציה אינסופית',
          wasResized: false
        });
        setIsOptimizing(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    // For Raster Images (PNG, JPG, WebP, GIF, etc.):
    // Automatically resize down to max 1200x800 and convert to high-performance WebP
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const origWidth = img.width;
        const origHeight = img.height;
        const origSizeKb = (file.size / 1024).toFixed(1);

        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let targetWidth = origWidth;
        let targetHeight = origHeight;

        if (targetWidth > MAX_WIDTH || targetHeight > MAX_HEIGHT) {
          if (targetWidth / MAX_WIDTH > targetHeight / MAX_HEIGHT) {
            targetHeight = Math.round((targetHeight * MAX_WIDTH) / targetWidth);
            targetWidth = MAX_WIDTH;
          } else {
            targetWidth = Math.round((targetWidth * MAX_HEIGHT) / targetHeight);
            targetHeight = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Export as WebP
        const optimizedDataUrl = canvas.toDataURL('image/webp', 0.90);

        canvas.toBlob((blob) => {
          if (!blob) {
            setSelectedImageFile(file);
            setImagePreview(event.target.result);
            setIsOptimizing(false);
            return;
          }

          const cleanBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const optimizedFile = new File([blob], `${cleanBaseName}.webp`, {
            type: 'image/webp'
          });

          const newSizeKb = (blob.size / 1024).toFixed(1);
          setSelectedImageFile(optimizedFile);
          setImagePreview(optimizedDataUrl);
          setImageInfo({
            name: file.name,
            originalSize: `${origSizeKb} KB (${origWidth}x${origHeight}px)`,
            newSize: `${newSizeKb} KB (${targetWidth}x${targetHeight}px)`,
            format: 'פורמט WebP מותאם אוטומטית',
            wasResized: origWidth !== targetWidth || origHeight !== targetHeight
          });
          setIsOptimizing(false);
        }, 'image/webp', 0.90);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setImageInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteQuestion = (id, questionText) => {
    const preview = questionText ? (questionText.length > 55 ? questionText.slice(0, 55) + '...' : questionText) : id;
    setConfirmDialog({
      title: 'מחיקת שאלה מבנק השאלות',
      message: 'האם אתה בטוח שברצונך למחוק שאלה זו לצמיתות?',
      details: `"${preview}" (מזהה שאלה: ${id})`,
      warningNote: 'השאלה תוסר לצמיתות ולא תופיע במבחנים עתידיים.',
      confirmText: 'מחק שאלה לצמיתות',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          const res = await authFetch(`/api/admin/questions/${id}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (data.success) {
            setQuestions(prev => prev.filter(q => q.id !== id));
            showToast('השאלה נמחקה בהצלחה מבנק השאלות', 'success');
          } else {
            showToast(data.message || 'שגיאה במחיקת השאלה', 'error');
          }
        } catch (err) {
          showToast('שגיאת תקשורת במחיקת השאלה', 'error');
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionText || newOptions.some(o => !o.trim())) {
      showToast('נא למלא את כל 4 המסיחים וגוף השאלה', 'warning');
      return;
    }

    setIsUploadingImage(true);
    let finalImageUrl = '/images/questions/q1_orifice_dp.svg';

    try {
      // If user attached an image, upload it first to the server
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append('image', selectedImageFile);

        const uploadRes = await authFetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          finalImageUrl = uploadData.imageUrl;
        } else {
          throw new Error(uploadData.message || 'שגיאה בהעלאת התמונה');
        }
      }

      // Create Question with optimized image and level
      const res = await authFetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: newTopic || 'מכשור ובקרה',
          level: parseInt(newLevel) || 2,
          question: newQuestionText,
          options: newOptions,
          correctAnswer: parseInt(newCorrectAnswer),
          explanation: newExplanation,
          image: finalImageUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowAddQuestionModal(false);
        setNewTopic('');
        setNewLevel(2);
        setNewQuestionText('');
        setNewOptions(['', '', '', '']);
        setNewExplanation('');
        handleClearImage();
        showToast('השאלה נוספה בהצלחה לבנק השאלות', 'success');
        fetchDashboardData();
      } else {
        showToast(data.message || 'שגיאה בשמירת שאלה חדשה', 'error');
      }
    } catch (err) {
      showToast(err.message || 'שגיאה בשמירת שאלה חדשה', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpName.trim()) {
      showToast('נא למלא שם עובד', 'warning');
      return;
    }

    try {
      const res = await authFetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEmpName.trim(),
          username: (newEmpUsername.trim() || newEmpName.trim()),
          password: newEmpPassword.trim() || undefined,
          department: newEmpDept,
          role: newEmpRole.trim() || 'מכשירן',
          level: parseInt(newEmpLevel, 10) || 2,
          isAdmin: newEmpIsAdmin
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddEmpModal(false);
        setNewEmpName('');
        setNewEmpUsername('');
        setNewEmpPassword('');
        setNewEmpDept('מכשיריית חומר גלם');
        setNewEmpRole('מכשירן חומר גלם');
        setNewEmpLevel(2);
        setNewEmpIsAdmin(false);
        showToast(`העובד "${data.employee?.name || newEmpName}" נוסף בהצלחה`, 'success');
        fetchDashboardData();
      } else {
        showToast(data.message || 'שגיאה בשמירת עובד', 'error');
      }
    } catch (err) {
      showToast('שגיאה בהוספת עובד', 'error');
    }
  };

  const handleSaveEmployeeEdit = async (empId, payload) => {
    try {
      const res = await authFetch(`/api/admin/employees/${empId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.employee) {
        setEmployees(prev => prev.map(emp => (emp.id === empId ? { ...emp, ...data.employee } : emp)));
        setEditingEmployee(null);
        showToast('פרטי העובד עודכנו בהצלחה', 'success');
      } else {
        showToast(data.message || 'שגיאה בעדכון פרטי העובד', 'error');
      }
    } catch (err) {
      showToast('שגיאת תקשורת בעדכון פרטי העובד', 'error');
    }
  };

  const copyPasswordToClipboard = (empId, password) => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiedEmpId(empId);
    setTimeout(() => setCopiedEmpId(null), 2000);
  };

  const generateRandomPassword = () => {
    const prefixes = ['Miv', 'Sec', 'Aut', 'Pro', 'Con', 'Saf', 'Tek', 'Ctl'];
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const symbols = '!@#$%&*';
    const randValues = new Uint32Array(7);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(randValues);
    } else {
      for (let i = 0; i < randValues.length; i++) {
        randValues[i] = Math.floor(Math.random() * 0xffffffff);
      }
    }
    const prefix = prefixes[randValues[0] % prefixes.length];
    const sym1 = symbols[randValues[1] % symbols.length];
    const sym2 = symbols[randValues[2] % symbols.length];
    let randomPart = '';
    for (let i = 3; i < 7; i++) {
      randomPart += charset[randValues[i] % charset.length];
    }
    return `${prefix}${sym1}${randomPart}${sym2}`;
  };

  const handleUpdateEmployeeLevel = async (empId, newLevel) => {
    setUpdatingEmpId(empId);
    try {
      const res = await authFetch(`/api/admin/employees/${empId}/level`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: newLevel })
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(prev => prev.map(emp => 
          emp.id === empId ? { ...emp, level: newLevel } : emp
        ));
        setRecentlyUpdatedEmpId(empId);
        setTimeout(() => {
          setRecentlyUpdatedEmpId(null);
        }, 2500);

        // Sync sessionStorage if current user is this employee
        try {
          const currentUser = JSON.parse(sessionStorage.getItem('mivhanan_user') || '{}');
          if (currentUser && String(currentUser.id) === String(empId)) {
            currentUser.level = newLevel;
            sessionStorage.setItem('mivhanan_user', JSON.stringify(currentUser));
          }
        } catch (e) {
          // ignore
        }
      } else {
        showToast(data.message || 'שגיאה בעדכון רמת העובד', 'error');
      }
    } catch (err) {
      showToast('שגיאת תקשורת בעדכון רמת העובד', 'error');
    } finally {
      setUpdatingEmpId(null);
    }
  };

  const handleToggleEmployeeActive = async (emp) => {
    const cleanId = String(emp.id || '').trim().toLowerCase();
    if (emp.isAdmin || cleanId === 'admin' || cleanId === '9999') {
      showToast('משתמשי Admin דלוקים תמיד ולא ניתן לכבותם', 'warning');
      return;
    }

    const nextActive = !(emp.isActive !== false);
    setTogglingActiveId(emp.id);
    try {
      const res = await authFetch(`/api/admin/employees/${emp.id}/active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive })
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(prev =>
          prev.map(item => (item.id === emp.id ? { ...item, isActive: nextActive } : item))
        );
        showToast(
          nextActive
            ? `המשתמש "${emp.name}" הופעל (דלוק) וכעת מורשה להיכנס למערכת`
            : `המשתמש "${emp.name}" כובה וכעת אינו יכול להיכנס למערכת`,
          nextActive ? 'success' : 'warning'
        );
      } else {
        showToast(data.message || 'שגיאה בעדכון סטטוס המשתמש', 'error');
      }
    } catch (err) {
      showToast('שגיאת תקשורת בעדכון סטטוס המשתמש', 'error');
    } finally {
      setTogglingActiveId(null);
    }
  };

  const handleDeleteResult = (resultId, employeeName, submittedAt, score = null) => {
    const dateFormatted = submittedAt ? new Date(submittedAt).toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';

    setConfirmDialog({
      title: 'מחיקת רשומת מבחן מיומן הציונים',
      message: `האם אתה בטוח שברצונך למחוק לצמיתות את רשומת המבחן של ${employeeName}?`,
      details: `תאריך ביצוע: ${dateFormatted}${score !== null && score !== undefined ? ` • ציון: ${score}%` : ''} • מזהה רשומה: ${resultId}`,
      warningNote: 'פעולה זו תמחק את הרשומה לצמיתות מיומן הציונים ותעדכן את הסטטוס בהתאם.',
      confirmText: 'מחק רשומה לצמיתות',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          const res = await authFetch(`/api/admin/results/${resultId}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (data.success) {
            setResults(prev => prev.filter(r => String(r.id).trim() !== String(resultId).trim()));
            showToast(`רשומת המבחן של ${employeeName} נמחקה בהצלחה`, 'success');
          } else {
            showToast(data.message || 'שגיאה במחיקת רשומת המבחן', 'error');
          }
        } catch (err) {
          showToast('שגיאת תקשורת במחיקת רשומת המבחן', 'error');
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleDeleteEmployee = (empId, empName, role, department) => {
    if (String(empId).trim() === '9999') {
      showToast('לא ניתן למחוק את מנהל המערכת הראשי (Admin)', 'warning');
      return;
    }

    setConfirmDialog({
      title: 'הסרת עובד מהמערכת',
      message: `האם אתה בטוח שברצונך להסיר את העובד "${empName}" מהמערכת?`,
      details: `מספר אישי: ${empId}${role ? ` • תפקיד: ${role}` : ''}${department ? ` • מחלקה: ${department}` : ''}`,
      warningNote: 'פעולה זו תמחק את העובד מרשימת העובדים ותמנע ממנו כניסה עתידית למבחנים.',
      confirmText: 'הסר עובד לצמיתות',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          const res = await authFetch(`/api/admin/employees/${empId}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (data.success) {
            setEmployees(prev => prev.filter(e => String(e.id).trim() !== String(empId).trim()));
            showToast(`העובד "${empName}" הוסר בהצלחה מהמערכת`, 'success');
          } else {
            showToast(data.message || 'שגיאה בהסרת העובד מהמערכת', 'error');
          }
        } catch (err) {
          showToast('שגיאת תקשורת בהסרת העובד', 'error');
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  // Latest result map for fast lookup
  const latestResultByEmp = React.useMemo(() => {
    const map = new Map();
    results.forEach(r => {
      const cleanId = String(r.employeeId).trim();
      const existing = map.get(cleanId);
      if (!existing || new Date(r.submittedAt) > new Date(existing.submittedAt)) {
        map.set(cleanId, r);
      }
    });
    return map;
  }, [results]);

  // Enhanced employees list with 4-month exam tracking calculations
  const employeeScheduleData = React.useMemo(() => {
    const now = new Date();
    return employees.map(emp => {
      const cleanId = String(emp.id).trim();
      const lastResult = latestResultByEmp.get(cleanId) || null;
      const lastExamDate = lastResult?.submittedAt ? new Date(lastResult.submittedAt) : null;

      // Default target date is 4 months from last exam date
      let targetDate = null;
      let isCustomTarget = false;

      if (emp.nextExamDate) {
        targetDate = new Date(emp.nextExamDate);
        isCustomTarget = true;
      } else if (lastExamDate) {
        targetDate = new Date(lastExamDate);
        targetDate.setMonth(targetDate.getMonth() + 4);
      }

      let diffDays = null;
      let statusKey = 'never'; // 'never', 'overdue', 'due_soon', 'valid'
      let statusLabel = 'טרם נבחן';
      let statusClass = 'status-never';

      if (!lastExamDate && !emp.nextExamDate) {
        statusKey = 'never';
        statusLabel = 'טרם ביצע מבחן';
        statusClass = 'status-never';
      } else if (targetDate) {
        const diffTime = targetDate.getTime() - now.getTime();
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          statusKey = 'overdue';
          statusLabel = `באיחור של ${Math.abs(diffDays)} ימים`;
          statusClass = 'status-overdue';
        } else if (diffDays <= 30) {
          statusKey = 'due_soon';
          statusLabel = diffDays === 0 ? 'היום!' : `נותרו ${diffDays} ימים`;
          statusClass = 'status-due-soon';
        } else {
          statusKey = 'valid';
          statusLabel = `בתוקף (עוד ${diffDays} ימים)`;
          statusClass = 'status-valid';
        }
      }

      return {
        ...emp,
        lastResult,
        lastExamDate,
        targetDate,
        isCustomTarget,
        diffDays,
        statusKey,
        statusLabel,
        statusClass
      };
    });
  }, [employees, latestResultByEmp]);

  // Schedule KPIs
  const scheduleKpi = React.useMemo(() => {
    const total = employeeScheduleData.length;
    const overdueCount = employeeScheduleData.filter(e => e.statusKey === 'overdue').length;
    const dueSoonCount = employeeScheduleData.filter(e => e.statusKey === 'due_soon').length;
    const validCount = employeeScheduleData.filter(e => e.statusKey === 'valid').length;
    const neverCount = employeeScheduleData.filter(e => e.statusKey === 'never').length;
    const complianceRate = total > 0 ? Math.round((validCount / total) * 100) : 0;

    return { total, overdueCount, dueSoonCount, validCount, neverCount, complianceRate };
  }, [employeeScheduleData]);

  // Filtered Schedule List
  const filteredScheduleList = React.useMemo(() => {
    return employeeScheduleData.filter(emp => {
      const term = scheduleSearchTerm.trim().toLowerCase();
      const matchesSearch = !term ||
        emp.name?.toLowerCase().includes(term) ||
        String(emp.id).includes(term) ||
        emp.department?.toLowerCase().includes(term) ||
        emp.role?.toLowerCase().includes(term) ||
        emp.scheduleNotes?.toLowerCase().includes(term);

      const matchesDept = scheduleDeptFilter === 'all' || emp.department === scheduleDeptFilter;

      let matchesStatus = true;
      if (scheduleStatusFilter === 'overdue') matchesStatus = emp.statusKey === 'overdue';
      else if (scheduleStatusFilter === 'due_soon') matchesStatus = emp.statusKey === 'due_soon';
      else if (scheduleStatusFilter === 'valid') matchesStatus = emp.statusKey === 'valid';
      else if (scheduleStatusFilter === 'never') matchesStatus = emp.statusKey === 'never';

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employeeScheduleData, scheduleSearchTerm, scheduleDeptFilter, scheduleStatusFilter]);

  // Scheduling Handlers
  const handleOpenScheduleModal = (emp) => {
    setSchedulingEmp(emp);
    let defaultDate = '';
    if (emp.nextExamDate) {
      defaultDate = emp.nextExamDate;
    } else if (emp.targetDate) {
      defaultDate = emp.targetDate.toISOString().split('T')[0];
    } else {
      const d = new Date();
      d.setMonth(d.getMonth() + 4);
      defaultDate = d.toISOString().split('T')[0];
    }
    setScheduleTargetDate(defaultDate);
    setScheduleNotes(emp.scheduleNotes || '');
  };

  const applyPreset = (months, days = 0) => {
    const d = new Date();
    if (months > 0) d.setMonth(d.getMonth() + months);
    if (days > 0) d.setDate(d.getDate() + days);
    setScheduleTargetDate(d.toISOString().split('T')[0]);
  };

  const handleSaveSchedule = async (e) => {
    e?.preventDefault();
    if (!schedulingEmp) return;
    setIsSavingSchedule(true);

    try {
      const res = await authFetch(`/api/admin/employees/${schedulingEmp.id}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextExamDate: scheduleTargetDate || null,
          scheduleNotes: scheduleNotes || ''
        })
      });

      const data = await res.json();
      if (data.success) {
        setEmployees(prev => prev.map(emp => 
          emp.id === schedulingEmp.id 
            ? { ...emp, nextExamDate: scheduleTargetDate || null, scheduleNotes }
            : emp
        ));
        setScheduleSuccessId(schedulingEmp.id);
        setTimeout(() => setScheduleSuccessId(null), 2500);
        setSchedulingEmp(null);
        showToast('מועד המבחן עודכן בהצלחה', 'success');
      } else {
        showToast(data.message || 'שגיאה בעדכון מועד המבחן', 'error');
      }
    } catch (err) {
      showToast('שגיאת תקשורת בעדכון המועד', 'error');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleClearCustomSchedule = () => {
    if (!schedulingEmp) return;
    setConfirmDialog({
      title: 'איפוס מועד מבחן מותאם',
      message: `האם לאפס את המועד המותאם לעובד "${schedulingEmp.name}"?`,
      details: 'המערכת תחזור לחישוב מועד אוטומטי של 4 חודשים מהמבחן האחרון.',
      confirmText: 'אפס מועד',
      confirmVariant: 'warning',
      onConfirm: async () => {
        setIsSavingSchedule(true);
        try {
          const res = await authFetch(`/api/admin/employees/${schedulingEmp.id}/schedule`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nextExamDate: null,
              scheduleNotes: ''
            })
          });
          const data = await res.json();
          if (data.success) {
            setEmployees(prev => prev.map(emp => 
              emp.id === schedulingEmp.id 
                ? { ...emp, nextExamDate: null, scheduleNotes: '' }
                : emp
            ));
            setSchedulingEmp(null);
            showToast('המועד המותאם אופס בהצלחה', 'success');
          } else {
            showToast(data.message || 'שגיאה באיפוס המועד', 'error');
          }
        } catch (err) {
          showToast('שגיאת תקשורת באיפוס המועד', 'error');
        } finally {
          setIsSavingSchedule(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleBatchAutoSchedule = () => {
    setConfirmDialog({
      title: 'תזמון אוטומטי מרוכז (מחזור 4 חודשים)',
      message: 'האם לבצע תזמון אוטומטי לכל העובדים שטרם נקבע להם מועד או שנמצאים באיחור?',
      details: 'המערכת תקבע יעד של 4 חודשים מהמבחן האחרון (או שבועיים מהיום למי שפג תוקפו או טרם נבחן).',
      confirmText: 'בצע תזמון מרוכז',
      confirmVariant: 'primary',
      onConfirm: async () => {
        setIsAutoScheduling(true);
        try {
          const res = await authFetch('/api/admin/employees/auto-schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          const data = await res.json();
          if (data.success && data.employees) {
            setEmployees(data.employees);
            showToast(data.message || 'התזמון האוטומטי הושלם בהצלחה!', 'success');
          } else {
            showToast(data.message || 'שגיאה בביצוע תזמון אוטומטי', 'error');
          }
        } catch (err) {
          showToast('שגיאת תקשורת בתזמון אוטומטי', 'error');
        } finally {
          setIsAutoScheduling(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleExportScheduleCsv = () => {
    handleAuthenticatedDownload('/api/admin/export-schedules-csv', 'mivhanan_schedules_4m.csv');
  };

  // KPIs
  const totalSubmissions = results.length;
  const passedCount = results.filter(r => r.status === 'passed' || r.score >= 70).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;
  const avgScore = totalSubmissions > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.score || 0), 0) / totalSubmissions) 
    : 0;

  // Filtered results
  const filteredResults = results.filter(r => {
    const matchesSearch = 
      r.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeId?.includes(searchTerm) ||
      r.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'passed') return matchesSearch && (r.status === 'passed' || r.score >= 70);
    if (statusFilter === 'failed') return matchesSearch && (r.status === 'failed' || r.score < 70);
    return matchesSearch;
  });

  return (
    <div className="admin-container fade-in" id="admin-dashboard">
      {/* Top Banner */}
      <div className="admin-header glass-card">
        <div className="admin-title-wrap">
          <div className="admin-icon-box">
            <FileSpreadsheet size={24} className="text-cyan" />
          </div>
          <div>
            <h1 className="admin-title">לוח ניהול מערכת ובקרה (Admin)</h1>
            <p className="admin-subtitle">מעקב אחר תוצאות מבחנים תקופתיים, ניהול בנק שאלות ורשימת עובדים</p>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={() => handleAuthenticatedDownload('/api/admin/backup-zip', 'mivhanan_full_backup.zip')}
            className="btn btn-secondary"
            title="הורדת קובץ גיבוי ZIP מלא של כל המערכת (כולל JSON וכל קובצי ה-PDF)"
          >
            <Archive size={16} className="text-amber" />
            <span>גיבוי מלא (ZIP)</span>
          </button>

          <label
            className="btn btn-secondary"
            style={{ cursor: isRestoring ? 'wait' : 'pointer' }}
            title="העלאת קובץ גיבוי ZIP ושחזור כל הנתונים וקובצי ה-PDF"
          >
            <UploadCloud size={16} className="text-cyan" />
            <span>{isRestoring ? 'משחזר נתונים...' : 'שחזור מ-ZIP'}</span>
            <input
              type="file"
              accept=".zip"
              style={{ display: 'none' }}
              disabled={isRestoring}
              onChange={handleRestoreZip}
            />
          </label>

          <button 
            type="button" 
            id="btn-export-excel"
            className="btn btn-primary"
            onClick={handleExportCsv}
            title="הורדת כל הציונים לקובץ Excel מסודר עם תמיכה מלאה בעברית"
          >
            <Download size={16} />
            <span>ייצוא לאקסל (Excel CSV)</span>
          </button>

          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={fetchDashboardData}
            title="רענן נתונים"
          >
            <RefreshCw size={16} />
            <span>רענן</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-icon-box cyan">
            <TrendingUp size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">סה"כ מבחנים שהוגשו</div>
            <div className="kpi-val" id="kpi-total-tests">{totalSubmissions}</div>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon-box emerald">
            <Award size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">אחוז מעבר כללי</div>
            <div className="kpi-val" id="kpi-pass-rate">{passRate}%</div>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon-box amber">
            <Award size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">ציון ממוצע</div>
            <div className="kpi-val" id="kpi-avg-score">{avgScore}</div>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon-box indigo">
            <HelpCircle size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">שאלות בבנק המבחנים</div>
            <div className="kpi-val" id="kpi-questions-count">{questions.length}</div>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon-box blue">
            <Users size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">עובדים רשומים</div>
            <div className="kpi-val" id="kpi-employees-count">{employees.length}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs-bar">
        <button 
          className={`admin-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <FileSpreadsheet size={16} />
          <span>יומן ציוני עובדים ({results.length})</span>
        </button>

        <button 
          id="tab-btn-schedule"
          className={`admin-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <CalendarClock size={16} />
          <span>מעקב ותזמון מבחנים (4 חודשים)</span>
          {scheduleKpi.overdueCount > 0 && (
            <span className="tab-pill-badge badge-overdue">{scheduleKpi.overdueCount} באיחור</span>
          )}
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          <HelpCircle size={16} />
          <span>בנק שאלות מכשור ובקרה ({questions.length})</span>
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <Users size={16} />
          <span>רשימת עובדים לאימות ({employees.length})</span>
        </button>
      </div>

      {/* Tab 1: Exam Results Table */}
      {activeTab === 'results' && (
        <div className="admin-tab-content glass-card fade-in">
          <div className="table-filter-bar">
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="חיפוש לפי שם עובד, מספר אישי או מחלקה..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="status-filter-group">
              <Filter size={16} className="text-secondary" />
              <button 
                className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                הכל
              </button>
              <button 
                className={`filter-pill ${statusFilter === 'passed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('passed')}
              >
                עברו בלבד
              </button>
              <button 
                className={`filter-pill ${statusFilter === 'failed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('failed')}
              >
                נכשלו
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-data-table" id="table-exam-results">
              <thead>
                <tr>
                  <th>תאריך ושעה</th>
                  <th>שם העובד</th>
                  <th>מספר אישי</th>
                  <th>מחלקה</th>
                  <th>ציון</th>
                  <th>תשובות נכונות</th>
                  <th>סטטוס</th>
                  <th>משך בחינה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-table-cell">
                      לא נמצאו רשומות תואמות
                    </td>
                  </tr>
                ) : (
                  filteredResults.map(r => {
                    const passed = r.status === 'passed' || r.score >= 70;
                    const dateFormatted = new Date(r.submittedAt).toLocaleString('he-IL', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    const durationMins = r.timeSpentSeconds ? `${Math.floor(r.timeSpentSeconds / 60)} דק'` : '—';

                    return (
                      <tr key={r.id} className="result-data-row">
                        <td className="text-muted">{dateFormatted}</td>
                        <td 
                          className="font-bold cell-clickable" 
                          onClick={() => setSelectedSavedExam(r)}
                          title="לחץ לצפייה במבחן השמור"
                        >
                          <span className="employee-name-link">{r.employeeName}</span>
                        </td>
                        <td className="font-mono">{r.employeeId}</td>
                        <td>{r.department}</td>
                        <td>
                          <span 
                            className={`table-score-pill ${passed ? 'score-high' : 'score-low'} score-clickable`}
                            onClick={() => setSelectedSavedExam(r)}
                            title="לחץ לצפייה בתחקיר המבחן השמור"
                          >
                            {r.score}%
                          </span>
                        </td>
                        <td>{r.correctCount} מתוך {r.totalQuestions}</td>
                        <td>
                          {passed ? (
                            <span className="table-status-tag tag-passed">
                              <CheckCircle2 size={13} />
                              <span>עבר</span>
                            </span>
                          ) : (
                            <span className="table-status-tag tag-failed">
                              <XCircle size={13} />
                              <span>נכשל</span>
                            </span>
                          )}
                        </td>
                        <td className="text-muted">{durationMins}</td>
                        <td className="table-actions-cell">
                          <div className="table-actions-group">
                            <button
                              type="button"
                              className="btn-table-view-exam"
                              onClick={() => setSelectedSavedExam(r)}
                              title="כניסה מהירה למבחן השמור ותחקיר שאלות"
                            >
                              <Eye size={13} />
                              <span>צפה במבחן</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenAuthenticatedPdf(r.id)}
                              className="btn-table-pdf"
                              title="הורדת / פתיחת קובץ ה-PDF של המבחן"
                            >
                              <FileDown size={13} />
                              <span>PDF</span>
                            </button>

                            <button
                              type="button"
                              className="btn-table-delete"
                              onClick={() => handleDeleteResult(r.id, r.employeeName, r.submittedAt, r.score)}
                              title="מחק רשומת מבחן זו מהיומן"
                            >
                              <Trash2 size={13} />
                              <span>מחק</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: 4-Month Periodic Exam Tracking & Scheduling */}
      {activeTab === 'schedule' && (() => {
        const allDepartments = Array.from(new Set([...DEFAULT_DEPARTMENTS, ...employees.map(e => e.department).filter(Boolean)]));

        return (
          <div className="admin-tab-content glass-card fade-in" id="admin-schedule-content">
            {/* Top Toolbar */}
            <div className="tab-actions-header">
              <div>
                <h3>מעקב תאימות ותזמון מבחנים תקופתיים (מחזור 4 חודשים)</h3>
                <p className="tab-subtitle">
                  כל עובד נדרש לבצע מבחן תקופתי כל 4 חודשים. המערכת מחשבת מועדי יעד ומציגה התראות על פיגור בזמן אמת.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  id="btn-batch-auto-schedule"
                  className="btn btn-secondary btn-sm"
                  onClick={handleBatchAutoSchedule}
                  disabled={isAutoScheduling}
                  title="חישוב וקביעת מועד יעד של 4 חודשים לכל העובדים שטרם נקבע להם מועד או שנמצאים באיחור"
                >
                  <Zap size={15} className="text-amber" />
                  <span>{isAutoScheduling ? 'מתזמן עובדים...' : 'תזמון אוטומטי למאחרים'}</span>
                </button>

                <button
                  type="button"
                  id="btn-export-schedule-csv"
                  className="btn btn-primary btn-sm"
                  onClick={handleExportScheduleCsv}
                  title="הורדת דוח מעקב 4 חודשים מלא לאקסל (CSV עם עברית תקינה)"
                >
                  <Download size={15} />
                  <span>ייצוא דוח מעקב (Excel)</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Row for 4-Month Tracking */}
            <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="kpi-card glass-card">
                <div className="kpi-icon-box emerald">
                  <CheckCircle2 size={22} />
                </div>
                <div className="kpi-content" style={{ flex: 1 }}>
                  <div className="kpi-label">עמידה ביעד 4 חודשים</div>
                  <div className="kpi-val" style={{ color: '#059669' }}>
                    {scheduleKpi.complianceRate}%
                  </div>
                  <div className="compliance-progress-box">
                    <div className="compliance-progress-fill" style={{ width: `${scheduleKpi.complianceRate}%` }} />
                  </div>
                </div>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-icon-box emerald">
                  <CalendarCheck size={22} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-label">הסמכה בתוקף</div>
                  <div className="kpi-val text-emerald">{scheduleKpi.validCount}</div>
                </div>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-icon-box amber">
                  <Clock size={22} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-label">נדרשים לתאם בקרוב (30 יום)</div>
                  <div className="kpi-val text-amber">{scheduleKpi.dueSoonCount}</div>
                </div>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-icon-box rose">
                  <AlertTriangle size={22} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-label">באיחור / פג תוקף</div>
                  <div className="kpi-val text-rose">{scheduleKpi.overdueCount}</div>
                </div>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-icon-box slate">
                  <HelpCircle size={22} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-label">טרם נבחנו במערכת</div>
                  <div className="kpi-val text-muted">{scheduleKpi.neverCount}</div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="table-filter-bar">
              <div className="search-input-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="חיפוש לפי שם עובד, מספר אישי, תפקיד או הערות מועד..."
                  value={scheduleSearchTerm}
                  onChange={(e) => setScheduleSearchTerm(e.target.value)}
                />
              </div>

              <div className="emp-filters-group">
                <select
                  className="emp-dept-select"
                  value={scheduleDeptFilter}
                  onChange={(e) => setScheduleDeptFilter(e.target.value)}
                  title="סינון לפי מחלקה / מכשיריה"
                >
                  <option value="all">כל המכשיריות ({employees.length})</option>
                  {allDepartments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept} ({employees.filter(e => e.department === dept).length})
                    </option>
                  ))}
                </select>

                <div className="filter-chips">
                  <button 
                    type="button" 
                    className={`chip-btn ${scheduleStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setScheduleStatusFilter('all')}
                  >
                    הכל ({employeeScheduleData.length})
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${scheduleStatusFilter === 'overdue' ? 'active' : ''}`}
                    onClick={() => setScheduleStatusFilter('overdue')}
                    style={scheduleKpi.overdueCount > 0 ? { color: '#be123c', fontWeight: 800 } : {}}
                  >
                    באיחור ({scheduleKpi.overdueCount})
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${scheduleStatusFilter === 'due_soon' ? 'active' : ''}`}
                    onClick={() => setScheduleStatusFilter('due_soon')}
                    style={scheduleKpi.dueSoonCount > 0 ? { color: '#b45309', fontWeight: 800 } : {}}
                  >
                    בקרוב ({scheduleKpi.dueSoonCount})
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${scheduleStatusFilter === 'valid' ? 'active' : ''}`}
                    onClick={() => setScheduleStatusFilter('valid')}
                  >
                    בתוקף ({scheduleKpi.validCount})
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${scheduleStatusFilter === 'never' ? 'active' : ''}`}
                    onClick={() => setScheduleStatusFilter('never')}
                  >
                    טרם נבחנו ({scheduleKpi.neverCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Table per Employee */}
            <div className="table-responsive">
              <table className="admin-data-table" id="table-exam-schedules">
                <thead>
                  <tr>
                    <th>מספר אישי</th>
                    <th>שם העובד</th>
                    <th>מחלקה / מכשיריה</th>
                    <th>תפקיד</th>
                    <th>מבחן אחרון שבוצע</th>
                    <th>מועד יעד למבחן הבא (4 חודשים)</th>
                    <th>סטטוס תאימות ביצוע</th>
                    <th>הערות מועד</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScheduleList.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="empty-table-cell">
                        לא נמצאו עובדים התואמים לחיפוש ולסינון הנוכחי
                      </td>
                    </tr>
                  ) : (
                    filteredScheduleList.map(emp => {
                      const lastExamStr = emp.lastExamDate 
                        ? emp.lastExamDate.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' })
                        : null;

                      const targetDateStr = emp.targetDate
                        ? emp.targetDate.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' })
                        : 'טרם נקבע';

                      return (
                        <tr 
                          key={emp.id} 
                          id={`schedule-row-${emp.id}`}
                          className={scheduleSuccessId === emp.id ? 'row-updated-highlight' : ''}
                        >
                          <td className="font-mono font-bold text-cyan">{emp.id}</td>
                          <td className="font-bold">{emp.name}</td>
                          <td>{emp.department}</td>
                          <td>{emp.role}</td>
                          <td>
                            {emp.lastResult ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <span style={{ fontWeight: 700 }}>{lastExamStr}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <span className={`table-score-pill ${emp.lastResult.score >= 70 ? 'score-high' : 'score-low'}`} style={{ padding: '0.1rem 0.45rem', fontSize: '0.74rem' }}>
                                    {emp.lastResult.score}%
                                  </span>
                                  <span style={{ fontSize: '0.74rem', color: emp.lastResult.score >= 70 ? '#059669' : '#e11d48', fontWeight: 700 }}>
                                    {emp.lastResult.score >= 70 ? 'עבר' : 'נכשל'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted" style={{ fontStyle: 'italic', fontSize: '0.82rem' }}>
                                טרם נבחן במערכת
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="schedule-target-cell">
                              <span className="schedule-target-date">{targetDateStr}</span>
                              {emp.isCustomTarget ? (
                                <span className="schedule-target-tag custom-tag">מועד מותאם אישית</span>
                              ) : emp.targetDate ? (
                                <span className="schedule-target-tag auto-tag">4 חודשים (אוטומטי)</span>
                              ) : null}
                            </div>
                          </td>
                          <td>
                            <span className={`schedule-status-badge ${emp.statusClass}`}>
                              {emp.statusKey === 'valid' && <CheckCircle2 size={13} />}
                              {emp.statusKey === 'due_soon' && <Clock size={13} />}
                              {emp.statusKey === 'overdue' && <AlertTriangle size={13} />}
                              {emp.statusKey === 'never' && <HelpCircle size={13} />}
                              <span>{emp.statusLabel}</span>
                            </span>
                          </td>
                          <td>
                            {emp.scheduleNotes ? (
                              <span style={{ fontSize: '0.82rem', color: '#334155' }}>{emp.scheduleNotes}</span>
                            ) : (
                              <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-schedule-action"
                              onClick={() => handleOpenScheduleModal(emp)}
                              title="קביעה או שינוי מועד מבחן תקופתי לעובד זה"
                            >
                              <Calendar size={13} />
                              <span>קבע / עדכן מועד</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Tab 3: Question Bank Inspector */}
      {activeTab === 'questions' && (
        <div className="admin-tab-content glass-card fade-in">
          <div className="tab-actions-header">
            <div>
              <h3>בנק השאלות המלא במכשור ובקרה ({questions.length} שאלות)</h3>
              <p className="tab-subtitle">כל השאלות מסווגות לפי רמות 1-3 כולל תרשימים טכניים ואפשרות מחיקה</p>
            </div>
            <button 
              type="button" 
              id="btn-open-add-question-modal"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddQuestionModal(true)}
            >
              <Plus size={16} />
              <span>הוסף שאלה חדשה לבנק</span>
            </button>
          </div>

          {/* Level Filter Bar */}
          <div className="level-filter-bar">
            <span className="level-filter-label">סינון לפי רמת קושי:</span>
            <button
              type="button"
              id="filter-level-all"
              className={`level-filter-btn ${questionLevelFilter === 'all' ? 'active-all' : ''}`}
              onClick={() => setQuestionLevelFilter('all')}
            >
              <span>כל השאלות</span>
              <span className="filter-count-chip">{questions.length}</span>
            </button>
            <button
              type="button"
              id="filter-level-1"
              className={`level-filter-btn ${questionLevelFilter === '1' ? 'active-1' : ''}`}
              onClick={() => setQuestionLevelFilter('1')}
            >
              <span>רמה 1 - מתחיל</span>
              <span className="filter-count-chip">{questions.filter(q => q.level === 1).length}</span>
            </button>
            <button
              type="button"
              id="filter-level-2"
              className={`level-filter-btn ${questionLevelFilter === '2' ? 'active-2' : ''}`}
              onClick={() => setQuestionLevelFilter('2')}
            >
              <span>רמה 2 - בינוני</span>
              <span className="filter-count-chip">{questions.filter(q => q.level === 2).length}</span>
            </button>
            <button
              type="button"
              id="filter-level-3"
              className={`level-filter-btn ${questionLevelFilter === '3' ? 'active-3' : ''}`}
              onClick={() => setQuestionLevelFilter('3')}
            >
              <span>רמה 3 - מתקדם</span>
              <span className="filter-count-chip">{questions.filter(q => q.level === 3).length}</span>
            </button>
          </div>

          <div className="questions-admin-grid">
            {questions
              .filter(q => questionLevelFilter === 'all' || String(q.level) === questionLevelFilter)
              .map((q, idx) => (
              <div key={q.id} className="admin-q-card glass-card" id={`admin-q-card-${q.id}`}>
                <div className="admin-q-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <span className="q-badge">שאלה {idx + 1}</span>
                    <span className={`level-badge level-${q.level || 2}`}>
                      {q.level === 3 ? 'רמה 3 - מתקדם' : q.level === 1 ? 'רמה 1 - מתחיל' : 'רמה 2 - בינוני'}
                    </span>
                    <span className="q-topic">{q.topic}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {q.image && (
                      <button 
                        type="button"
                        className="btn-zoom-inline" 
                        onClick={() => setLightboxImage(q.image)}
                        title="צפה בתרשים במסך מלא"
                      >
                        <Eye size={13} />
                        <span>תרשים</span>
                      </button>
                    )}
                    <button
                      type="button"
                      id={`btn-delete-q-${q.id}`}
                      className="btn-delete-q"
                      onClick={() => handleDeleteQuestion(q.id, q.question)}
                      title="מחק שאלה זו מבנק השאלות"
                    >
                      <Trash2 size={13} />
                      <span>מחק</span>
                    </button>
                  </div>
                </div>

                <div className="admin-q-title">{q.question}</div>

                {q.image && (
                  <div className="admin-q-img-wrap" onClick={() => setLightboxImage(q.image)}>
                    <img src={q.image} alt={q.topic} className="admin-q-img" />
                  </div>
                )}

                <div className="admin-q-options">
                  {q.options.map((opt, i) => (
                    <div 
                      key={i} 
                      className={`admin-q-opt ${i === q.correctAnswer ? 'opt-correct-marker' : ''}`}
                    >
                      <strong>{['א', 'ב', 'ג', 'ד'][i]}.</strong> {opt}
                      {i === q.correctAnswer && <span className="correct-tag">נכונה</span>}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="admin-q-explanation">
                    <strong>הסבר טכני:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Employees Management */}
      {activeTab === 'employees' && (() => {
        const allDepartments = Array.from(new Set([...DEFAULT_DEPARTMENTS, ...employees.map(e => e.department).filter(Boolean)]));
        const filteredEmployees = employees.filter(emp => {
          const term = empSearchTerm.trim().toLowerCase();
          const matchesSearch = !term || 
            emp.name.toLowerCase().includes(term) ||
            String(emp.id).includes(term) ||
            (emp.role && emp.role.toLowerCase().includes(term)) ||
            (emp.department && emp.department.toLowerCase().includes(term));
          const matchesDept = empDeptFilter === 'all' || emp.department === empDeptFilter;
          const matchesLevel = empLevelFilter === 'all' || String(emp.level || 1) === empLevelFilter;
          return matchesSearch && matchesDept && matchesLevel;
        });

        return (
          <div className="admin-tab-content glass-card fade-in">
            <div className="tab-actions-header">
              <div>
                <h3>רשימת עובדים מורשים לכניסה למבחן ({employees.length} עובדים)</h3>
                <p className="tab-subtitle">ניהול הרשאות, רמת מבחן וסיסמאות אישיות מאובטחות (תואם תקני הגנת המידע והפרטיות)</p>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={() => handleAuthenticatedDownload('/api/admin/export-credentials-csv', 'mivhanan_credentials.csv')}
                  className="btn btn-secondary btn-sm"
                  title="הורדת קובץ אקסל עם שמות המשתמש והסיסמאות של כל העובדים לצורך חלוקה"
                >
                  <KeyRound size={15} />
                  <span>ייצוא רשימת סיסמאות (Excel)</span>
                </button>
                <button 
                  type="button" 
                  id="btn-open-add-emp-modal"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAddEmpModal(true)}
                >
                  <Plus size={16} />
                  <span>הוסף עובד חדש לרשימה</span>
                </button>
              </div>
            </div>

            {/* Filter toolbar for employees */}
            <div className="emp-toolbar">
              <div className="search-box" style={{ maxWidth: '320px', minWidth: '220px' }}>
                <Search className="search-icon" size={17} />
                <input
                  type="text"
                  id="input-search-employees"
                  className="search-input"
                  placeholder="חיפוש לפי שם, מזהה, תפקיד..."
                  value={empSearchTerm}
                  onChange={(e) => setEmpSearchTerm(e.target.value)}
                />
              </div>

              <div className="emp-filters-group">
                <select
                  id="select-dept-filter"
                  className="emp-dept-select"
                  value={empDeptFilter}
                  onChange={(e) => setEmpDeptFilter(e.target.value)}
                  title="סנן לפי מכשיריה"
                >
                  <option value="all">כל המכשיריות ({employees.length})</option>
                  {allDepartments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept} ({employees.filter(e => e.department === dept).length})
                    </option>
                  ))}
                </select>

                <div className="filter-chips">
                  <button 
                    type="button" 
                    className={`chip-btn ${empLevelFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setEmpLevelFilter('all')}
                  >
                    הכל
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn chip-level-1 ${empLevelFilter === '1' ? 'active' : ''}`}
                    onClick={() => setEmpLevelFilter('1')}
                  >
                    רמה 1 ({employees.filter(e => (e.level || 1) === 1).length})
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn chip-level-2 ${empLevelFilter === '2' ? 'active' : ''}`}
                    onClick={() => setEmpLevelFilter('2')}
                  >
                    רמה 2 ({employees.filter(e => (e.level || 1) === 2).length})
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn chip-level-3 ${empLevelFilter === '3' ? 'active' : ''}`}
                    onClick={() => setEmpLevelFilter('3')}
                  >
                    רמה 3 ({employees.filter(e => (e.level || 1) === 3).length})
                  </button>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>מזהה פנימי</th>
                    <th>שם העובד</th>
                    <th>שם משתמש</th>
                    <th>סיסמה</th>
                    <th>מחלקה / מכשיריה</th>
                    <th>תפקיד</th>
                    <th>שינוי רמת מבחן (1-3)</th>
                    <th>הרשאות מנהל</th>
                    <th>פעולות</th>
                    <th>כניסת משתמש</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => {
                    const isSystemAdmin = Boolean(emp.isAdmin || String(emp.id).trim().toLowerCase() === 'admin' || String(emp.id).trim() === '9999');
                    const isEmpActive = isSystemAdmin || emp.isActive !== false;
                    return (
                    <tr key={emp.id} id={`emp-row-${emp.id}`} className={!isEmpActive ? 'emp-row-inactive' : ''}>
                      <td className="font-mono font-bold text-cyan">{emp.id}</td>
                      <td className="font-bold">{emp.name}</td>
                      <td>
                        <span className="badge-dept-pill" style={{ fontSize: '0.82rem', padding: '0.2rem 0.55rem' }}>
                          {emp.username || emp.name}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <code className="font-mono" style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 7px', borderRadius: '4px', fontSize: '0.84rem' }}>
                            {emp.password || '—'}
                          </code>
                          {emp.password && (
                            <button
                              type="button"
                              onClick={() => copyPasswordToClipboard(emp.id, emp.password)}
                              title="העתק סיסמה ללוח"
                              style={{ 
                                padding: '3px 5px', 
                                cursor: 'pointer', 
                                background: copiedEmpId === emp.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '4px',
                                color: copiedEmpId === emp.id ? '#10b981' : '#94a3b8',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.74rem'
                              }}
                            >
                              {copiedEmpId === emp.id ? (
                                <>
                                  <CheckCircle2 size={13} />
                                  <span>הועתק!</span>
                                </>
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>{emp.department}</td>
                      <td>{emp.role}</td>
                      <td>
                        <div className="emp-level-change-box">
                          <select
                            id={`select-level-emp-${emp.id}`}
                            className={`emp-level-select level-select-${emp.level || 2}`}
                            value={emp.level || 2}
                            onChange={(e) => handleUpdateEmployeeLevel(emp.id, parseInt(e.target.value, 10))}
                            disabled={updatingEmpId === emp.id}
                            title="בחר רמת מבחן עבור עובד זה - השינוי נשמר מיידית"
                          >
                            <option value={1}>רמה 1 - מתחיל</option>
                            <option value={2}>רמה 2 - בינוני</option>
                            <option value={3}>רמה 3 - מתקדם</option>
                          </select>

                          {updatingEmpId === emp.id && (
                            <span className="spinner-mini" style={{ width: 14, height: 14 }} />
                          )}

                          {recentlyUpdatedEmpId === emp.id && (
                            <span className="level-update-success fade-in">
                              <CheckCircle2 size={13} />
                              <span>עודכן!</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {emp.isAdmin ? (
                          <span className="table-status-tag tag-passed">Admin</span>
                        ) : (
                          <span className="text-muted">עובד רגיל</span>
                        )}
                      </td>
                      <td className="table-actions-cell">
                        <div className="table-actions-group">
                          <button
                            type="button"
                            className="btn-table-view-exam"
                            onClick={() => setEditingEmployee(emp)}
                            title={`עריכת פרטים או סיסמה עבור ${emp.name}`}
                          >
                            <Edit3 size={13} />
                            <span>ערוך</span>
                          </button>
                          {isSystemAdmin ? (
                            <span className="text-muted" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                              מוגן (Admin)
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-table-delete"
                              onClick={() => handleDeleteEmployee(emp.id, emp.name, emp.role, emp.department)}
                              title={`הסר את ${emp.name} מרשימת העובדים`}
                            >
                              <Trash2 size={13} />
                              <span>הסר</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="emp-power-cell">
                        <button
                          type="button"
                          id={`btn-toggle-active-${emp.id}`}
                          className={`btn-emp-power ${isEmpActive ? 'power-on' : 'power-off'}`}
                          onClick={() => handleToggleEmployeeActive(emp)}
                          disabled={togglingActiveId === emp.id || isSystemAdmin}
                          title={
                            isSystemAdmin
                              ? 'משתמש Admin דלוק תמיד'
                              : isEmpActive
                                ? `המשתמש ${emp.name} דלוק (מורשה להיכנס) — לחץ לכיבוי`
                                : `המשתמש ${emp.name} כבוי (חסום מכניסה) — לחץ להדלקה`
                          }
                        >
                          <span className="power-switch-track">
                            <span className="power-switch-thumb" />
                          </span>
                          <Power size={13} />
                          <span>{isEmpActive ? 'דלוק' : 'כבוי'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                  })}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        לא נמצאו עובדים התואמים לחיפוש ולסינון הנוכחי
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Lightbox Modal */}
      <ImageModal
        isOpen={Boolean(lightboxImage)}
        imageSrc={lightboxImage}
        title="תרשים מכשור ובקרה"
        onClose={() => setLightboxImage(null)}
      />

      {/* Edit Employee Modal (CR-11) */}
      <EditEmployeeModal
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSave={handleSaveEmployeeEdit}
        generateRandomPassword={generateRandomPassword}
      />

      {/* Add Question Modal */}
      {showAddQuestionModal && createPortal(
        <div className="modal-backdrop fade-in" id="modal-add-question-backdrop" onClick={() => setShowAddQuestionModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">הוספת שאלה אמריקאית חדשה לבנק</h3>
              <button 
                type="button" 
                className="btn-close-modal" 
                id="btn-close-add-question-modal"
                onClick={() => setShowAddQuestionModal(false)}
                title="סגור חלון"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddQuestion} className="modal-form">
              <div className="form-group">
                <label className="form-label">נושא השאלה (Topic)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="לדוגמה: שסתומי בקרה / מדידת לחץ"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                />
              </div>

              {/* Level Selector */}
              <div className="form-group">
                <label className="form-label">רמת קושי של השאלה</label>
                <div className="level-select-group">
                  <label className={`level-radio-pill ${newLevel === 1 ? 'active-level-1' : ''}`}>
                    <input 
                      type="radio" 
                      name="qLevelChoice" 
                      value={1} 
                      checked={newLevel === 1} 
                      onChange={() => setNewLevel(1)} 
                    />
                    <span>רמה 1 - מתחיל</span>
                  </label>
                  <label className={`level-radio-pill ${newLevel === 2 ? 'active-level-2' : ''}`}>
                    <input 
                      type="radio" 
                      name="qLevelChoice" 
                      value={2} 
                      checked={newLevel === 2} 
                      onChange={() => setNewLevel(2)} 
                    />
                    <span>רמה 2 - בינוני</span>
                  </label>
                  <label className={`level-radio-pill ${newLevel === 3 ? 'active-level-3' : ''}`}>
                    <input 
                      type="radio" 
                      name="qLevelChoice" 
                      value={3} 
                      checked={newLevel === 3} 
                      onChange={() => setNewLevel(3)} 
                    />
                    <span>רמה 3 - מתקדם</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ניסוח השאלה</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  placeholder="הזן את שאלת המבחן..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  required
                />
              </div>

              {/* Image Upload & Auto-fit Component */}
              <div className="form-group image-upload-group">
                <label className="form-label">
                  תמונה / תרשים נלווה לשאלה
                  <span className="label-subtext"> (המערכת מתאימה ומייעלת את הגודל והפורמט אוטומטית)</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,.svg"
                  onChange={(e) => handleImageProcess(e.target.files?.[0])}
                />

                {!imagePreview ? (
                  <div 
                    className={`image-upload-dropzone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleImageProcess(e.dataTransfer?.files?.[0]);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="dropzone-icon-box">
                      <UploadCloud size={28} className="text-cyan" />
                    </div>
                    <div className="dropzone-title">
                      גרור קובץ תמונה לכאן, או <span className="browse-link">לחץ לבחירה מהמחשב</span>
                    </div>
                    <div className="dropzone-hint">
                      תומך ב-JPG, PNG, WebP, SVG • המערכת מבצעת התאמת רזולוציה ודחיסה אוטומטית
                    </div>
                  </div>
                ) : (
                  <div className="image-preview-card">
                    <div 
                      className="image-preview-thumb-wrap" 
                      onClick={() => setLightboxImage(imagePreview)} 
                      title="לחץ להגדלה מלאה ב-Lightbox"
                    >
                      <img src={imagePreview} alt="תצוגה מקדימה של התרשים" className="image-preview-thumb" />
                      <div className="preview-zoom-badge">
                        <Maximize2 size={12} />
                        <span>הגדל</span>
                      </div>
                    </div>

                    <div className="image-preview-details">
                      <div className="image-preview-title">
                        <ImageIcon size={15} className="text-cyan" />
                        <span className="file-name-truncate">{imageInfo?.name}</span>
                      </div>
                      
                      {imageInfo && (
                        <div className="optimization-status-box">
                          <div className="opt-status-row">
                            <Sparkles size={13} className="text-emerald" />
                            <span className="opt-badge-text">
                              {imageInfo.format}
                            </span>
                          </div>
                          <div className="opt-metrics-row">
                            <span>גודל מותאם: <strong>{imageInfo.newSize}</strong></span>
                            {imageInfo.wasResized && (
                              <span className="opt-original-tag">(מקור: {imageInfo.originalSize})</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="image-preview-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          החלף תמונה
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-remove-img"
                          onClick={handleClearImage}
                        >
                          <Trash2 size={14} />
                          <span>הסר תמונה</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isOptimizing && (
                  <div className="optimizing-progress-bar">
                    <div className="spinner-mini" />
                    <span>מתאים גודל ומייעל תמונה...</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">4 מסיחים ותשובה נכונה</label>
                {newOptions.map((opt, i) => (
                  <div key={i} className="new-opt-row">
                    <input 
                      type="radio" 
                      name="correctChoice" 
                      checked={newCorrectAnswer === i} 
                      onChange={() => setNewCorrectAnswer(i)}
                      title="סמן כתשובה נכונה"
                    />
                    <span className="opt-label">{['א', 'ב', 'ג', 'ד'][i]}:</span>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder={`אפשרות ${['א', 'ב', 'ג', 'ד'][i]}...`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newOptions];
                        updated[i] = e.target.value;
                        setNewOptions(updated);
                      }}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">הסבר מקצועי לתחקיר בסיום הבחינה</label>
                <textarea 
                  className="form-input" 
                  rows="2"
                  placeholder="הסבר למה התשובה נכונה..."
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddQuestionModal(false)} disabled={isUploadingImage}>
                  ביטול
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUploadingImage || isOptimizing}>
                  {isUploadingImage ? 'מעלה ומייעל תמונה...' : 'שמור שאלה בבנק'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Add Employee Modal */}
      {showAddEmpModal && createPortal(
        <div className="modal-backdrop fade-in" id="modal-add-emp-backdrop" onClick={() => setShowAddEmpModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">הוספת עובד חדש לרשימת המערכת</h3>
              <button 
                type="button" 
                className="btn-close-modal" 
                id="btn-close-add-emp-modal"
                onClick={() => setShowAddEmpModal(false)}
                title="סגור חלון"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="modal-form">
              <div className="form-group">
                <label className="form-label">שם העובד (שם פרטי + אות משפחה)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="לדוגמה: ישראל י' או ברק ח'"
                  value={newEmpName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewEmpName(val);
                    if (!newEmpUsername || newEmpUsername === newEmpName) {
                      setNewEmpUsername(val);
                    }
                  }}
                  required
                />
                <small className="label-subtext">תואם תקנות הגנת המידע - ללא שם משפחה מלא וללא מספר אישי</small>
              </div>

              <div className="form-group">
                <label className="form-label">שם משתמש לכניסה</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="לדוגמה: ישראל י'"
                  value={newEmpUsername}
                  onChange={(e) => setNewEmpUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>סיסמה מאובטחת</label>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setNewEmpPassword(generateRandomPassword())}
                    style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                  >
                    <Sparkles size={12} />
                    <span>ייצר סיסמה חזקה</span>
                  </button>
                </div>
                <input 
                  type="text" 
                  className="form-input font-mono" 
                  placeholder="הזן סיסמה או לחץ 'ייצר סיסמה חזקה'..."
                  value={newEmpPassword}
                  onChange={(e) => setNewEmpPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">מחלקה / מכשיריה</label>
                <select
                  className="form-input"
                  value={newEmpDept}
                  onChange={(e) => {
                    const dept = e.target.value;
                    setNewEmpDept(dept);
                    if (dept === 'הנדסת מכשור') {
                      setNewEmpRole('הנדסת מכשור');
                    } else if (dept === 'מסגריית מכשור') {
                      setNewEmpRole('מסגר מכשור');
                    } else if (dept === 'הנהלת מכשור ובקרה') {
                      setNewEmpRole('מנהל מכשור ובקרה');
                    } else {
                      const cleanBase = dept.replace(/^מכשיריית\s*/, '');
                      setNewEmpRole(`מכשירן ${cleanBase}`);
                    }
                  }}
                >
                  <option value="מכשיריית חומר גלם">מכשיריית חומר גלם</option>
                  <option value="מכשיריית אשלג ב'">מכשיריית אשלג ב'</option>
                  <option value="מכשיריית ברום / כלור">מכשיריית ברום / כלור</option>
                  <option value="מכשיריית גלעון">מכשיריית גלעון</option>
                  <option value="מכשיריית מלחים">מכשיריית מלחים</option>
                  <option value="מכשיריית מקלף">מכשיריית מקלף</option>
                  <option value="מכשיריית תחנת כוח">מכשיריית תחנת כוח</option>
                  <option value="הנדסת מכשור">הנדסת מכשור</option>
                  <option value="מסגריית מכשור">מסגריית מכשור</option>
                  <option value="הנהלת מכשור ובקרה">הנהלת מכשור ובקרה</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">תפקיד</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  placeholder="לדוגמה: מכשירן חומר גלם / מנהל מכשיריה"
                  required
                />
              </div>

              {/* Employee Level Selection */}
              <div className="form-group">
                <label className="form-label">רמת מבחן מותאמת לעובד</label>
                <div className="level-select-group">
                  <label className={`level-radio-pill ${newEmpLevel === 1 ? 'active-level-1' : ''}`}>
                    <input 
                      type="radio" 
                      name="newEmpLevelChoice" 
                      value={1} 
                      checked={newEmpLevel === 1} 
                      onChange={() => setNewEmpLevel(1)} 
                    />
                    <span>רמה 1 - מתחיל</span>
                  </label>
                  <label className={`level-radio-pill ${newEmpLevel === 2 ? 'active-level-2' : ''}`}>
                    <input 
                      type="radio" 
                      name="newEmpLevelChoice" 
                      value={2} 
                      checked={newEmpLevel === 2} 
                      onChange={() => setNewEmpLevel(2)} 
                    />
                    <span>רמה 2 - בינוני</span>
                  </label>
                  <label className={`level-radio-pill ${newEmpLevel === 3 ? 'active-level-3' : ''}`}>
                    <input 
                      type="radio" 
                      name="newEmpLevelChoice" 
                      value={3} 
                      checked={newEmpLevel === 3} 
                      onChange={() => setNewEmpLevel(3)} 
                    />
                    <span>רמה 3 - מתקדם</span>
                  </label>
                </div>
                <small className="label-subtext" style={{ display: 'block', marginTop: '0.45rem' }}>
                  המערכת תדגום אוטומטית 20 שאלות מרמה זו כאשר העובד ייכנס למבחן
                </small>
              </div>

              {/* Admin Permissions Checkbox */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem' }}>
                  <input
                    type="checkbox"
                    checked={newEmpIsAdmin}
                    onChange={(e) => setNewEmpIsAdmin(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)' }}
                  />
                  <span>הענק הרשאות ניהול (Admin - כניסה ללוח הניהול ולבנק השאלות)</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEmpModal(false)}>
                  ביטול
                </button>
                <button type="submit" className="btn btn-primary">
                  שמור עובד
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Schedule Exam Modal */}
      {schedulingEmp && createPortal(
        <div className="modal-backdrop fade-in" id="modal-schedule-backdrop" onClick={() => setSchedulingEmp(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="kpi-icon-box blue" style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarClock size={20} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>קביעת מועד מבחן תקופתי</h3>
                  <small className="text-muted">מחזור 4 חודשים תקופתי במכשור ובקרה</small>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close-modal" 
                onClick={() => setSchedulingEmp(null)}
                title="סגור חלון"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="modal-form">
              {/* Employee Summary Card */}
              <div className="schedule-info-box">
                <div className="schedule-info-item">
                  <span className="schedule-info-label">שם העובד:</span>
                  <span className="schedule-info-value">{schedulingEmp.name}</span>
                </div>
                <div className="schedule-info-item">
                  <span className="schedule-info-label">מספר אישי (מ.א):</span>
                  <span className="schedule-info-value font-mono">{schedulingEmp.id}</span>
                </div>
                <div className="schedule-info-item">
                  <span className="schedule-info-label">מחלקה:</span>
                  <span className="schedule-info-value">{schedulingEmp.department}</span>
                </div>
                <div className="schedule-info-item">
                  <span className="schedule-info-label">מבחן אחרון:</span>
                  <span className="schedule-info-value">
                    {schedulingEmp.lastExamDate 
                      ? `${schedulingEmp.lastExamDate.toLocaleDateString('he-IL')} (${schedulingEmp.lastResult?.score}%)`
                      : 'טרם נבחן במערכת'}
                  </span>
                </div>
              </div>

              {/* Date Input */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>תאריך יעד לביצוע המבחן</span>
                  <span className="text-muted" style={{ fontWeight: 500, fontSize: '0.8rem' }}>
                    תקן: כל 4 חודשים
                  </span>
                </label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={scheduleTargetDate}
                  onChange={(e) => setScheduleTargetDate(e.target.value)}
                  required
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="form-group">
                <div className="preset-pills-label">
                  <Sparkles size={13} className="text-amber" />
                  <span>קיצורי דרך לקביעת מועד:</span>
                </div>
                <div className="preset-pills-grid">
                  <button 
                    type="button" 
                    className="preset-pill-btn preset-primary"
                    onClick={() => applyPreset(4)}
                    title="קבע מועד בעוד 4 חודשים בדיוק"
                  >
                    + 4 חודשים
                  </button>
                  <button 
                    type="button" 
                    className="preset-pill-btn"
                    onClick={() => applyPreset(1)}
                  >
                    + חודש אחד
                  </button>
                  <button 
                    type="button" 
                    className="preset-pill-btn"
                    onClick={() => applyPreset(0, 14)}
                  >
                    + שבועיים
                  </button>
                  <button 
                    type="button" 
                    className="preset-pill-btn"
                    onClick={() => applyPreset(0, 7)}
                  >
                    + שבוע
                  </button>
                </div>
              </div>

              {/* Notes Input */}
              <div className="form-group">
                <label className="form-label">הערות למועד (אופציונלי)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="לדוגמה: חדר הדרכה מכשיריה, משמרת בוקר, מבחן הסמכה מחדש..."
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                <div>
                  {schedulingEmp.isCustomTarget && (
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={handleClearCustomSchedule}
                      disabled={isSavingSchedule}
                      style={{ color: '#be123c' }}
                      title="איפוס התאריך המותאם וחזרה לחישוב אוטומטי של 4 חודשים"
                    >
                      אפס ל-4 חודשים אוטומטי
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setSchedulingEmp(null)}
                    disabled={isSavingSchedule}
                  >
                    ביטול
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSavingSchedule}
                  >
                    {isSavingSchedule ? 'שומר מועד...' : 'שמור מועד מבחן'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* In-App Confirmation Modal (Prevents browser dialog blocking) */}
      {confirmDialog && createPortal(
        <div 
          className="custom-confirm-overlay fade-in" 
          onClick={() => !confirmDialog.isProcessing && setConfirmDialog(null)}
        >
          <div 
            className="custom-confirm-modal glass-card" 
            onClick={e => e.stopPropagation()}
          >
            <div className={`confirm-icon-box ${confirmDialog.confirmVariant === 'danger' ? 'icon-danger' : 'icon-warning'}`}>
              {confirmDialog.confirmVariant === 'danger' ? (
                <Trash2 size={34} />
              ) : (
                <AlertTriangle size={34} />
              )}
            </div>

            <h3 className="confirm-modal-title">{confirmDialog.title}</h3>
            <p className="confirm-modal-message">{confirmDialog.message}</p>
            
            {confirmDialog.details && (
              <div className="confirm-modal-details">
                {confirmDialog.details}
              </div>
            )}

            {confirmDialog.warningNote && (
              <div className="confirm-modal-warning">
                <AlertTriangle size={16} />
                <span>{confirmDialog.warningNote}</span>
              </div>
            )}

            <div className="confirm-modal-actions">
              <button
                type="button"
                className={`btn ${confirmDialog.confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={confirmDialog.onConfirm}
                disabled={confirmDialog.isProcessing}
              >
                {confirmDialog.isProcessing ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    <span>מבצע...</span>
                  </>
                ) : (
                  <>
                    {confirmDialog.confirmVariant === 'danger' ? <Trash2 size={15} /> : <CheckCircle2 size={15} />}
                    <span>{confirmDialog.confirmText || 'אישור'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmDialog(null)}
                disabled={confirmDialog.isProcessing}
              >
                <span>ביטול</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Saved Exam Full Review & PDF Modal */}
      {selectedSavedExam && createPortal(
        <SavedExamModal
          result={selectedSavedExam}
          onClose={() => setSelectedSavedExam(null)}
        />,
        document.body
      )}

      {/* Floating Toast Notification */}
      {toastNotification && createPortal(
        <div className={`admin-floating-toast toast-${toastNotification.type} fade-in`}>
          {toastNotification.type === 'success' && <CheckCircle2 size={18} />}
          {toastNotification.type === 'error' && <XCircle size={18} />}
          {toastNotification.type === 'warning' && <AlertTriangle size={18} />}
          <span>{toastNotification.text}</span>
        </div>,
        document.body
      )}
    </div>
  );
}
