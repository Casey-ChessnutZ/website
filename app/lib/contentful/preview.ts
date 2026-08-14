const PREVIEW_ORIGIN = 'https://preview.local';

export function isSafePreviewPath(path: string | null): path is string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return false;
  }

  try {
    const target = new URL(path, PREVIEW_ORIGIN);
    return target.origin === PREVIEW_ORIGIN && !target.pathname.startsWith('/api');
  } catch {
    return false;
  }
}

export function getPreviewRedirectPath(path: string | null): string {
  return isSafePreviewPath(path) ? path : '/';
}
