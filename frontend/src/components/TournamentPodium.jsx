import React from 'react';
import { Award, Sparkles, Users, CheckCircle2, Zap } from 'lucide-react';

export default function TournamentPodium({ tournament, leaderboard }) {
  if (!leaderboard) return null;

  const { highestScore, podium = [], departmentStandings = [] } = leaderboard;

  const firstPlace = podium.find(p => p.rank === 1) || null;
  const secondPlace = podium.find(p => p.rank === 2) || null;
  const thirdPlace = podium.find(p => p.rank === 3) || null;

  // Deterministic confetti particles for festive celebration
  const confettiPieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 4.2 + 2) % 98}%`,
    delay: `${(i % 7) * 0.35}s`,
    duration: `${3.2 + (i % 4) * 0.6}s`,
    color: ['#f59e0b', '#10b981', '#4f46e5', '#06b6d4', '#ec4899', '#eab308'][i % 6]
  }));

  return (
    <div className="tournament-arena-card fade-in" id="tournament-results-arena">
      {/* Animated Confetti Layer */}
      <div className="tournament-confetti-layer" aria-hidden="true">
        {confettiPieces.map(piece => (
          <span
            key={piece.id}
            className="confetti-dot"
            style={{
              left: piece.left,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              backgroundColor: piece.color
            }}
          />
        ))}
      </div>

      {/* Arena Header */}
      <div className="tournament-arena-header">
        <div className="arena-crown-badge">
          <Sparkles size={18} />
          <span>תוצאות רשמיות • {tournament?.title || 'אליפות המכשור והבקרה'}</span>
          <Sparkles size={18} />
        </div>
        <h2 className="arena-main-title">🏆 בימת המנצחים ושיאי הטורניר 🏆</h2>
        {tournament?.startDateFormatted && tournament?.endDateFormatted && (
          <p className="arena-dates-sub">
            מחזור תחרות: {tournament.startDateFormatted} – {tournament.endDateFormatted}
          </p>
        )}
      </div>

      <div className="tournament-criteria-grid">
        {/* Criterion 1: Highest Score in the Tournament (Anonymous: Score + Department Only) */}
        <div className="criterion-record-card">
          <div className="record-trophy-orb">
            <span className="trophy-emoji" role="img" aria-label="גביע">🏆</span>
          </div>
          <div className="record-badge-tag">קריטריון 1 • שיא הטורניר האישי</div>
          <h3 className="record-card-title">הציון הגבוה ביותר בטורניר</h3>

          {highestScore ? (
            <>
              <div className="record-score-giant" id="tournament-highest-score">
                {highestScore.score}%
              </div>
              <div className="record-dept-banner">
                <Zap size={16} />
                <span>נציג/ת {highestScore.department}</span>
              </div>
              <p className="record-privacy-note">
                שיא הציון נקבע במבחן הרשמי של הטורניר (ללא חשיפת שמות לשמירה על אנונימיות מלאה)
              </p>
            </>
          ) : (
            <div className="record-empty-state">
              טרם הוגשו מבחנים בטורניר זה
            </div>
          )}
        </div>

        {/* Criterion 2: 1st, 2nd, 3rd Place Departments Podium */}
        <div className="criterion-podium-card">
          <div className="record-badge-tag podium-tag">קריטריון 2 • דירוג מכשיריות מצטיינות</div>
          <h3 className="record-card-title">פודיום המכשיריות המובילות (ממוצע כלל העובדים הפעילים)</h3>

          {podium.length === 0 ? (
            <div className="record-empty-state">
              אין עדיין נתוני דירוג למכשיריות בטורניר הנוכחי
            </div>
          ) : (
            <div className="olympic-podium-stage">
              {/* 2nd Place (Right/Left of Center) */}
              <div className={`podium-column place-2 ${!secondPlace ? 'podium-empty' : ''}`}>
                {secondPlace ? (
                  <>
                    <div className="podium-medal-icon">🥈</div>
                    <div className="podium-dept-name">{secondPlace.department}</div>
                    <div className="podium-avg-pill silver-pill">
                      ממוצע: {secondPlace.averageScore}%
                    </div>
                    <div className="podium-meta-sub">
                      <Users size={12} />
                      <span>{secondPlace.completedCount}/{secondPlace.activeCount} ביצעו</span>
                    </div>
                  </>
                ) : (
                  <div className="podium-placeholder">—</div>
                )}
                <div className="podium-pedestal pedestal-silver">
                  <span className="pedestal-rank-num">2</span>
                  <span className="pedestal-rank-label">מקום שני</span>
                </div>
              </div>

              {/* 1st Place (Center, Tallest) */}
              <div className={`podium-column place-1 ${!firstPlace ? 'podium-empty' : ''}`}>
                {firstPlace ? (
                  <>
                    <div className="podium-crown-top">👑</div>
                    <div className="podium-medal-icon medal-lg">🥇</div>
                    <div className="podium-dept-name dept-winner">{firstPlace.department}</div>
                    <div className="podium-avg-pill gold-pill">
                      ממוצע: {firstPlace.averageScore}%
                    </div>
                    <div className="podium-meta-sub">
                      <Users size={12} />
                      <span>{firstPlace.completedCount}/{firstPlace.activeCount} ביצעו</span>
                    </div>
                  </>
                ) : (
                  <div className="podium-placeholder">—</div>
                )}
                <div className="podium-pedestal pedestal-gold">
                  <span className="pedestal-rank-num">1</span>
                  <span className="pedestal-rank-label">מקום ראשון</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className={`podium-column place-3 ${!thirdPlace ? 'podium-empty' : ''}`}>
                {thirdPlace ? (
                  <>
                    <div className="podium-medal-icon">🥉</div>
                    <div className="podium-dept-name">{thirdPlace.department}</div>
                    <div className="podium-avg-pill bronze-pill">
                      ממוצע: {thirdPlace.averageScore}%
                    </div>
                    <div className="podium-meta-sub">
                      <Users size={12} />
                      <span>{thirdPlace.completedCount}/{thirdPlace.activeCount} ביצעו</span>
                    </div>
                  </>
                ) : (
                  <div className="podium-placeholder">—</div>
                )}
                <div className="podium-pedestal pedestal-bronze">
                  <span className="pedestal-rank-num">3</span>
                  <span className="pedestal-rank-label">מקום שלישי</span>
                </div>
              </div>
            </div>
          )}

          <div className="podium-formula-note">
            <Award size={15} />
            <span>
              הממוצע מחושב לפי סך כל העובדים הפעילים (דלוקים) בכל מכשירייה – עובד פעיל שלא ביצע את המבחן נספר כ-0 בממוצע המכשירייה.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
