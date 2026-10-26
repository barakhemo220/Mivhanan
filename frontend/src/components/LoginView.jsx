import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck 
} from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdminAttempt = employeeId.trim() === '9999' || name.trim() === 'מנהל מערכת';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !employeeId.trim()) {
      setError('אנא מלא את שני השדות: שם מלא ומספר אישי');
      return;
    }

    if (isAdminAttempt && !password.trim()) {
      setError('כניסת מנהל מערכת דורשת סיסמה מאובטחת');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          employeeId: employeeId.trim(),
          password: password.trim()
        })
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
              placeholder="לדוגמה: ישראל ישראלי או מנהל מערכת"
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

          {/* Admin Password Field - Displays when Admin ID 9999 or Admin name is entered */}
          {isAdminAttempt && (
            <div className="form-group fade-in" id="admin-password-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="input-admin-password" className="form-label" style={{ margin: 0 }}>
                  סיסמת מנהל מערכת (Admin)
                </label>
                <span className="badge-admin-security">
                  <ShieldCheck size={13} />
                  <span>אבטחת ניהול</span>
                </span>
              </div>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-admin-password"
                  className="form-input"
                  placeholder="הזן סיסמת מנהל מערכת..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  title={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

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
                <span>{isAdminAttempt ? 'כניסה לממשק ניהול' : 'כניסה למבחן התקופתי'}</span>
                <ArrowLeft size={18} />
              </>
            )}
          </button>
        </form>

        {/* Information points */}
        <div className="login-features-list">
          <div className="feature-item">
            <CheckCircle2 size={16} className="feature-icon" />
            <span>הגרלה אקראית של שאלות מתוך בנק מבחנים מאובטח ב-Backend</span>
          </div>
          <div className="feature-item">
            <CheckCircle2 size={16} className="feature-icon" />
            <span>תזמון תקופתי מובנה לכל 4 חודשים לפי תקני המפעל</span>
          </div>
          <div className="feature-item">
            <CheckCircle2 size={16} className="feature-icon" />
            <span>הפקה ושמירה אוטומטית של קובץ דוח PDF מלא בסיום הבחינה</span>
          </div>
          <div className="feature-item">
            <CheckCircle2 size={16} className="feature-icon" />
            <span>תרשימים טכניים מוגדלים (ISA-5.1, ATEX, SIL, שקילה ובקרים)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
