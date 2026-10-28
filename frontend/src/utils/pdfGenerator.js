import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// HTML Entity Escaping (SEC-06: Prevents DOM-Based XSS in client PDF renderer)
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates an official examination PDF report for a completed or saved exam.
 * 
 * @param {Object} resultData - The exam result data with review, employee info, and scores.
 * @param {Object} options - Options { autoDownload, uploadToServer }
 * @returns {Promise<{ success: boolean, pdfBase64?: string, filename?: string }>}
 */
export async function generateAndSaveExamPdf(resultData, options = {}) {
  const { autoDownload = true, uploadToServer = true } = options;

  if (!resultData) {
    throw new Error('Missing resultData for PDF generation');
  }

  const {
    id,
    employeeId = 'עובד',
    employeeName = 'נבחן',
    department = 'מכשור ובקרה',
    submittedAt = new Date().toISOString(),
    score = 0,
    totalQuestions = 0,
    correctCount = 0,
    timeSpentSeconds = 0,
    review = []
  } = resultData;

  const passed = score >= 70;
  const dateObj = new Date(submittedAt);
  const dateFormatted = dateObj.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');

  const timeFormatted = dateObj.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const durationStr = timeSpentSeconds
    ? `${Math.floor(timeSpentSeconds / 60)} דק' ו-${timeSpentSeconds % 60} שניות`
    : 'לא נמדד';

  const cleanEmpName = String(employeeName).replace(/[^a-zA-Z0-9_\u0590-\u05FF-]/g, '_');
  const filename = `דוח_מבחן_${cleanEmpName}_${dateFormatted}.pdf`;

  // Create temporary container for PDF rendering
  const container = document.createElement('div');
  container.setAttribute('dir', 'rtl');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '820px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Assistant', 'Segoe UI', Tahoma, Arial, sans-serif";
  container.style.padding = '32px 36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-1000';

  const letters = ['א', 'ב', 'ג', 'ד'];

  container.innerHTML = `
    <div style="border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 22px; font-weight: 800; color: #0284c7; margin-bottom: 4px;">
          מִבְחָנָן • דוח תוצאות ותחקיר מבחן תקופתי
        </div>
        <div style="font-size: 13px; color: #64748b;">
          מערכת מוסמכת למבחני כשירות במכשור ובקרה | תקני ISA-5.1 ו-IEC 61508
        </div>
      </div>
      <div style="padding: 8px 18px; border-radius: 9999px; font-size: 15px; font-weight: 700; ${
        passed
          ? 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;'
          : 'background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;'
      }">
        ${passed ? '✓ עבר בהצלחה' : '✗ נכשל במבחן'}
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
      <div><span style="color: #64748b;">שם הנבחן:</span> <strong>${escapeHtml(employeeName)}</strong></div>
      <div><span style="color: #64748b;">מספר אישי:</span> <strong>${escapeHtml(employeeId)}</strong></div>
      <div><span style="color: #64748b;">מחלקה / יחידה:</span> <strong>${escapeHtml(department)}</strong></div>
      <div><span style="color: #64748b;">תאריך ביצוע:</span> <strong>${escapeHtml(dateFormatted)} ${escapeHtml(timeFormatted)}</strong></div>
      <div><span style="color: #64748b;">משך בחינה:</span> <strong>${escapeHtml(durationStr)}</strong></div>
      <div><span style="color: #64748b;">מזהה מערכת:</span> <span style="font-family: monospace; font-size: 11px;">${escapeHtml(id || '—')}</span></div>
    </div>

    <div style="display: flex; justify-content: space-around; align-items: center; border: 2px solid ${
      passed ? '#22c55e' : '#ef4444'
    }; background: #ffffff; padding: 14px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
      <div>
        <div style="font-size: 32px; font-weight: 800; color: ${passed ? '#15803d' : '#b91c1c'};">${Number(score) || 0}%</div>
        <div style="font-size: 12px; color: #64748b; font-weight: 600;">ציון סופי</div>
      </div>
      <div style="width: 1px; height: 36px; background: #e2e8f0;"></div>
      <div>
        <div style="font-size: 26px; font-weight: 700; color: #0284c7;">${Number(correctCount) || 0} / ${Number(totalQuestions) || 0}</div>
        <div style="font-size: 12px; color: #64748b; font-weight: 600;">תשובות נכונות</div>
      </div>
      <div style="width: 1px; height: 36px; background: #e2e8f0;"></div>
      <div>
        <div style="font-size: 26px; font-weight: 700; color: ${totalQuestions - correctCount > 0 ? '#b91c1c' : '#15803d'};">
          ${(Number(totalQuestions) || 0) - (Number(correctCount) || 0)}
        </div>
        <div style="font-size: 12px; color: #64748b; font-weight: 600;">שגויות / לא נענו</div>
      </div>
    </div>

    <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">
      תחקיר מקצועי של שאלות המבחן (${review.length})
    </div>

    <div>
      ${review.map((q, idx) => {
        const isCorrect = q.isCorrect;
        return `
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px; background: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12px;">
              <span style="font-weight: 700; color: #334155;">שאלה ${idx + 1} מתוך ${review.length}</span>
              <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
                ${escapeHtml(q.topic || 'מכשור ובקרה')}
              </span>
              <span style="font-weight: 700; color: ${isCorrect ? '#16a34a' : '#dc2626'};">
                ${isCorrect ? '✓ תשובה נכונה' : '✗ תשובה שגויה'}
              </span>
            </div>

            <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 10px; line-height: 1.4;">
              ${escapeHtml(q.question)}
            </div>

            <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px;">
              ${(q.options || []).map((opt, optIdx) => {
                const isSelected = q.selectedAnswer === optIdx;
                const isAnswerCorrect = q.correctAnswer === optIdx;
                let bg = '#f8fafc';
                let border = '#e2e8f0';
                let text = '#334155';
                let tag = '';

                if (isAnswerCorrect) {
                  bg = '#dcfce7';
                  border = '#86efac';
                  text = '#14532d';
                  tag = ' <span style="color: #15803d; font-weight: 700;">(תשובה נכונה ✓)</span>';
                }
                if (isSelected && !isAnswerCorrect) {
                  bg = '#fee2e2';
                  border = '#fca5a5';
                  text = '#7f1d1d';
                  tag = ' <span style="color: #b91c1c; font-weight: 700;">(תשובתך - שגויה ✗)</span>';
                } else if (isSelected && isAnswerCorrect) {
                  tag += ' <span style="color: #15803d; font-weight: 700;">(בחירתך)</span>';
                }

                return `
                  <div style="padding: 7px 12px; border-radius: 6px; font-size: 12px; border: 1px solid ${border}; background: ${bg}; color: ${text};">
                    <strong>${letters[optIdx]}.</strong> ${escapeHtml(opt)} ${tag}
                  </div>
                `;
              }).join('')}
            </div>

            ${q.explanation ? `
              <div style="background: #eff6ff; border-right: 3px solid #3b82f6; padding: 8px 12px; border-radius: 4px; font-size: 11.5px; color: #1e40af; line-height: 1.4;">
                <strong>💡 הסבר טכני:</strong> ${escapeHtml(q.explanation)}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>

    <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px;">
      הופק אוטומטית ע"י מערכת מִבְחָנָן • ${escapeHtml(dateFormatted)} ${escapeHtml(timeFormatted)} • מזהה אימות דיגיטלי: ${escapeHtml(id || '000')}
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 1.8,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const pdfBase64 = pdf.output('datauristring');

    // 1. Auto download to browser
    if (autoDownload) {
      pdf.save(filename);
    }

    // 2. Upload to backend for permanent archive
    let token = null;
    try {
      const savedUser = sessionStorage.getItem('mivhanan_user');
      token = savedUser ? JSON.parse(savedUser)?.token : null;
    } catch {}

    if (uploadToServer && id) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        await fetch(`/api/results/${id}/pdf`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ pdfBase64 })
        });
      } catch (uploadErr) {
        console.warn('PDF server archive upload warning:', uploadErr);
      }
    }

    return {
      success: true,
      pdfBase64,
      filename
    };
  } catch (error) {
    console.error('Error in generateAndSaveExamPdf:', error);
    // If client generation fails, fallback to server printable view via Authorization header (SEC-09)
    if (id && autoDownload) {
      try {
        const savedUser = sessionStorage.getItem('mivhanan_user');
        const token = savedUser ? JSON.parse(savedUser)?.token : null;
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const repRes = await fetch(`/api/results/${id}/report?print=1`, { headers });
        if (repRes.ok) {
          const htmlBlob = await repRes.blob();
          const blobUrl = URL.createObjectURL(htmlBlob);
          window.open(blobUrl, '_blank');
        }
      } catch {}
    }
    return { success: false, error: error.message };
  } finally {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
