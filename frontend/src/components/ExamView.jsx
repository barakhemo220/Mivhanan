import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Flag, 
  Maximize2, 
  CheckCircle2, 
  XCircle,
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
  FileText,
  Trophy
} from 'lucide-react';
import ImageModal from './ImageModal';
import ConfirmSubmitModal from './ConfirmSubmitModal';
import TournamentPodium from './TournamentPodium';
import { getAuthHeaders } from '../utils/authClient';

const OPTION_LETTERS = ['א', 'ב', 'ג', 'ד'];

export default function ExamView({ user, onExamComplete, examStartTime, onLogout, onActiveExamRunning }) {
  const [questions, setQuestions] = useState([]);
  const [examId, setExamId] = useState(null);
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

  const draftStorageKey = `mivhanan_active_draft_${user?.id || 'guest'}`;

  const clearSavedDraft = () => {
    try {
      sessionStorage.removeItem(draftStorageKey);
      localStorage.removeItem(draftStorageKey);
      localStorage.removeItem(`mivhanan_draft_${user?.id}`);
    } catch {}
  };

  // CR-01: Persist active exam progress consistently across refreshes
  useEffect(() => {
    if (!examStarted || !questions.length || !examId) return;
    try {
      const payload = JSON.stringify({
        examId,
        questions,
        answers,
        flagged,
        currentIndex,
        isPractice,
        examStarted,
        scheduleInfo,
        examStartTime,
        savedAt: Date.now()
      });
      sessionStorage.setItem(draftStorageKey, payload);
      localStorage.setItem(draftStorageKey, payload);
    } catch {}
  }, [examId, questions, answers, flagged, currentIndex, isPractice, examStarted, scheduleInfo, examStartTime, draftStorageKey]);

  // Fetch randomized questions on mount (or restore active in-progress draft)
  useEffect(() => {
    fetchExamQuestions();
  }, []);

  const fetchExamQuestions = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshingStatus(true);
    } else {
      setLoading(true);
      // CR-01: Check if user has an active in-progress exam draft from a page reload
      try {
        const rawDraft = sessionStorage.getItem(draftStorageKey) || localStorage.getItem(draftStorageKey);
        if (rawDraft) {
          const draft = JSON.parse(rawDraft);
          const isFresh = draft.savedAt && (Date.now() - draft.savedAt < 12 * 60 * 60 * 1000);
          if (isFresh && draft.examStarted && Array.isArray(draft.questions) && draft.questions.length > 0 && draft.examId) {
            setRestriction(null);
            setQuestions(draft.questions);
            setExamId(draft.examId);
            setAnswers(draft.answers || {});
            setFlagged(draft.flagged || {});
            setCurrentIndex(Number.isInteger(draft.currentIndex) ? draft.currentIndex : 0);
            setIsPractice(Boolean(draft.isPractice));
            setScheduleInfo(draft.scheduleInfo || null);
            setExamStarted(true);
            if (onActiveExamRunning) onActiveExamRunning(true, draft.examStartTime || Date.now());
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not restore exam draft:', e);
      }
    }
    setError('');

    try {
      const userLevel = user?.level || 2;
      const res = await fetch(`/api/exam/questions?count=20&level=${userLevel}&employeeId=${encodeURIComponent(user?.id || '')}`, {
        headers: getAuthHeaders(user)
      });
      
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('שגיאה בפענוח תשובת השרת');
      }

      if (!res.ok || !data.success) {
        // Schedule / Tournament Restriction
        if (
          data.canTakeExam === false ||
          data.reason === 'NO_SCHEDULED_EXAM' ||
          data.reason === 'TOO_EARLY' ||
          data.reason === 'ALREADY_COMPLETED' ||
          data.reason === 'TOURNAMENT_ENDED'
        ) {
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
        diffDays: data.diffDays,
        tournamentSummary: data.tournamentSummary || null
      });
      setQuestions(data.questions);
      setExamId(data.examId || null);
      setAnswers({});
      setFlagged({});
      setCurrentIndex(0);
      setExamStarted(false);
      setIsPractice(false);
      if (onActiveExamRunning) onActiveExamRunning(false);
    } catch (err) {
      setError(err.message || 'שגיאה בתקשורת עם השרת');
      if (onActiveExamRunning) onActiveExamRunning(false);
    } finally {
      setLoading(false);
      setIsRefreshingStatus(false);
    }
  };

  // Start Official Scheduled Exam (CR-02: Reset exam start timer on actual start)
  const startOfficialExam = () => {
    clearSavedDraft();
    setIsPractice(false);
    setExamStarted(true);
    setCurrentIndex(0);
    if (onActiveExamRunning) onActiveExamRunning(true, Date.now());
  };

  // Start Practice Exam (Scores are not recorded anywhere; samples across all levels 1-3)
  const startPracticeExam = async () => {
    setLoadingPractice(true);
    setError('');
    try {
      const res = await fetch(`/api/exam/questions?mode=practice&count=20&employeeId=${encodeURIComponent(user?.id || '')}`, {
        headers: getAuthHeaders(user)
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

      clearSavedDraft();
      setQuestions(data.questions);
      setExamId(data.examId || null);
      setRestriction(null);
      setIsPractice(true);
      setExamStarted(true);
      setCurrentIndex(0);
      setAnswers({});
      setFlagged({});
      if (onActiveExamRunning) onActiveExamRunning(true, Date.now());
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
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
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
        headers: getAuthHeaders(user, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          examId,
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
      clearSavedDraft();
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
  // Restriction 1: No Scheduled Tournament Available
  // -------------------------------------------------------------
  if (restriction && restriction.reason === 'NO_SCHEDULED_EXAM') {
    const tournSummary = restriction.tournamentSummary;
    return (
      <div className="schedule-restriction-container fade-in" id="restriction-no-schedule">
        <div className="schedule-card-wrapper glass-card">
          <div className="schedule-badge-icon badge-locked">
            <Trophy size={48} className="icon-locked" />
          </div>

          <h1 className="schedule-title">טרם נקבע מועד לטורניר המכשיריות</h1>
          <p className="schedule-subtitle">
            שלום <strong>{user?.name}</strong>, כרגע אין טורניר פעיל מתוזמן במערכת. באפשרותך להיכנס לאזור התרגול החופשי (הכולל שאלות מכל הרמות והצגת תשובה והסבר מיידי לכל שאלה).
          </p>

          <div className="employee-info-box">
            <div className="info-chip">
              <span className="info-label">עובד:</span>
              <span className="info-val">{user?.name}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">מחלקה / מכשיריה:</span>
              <span className="info-val">{user?.department}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">סטטוס טורניר:</span>
              <span className="info-val status-blocked-tag">טרם נקבע מועד טורניר</span>
            </div>
          </div>

          <div className="schedule-actions-row">
            <button 
              type="button" 
              id="btn-start-practice"
              className="btn btn-primary btn-practice" 
              onClick={startPracticeExam}
              disabled={loadingPractice}
              title="כניסה לתרגול חופשי מכל הרמות עם הצגת תשובה והסבר מיידי לכל שאלה"
            >
              <GraduationCap size={18} />
              <span>{loadingPractice ? 'טוען תרגול...' : 'התחל תרגול'}</span>
            </button>
          </div>
        </div>

        {tournSummary?.isResultsVisible && (
          <div className="employee-podium-below-wrapper">
            <TournamentPodium tournament={tournSummary} />
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Restriction 2: Tournament Scheduled In The Future
  // -------------------------------------------------------------
  if (restriction && restriction.reason === 'TOO_EARLY') {
    const tournSummary = restriction.tournamentSummary;
    return (
      <div className="schedule-restriction-container fade-in" id="restriction-too-early">
        <div className="schedule-card-wrapper glass-card">
          <div className="schedule-badge-icon badge-early">
            <CalendarClock size={48} className="icon-early" />
          </div>

          <h1 className="schedule-title">מועד טורניר המכשיריות טרם הגיע</h1>
          <p className="schedule-subtitle">
            שלום <strong>{user?.name}</strong>, נקבע מועד לטורניר המכשיריות הקרוב! עד לפתיחת הטורניר תוכל להתאמן ולהתכונן במצב תרגול.
          </p>

          {/* Timeline & Countdown Grid */}
          <div className="countdown-cards-grid">
            <div className="countdown-card active-window-card">
              <div className="card-top-label">פתיחת הטורניר</div>
              <div className="card-main-val highlight-open">
                {restriction.windowOpenDateFormatted || restriction.windowOpenDate}
              </div>
              <div className="card-sub-label">תאריך התחלת התחרות</div>
            </div>

            <div className="countdown-card">
              <div className="card-top-label">סיום הטורניר</div>
              <div className="card-main-val highlight-target">
                {restriction.targetDateFormatted || restriction.nextExamDate}
              </div>
              <div className="card-sub-label">תאריך סיום התחרות</div>
            </div>

            <div className="countdown-card">
              <div className="card-top-label">זמן שנותר לפתיחה</div>
              <div className="card-main-val highlight-countdown">
                {restriction.daysUntilOpen}
                <span className="unit-text"> ימים</span>
              </div>
              <div className="card-sub-label">עד לפתיחת הטורניר</div>
            </div>
          </div>

          <div className="schedule-actions-row">
            <button 
              type="button" 
              id="btn-start-practice-early"
              className="btn btn-primary btn-practice" 
              onClick={startPracticeExam}
              disabled={loadingPractice}
              title="כניסה לתרגול חופשי מכל הרמות עם הצגת תשובה והסבר מיידי לכל שאלה"
            >
              <GraduationCap size={18} />
              <span>{loadingPractice ? 'טוען תרגול...' : 'התחל תרגול'}</span>
            </button>
          </div>
        </div>

        {tournSummary?.isResultsVisible && (
          <div className="employee-podium-below-wrapper">
            <TournamentPodium tournament={tournSummary} />
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Restriction 3 & 4: Already Completed Tournament OR Tournament Ended
  // -------------------------------------------------------------
  if (restriction && (restriction.reason === 'ALREADY_COMPLETED' || restriction.reason === 'TOURNAMENT_ENDED')) {
    const isCompleted = restriction.reason === 'ALREADY_COMPLETED';
    const tournSummary = restriction.tournamentSummary;

    return (
      <div className="schedule-restriction-container fade-in" id="restriction-tournament-status">
        <div className="schedule-card-wrapper glass-card">
          <div className="schedule-badge-icon badge-lobby">
            <Trophy size={48} className="icon-lobby" />
          </div>

          <h1 className="schedule-title">
            {isCompleted ? 'השתתפותך בטורניר נקלטה בהצלחה! 🏆' : 'טורניר המכשיריות הסתיים'}
          </h1>
          <p className="schedule-subtitle">
            {isCompleted
              ? `כל הכבוד ${user?.name}! כבר ביצעת את מבחן הטורניר הנוכחי. התוצאות ישוקללו בממוצע של ${user?.department} וייחשפו בסיום התחרות.`
              : `חלון הזמן של טורניר המכשיריות הסתיים${restriction.targetDateFormatted ? ` (${restriction.targetDateFormatted})` : ''}. ניתן לצפות בתוצאות התחרות למטה או להמשיך לתרגל חופשי.`}
          </p>

          <div className="employee-info-box">
            <div className="info-chip">
              <span className="info-label">עובד:</span>
              <span className="info-val">{user?.name}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">מכשיריה:</span>
              <span className="info-val">{user?.department}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">סטטוס בטורניר:</span>
              <span className={`info-val ${isCompleted ? 'status-open-tag' : 'status-blocked-tag'}`}>
                {isCompleted ? 'ביצע מבחן טורניר ✓' : 'הטורניר הסתיים'}
              </span>
            </div>
          </div>

          <div className="schedule-actions-row">
            <button
              type="button"
              id="btn-start-practice-completed"
              className="btn btn-primary btn-practice"
              onClick={startPracticeExam}
              disabled={loadingPractice}
              title="כניסה לתרגול חופשי מכל הרמות עם הצגת תשובה והסבר מיידי לכל שאלה"
            >
              <GraduationCap size={18} />
              <span>{loadingPractice ? 'טוען תרגול...' : 'התחל תרגול'}</span>
            </button>
          </div>
        </div>

        {tournSummary?.isResultsVisible && (
          <div className="employee-podium-below-wrapper">
            <TournamentPodium tournament={tournSummary} />
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Pre-Exam Lobby: Scheduled Tournament Ready, User Chooses Start Tournament or Start Practice
  // -------------------------------------------------------------
  if (!examStarted && !restriction && questions.length > 0) {
    const tournSummary = scheduleInfo?.tournamentSummary;
    return (
      <div className="schedule-restriction-container fade-in" id="exam-welcome-lobby">
        <div className="schedule-card-wrapper glass-card">
          <div className="schedule-badge-icon badge-lobby">
            <Trophy size={48} className="icon-lobby" />
          </div>

          <h1 className="schedule-title">טורניר המכשיריות במכשור ובקרה 🏆</h1>
          <p className="schedule-subtitle">
            שלום <strong>{user?.name}</strong>, טורניר המכשיריות פתוח כעת! הצלחתך במבחן הטורניר מחזקת את הממוצע של <strong>{user?.department}</strong> בתחרות:
          </p>

          <div className="employee-info-box">
            <div className="info-chip">
              <span className="info-label">עובד:</span>
              <span className="info-val">{user?.name}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">מחלקה / מכשיריה:</span>
              <span className="info-val">{user?.department}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">רמת מבחן טורניר:</span>
              <span className="info-val">
                {user?.level === 3 ? 'רמה 3 (מתקדם)' : user?.level === 1 ? 'רמה 1 (מתחיל)' : 'רמה 2 (בינוני)'}
              </span>
            </div>
            {scheduleInfo?.targetDateFormatted && (
              <div className="info-chip">
                <span className="info-label">מועד סיום הטורניר:</span>
                <span className="info-val status-open-tag">
                  {scheduleInfo.targetDateFormatted}
                </span>
              </div>
            )}
          </div>

          <div className="schedule-notice-box notice-info">
            <Info size={20} className="notice-icon" />
            <div className="notice-content">
              <strong>בחר מסלול כניסה</strong>
              <span>
                לחיצה על <strong>"התחל טורניר"</strong> תכניס אותך למבחן הרשמי של התחרות ({questions.length} שאלות).
                לחיצה על <strong>"התחל תרגול"</strong> תפתח אימון חופשי מכל הרמות עם הצגת תשובה נכונה והסבר מיידי לכל שאלה.
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
              <Trophy size={18} />
              <span>התחל טורניר</span>
            </button>

            <button 
              type="button" 
              id="btn-start-practice-lobby"
              className="btn btn-secondary btn-practice" 
              onClick={startPracticeExam}
              disabled={loadingPractice}
              title="ביצוע תרגול מכל הרמות עם הצגת תשובה והסבר מיידי לכל שאלה"
            >
              <GraduationCap size={18} />
              <span>{loadingPractice ? 'טוען תרגול...' : 'התחל תרגול'}</span>
            </button>
          </div>
        </div>

        {tournSummary?.isResultsVisible && (
          <div className="employee-podium-below-wrapper">
            <TournamentPodium tournament={tournSummary} />
          </div>
        )}
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
            <span className={`exam-level-pill level-${isPractice ? 2 : (user?.level || 2)}`}>
              {isPractice
                ? 'רמת תרגול: כל הרמות (1–3)'
                : `רמת מבחן: ${user?.level === 3 ? 'רמה 3 - מתקדם' : user?.level === 1 ? 'רמה 1 - מתחיל' : 'רמה 2 - בינוני'}`}
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
                const selectedOpt = answers[currentQ.id];
                const hasAnsweredCurrent = selectedOpt !== undefined && selectedOpt !== null;
                const isSelected = selectedOpt === optIdx;
                const showPracticeFeedback = Boolean(isPractice && hasAnsweredCurrent && currentQ.correctAnswer !== undefined);
                const isCorrectOption = showPracticeFeedback && optIdx === currentQ.correctAnswer;
                const isWrongSelected = showPracticeFeedback && isSelected && optIdx !== currentQ.correctAnswer;

                let optionStateClass = isSelected ? 'selected' : '';
                if (isCorrectOption) optionStateClass += ' practice-opt-correct';
                if (isWrongSelected) optionStateClass += ' practice-opt-wrong';

                return (
                  <div
                    key={optIdx}
                    id={`option-${optIdx}`}
                    className={`option-card ${optionStateClass}`}
                    onClick={() => handleSelectOption(optIdx)}
                  >
                    <div className="option-radio-indicator">
                      <div className="option-letter">{OPTION_LETTERS[optIdx]}</div>
                      <div className="option-circle">
                        {isSelected && <div className="option-circle-dot" />}
                      </div>
                    </div>
                    <div className="option-text" style={{ flex: 1 }}>{optText}</div>

                    {isCorrectOption && (
                      <span className="practice-opt-badge badge-opt-correct">
                        <CheckCircle2 size={15} />
                        <span>{isSelected ? 'בחירתך נכונה ✓' : 'התשובה הנכונה ✓'}</span>
                      </span>
                    )}
                    {isWrongSelected && (
                      <span className="practice-opt-badge badge-opt-wrong">
                        <XCircle size={15} />
                        <span>תשובה שגויה ✗</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Instant Answer & Explanation Box in Practice Mode */}
            {isPractice && answers[currentQ.id] !== undefined && answers[currentQ.id] !== null && currentQ.correctAnswer !== undefined && (() => {
              const userChoice = answers[currentQ.id];
              const isUserCorrect = userChoice === currentQ.correctAnswer;
              const correctLetter = OPTION_LETTERS[currentQ.correctAnswer] || '';
              const correctOptionText = currentQ.options?.[currentQ.correctAnswer] || '';

              return (
                <div
                  className={`practice-instant-feedback fade-in ${isUserCorrect ? 'feedback-correct' : 'feedback-wrong'}`}
                  id="practice-instant-feedback"
                >
                  <div className="practice-feedback-header">
                    {isUserCorrect ? (
                      <>
                        <CheckCircle2 size={20} />
                        <span>תשובה נכונה! כל הכבוד ✓</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={20} />
                        <span>
                          תשובה שגויה — התשובה הנכונה היא סעיף {correctLetter}&apos;: {correctOptionText}
                        </span>
                      </>
                    )}
                  </div>

                  {currentQ.explanation && (
                    <div className="practice-feedback-explanation">
                      <strong>הסבר מקצועי: </strong>
                      <span>{currentQ.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })()}
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
                <span>{isPractice ? 'סיום תרגול וצפייה בסיכום' : 'סיום והגשת מבחן'}</span>
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
                if (isAnswered) {
                  if (isPractice && q.correctAnswer !== undefined) {
                    statusClass = answers[q.id] === q.correctAnswer
                      ? 'status-answered practice-matrix-correct'
                      : 'status-answered practice-matrix-wrong';
                  } else {
                    statusClass = 'status-answered';
                  }
                }

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
