import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Edit3 } from 'lucide-react';

export default function EditEmployeeModal({
  employee,
  onClose,
  onSave,
  generateRandomPassword
}) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('מכשיריית חומר גלם');
  const [role, setRole] = useState('מכשירן');
  const [level, setLevel] = useState(2);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setUsername(employee.username || employee.name || '');
      setPassword(employee.password === '—' ? '' : (employee.password || ''));
      setDepartment(employee.department || 'מכשיריית חומר גלם');
      setRole(employee.role || 'מכשירן');
      setLevel(employee.level || 2);
      setIsAdmin(Boolean(employee.isAdmin));
    }
  }, [employee]);

  if (!employee) return null;

  const isPrimaryAdmin = String(employee.id).trim() === 'admin' || String(employee.id).trim() === '9999';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(employee.id, {
        name: name.trim(),
        username: username.trim() || name.trim(),
        password: password.trim() || undefined,
        department,
        role: role.trim() || 'מכשירן',
        level: parseInt(level, 10) || 2,
        isAdmin: isPrimaryAdmin ? true : Boolean(isAdmin)
      });
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop fade-in" id="modal-edit-emp-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={18} className="text-cyan" />
            <h3 className="modal-title">עריכת פרטי עובד ({employee.id})</h3>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            title="סגור חלון"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">שם העובד</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">שם משתמש לכניסה</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>סיסמה אישית</label>
              {generateRandomPassword && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPassword(generateRandomPassword())}
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                >
                  <Sparkles size={12} />
                  <span>ייצר סיסמה חדשה</span>
                </button>
              )}
            </div>
            <input
              type="text"
              className="form-input font-mono"
              placeholder="השאר ריק כדי לשמור על הסיסמה הקיימת..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">מחלקה / מכשיריה</label>
            <select
              className="form-input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="מכשיריית חומר גלם">מכשיריית חומר גלם</option>
              <option value="מכשיריית אשלג ב'">מכשיריית אשלג ב'</option>
              <option value="מכשיריית ברום / כלור">מכשיריית ברום / כלור</option>
              <option value="מכשיריית גלעון">מכשיריית גלעון</option>
              <option value="מכשיריית מלחים">מכשיריית מלחים</option>
              <option value="מכשיריית מקלף">מכשיריית מקלף</option>
              <option value="מכשיריית תחנת כוח">מכשיריית תחנת כוח</option>
              <option value="הנדסת מכשור">הנדסת מכשור</option>
              <option value="מסגריית מכשור">מסגריית מכשור</option>
              <option value="הנהלת מכשור ובקרה">הנהלת מכשור ובקרה</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">תפקיד</label>
            <input
              type="text"
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">רמת מבחן מותאמת (1-3)</label>
            <div className="level-select-group">
              {[1, 2, 3].map((lvl) => (
                <label key={lvl} className={`level-radio-pill ${level === lvl ? `active-level-${lvl}` : ''}`}>
                  <input
                    type="radio"
                    name="editEmpLevelChoice"
                    value={lvl}
                    checked={level === lvl}
                    onChange={() => setLevel(lvl)}
                  />
                  <span>
                    {lvl === 1 ? 'רמה 1 - מתחיל' : lvl === 2 ? 'רמה 2 - בינוני' : 'רמה 3 - מתקדם'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {!isPrimaryAdmin && (
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem' }}>
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)' }}
                />
                <span>הענק הרשאות ניהול (Admin)</span>
              </label>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              ביטול
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'שומר שינויים...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

