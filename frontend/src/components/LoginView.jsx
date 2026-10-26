import React, { useState } from 'react';
import { Gauge, ArrowLeft, ShieldAlert, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !employeeId.trim()) {
      setError('אנא מלא את שני השדות: שם מלא ומספר אישי');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), employeeId: employeeId.trim() })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'פרטי הזיהוי אינם תואמים');
      }

      onLoginSuccess(data.employee);
    } catch (err) {
      setError(err.message || 'שגיאה בהתחברות לשרת');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickName, quickId) => {
    setName(quickName);
    setEmployeeId(quickId);
    setError('');
  };

  return (
    <div className="login-page-container fade-in" id="login-container">
      {/* Background decoration elements */}
      <div className="login-bg-glow glow-1"></div>
      <div className="login-bg-glow glow-2"></div>

      <div className="login-card glass-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon-badge">
            <Cpu size={32} className="login-badge-icon" />
          </div>
          <h1 className="login-title">מערכת מבחנים תקופתיים</h1>
          <p className="login-subtitle">
            פלטפורמת הערכה והסמכה מקצועית בתחום <span className="highlight-text">מכשור ובקרה</span>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-box alert-error fade-in" id="login-error-alert">
            <ShieldAlert size={20} className="alert-icon" />
            <div className="alert-text">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="input-employee-name" className="form-label">
              שם מלא של העובד
            </label>
            <input
              type="text"
              id="input-employee-name"
              className="form-input"
              placeholder="לדוגמה: ישראל ישראלי"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="input-employee-id" className="form-label">
              מספר אישי (מ.א)
            </label>
            <input
              type="text"
              id="input-employee-id"
              className="form-input"
              placeholder="לדוגמה: 1001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              autoComplete="off"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            id="btn-login-submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-spinner">מאמת נתונים...</span>
            ) : (
              <>
                <span>כניסה למבחן התקופתי</span>
                <ArrowLeft size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Selector */}
        <div className="quick-login-section">
          <div className="quick-login-title">
            <Sparkles size={14} />
            <span>כניסה מהירה לבדיקה והתרשמות:</span>
          </div>
          <div className="quick-chips-grid">
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleQuickLogin('ברק חמו', '134168')}
            >
              <strong>ברק חמו</strong> (134168) - מכשירן חומר גלם
            </button>
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleQuickLogin('הרצל ביתן', '9430')}
            >
              <strong>הרצל ביתן</strong> (9430) - מנהל חומר גלם
            </button>
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleQuickLogin('ניר אבוטבול', '128704')}
            >
              <strong>ניר אבוטבול</strong> (128704) - מנהל אשלג ב'
            </button>
            <button
              type="button"
              className="quick-chip admin-chip"
              onClick={() => handleQuickLogin('מנהל מערכת', '9999')}
            >
              <strong>מנהל מערכת</strong> (9999) - גישת Admin
            </button>
          </div>
        </div>

        {/* Information points */}
        <div className="login-features-list">
          <div className="feature-item">
            <CheckCircle2 size={16} className="feature-icon" />
            <span>הגרלה אקראית של שאלות מתוך בנק מבחנים ב-Backend</span>
          </div>
          <div className="feature-item">
            <CheckCircle2 size={16} className="feature-icon" />
            <span>ניווט חופשי, חזרה לשאלות קודמות ולוח מקשים חכם</span>
          </div>
          <div className="feature-item">
            <CheckCircle2 size={16} className="feature-icon" />
            <span>תרשימים טכניים מוגדלים (P&ID, אקטואטורים, PID, FSK)</span>
          </div>
          <div className="feature-item">
            <CheckCircle2 size={16} className="feature-icon" />
            <span>חישוב ציון מיידי ותחקיר טכני מעמיק בסיום הבחינה</span>
          </div>
        </div>
      </div>
    </div>
  );
}
