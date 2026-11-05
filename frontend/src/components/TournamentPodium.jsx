import React from 'react';
import { Award, Sparkles, Users, Trophy, Zap } from 'lucide-react';

export default function TournamentPodium({ tournament, leaderboard }) {
  const lb = leaderboard || tournament?.leaderboard || tournament || {};

  const highestScore = lb.highestScore || null;
  const podium = Array.isArray(lb.podium) ? lb.podium : [];

  const firstPlace = podium.find(p => p.rank === 1) || podium[0] || null;
  const secondPlace = podium.find(p => p.rank === 2) || podium[1] || null;
  const thirdPlace = podium.find(p => p.rank === 3) || podium[2] || null;

  // Deterministic confetti particles for festive celebration
  const confettiPieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 4.2 + 2) % 98}%`,
    delay: `${(i % 7) * 0.35}s`,
    duration: `${3.2 + (i % 4) * 0.6}s`,
    colorClass: `confetti-${i % 5}`
  }));

  return (
    <div className="tournament-arena-card fade-in" id="tournament-results-arena">
      {/* Animated Confetti Layer */}
      <div className="tournament-confetti-layer" aria-hidden="true">
        {confettiPieces.map(piece => (
          <span
            key={piece.id}
            className={`confetti-dot ${piece.colorClass}`}
            style={{
              left: piece.left,
              animationDelay: piece.delay,
              animationDuration: piece.duration
            }}
          />
        ))}
      </div>

      {/* Arena Header */}
      <div className="tournament-arena-header">
        <div className="tournament-crown-badge">
          <Sparkles size={16} />
          <span>תוצאות רשמיות • {tournament?.title || 'אליפות המכשור והבקרה'}</span>
          <Sparkles size={16} />
        </div>
        <h2 className="tournament-arena-title">🏆 בימת המנצחים ושיאי הטורניר 🏆</h2>
        {tournament?.startDateFormatted && tournament?.endDateFormatted ? (
          <p className="tournament-arena-subtitle">
            מחזור תחרות: {tournament.startDateFormatted} – {tournament.endDateFormatted}
          </p>
        ) : (
          <p className="tournament-arena-subtitle">
            סיכום הישגי הטורניר ודירוג המכשיריות המובילות
          </p>
        )}
      </div>

      <div className="tournament-criteria-grid">
        {/* Criterion 1: Highest Score in the Tournament (Anonymous: Score + Department Only) */}
        <div className="tournament-criterion-card criterion-record-card">
          <div>
            <div className="criterion-header-tag">
              <Zap size={14} />
              <span>קריטריון 1 • שיא הטורניר</span>
            </div>
            <h3 className="criterion-title">הציון הגבוה ביותר בטורניר</h3>
          </div>

          {highestScore ? (
            <div className="record-showcase-box">
              <div className="record-trophy-circle">
                <Trophy size={38} />
              </div>
              <div className="record-score-giant" id="tournament-highest-score">
                {highestScore.score}
              </div>
              <div className="record-dept-pill">
                <Sparkles size={15} />
                <span>נציג/ת {highestScore.department}</span>
              </div>
              <p className="record-privacy-note">
                שיא הציון נקבע במבחן הטורניר (ללא חשיפת שמות לשמירה על אנונימיות מלאה)
              </p>
            </div>
          ) : (
            <div className="record-empty-box">
              <Trophy size={32} />
              <span>טרם הוגשו מבחנים בטורניר זה</span>
            </div>
          )}
        </div>

        {/* Criterion 2: 1st, 2nd, 3rd Place Departments Podium */}
        <div className="tournament-criterion-card criterion-podium-card">
          <div>
            <div className="criterion-header-tag">
              <Award size={14} />
              <span>קריטריון 2 • דירוג מכשיריות מצטיינות</span>
            </div>
            <h3 className="criterion-title">מקום ראשון, שני ושלישי – ממוצע הציונים הגבוה ביותר</h3>
          </div>

          {podium.length === 0 ? (
            <div className="record-empty-box">
              <span>אין עדיין נתוני דירוג למכשיריות בטורניר הנוכחי</span>
            </div>
          ) : (
            <div className="olympic-podium-stage">
              {/* 2nd Place */}
              <div className="podium-column podium-silver">
                <div className="podium-dept-card">
                  <div className="podium-medal-emoji">🥈</div>
                  <div className="podium-place-label">מקום שני</div>
                  <div className="podium-dept-name">
                    {secondPlace ? secondPlace.department : '—'}
                  </div>
                  <div className="podium-avg-score">
                    {secondPlace ? secondPlace.averageScore : '—'}
                  </div>
                  <div className="podium-avg-caption">ממוצע מכשירייה</div>
                  {secondPlace && (
                    <span className="podium-participation-pill">
                      {secondPlace.completedCount}/{secondPlace.activeCount} ביצעו
                    </span>
                  )}
                </div>
                <div className="podium-pedestal">2</div>
              </div>

              {/* 1st Place (Center, Tallest) */}
              <div className="podium-column podium-gold">
                <div className="podium-dept-card">
                  <div className="podium-medal-emoji">👑 🥇</div>
                  <div className="podium-place-label">מקום ראשון</div>
                  <div className="podium-dept-name">
                    {firstPlace ? firstPlace.department : '—'}
                  </div>
                  <div className="podium-avg-score">
                    {firstPlace ? firstPlace.averageScore : '—'}
                  </div>
                  <div className="podium-avg-caption">ממוצע מכשירייה</div>
                  {firstPlace && (
                    <span className="podium-participation-pill">
                      {firstPlace.completedCount}/{firstPlace.activeCount} ביצעו
                    </span>
                  )}
                </div>
                <div className="podium-pedestal">1</div>
              </div>

              {/* 3rd Place */}
              <div className="podium-column podium-bronze">
                <div className="podium-dept-card">
                  <div className="podium-medal-emoji">🥉</div>
                  <div className="podium-place-label">מקום שלישי</div>
                  <div className="podium-dept-name">
                    {thirdPlace ? thirdPlace.department : '—'}
                  </div>
                  <div className="podium-avg-score">
                    {thirdPlace ? thirdPlace.averageScore : '—'}
                  </div>
                  <div className="podium-avg-caption">ממוצע מכשירייה</div>
                  {thirdPlace && (
                    <span className="podium-participation-pill">
                      {thirdPlace.completedCount}/{thirdPlace.activeCount} ביצעו
                    </span>
                  )}
                </div>
                <div className="podium-pedestal">3</div>
              </div>
            </div>
          )}

          <p className="podium-rule-footnote">
            * ממוצע כל מכשירייה מחושב לפי סך העובדים הפעילים (דלוקים) באותה מכשירייה.
          </p>
        </div>
      </div>
    </div>
  );
}

