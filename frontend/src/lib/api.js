const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiUrl = (path) => `${BASE_URL}${path}`;

export async function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
}