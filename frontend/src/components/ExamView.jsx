import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Flag, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  HelpCircle,
  BookmarkCheck,
  RotateCcw,
  CalendarX,
  CalendarClock,
  CalendarCheck,
  Lock,
  LogOut,
  RefreshCw,
  Clock,
  ShieldAlert,
  Info,
  GraduationCap,
  Award,
  FileText
} from 'lucide-react';
import ImageModal from './ImageModal';
import ConfirmSubmitModal from './ConfirmSubmitModal';

const OPTION_LETTERS = ['א', 'ב', 'ג', 'ד'];

export default function ExamView({ user, onExamComplete, examStartTime, onLogout, onActiveExamRunning }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: selectedOptionIndex }
  const [flagged, setFlagged] = useState({}); // { [qId]: boolean }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Practice Mode & Start Lobby State
  const [isPractice, setIsPractice] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [loadingPractice, setLoadingPractice] = useState(false);

  // Schedule Restriction & Eligibility State
  const [restriction, setRestriction] = useState(null);
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  // Modals state
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState('all'); // all, unanswered, flagged

  // Fetch randomized questions on mount
  useEffect(() => {
    fetchExamQuestions();
  }, []);

  const fetchExamQuestions = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshingStatus(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const userLevel = user?.level || 2;
      const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      const res = await fetch(`/api/exam/questions?count=20&level=${userLevel}&employeeId=${encodeURIComponent(user?.id || '')}`, {
        headers: authHeaders
      });
      
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('שגיאה בפענוח תשובת השרת');
      }

      if (!res.ok || !data.success) {
        // Schedule Restriction: No scheduled exam or too early
        if (data.canTakeExam === false || data.reason === 'NO_SCHEDULED_EXAM' || data.reason === 'TOO_EARLY') {
          setRestriction(data);
          setQuestions([]);
          setExamStarted(false);
          if (onActiveExamRunning) onActiveExamRunning(false);
          return;
        }
        throw new Error(data.message || 'שגיאה בטעינת המבחן');
      }

      // Valid & Eligible: Exam questions loaded, ready in pre-exam lobby
      setRestriction(null);
      setScheduleInfo({
        nextExamDate: data.nextExamDate,
        targetDateFormatted: data.targetDateFormatted,
        isOverdue: data.isOverdue,
        diffDays: data.diffDays
      });
      setQuestions(data.questions);
      setExamStarted(false);
      setIsPractice(false);
      if (onActiveExamRunning) onActiveExamRunning(false);

      // Check if there are saved draft answers in localStorage
      const storageKey = `mivhanan_answers_${user.id}_${data.examId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setAnswers(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved answers', e);
        }
      }
    } catch (err) {
      setError(err.message || 'שגיאה בתקשורת עם השרת');
      if (onActiveExamRunning) onActiveExamRunning(false);
    } finally {
      setLoading(false);
      setIsRefreshingStatus(false);
    }
  };

  // Start Official Scheduled Exam
  const startOfficialExam = () => {
    setIsPractice(false);
    setExamStarted(true);
    setCurrentIndex(0);
    if (onActiveExamRunning) onActiveExamRunning(true);
  };

  // Start Practice Exam (Scores are not recorded anywhere)
  const startPracticeExam = async () => {
    setLoadingPractice(true);
    setError('');
    try {
      const userLevel = user?.level || 2;
      const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      const res = await fetch(`/api/exam/questions?mode=practice&count=20&level=${userLevel}&employeeId=${encodeURIComponent(user?.id || '')}`, {
        headers: authHeaders
      });
      
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('שגיאה בפענוח תשובת השרת במצב תרגול');
      }
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'שגיאה בטעינת מצב תרגול');
      }

      setQuestions(data.questions);
      setRestriction(null);
      setIsPractice(true);
      setExamStarted(true);
      setCurrentIndex(0);
      setAnswers({});
      setFlagged({});
      if (onActiveExamRunning) onActiveExamRunning(true);
    } catch (err) {
      alert(err.message || 'שגיאה בטעינת מצב תרגול');
    } finally {
      setLoadingPractice(false);
    }
  };

  const currentQ = questions[currentIndex];

  // Save selected option
  const handleSelectOption = (optionIndex) => {
    if (!currentQ) return;
    const updated = {
      ...answers,
      [currentQ.id]: optionIndex
    };
    setAnswers(updated);

    // Save to local storage for crash/refresh resilience
    try {
      localStorage.setItem(`mivhanan_draft_${user.id}`, JSON.stringify(updated));
    } catch (e) {
      // Ignore quota errors
    }
  };

  // Toggle flag / review bookmark
  const handleToggleFlag = (qId) => {
    setFlagged(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  // Final Submit
  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {})
        },
        body: JSON.stringify({
          employeeId: user.id,
          employeeName: user.name,
          department: user.department,
          isPractice: Boolean(isPractice),
          answers,
          questionIds: questions.map(q => q.id),
          totalQuestions: questions.length,
          timeSpentSeconds: examStartTime ? Math.max(1, Math.floor((Date.now() - examStartTime) / 1000)) : 0
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'שגיאה בשליחת המבחן');
      }

      // Clear draft storage
      localStorage.removeItem(`mivhanan_draft_${user.id}`);
      setShowConfirmModal(false);
      if (onActiveExamRunning) onActiveExamRunning(false);
      onExamComplete({ ...data, isPractice });
    } catch (err) {
      alert(err.message || 'שגיאה בהגשת המבחן');
    } finally {
      setSubmitting(false);
    }
  };

  // Statistics calculation
  const totalCount = questions.length;
  const answeredCount = Object.keys(answers).filter(qId => answers[qId] !== undefined && answers[qId] !== null).length;
  const flaggedCount = Object.keys(flagged).filter(qId => flagged[qId]).length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // Unanswered question indices for warning modal
  const unansweredIndices = questions
    .map((q, idx) => (answers[q.id] === undefined || answers[q.id] === null ? idx : null))
    .filter(idx => idx !== null);

  if (loading) {
    return (
      <div className="exam-loading-screen fade-in" id="exam-loading">
        <div className="spinner-glow"></div>
        <div className="loading-text">בודק מועד מבחן מתוזמן...</div>
        <div className="loading-subtext">מאמת תוקף ודוגם שאלות רלוונטיות</div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Restriction 1: No Scheduled Exam Available
  // -------------------------------------------------------------
  if (restriction && restriction.reason === 'NO_SCHEDULED_EXAM') {
    return (
      <div className="schedule-restriction-container fade-in" id="restriction-no-schedule">
        <div className="schedule-card-wrapper glass-card">
          <div className="schedule-badge-icon badge-locked">
            <CalendarX size={48} className="icon-locked" />
          </div>

          <h1 className="schedule-title">אין עבורך מבחן מתוזמן במערכת</h1>
          <p className="schedule-subtitle">
            האפשרות לגשת למבחן חסומה כעת. על פי נהלי המפעל, ביצוע מבחן תקופתי במכשור ובקרה מתאפשר אך ורק לאחר תיאום ותזמון מועד על ידי מנהל המערכת.
          </p>

          <div className="employee-info-box">
            <div className="info-chip">
              <span className="info-label">עובד:</span>
              <span className="info-val">{user?.name}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">מספר אישי:</span>
              <span className="info-val">{user?.id}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">מחלקה:</span>
              <span className="info-val">{user?.department}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">סטטוס מועד:</span>
              <span className="info-val status-blocked-tag">לא נקבע מועד בחינה פעיל</span>
            </div>
          </div>

          <div className="schedule-notice-box notice-warning">
            <Info size={20} className="notice-icon" />
            <div className="notice-content">
              <strong>כיצד לפתוח את המבחן?</strong>
              <span>
                יש לפנות למנהל המכשירייה או למנהל ההדרכה על מנת שיתזמן עבורך מועד בחינה במערכת הניהול. לאחר התזמון, לחץ על "רענן סטטוס" כדי להיכנס למבחן.
              </span>
            </div>
          </div>

          <div className="schedule-actions-row">
            <button 
              type="button" 
              id="btn-start-practice"
              className="btn btn-primary btn-practice" 
              onClick={startPracticeExam}
              disabled={loadingPractice}
              title="כניסה למבחן במצב תרגול - לקבלת ציון ותחקיר ללא רישום ביומן"
            >
              <GraduationCap size={18} />
              <span>{loadingPractice ? 'טוען תרגול...' : 'תרגול'}</span>
            </button>

            <button 
              type="button" 
              id="btn-refresh-schedule-status"
              className="btn btn-secondary" 
              onClick={() => fetchExamQuestions(true)}
              disabled={isRefreshingStatus}
            >
              <RefreshCw size={16} className={isRefreshingStatus ? 'spin' : ''} />
              <span>{isRefreshingStatus ? 'בודק נתונים...' : 'רענן סטטוס מועד'}</span>
            </button>

            {onLogout && (
              <button 
                type="button" 
                id="btn-logout-blocked"
                className="btn btn-secondary" 
                onClick={onLogout}
              >
                <LogOut size={16} />
                <span>יציאה מהמערכת</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Restriction 2: Exam Scheduled Too Far In The Future (> 30 days)
  // -------------------------------------------------------------
  if (restriction && restriction.reason === 'TOO_EARLY') {
    return (
      <div className="schedule-restriction-container fade-in" id="restriction-too-early">
        <div className="schedule-card-wrapper glass-card">
          <div className="schedule-badge-icon badge-early">
            <CalendarClock size={48} className="icon-early" />
          </div>

          <h1 className="schedule-title">מועד המבחן טרם הגיע</h1>
          <p className="schedule-subtitle">
            עובד יקר, נקבע עבורך מועד למבחן תקופתי, אך חלון הבחינה ייפתח עד חודש (30 יום) לפני המועד המתוזמן.
          </p>

          {/* Timeline & Countdown Grid */}
          <div className="countdown-cards-grid">
            <div className="countdown-card">
              <div className="card-top-label">תאריך יעד המבחן</div>
              <div className="card-main-val highlight-target">
                {restriction.targetDateFormatted || restriction.nextExamDate}
              </div>
              <div className="card-sub-label">מועד סיום התקופה</div>
            </div>

            <div className="countdown-card active-window-card">
              <div className="card-top-label">פתיחת חלון הבחינה</div>
              <div className="card-main-val highlight-open">
                {restriction.windowOpenDateFormatted || restriction.windowOpenDate}
              </div>
              <div className="card-sub-label">חודש (30 יום) לפני המועד</div>
            </div>

            <div className="countdown-card">
              <div className="card-top-label">זמן שנותר לפתיחה</div>
              <div className="card-main-val highlight-countdown">
                {restriction.daysUntilOpen}
                <span className="unit-text"> ימים</span>
              </div>
              <div className="card-sub-label">עד לפתיחת חלון הבחינה</div>
            </div>
          </div>

          <div className="schedule-notice-box notice-info">
            <Info size={20} className="notice-icon" />
            <div className="notice-content">
              <strong>הנחיית ביצוע מבחן</strong>
              <span>
                על פי נהלי המערכת, עובד יכול לבצע את המבחן החל מ-30 יום לפני מועד היעד שנקבע.
                החל מתאריך <strong>{restriction.windowOpenDateFormatted}</strong> תיפתח עבורך האפשרות להיבחן באופן אוטומטי.
              </span>
            </div>
          </div>

          <div className="schedule-actions-row">
            <button 
              type="button" 
              id="btn-start-practice-early"
              className="btn btn-primary btn-practice" 
              onClick={startPracticeExam}
              disabled={loadingPractice}
              title="כניסה למבחן במצב תרגול - לקבלת ציון ותחקיר ללא רישום ביומן"
            >
              <GraduationCap size={18} />
              <span>{loadingPractice ? 'טוען תרגול...' : 'תרגול'}</span>
            </button>

            <button 
              type="button" 
              id="btn-refresh-schedule-early"
              className="btn btn-secondary" 
              onClick={() => fetchExamQuestions(true)}
              disabled={isRefreshingStatus}
            >
              <RefreshCw size={16} className={isRefreshingStatus ? 'spin' : ''} />
              <span>{isRefreshingStatus ? 'בודק נתונים...' : 'רענן סטטוס מועד'}</span>
            </button>

            {onLogout && (
              <button 
                type="button" 
                id="btn-logout-early"
                className="btn btn-secondary" 
                onClick={onLogout}
              >
                <LogOut size={16} />
                <span>יציאה מהמערכת</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Pre-Exam Lobby: Scheduled Exam Ready, User Chooses Start or Practice
  // -------------------------------------------------------------
  if (!examStarted && !restriction && questions.length > 0) {
    return (
      <div className="schedule-restriction-container fade-in" id="exam-welcome-lobby">
        <div className="schedule-card-wrapper glass-card">
          <div className="schedule-badge-icon badge-lobby">
            <Award size={48} className="icon-lobby" />
          </div>

          <h1 className="schedule-title">מבחן תקופתי במכשור ובקרה</h1>
          <p className="schedule-subtitle">
            שלום <strong>{user?.name}</strong>, נקבע עבורך מועד בחינה פעיל במערכת. ודא את פרטיך ובחר כיצד להמשיך:
          </p>

          <div className="employee-info-box">
            <div className="info-chip">
              <span className="info-label">עובד:</span>
              <span className="info-val">{user?.name}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">מספר אישי:</span>
              <span className="info-val">{user?.id}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">מחלקה:</span>
              <span className="info-val">{user?.department}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">רמת מבחן:</span>
              <span className="info-val">
                {user?.level === 3 ? 'רמה 3 (מתקדם)' : user?.level === 1 ? 'רמה 1 (מתחיל)' : 'רמה 2 (בינוני)'}
              </span>
            </div>
            {scheduleInfo?.targetDateFormatted && (
              <div className="info-chip">
                <span className="info-label">מועד מתוזמן:</span>
                <span className={`info-val ${scheduleInfo.isOverdue ? 'status-blocked-tag' : 'status-open-tag'}`}>
                  {scheduleInfo.isOverdue ? `באיחור (${scheduleInfo.targetDateFormatted})` : scheduleInfo.targetDateFormatted}
                </span>
              </div>
            )}
          </div>

          <div className="schedule-notice-box notice-info">
            <Info size={20} className="notice-icon" />
            <div className="notice-content">
              <strong>מבנה המבחן והנחיות</strong>
              <span>
                המבחן כולל <strong>{questions.length} שאלות רב-ברירה</strong> ותרשימים טכניים.
                ציון המעבר הינו <strong>70%</strong>. תוכל לגשת ישירות למבחן הרשמי, או לבצע תרגול מקדים ללא רישום ציון.
              </span>
            </div>
          </div>

          <div className="schedule-actions-row">
            <button 
              type="button" 
              id="btn-start-official-exam"
              className="btn btn-primary btn-start-exam" 
              onClick={startOfficialExam}
            >
              <CheckCircle2 size={18} />
              <span>התחל מבחן</span>
            </button>

            <button 
              type="button" 
              id="btn-start-practice-lobby"
              className="btn btn-secondary btn-practice" 
              onClick={startPracticeExam}
              disabled={loadingPractice}
              title="ביצוע תרגול מקדים - הציון לא נרשם במערכת"
            >
              <GraduationCap size={18} />
              <span>{loadingPractice ? 'טוען תרגול...' : 'תרגול מקדים (ללא ציון)'}</span>
            </button>

            {onLogout && (
              <button 
                type="button" 
                id="btn-logout-lobby"
                className="btn btn-secondary" 
                onClick={onLogout}
              >
                <LogOut size={16} />
                <span>יציאה מהמערכת</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error || !questions.length) {
    return (
      <div className="exam-error-screen fade-in glass-card">
        <AlertCircle size={44} className="text-rose" />
        <h2>שגיאה בטעינת המבחן</h2>
        <p>{error || 'לא נמצאו שאלות בבנק המבחנים'}</p>
        <button className="btn btn-primary" onClick={() => fetchExamQuestions()}>
          <RotateCcw size={16} />
          <span>נסה שוב</span>
        </button>
      </div>
    );
  }

  return (
    <div className="exam-view-container fade-in" id="exam-container">
      {/* Top Exam Header with Progress Bar */}
      <div className="exam-top-bar glass-card">
        <div className="progress-info-row">
          <div className="exam-meta-tags">
            <span className={`exam-level-pill level-${user?.level || 2}`}>
              רמת מבחן: {user?.level === 3 ? 'רמה 3 - מתקדם' : user?.level === 1 ? 'רמה 1 - מתחיל' : 'רמה 2 - בינוני'}
            </span>
            {isPractice ? (
              <span className="exam-tag practice-pill">
                <GraduationCap size={14} />
                <span>מצב תרגול (הציון לא נרשם)</span>
              </span>
            ) : scheduleInfo?.targetDateFormatted ? (
              <span className={`exam-tag schedule-pill ${scheduleInfo.isOverdue ? 'schedule-pill-overdue' : 'schedule-pill-valid'}`}>
                <CalendarCheck size={14} />
                <span>
                  {scheduleInfo.isOverdue
                    ? `באיחור (יעד: ${scheduleInfo.targetDateFormatted})`
                    : `מועד מתוזמן: ${scheduleInfo.targetDateFormatted}`}
                </span>
              </span>
            ) : null}
            <span className="exam-tag topic-badge">
              {currentQ.topic || 'מכשור ובקרה'}
            </span>
            <span className="exam-tag q-counter-badge" id="question-counter-badge">
              שאלה {currentIndex + 1} מתוך {totalCount}
            </span>
          </div>

          <div className="progress-stats">
            <span className="progress-text">
              הושלמו: <strong>{answeredCount}</strong> / {totalCount} ({progressPercent}%)
            </span>
            {flaggedCount > 0 && (
              <span className="flagged-count-badge">
                <Flag size={14} />
                <span>{flaggedCount} לבירור</span>
              </span>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Grid: Question Card on Left, Matrix on Right */}
      <div className="exam-content-grid">
        {/* Left Column: Question & Options */}
        <div className="question-main-column">
          <div className="question-card glass-card" id={`question-card-${currentQ.id}`}>
            {/* Question Top Header */}
            <div className="question-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div className="question-number-pill">
                  שאלה {currentIndex + 1}
                </div>
                <span className={`level-badge level-${currentQ.level || 2}`}>
                  {currentQ.level === 3 ? 'רמה 3 - מתקדם' : currentQ.level === 1 ? 'רמה 1 - מתחיל' : 'רמה 2 - בינוני'}
                </span>
                <div className="question-topic-pill">
                  {currentQ.topic}
                </div>
              </div>

              {/* Action Buttons: Flag / Review Later & Zoom */}
              <div className="question-header-actions">
                <button
                  type="button"
                  id={`btn-flag-question-${currentIndex + 1}`}
                  className={`btn-header-action ${flagged[currentQ.id] ? 'flagged-active' : ''}`}
                  onClick={() => handleToggleFlag(currentQ.id)}
                  title={flagged[currentQ.id] ? 'הסר סימון לבדיקה' : 'סמן שאלה זו לבדיקה מאוחרת'}
                >
                  <Flag size={16} className={flagged[currentQ.id] ? 'fill-amber' : ''} />
                  <span>{flagged[currentQ.id] ? 'מסומן לבדיקה' : 'סמן לבדיקה'}</span>
                </button>

                {currentQ.image && (
                  <button
                    type="button"
                    id="btn-zoom-image"
                    className="btn-header-action"
                    onClick={() => setLightboxImage(currentQ.image)}
                    title="הגדל תרשים במסך מלא"
                  >
                    <Maximize2 size={16} />
                    <span>הגדל תרשים</span>
                  </button>
                )}
              </div>
            </div>

            {/* Question Text */}
            <h2 className="question-text" id="current-question-text">
              {currentQ.question}
            </h2>

            {/* Technical Diagram Container */}
            {currentQ.image && (
              <div 
                className="technical-diagram-wrapper" 
                id="diagram-wrapper"
                onClick={() => setLightboxImage(currentQ.image)}
                title="לחץ להגדלה במסך מלא"
              >
                <img 
                  src={currentQ.image} 
                  alt={currentQ.topic || 'תרשים טכני'} 
                  className="technical-diagram-img" 
                />
                <div className="diagram-zoom-hint">
                  <Maximize2 size={14} />
                  <span>לחץ על התרשים להגדלה ב-Lightbox</span>
                </div>
              </div>
            )}

            {/* 4 Multiple Choice Options */}
            <div className="options-container" id="options-container">
              {currentQ.options.map((optText, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                return (
                  <div
                    key={optIdx}
                    id={`option-${optIdx}`}
                    className={`option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(optIdx)}
                  >
                    <div className="option-radio-indicator">
                      <div className="option-letter">{OPTION_LETTERS[optIdx]}</div>
                      <div className="option-circle">
                        {isSelected && <div className="option-circle-dot" />}
                      </div>
                    </div>
                    <div className="option-text">{optText}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation Toolbar */}
          <div className="exam-bottom-toolbar glass-card" id="exam-navigation-toolbar">
            <div className="nav-toolbar-left">
              <button
                type="button"
                id="btn-prev-question"
                className="btn btn-secondary"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <ChevronRight size={18} />
                <span>השאלה הקודמת</span>
              </button>

              <button
                type="button"
                id="btn-next-question"
                className="btn btn-secondary"
                onClick={handleNext}
                disabled={currentIndex === totalCount - 1}
              >
                <span>השאלה הבאה</span>
                <ChevronLeft size={18} />
              </button>
            </div>

            <div className="nav-toolbar-right">
              <button
                type="button"
                id="btn-submit-exam"
                className="btn btn-primary btn-submit-exam"
                onClick={() => setShowConfirmModal(true)}
              >
                <Send size={18} />
                <span>סיום והגשת מבחן</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator Matrix (Palette) */}
        <div className="question-matrix-column">
          <div className="matrix-card glass-card" id="question-navigator-matrix">
            <div className="matrix-header">
              <div className="matrix-title">מפת שאלות המבחן</div>
              <div className="matrix-subtitle">ניווט מהיר וחיווי סטטוס</div>
            </div>

            {/* Filter Pills */}
            <div className="matrix-filters">
              <button 
                className={`matrix-filter-btn ${paletteFilter === 'all' ? 'active' : ''}`}
                onClick={() => setPaletteFilter('all')}
              >
                הכל ({totalCount})
              </button>
              <button 
                className={`matrix-filter-btn ${paletteFilter === 'unanswered' ? 'active' : ''}`}
                onClick={() => setPaletteFilter('unanswered')}
              >
                טרם נענו ({totalCount - answeredCount})
              </button>
              {flaggedCount > 0 && (
                <button 
                  className={`matrix-filter-btn ${paletteFilter === 'flagged' ? 'active' : ''}`}
                  onClick={() => setPaletteFilter('flagged')}
                >
                  לבירור ({flaggedCount})
                </button>
              )}
            </div>

            {/* Grid of question buttons */}
            <div className="matrix-grid">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
                const isFlagged = Boolean(flagged[q.id]);

                // Filter logic
                if (paletteFilter === 'unanswered' && isAnswered) return null;
                if (paletteFilter === 'flagged' && !isFlagged) return null;

                let statusClass = 'status-unanswered';
                if (isAnswered) statusClass = 'status-answered';

                return (
                  <button
                    key={q.id}
                    id={`matrix-btn-q-${idx + 1}`}
                    type="button"
                    className={`matrix-btn ${statusClass} ${isCurrent ? 'matrix-btn-current' : ''} ${isFlagged ? 'matrix-btn-flagged' : ''}`}
                    onClick={() => handleJumpToQuestion(idx)}
                    title={`שאלה ${idx + 1}: ${isAnswered ? 'נענתה' : 'טרם נענתה'}${isFlagged ? ' • סומנה לבדיקה' : ''}`}
                  >
                    <span className="matrix-num">{idx + 1}</span>
                    {isFlagged && <Flag size={10} className="matrix-flag-icon" />}
                    {isAnswered && !isFlagged && <div className="matrix-answered-dot" />}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="matrix-legend">
              <div className="legend-item">
                <span className="legend-dot answered"></span>
                <span>שאלה שנענתה ({answeredCount})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot unanswered"></span>
                <span>טרם נענתה ({totalCount - answeredCount})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot flagged"></span>
                <span>סומנה לבדיקה ({flaggedCount})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot current"></span>
                <span>שאלה נוכחית</span>
              </div>
            </div>

            {/* Quick Submit button in sidebar */}
            <div className="matrix-footer">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setShowConfirmModal(true)}
              >
                <Send size={16} />
                <span>הגשת המבחן ({answeredCount}/{totalCount})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Schematics */}
      <ImageModal
        isOpen={Boolean(lightboxImage)}
        imageSrc={lightboxImage}
        title={currentQ.topic || 'תרשים טכני מוגדל'}
        onClose={() => setLightboxImage(null)}
      />

      {/* Confirmation Before Final Submit Modal */}
      <ConfirmSubmitModal
        isOpen={showConfirmModal}
        totalQuestions={totalCount}
        answeredCount={answeredCount}
        unansweredIndices={unansweredIndices}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        onJumpToQuestion={handleJumpToQuestion}
        submitting={submitting}
      />
    </div>
  );
}
