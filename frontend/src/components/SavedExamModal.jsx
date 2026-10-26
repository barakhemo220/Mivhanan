import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Building,
  Printer,
  FileDown,
  Award,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { generateAndSaveExamPdf } from '../utils/pdfGenerator';

export default function SavedExamModal({ result, onClose }) {
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'incorrect' | 'correct'
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchFullExam() {
      if (!result?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/results/${result.id}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'שגיאה בטעינת נתוני המבחן השמור');
        }
        if (isMounted) {
          setExamData(data.result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchFullExam();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [result?.id, onClose]);

  const handleDownloadPdf = async () => {
    if (!examData) return;
    setIsExportingPdf(true);
    try {
      await generateAndSaveExamPdf(examData, { autoDownload: true, uploadToServer: true });
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback
      window.open(`/api/results/${examData.id}/pdf`, '_blank');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleOpenPrintable = () => {
    if (!examData?.id) return;
    window.open(`/api/results/${examData.id}/report?print=1`, '_blank');
  };

  if (!result) return null;

  const currentData = examData || result;
  const review = currentData.review || [];
  const passed = (currentData.score ?? 0) >= 70;
  const totalCount = currentData.totalQuestions || review.length || 0;
  const correctCount = currentData.correctCount || review.filter(q => q.isCorrect).length || 0;
  const incorrectCount = Math.max(0, totalCount - correctCount);

  const filteredReview = review.filter(q => {
    if (filter === 'incorrect') return !q.isCorrect;
    if (filter === 'correct') return q.isCorrect;
    return true;
  });

  const dateFormatted = currentData.submittedAt
    ? new Date(currentData.submittedAt).toLocaleString('he-IL', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : '—';

  const durationStr = currentData.timeSpentSeconds
    ? `${Math.floor(currentData.timeSpentSeconds / 60)} דק' ו-${currentData.timeSpentSeconds % 60} שנ'`
    : '—';

  return (
    <div className="modal-backdrop fade-in" onClick={onClose} id="saved-exam-modal-backdrop">
      <div 
        className="modal-box saved-exam-modal glass-card" 
        onClick={(e) => e.stopPropagation()}
        id="saved-exam-modal-container"
      >
        {/* Header */}
        <div className="saved-exam-modal-header">
          <div className="saved-exam-title-wrap">
            <div className="modal-icon-badge">
              <FileCheck size={24} className="text-cyan" />
            </div>
            <div>
              <h2>תחקיר מבחן שמור • {currentData.employeeName}</h2>
              <div className="saved-exam-submeta">
                <span>מספר אישי: <strong>{currentData.employeeId}</strong></span>
                <span className="dot-sep">•</span>
                <span>מחלקה: <strong>{currentData.department}</strong></span>
                <span className="dot-sep">•</span>
                <span>תאריך ביצוע: <strong>{dateFormatted}</strong></span>
              </div>
            </div>
          </div>

          <div className="saved-exam-header-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              title="הורד קובץ PDF של המבחן"
            >
              <FileDown size={15} />
              <span>{isExportingPdf ? 'מייצר PDF...' : 'הורד PDF'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleOpenPrintable}
              title="פתיחת דוח מותאם להדפסה"
            >
              <Printer size={15} />
              <span>הדפסת דוח</span>
            </button>

            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={onClose}
              title="סגור חלון"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="saved-exam-modal-body">
          {loading && (
            <div className="saved-exam-loading">
              <div className="spinner-glow"></div>
              <p>טוען את נתוני המבחן והשאלות השמורות...</p>
            </div>
          )}

          {error && (
            <div className="saved-exam-error">
              <AlertTriangle size={24} className="text-amber" />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Score & KPI Summary Row */}
              <div className="saved-exam-kpi-banner">
                <div className={`saved-exam-score-box ${passed ? 'pass-theme' : 'fail-theme'}`}>
                  <div className="score-circle-value">{currentData.score}%</div>
                  <div className="score-circle-badge">
                    {passed ? (
                      <span className="badge-pass"><CheckCircle2 size={13} /> עבר בהצלחה</span>
                    ) : (
                      <span className="badge-fail"><XCircle size={13} /> נכשל</span>
                    )}
                  </div>
                </div>

                <div className="saved-exam-kpi-cards">
                  <div className="kpi-mini-card">
                    <span className="kpi-mini-label">תשובות נכונות</span>
                    <span className="kpi-mini-val text-emerald">{correctCount} מתוך {totalCount}</span>
                  </div>

                  <div className="kpi-mini-card">
                    <span className="kpi-mini-label">שאלות שגויות</span>
                    <span className="kpi-mini-val text-rose">{incorrectCount}</span>
                  </div>

                  <div className="kpi-mini-card">
                    <span className="kpi-mini-label">משך בחינה</span>
                    <span className="kpi-mini-val text-cyan">{durationStr}</span>
                  </div>

                  <div className="kpi-mini-card">
                    <span className="kpi-mini-label">ציון סף עובר</span>
                    <span className="kpi-mini-val text-amber">70%</span>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="saved-exam-filter-bar">
                <div className="filter-bar-title">
                  <FileCheck size={16} />
                  <span>שאלות המבחן ({review.length})</span>
                </div>

                <div className="review-filters">
                  <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    כל השאלות ({review.length})
                  </button>
                  <button
                    className={`filter-btn filter-btn-incorrect ${filter === 'incorrect' ? 'active' : ''}`}
                    onClick={() => setFilter('incorrect')}
                  >
                    <XCircle size={14} />
                    <span>שגויות ({incorrectCount})</span>
                  </button>
                  <button
                    className={`filter-btn filter-btn-correct ${filter === 'correct' ? 'active' : ''}`}
                    onClick={() => setFilter('correct')}
                  >
                    <CheckCircle2 size={14} />
                    <span>נכונות ({correctCount})</span>
                  </button>
                </div>
              </div>

              {/* Question Cards List */}
              <div className="saved-exam-questions-list">
                {filteredReview.length === 0 ? (
                  <div className="empty-filter-state">
                    <CheckCircle2 size={32} className="text-emerald" />
                    <p>אין שאלות התואמות לסינון הנבחר</p>
                  </div>
                ) : (
                  filteredReview.map((q, idx) => {
                    const letters = ['א', 'ב', 'ג', 'ד'];
                    const isCorrect = q.isCorrect;

                    return (
                      <div 
                        key={q.id || idx} 
                        className={`saved-q-card ${isCorrect ? 'q-card-correct' : 'q-card-incorrect'}`}
                      >
                        {/* Question Card Header */}
                        <div className="saved-q-header">
                          <div className="saved-q-index">
                            <span className="q-badge-num">שאלה {idx + 1}</span>
                            <span className="q-badge-topic">{q.topic || 'מכשור ובקרה'}</span>
                            {q.level && (
                              <span className="q-badge-level">רמה {q.level}</span>
                            )}
                          </div>

                          <div className="saved-q-status-tag">
                            {isCorrect ? (
                              <span className="status-tag-correct">
                                <CheckCircle2 size={14} />
                                <span>תשובה נכונה (+{Math.round(100 / totalCount)} נק')</span>
                              </span>
                            ) : (
                              <span className="status-tag-incorrect">
                                <XCircle size={14} />
                                <span>תשובה שגויה (0 נק')</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question Text */}
                        <h4 className="saved-q-title">{q.question}</h4>

                        {/* Question Image/Diagram if available */}
                        {q.image && (
                          <div className="saved-q-image-wrap">
                            <img 
                              src={q.image} 
                              alt="שרטוט טכני" 
                              className="saved-q-image"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}

                        {/* Options */}
                        <div className="saved-q-options">
                          {(q.options || []).map((opt, optIdx) => {
                            const isSelected = q.selectedAnswer === optIdx;
                            const isAnswerCorrect = q.correctAnswer === optIdx;

                            let optClass = 'saved-opt-item';
                            if (isAnswerCorrect) optClass += ' opt-is-correct';
                            if (isSelected && !isAnswerCorrect) optClass += ' opt-is-wrong-selected';
                            if (isSelected && isAnswerCorrect) optClass += ' opt-is-correct-selected';

                            return (
                              <div key={optIdx} className={optClass}>
                                <div className="opt-letter-tag">{letters[optIdx]}</div>
                                <div className="opt-text">{opt}</div>

                                <div className="opt-badge-area">
                                  {isAnswerCorrect && (
                                    <span className="badge-correct-answer">
                                      <CheckCircle2 size={13} />
                                      <span>התשובה הנכונה</span>
                                    </span>
                                  )}
                                  {isSelected && !isAnswerCorrect && (
                                    <span className="badge-user-wrong">
                                      <XCircle size={13} />
                                      <span>תשובת הנבחן</span>
                                    </span>
                                  )}
                                  {isSelected && isAnswerCorrect && (
                                    <span className="badge-user-correct">
                                      <span>✓ בחירת הנבחן</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {q.explanation && (
                          <div className="saved-q-explanation">
                            <div className="explanation-title">
                              <Lightbulb size={15} className="text-amber" />
                              <span>הסבר טכני מקצועי:</span>
                            </div>
                            <p className="explanation-text">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="saved-exam-modal-footer">
          <div className="footer-left-info">
            <span>מזהה רשומה: <code>{currentData.id}</code></span>
          </div>

          <div className="footer-right-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleOpenPrintable}
            >
              <Printer size={15} />
              <span>הדפסה</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
            >
              <FileDown size={15} />
              <span>{isExportingPdf ? 'מייצר קובץ PDF...' : 'הורד קובץ PDF'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              <span>סגור</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
