/**
 * Centralized API fetch utility for be_laundry backend.
 *
 * - Reads base URL from VITE_API_URL env var (falls back to production).
 * - Attaches `Authorization: Bearer <token>` from localStorage automatically.
 * - Skips Content-Type header for FormData uploads (browser sets it with boundary).
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.liveonline.codes';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = sessionStorage.getItem('auth_token');

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    // Do NOT set Content-Type for FormData — browser adds it with the correct boundary
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
}
