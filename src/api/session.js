/** Auth token storage, shared by the HTTP and mock adapters. */
const KEY = 'trustai.session';

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
};

let current = read();

export const session = {
  get: () => current,
  getToken: () => current?.accessToken || null,
  getRefreshToken: () => current?.refreshToken || null,
  isLoggedIn: () => Boolean(current?.accessToken),
  set(next) {
    current = next;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable (private mode) – keep in memory only */
    }
  },
  clear() {
    current = null;
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};

/** Fired when the backend rejects the token; AppContext logs the user out. */
export const AUTH_EXPIRED_EVENT = 'trustai:auth-expired';
