import { env } from './config/env';

export const CURRENCY = env.currency;

/** 1234.5 -> "1,234.50" */
export const money = (n, digits = 2) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** 1234.5 -> "+1,234.50" / "-12.00" */
export const signed = (n, digits = 2) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${money(Math.abs(n), digits)}`;

/** 160580 -> "160.6K" */
export const compact = (n) => Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);

export const pct = (n, digits = 1) => `${n > 0 ? '+' : ''}${Number(n || 0).toFixed(digits)}%`;

export const levelLabel = (level) => `LV${Number(level || 0) + 1}`;

export const shortAddress = (a, head = 6, tail = 4) => (a && a.length > head + tail + 3 ? `${a.slice(0, head)}…${a.slice(-tail)}` : a || '');

export function dateTime(v) {
  if (!v) return '—';
  const d = new Date(v);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}

export function dateShort(v) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(v) {
  const s = Math.max(1, Math.round((Date.now() - new Date(v).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : dateShort(v);
}

/** Stable 32-bit hash of a string (same input → same number on every load). */
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return h >>> 0;
}

/** Seeded PRNG: const r = rng('seed'); r() -> 0..1 */
export function rng(seed) {
  let a = hash(String(seed)) || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
