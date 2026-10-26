import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle, ArrowRight, Send } from 'lucide-react';

export default function ConfirmSubmitModal({ 
  isOpen, 
  totalQuestions, 
  answeredCount, 
  unansweredIndices, 
  onClose, 
  onConfirm, 
  onJumpToQuestion,
  submitting 
}) {
  if (!isOpen) return null;

  const isComplete = answeredCount === totalQuestions;

  return createPortal(
    <div className="modal-backdrop fade-in" id="confirm-submit-modal" onClick={onClose}>
      <div className="modal-content confirm-modal-box glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <div className={`confirm-icon-wrap ${isComplete ? 'complete' : 'warning'}`}>
            {isComplete ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
          </div>
          <h2 className="confirm-title">
            {isComplete ? 'סיום והגשת המבחן' : 'שים לב: נותרו שאלות ללא מענה!'}
          </h2>
          <p className="confirm-subtitle">
            ענית על <strong>{answeredCount}</strong> מתוך <strong>{totalQuestions}</strong> שאלות במבחן.
          </p>
        </div>

        {!isComplete && (
          <div className="unanswered-warning-box">
            <div className="unanswered-label">השאלות שטרם נענו:</div>
            <div className="unanswered-chips">
              {unansweredIndices.map((idx) => (
                <button
                  key={idx}
                  className="unanswered-chip"
                  onClick={() => {
                    onJumpToQuestion(idx);
                    onClose();
                  }}
                  title={`קפוץ לשאלה ${idx + 1}`}
                >
                  שאלה {idx + 1}
                </button>
              ))}
            </div>
            <p className="unanswered-hint">לחץ על מספר שאלה כדי להגיע אליה ישירות ולהשלים את התשובה.</p>
          </div>
        )}

        <div className="confirm-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            id="btn-cancel-submit"
            onClick={onClose}
            disabled={submitting}
          >
            <ArrowRight size={17} />
            <span>המשך במבחן</span>
          </button>

          <button 
            type="button" 
            className={`btn ${isComplete ? 'btn-primary' : 'btn-warning'}`} 
            id="btn-finalize-submit"
            onClick={onConfirm}
            disabled={submitting}
          >
            <Send size={17} />
            <span>{submitting ? 'שולח ומחשב ציון...' : 'אשר והגש סופית'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
