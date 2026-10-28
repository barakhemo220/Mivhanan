import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getAuthHeaders, openAuthenticatedBlobInNewTab } from './authClient';

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
    <div class="pdf-block">
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
    </div>

    <div>
      ${review.map((q, idx) => {
        const isCorrect = q.isCorrect;
        return `
          <div class="pdf-block" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px; background: #ffffff;">
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

            ${q.image ? `
              <div style="margin: 8px 0 12px; text-align: center;">
                <img src="${escapeHtml(q.image)}" crossorigin="anonymous" alt="תרשים" style="max-width: 100%; max-height: 190px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px; background: #fff;" />
              </div>
            ` : ''}

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

    <div class="pdf-block" style="margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px;">
      הופק אוטומטית ע"י מערכת מִבְחָנָן • ${escapeHtml(dateFormatted)} ${escapeHtml(timeFormatted)} • מזהה אימות דיגיטלי: ${escapeHtml(id || '000')}
    </div>
  `;

  document.body.appendChild(container);

  try {
    const scale = 1.8;
    const canvas = await html2canvas(container, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const pageWidthMm = 210; // A4 width in mm
    const pageHeightMm = 297; // A4 height in mm
    const marginTopMm = 10;
    const marginBottomMm = 10;
    const usablePageHeightMm = pageHeightMm - marginTopMm - marginBottomMm;

    // Convert mm to canvas pixels
    const pxPerMm = canvas.width / pageWidthMm;
    const maxPageHeightPx = Math.floor(usablePageHeightMm * pxPerMm);

    // CR-09: Measure DOM block boundaries so question cards are never sliced in half across pages
    const containerRect = container.getBoundingClientRect();
    const blockElements = Array.from(container.querySelectorAll('.pdf-block'));
    const blockBottomsPx = blockElements.map(el => {
      const r = el.getBoundingClientRect();
      return Math.min(canvas.height, Math.ceil((r.bottom - containerRect.top) * scale));
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    let currentTopPx = 0;
    let pageIndex = 0;

    while (currentTopPx < canvas.height - 2) {
      let sliceBottomPx = Math.min(canvas.height, currentTopPx + maxPageHeightPx);

      if (sliceBottomPx < canvas.height) {
        // Find the last block that ends at or before sliceBottomPx
        const fittingBottoms = blockBottomsPx.filter(b => b > currentTopPx + 40 && b <= sliceBottomPx);
        if (fittingBottoms.length > 0) {
          sliceBottomPx = fittingBottoms[fittingBottoms.length - 1];
        }
      }

      const sliceHeightPx = sliceBottomPx - currentTopPx;
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      const pageCtx = pageCanvas.getContext('2d');
      pageCtx.fillStyle = '#ffffff';
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageCtx.drawImage(canvas, 0, currentTopPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

      const sliceHeightMm = sliceHeightPx / pxPerMm;
      const sliceImgData = pageCanvas.toDataURL('image/jpeg', 0.94);

      if (pageIndex > 0) {
        pdf.addPage();
      }
      pdf.addImage(sliceImgData, 'JPEG', 0, marginTopMm, pageWidthMm, sliceHeightMm);

      currentTopPx = sliceBottomPx;
      pageIndex++;
    }

    const pdfBase64 = pdf.output('datauristring');

    // 1. Auto download to browser
    if (autoDownload) {
      pdf.save(filename);
    }

    // 2. Upload to backend for permanent archive
    if (uploadToServer && id) {
      try {
        await fetch(`/api/results/${id}/pdf`, {
          method: 'POST',
          headers: getAuthHeaders(null, { 'Content-Type': 'application/json' }),
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
        await openAuthenticatedBlobInNewTab(`/api/results/${id}/report?print=1`, null, 'text/html;charset=utf-8');
      } catch {}
    }
    return { success: false, error: error.message };
  } finally {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
