// Shared Authentication & Authenticated Fetch / Download Utilities (CR-10 & SEC-09)

export function getAuthToken(user = null) {
  if (user?.token) return user.token;
  try {
    const saved = sessionStorage.getItem('mivhanan_user');
    return saved ? JSON.parse(saved)?.token || '' : '';
  } catch {
    return '';
  }
}

export function getAuthHeaders(user = null, extraHeaders = {}) {
  const token = getAuthToken(user);
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
}

export async function downloadAuthenticatedBlob(url, fallbackFilename, user = null) {
  const res = await fetch(url, {
    headers: getAuthHeaders(user)
  });
  if (!res.ok) {
    throw new Error('שגיאה בהורדת הקובץ מהשרת');
  }

  const disposition = res.headers.get('content-disposition');
  let filename = fallbackFilename;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^";]+)"?/i);
    if (match && match[1]) filename = match[1];
  }

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
}

export async function openAuthenticatedBlobInNewTab(url, user = null, forcedMimeType = null) {
  const res = await fetch(url, {
    headers: getAuthHeaders(user)
  });
  if (!res.ok) {
    throw new Error('שגיאה בפתיחת הקובץ מהשרת');
  }

  let blob;
  if (forcedMimeType) {
    const buf = await res.arrayBuffer();
    blob = new Blob([buf], { type: forcedMimeType });
  } else {
    blob = await res.blob();
  }

  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
}

