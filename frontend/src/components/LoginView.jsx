import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Cpu, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('אנא מלא את שני השדות: שם משתמש וסיסמה');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(),
          name: username.trim(),
          password: password.trim(),
          employeeId: password.trim()
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'שם משתמש או סיסמה שגויים');
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
              שם משתמש
            </label>
            <input
              type="text"
              id="input-employee-name"
              className="form-input"
              placeholder=""
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="input-employee-id" className="form-label">
              סיסמה
            </label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="input-employee-id"
                className="form-input"
                placeholder=""
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
                <span>כניסה למערכת</span>
                <ArrowLeft size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
