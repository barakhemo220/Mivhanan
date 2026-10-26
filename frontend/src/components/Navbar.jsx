import React, { useState, useEffect } from 'react';
import { Gauge, Clock, User, ShieldCheck, LogOut, LayoutDashboard, FileText } from 'lucide-react';

export default function Navbar({ 
  user, 
  onLogout, 
  currentView, 
  onNavigate, 
  examStartTime, 
  isExamActive 
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isExamActive && examStartTime) {
      interval = setInterval(() => {
        const seconds = Math.floor((Date.now() - examStartTime) / 1000);
        setElapsedSeconds(seconds);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isExamActive, examStartTime]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="navbar no-print" id="main-header">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="brand" id="brand-logo" onClick={() => onNavigate(user?.isAdmin ? 'admin' : 'exam')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrapper">
            <Gauge className="brand-icon" size={26} />
          </div>
          <div className="brand-text">
            <div className="brand-title">מִבְחָנָן</div>
            <div className="brand-subtitle">מכשור ובקרה תעשייתית</div>
          </div>
        </div>

        {/* Center: Live Timer if in Exam */}
        {isExamActive && !user?.isAdmin && (
          <div className="exam-timer-badge" id="exam-timer">
            <Clock size={18} className="timer-icon" />
            <span className="timer-label">זמן בחינה:</span>
            <span className="timer-value">{formatTime(elapsedSeconds)}</span>
          </div>
        )}

        {/* User Info & Navigation Actions */}
        <div className="nav-actions">
          {user && (
            <div className="user-profile-chip" id="user-profile-badge">
              <div className="user-avatar">
                <User size={16} />
              </div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-meta">{user.department} • מ.א: {user.id}</div>
              </div>
            </div>
          )}

          {/* View Switchers */}
          {user && (
            <div className="nav-buttons">
              {!user.isAdmin && (
                <button 
                  id="btn-nav-exam"
                  className={`nav-tab-btn ${currentView === 'exam' || currentView === 'results' ? 'active' : ''}`}
                  onClick={() => onNavigate('exam')}
                >
                  <FileText size={17} />
                  <span>מבחן</span>
                </button>
              )}

              {user.isAdmin && (
                <button 
                  id="btn-nav-admin"
                  className={`nav-tab-btn ${currentView === 'admin' ? 'active' : ''}`}
                  onClick={() => onNavigate('admin')}
                >
                  <LayoutDashboard size={17} />
                  <span>ניהול מערכת</span>
                </button>
              )}

              <button 
                id="btn-nav-logout"
                className="nav-tab-btn logout-btn" 
                onClick={onLogout} 
                title="התנתקות מהמערכת"
              >
                <LogOut size={17} />
                <span>יציאה</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
