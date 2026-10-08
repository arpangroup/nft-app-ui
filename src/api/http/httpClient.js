import { env } from '../../config/env';
import { ApiError, ErrorCodes } from '../errors';
import { AUTH_EXPIRED_EVENT, session } from '../session';
import { endpoints } from './endpoints';

/**
 * Thin fetch wrapper: base URL, auth header, timeout, JSON, one silent token refresh,
 * error normalisation. Adjust here if the backend uses a different envelope.
 */
async function send(path, { method = 'GET', body, query, auth = true, headers = {} } = {}) {
  const url = new URL(env.apiBaseUrl + path, window.location.origin);
  Object.entries(query || {}).forEach(([k, v]) => v !== undefined && v !== null && v !== '' && url.searchParams.set(k, v));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), env.apiTimeoutMs);
  const token = session.getToken();
  try {
    return await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(auth && token && { Authorization: `Bearer ${token}` }),
        'X-App-Env': env.name,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const timedOut = controller.signal.reason === 'timeout';
    throw new ApiError(timedOut ? 'Request timed out' : 'Network error — check your connection', {
      code: timedOut ? ErrorCodes.TIMEOUT : ErrorCodes.NETWORK,
      details: err,
    });
  } finally {
    clearTimeout(timer);
  }
}

const parse = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

let refreshing = null;
/** Exchanges the refresh token once; concurrent 401s share the same refresh call. */
function refreshToken() {
  refreshing ??= (async () => {
    const refresh = session.getRefreshToken();
    if (!refresh) return false;
    const res = await send(endpoints.auth.refresh, { method: 'POST', body: { refreshToken: refresh }, auth: false });
    if (!res.ok) return false;
    const data = await parse(res);
    session.set({ ...session.get(), accessToken: data.accessToken, refreshToken: data.refreshToken || refresh });
    return true;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function request(path, opts = {}) {
  let res = await send(path, opts);
  if (res.status === 401 && opts.auth !== false && (await refreshToken().catch(() => false))) {
    res = await send(path, opts);
  }
  const data = await parse(res);

  if (res.status === 401 && opts.auth !== false) {
    session.clear();
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  if (!res.ok) {
    throw new ApiError(data?.message || res.statusText || 'Something went wrong', {
      status: res.status,
      code: data?.errorCode || data?.code || (res.status === 401 ? ErrorCodes.UNAUTHORIZED : `HTTP_${res.status}`),
      details: data,
    });
  }
  return data;
}

export const http = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
