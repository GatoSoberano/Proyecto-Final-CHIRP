const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function token(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('chirp_token');
}

async function req(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  const t = token();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
  return res.status === 204 ? null : res.json();
}

export const api = {
  register: (b: any) => req('/auth/register', { method: 'POST', body: JSON.stringify(b) }),
  login: (b: any) => req('/auth/login', { method: 'POST', body: JSON.stringify(b) }),
  timeline: () => req('/timeline'),
  explore: () => req('/timeline/explore'),
  createChirp: (b: any) => req('/chirps', { method: 'POST', body: JSON.stringify(b) }),
  deleteChirp: (id: string) => req(`/chirps/${id}`, { method: 'DELETE' }),
  like: (id: string) => req(`/chirps/${id}/like`, { method: 'POST' }),
  unlike: (id: string) => req(`/chirps/${id}/like`, { method: 'DELETE' }),
  moderate: (text: string) => req('/ai/moderate', { method: 'POST', body: JSON.stringify({ text }) }),
};

export function setToken(t: string) { window.localStorage.setItem('chirp_token', t); }
export function clearToken() { window.localStorage.removeItem('chirp_token'); }
export function isAuthed() { return !!token(); }