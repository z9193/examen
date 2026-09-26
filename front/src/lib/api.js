export const API = (import.meta.env.VITE_API || 'https://examen-t0at.onrender.com').replace(/\/$/, '');

export function api(path, token, opts = {}) {
  return fetch(API + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...opts.headers,
    },
  });
}
