import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Printer, 
  RotateCcw, 
  Maximize2,
  FileCheck,
  LogOut,
  CalendarCheck,
  FileDown,
  GraduationCap
} from 'lucide-react';
import ImageModal from './ImageModal';
import { generateAndSaveExamPdf } from '../utils/pdfGenerator';

const OPTION_LETTERS = ['א', 'ב', 'ג', 'ד'];

export default function ResultsView({ resultData, user, onRetakeExam, onLogout }) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, incorrect, correct
  const [pdfStatus, setPdfStatus] = useState(resultData?.isPractice ? 'practice' : 'generating'); // 'generating' | 'saved' | 'error' | 'practice'
  const [savedPdfFilename, setSavedPdfFilename] = useState('');

  const { score, correctCount, totalQuestions, status, timeSpentSeconds, review } = resultData;
  const isPassed = status === 'passed' || score >= 70;
  const incorrectCount = totalQuestions - correctCount;

  // Trigger celebration confetti on pass!
  useEffect(() => {
    if (isPassed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isPassed]);

  // Automatic PDF generation & saving on finish exam (skipped in practice mode)
  useEffect(() => {
    if (resultData?.isPractice) {
      setPdfStatus('practice');
      return;
    }

    let isMounted = true;
    async function autoSavePdf() {
      try {
        setPdfStatus('generating');
        const payload = {
          ...resultData,
          employeeId: user?.id,
          employeeName: user?.name,
          department: user?.department,
          id: resultData?.resultId || resultData?.id
        };
        const res = await generateAndSaveExamPdf(payload, { autoDownload: true, uploadToServer: true });
        if (isMounted) {
          if (res.success) {
            setPdfStatus('saved');
            setSavedPdfFilename(res.filename || 'דוח_מבחן.pdf');
          } else {
            setPdfStatus('error');
          }
        }
      } catch (err) {
        console.error('Auto PDF error:', err);
        if (isMounted) setPdfStatus('error');
      }
    }

    autoSavePdf();
    return () => { isMounted = false; };
  }, [resultData?.isPractice]);

  const formatTime = (secs) => {
    if (!secs) return 'ללא תיעוד';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} דק' ו-${s} שנ'`;
  };

  const filteredReview = (review || []).filter(item => {
    if (filter === 'incorrect') return !item.isCorrect;
    if (filter === 'correct') return item.isCorrect;
    return true;
  });

  return (
    <div className="results-container fade-in" id="results-view">
      {/* Printable Header (Visible only when printing) */}
      <div className="print-header print-only">
        <h2>מִבְחָנָן - גיליון תוצאות מבחן תקופתי במכשור ובקרה</h2>
        <p>שם הנבחן: {user.name} | מספר אישי: {user.id} | מחלקה: {user.department}</p>
        <p>תאריך: {new Date().toLocaleDateString('he-IL')} | ציון: {score}% ({isPassed ? 'עבר' : 'נכשל'})</p>
        <hr />
      </div>

      {/* Auto Save PDF Status Banner / Practice Banner */}
      <div className="pdf-auto-save-wrapper no-print">
        {resultData?.isPractice && (
          <div className="pdf-auto-save-banner banner-practice">
            <div className="banner-icon-text">
              <GraduationCap size={20} className="text-cyan" />
              <span>
                <strong>מצב תרגול עצמי (אימון)</strong> — הציון והתשובות שקיבלת נועדו ללמידה ותרגול אישי בלבד. תוצאות אלו <strong>לא נרשמו במערכת</strong> ולא משפיעות על מעקב המבחנים הרשמי שלך.
              </span>
            </div>
          </div>
        )}

        {!resultData?.isPractice && pdfStatus === 'generating' && (
          <div className="pdf-auto-save-banner banner-generating">
            <div className="spinner-mini"></div>
            <span>מייצר ושומר קובץ PDF של תוצאות המבחן באופן אוטומטי...</span>
          </div>
        )}

        {!resultData?.isPractice && pdfStatus === 'saved' && (
          <div className="pdf-auto-save-banner banner-saved">
            <div className="banner-icon-text">
              <CheckCircle2 size={18} className="text-emerald" />
              <span>
                <strong>קובץ ה-PDF נשמר בהצלחה!</strong> דוח תוצאות המבחן נשמר בארכיון והורד אוטומטית למחשבך (<code>{savedPdfFilename}</code>).
              </span>
            </div>
            <button 
              type="button" 
              className="btn-banner-redownload"
              onClick={() => generateAndSaveExamPdf({
                ...resultData,
                employeeId: user?.id,
                employeeName: user?.name,
                department: user?.department,
                id: resultData?.resultId || resultData?.id
              }, { autoDownload: true, uploadToServer: false })}
              title="הורד שוב את קובץ ה-PDF"
            >
              <FileDown size={14} />
              <span>הורד שוב</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Score Hero Card */}
      <div className="score-hero-card glass-card" id="score-summary-card">
        <div className="score-hero-content">
          <div className="score-gauge-wrapper">
            <div className={`score-circle-ring ${isPassed ? 'ring-passed' : 'ring-failed'}`}>
              <div className="score-number-display" id="final-score-value">
                {score}
                <span className="percent-symbol">%</span>
              </div>
            </div>
            <div className={`score-status-badge ${isPassed ? 'badge-passed' : 'badge-failed'}`} id="pass-fail-status-badge">
              {isPassed ? (
                <>
                  <Award size={18} />
                  <span>{resultData?.isPractice ? 'עבר בתרגול!' : 'עבר בהצלחה!'}</span>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <span>טעון שיפור</span>
                </>
              )}
            </div>
          </div>

          <div className="score-details-pane">
            <h1 className="score-title">
              {resultData?.isPractice
                ? (isPassed ? `כל הכבוד בתרגול, ${user.name}!` : `סיום תרגול, ${user.name}`)
                : (isPassed ? `כל הכבוד, ${user.name}!` : `סיום מבחן, ${user.name}`)}
            </h1>
            <p className="score-subtitle">
              {resultData?.isPractice
                ? (isPassed 
                    ? 'השגת ציון עובר בתרגול! התוצאה לא נרשמת ביומן. תוכל לעבור על התחקיר המקצועי כדי לחדד דקויות נוספות.'
                    : 'ציון המעבר הינו 70%. זהו תרגול בלבד והציון לא נרשם. עבור על התחקיר המקצועי למטה כדי ללמוד את התשובות הנכונות.')
                : (isPassed
                    ? 'עברת בהצלחה את המבחן התקופתי במכשור ובקרה. התוצאות נשמרו בתיק ההדרכה שלך.'
                    : 'ציון המעבר הינו 70%. מומלץ לעבור על התחקיר המקצועי למטה, ללמוד את ההסברים ולגשת למבחן חוזר.')}
            </p>

            {/* Metrics Chips */}
            <div className="metrics-chips-grid">
              <div className="metric-chip chip-correct">
                <CheckCircle2 size={18} className="text-emerald" />
                <div className="metric-chip-content">
                  <span className="metric-label">תשובות נכונות:</span>
                  <span className="metric-val">{correctCount} מתוך {totalQuestions}</span>
                </div>
              </div>

              <div className="metric-chip chip-incorrect">
                <XCircle size={18} className="text-rose" />
                <div className="metric-chip-content">
                  <span className="metric-label">תשובות שגויות:</span>
                  <span className="metric-val">{incorrectCount}</span>
                </div>
              </div>

              <div className="metric-chip chip-time">
                <Clock size={18} className="text-cyan" />
                <div className="metric-chip-content">
                  <span className="metric-label">זמן ביצוע:</span>
                  <span className="metric-val">{formatTime(timeSpentSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Completion Notice for Scheduled Exam vs Practice */}
            {!user?.isAdmin && !resultData?.isPractice && (
              <div className="exam-completion-notice">
                <CalendarCheck size={18} className="completion-icon" />
                <span>המבחן התקופתי הושלם ונרשם בהצלחה ביומן הציונים. המועד הבא ייקבע על ידי מנהל המערכת (מחזור של 4 חודשים).</span>
              </div>
            )}

            {!user?.isAdmin && resultData?.isPractice && (
              <div className="exam-completion-notice practice-completion-notice">
                <GraduationCap size={18} className="completion-icon" />
                <span>התרגול הסתיים בהצלחה. שים לב: ציון זה נועד לתרגול אישי בלבד ולא נרשם במערכת הניהול.</span>
              </div>
            )}

            {/* Actions Bar */}
            <div className="score-actions-row no-print">
              {resultData?.isPractice ? (
                <>
                  <button 
                    type="button" 
                    id="btn-retake-practice"
                    className="btn btn-primary"
                    onClick={onRetakeExam}
                    title="חזרה למסך הראשי או ביצוע תרגול נוסף"
                  >
                    <RotateCcw size={16} />
                    <span>חזרה למסך הראשי / תרגול נוסף</span>
                  </button>

                  <button 
                    type="button" 
                    id="btn-finish-practice-logout"
                    className="btn btn-secondary"
                    onClick={onLogout}
                  >
                    <LogOut size={16} />
                    <span>יציאה מהמערכת</span>
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  id="btn-finish-exam"
                  className="btn btn-primary"
                  onClick={onLogout}
                >
                  <LogOut size={16} />
                  <span>סיום ויציאה מהמערכת</span>
                </button>
              )}

              <button 
                type="button" 
                id="btn-download-pdf-direct"
                className="btn btn-secondary"
                onClick={() => generateAndSaveExamPdf({
                  ...resultData,
                  employeeId: user?.id,
                  employeeName: user?.name,
                  department: user?.department,
                  id: resultData?.resultId || resultData?.id
                }, { autoDownload: true, uploadToServer: false })}
                title="הורדת קובץ PDF של תוצאות המבחן"
              >
                <FileDown size={16} />
                <span>הורד קובץ PDF</span>
              </button>

              <button 
                type="button" 
                id="btn-print-results"
                className="btn btn-secondary"
                onClick={() => window.print()}
                title="הדפסת גיליון התוצאות"
              >
                <Printer size={16} />
                <span>הדפס</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="review-section" id="detailed-review-section">
        <div className="review-section-header no-print">
          <div className="review-heading">
            <FileCheck size={22} className="text-cyan" />
            <h2>תחקיר מקצועי של שאלות המבחן</h2>
          </div>

          {/* Review Filter Buttons */}
          <div className="review-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              כל השאלות ({totalQuestions})
            </button>
            <button 
              className={`filter-btn ${filter === 'incorrect' ? 'active' : ''}`}
              onClick={() => setFilter('incorrect')}
            >
              שגויות ({incorrectCount})
            </button>
            <button 
              className={`filter-btn ${filter === 'correct' ? 'active' : ''}`}
              onClick={() => setFilter('correct')}
            >
              נכונות ({correctCount})
            </button>
          </div>
        </div>

        {/* List of Questions in Review */}
        <div className="review-list">
          {filteredReview.map((item, index) => {
            return (
              <div 
                key={item.id} 
                className={`review-card glass-card ${item.isCorrect ? 'card-correct' : 'card-incorrect'}`}
                id={`review-card-${item.id}`}
              >
                {/* Header */}
                <div className="review-card-top">
                  <div className="review-status-indicator">
                    {item.isCorrect ? (
                      <div className="review-status-badge badge-success">
                        <CheckCircle2 size={16} />
                        <span>תשובה נכונה</span>
                      </div>
                    ) : item.selectedAnswer === -1 || item.selectedAnswer === undefined ? (
                      <div className="review-status-badge badge-warning" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' }}>
                        <XCircle size={16} />
                        <span>לא נענתה (0 נק')</span>
                      </div>
                    ) : (
                      <div className="review-status-badge badge-danger">
                        <XCircle size={16} />
                        <span>תשובה שגויה (0 נק')</span>
                      </div>
                    )}
                    <span className="review-topic-tag">{item.topic}</span>
                  </div>

                  {item.image && (
                    <button 
                      type="button" 
                      className="btn-zoom-inline no-print"
                      onClick={() => setLightboxImage(item.image)}
                      title="הגדל תרשים"
                    >
                      <Maximize2 size={14} />
                      <span>הגדל תרשים</span>
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <h3 className="review-question-text">
                  שאלה {index + 1}: {item.question}
                </h3>

                {/* Diagram */}
                {item.image && (
                  <div 
                    className="review-diagram-wrap" 
                    onClick={() => setLightboxImage(item.image)}
                    title="לחץ להגדלה"
                  >
                    <img src={item.image} alt={item.topic} className="review-diagram-img" />
                  </div>
                )}

                {/* Options List */}
                <div className="review-options-list">
                  {item.options.map((optText, optIdx) => {
                    const isUserChoice = item.selectedAnswer === optIdx;
                    const isTheCorrectAnswer = item.correctAnswer === optIdx;

                    let optClass = 'opt-neutral';
                    if (isTheCorrectAnswer) {
                      optClass = 'opt-is-correct';
                    } else if (isUserChoice && !item.isCorrect) {
                      optClass = 'opt-user-wrong';
                    }

                    return (
                      <div key={optIdx} className={`review-option-item ${optClass}`}>
                        <div className="review-option-letter">
                          {OPTION_LETTERS[optIdx]}
                        </div>
                        <div className="review-option-text">
                          {optText}
                        </div>
                        <div className="review-option-badge">
                          {isTheCorrectAnswer && (
                            <span className="badge-correct-answer">
                              <CheckCircle2 size={14} />
                              <span>התשובה הנכונה</span>
                            </span>
                          )}
                          {isUserChoice && !isTheCorrectAnswer && (
                            <span className="badge-wrong-choice">
                              <XCircle size={14} />
                              <span>הבחירה שלך</span>
                            </span>
                          )}
                          {isUserChoice && isTheCorrectAnswer && (
                            <span className="badge-user-correct">
                              <span>הבחירה שלך (מדויק!)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Technical Explanation Box */}
                {item.explanation && (
                  <div className="technical-explanation-card">
                    <div className="explanation-header">
                      <HelpCircle size={16} className="text-cyan" />
                      <h4>הסבר טכני ומקצועי:</h4>
                    </div>
                    <p className="explanation-text">
                      {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageModal
        isOpen={Boolean(lightboxImage)}
        imageSrc={lightboxImage}
        title="תרשים טכני"
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
