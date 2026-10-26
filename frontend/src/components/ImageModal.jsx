import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn } from 'lucide-react';

export default function ImageModal({ isOpen, imageSrc, title, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageSrc) return null;

  return createPortal(
    <div className="modal-backdrop fade-in" id="image-modal-lightbox" onClick={onClose}>
      <div className="modal-content image-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <ZoomIn size={18} className="text-cyan" />
            <h3 className="modal-title">{title || 'תרשים טכני מוגדל'}</h3>
          </div>
          <button className="btn-close-modal" id="btn-close-image-modal" onClick={onClose} aria-label="סגור">
            <X size={20} />
          </button>
        </div>

        <div className="image-modal-body">
          <img 
            src={imageSrc} 
            alt={title || 'תרשים טכני'} 
            className="lightbox-img" 
          />
        </div>

        <div className="modal-footer">
          <span className="modal-hint">לחץ בכל מקום מחוץ לתרשים או על מקש ESC לסגירה</span>
          <button className="btn btn-secondary" onClick={onClose}>סגור תצוגה</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
