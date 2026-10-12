import { Config } from '../constants/Config';

/**
 * Resolves a video or image URL to ensure it works on physical mobile devices and emulators:
 * - Rewrites localhost / 127.0.0.1 URLs to the active API host (e.g. 192.168.1.5:8001)
 * - Rewrites relative paths (/storage/...) to the full backend URL
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const apiBase = Config.API_URL.replace(/\/api\/?$/, '');

  // If it's a relative path
  if (trimmed.startsWith('/storage/') || trimmed.startsWith('storage/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${apiBase}${cleanPath}`;
  }

  // If it's pointing to localhost or 127.0.0.1
  const localhostRegex = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/.*)?$/i;
  const match = trimmed.match(localhostRegex);
  if (match) {
    const pathAndQuery = match[1] || '';
    return `${apiBase}${pathAndQuery}`;
  }

  return trimmed;
}
