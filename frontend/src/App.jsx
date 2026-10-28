import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginView from './components/LoginView';
import ExamView from './components/ExamView';
import ResultsView from './components/ResultsView';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('mivhanan_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('mivhanan_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed.isAdmin ? 'admin' : 'exam';
      }
      return 'login';
    } catch {
      return 'login';
    }
  });

  const [examStartTime, setExamStartTime] = useState(() => Date.now());
  const [lastResult, setLastResult] = useState(null);
  const [isExamRunning, setIsExamRunning] = useState(false);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('mivhanan_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('mivhanan_user');
    }
  }, [user]);

  const handleLoginSuccess = (employee) => {
    setUser(employee);
    setExamStartTime(Date.now());
    if (employee.isAdmin) {
      setCurrentView('admin');
    } else {
      setCurrentView('exam');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLastResult(null);
    setIsExamRunning(false);
    setCurrentView('login');
    sessionStorage.removeItem('mivhanan_user');
  };

  const handleExamComplete = (resultData) => {
    setLastResult(resultData);
    setIsExamRunning(false);
    setCurrentView('results');
  };

  const handleRetakeExam = () => {
    setLastResult(null);
    setExamStartTime(Date.now());
    setCurrentView('exam');
  };

  // CR-02: Reset examStartTime when the exam actually starts (not while waiting in lobby)
  const handleActiveExamRunning = (isRunning, customStartTime = null) => {
    setIsExamRunning(prev => {
      if (isRunning && (!prev || customStartTime)) {
        setExamStartTime(customStartTime || Date.now());
      }
      return isRunning;
    });
  };

  const handleNavigate = (view) => {
    // Admin users only access admin dashboard, never take exams
    if (user?.isAdmin && (view === 'exam' || view === 'results')) {
      setCurrentView('admin');
      return;
    }
    if (view === 'admin' && !user?.isAdmin) {
      setCurrentView('exam');
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="app-layout" id="app-root-layout">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentView={currentView}
        onNavigate={handleNavigate}
        examStartTime={examStartTime}
        isExamActive={Boolean(user && currentView === 'exam' && isExamRunning)}
      />

      {/* Main Content Area */}
      <main className="main-content-viewport" id="main-viewport">
        {currentView === 'login' && (
          <LoginView onLoginSuccess={handleLoginSuccess} />
        )}

        {currentView === 'exam' && user && !user.isAdmin && (
          <ExamView
            user={user}
            onExamComplete={handleExamComplete}
            examStartTime={examStartTime}
            onLogout={handleLogout}
            onActiveExamRunning={handleActiveExamRunning}
          />
        )}

        {currentView === 'results' && user && lastResult && (
          <ResultsView
            resultData={lastResult}
            user={user}
            onRetakeExam={handleRetakeExam}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'admin' && user?.isAdmin && (
          <AdminDashboard
            user={user}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer no-print">
        <div className="footer-content">
          <span>מִבְחָנָן • פלטפורמת מבחנים תקופתיים במכשור ובקרה</span>
          <span className="footer-separator">•</span>
          <span>גרסה 2.4 תעשייתית</span>
          <span className="footer-separator">•</span>
          <span className="footer-company">תקני ISA-5.1 ו-IEC 61508</span>
        </div>
      </footer>
    </div>
  );
}
