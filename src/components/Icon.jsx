/** Inline stroke icons (24×24 grid). <Icon name="wallet" size={20} /> */
const P = (d) => <path d={d} />;
const C = (cx, cy, r) => <circle cx={cx} cy={cy} r={r} />;

const ICONS = {
  home: P('M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'),
  compass: <>{C(12, 12, 9)}{P('m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z')}</>,
  bag: <>{P('M5 8h14l-1 12.5a1 1 0 0 1-1 .5H7a1 1 0 0 1-1-.5z')}{P('M9 8V7a3 3 0 0 1 6 0v1')}</>,
  wallet: <>{P('M19 7V5.5A1.5 1.5 0 0 0 17.5 4H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v3.5M21 16.5V19a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6')}{P('M21 12.5h-4a2 2 0 0 0 0 4h4z')}</>,
  user: <>{C(12, 8, 4)}{P('M4 21a8 8 0 0 1 16 0')}</>,
  bell: P('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0'),
  back: P('M15 18l-6-6 6-6'),
  chevron: P('m9 18 6-6-6-6'),
  down: P('m6 9 6 6 6-6'),
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" />{P('M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1')}</>,
  search: <>{C(11, 11, 7)}{P('m20 20-3.5-3.5')}</>,
  heart: P('M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'),
  flame: P('M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z'),
  plus: P('M12 5v14M5 12h14'),
  up: P('M12 19V5M5 12l7-7 7 7'),
  downArrow: P('M12 5v14M19 12l-7 7-7-7'),
  upRight: P('M7 17 17 7M7 7h10v10'),
  swap: P('M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7'),
  shield: <>{P('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z')}{P('m9 12 2 2 4-4')}</>,
  gift: P('M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z'),
  users: <>{P('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2')}{C(9, 7, 4)}{P('M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75')}</>,
  clock: <>{C(12, 12, 9)}{P('M12 7v5l3 2')}</>,
  check: P('M20 6 9 17l-5-5'),
  x: P('M18 6 6 18M6 6l12 12'),
  eye: <>{P('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z')}{C(12, 12, 3)}</>,
  eyeOff: P('M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20'),
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" />{P('M8 11V7a4 4 0 0 1 8 0v4')}</>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" />{P('m22 7-10 6L2 7')}</>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="2.5" />{P('M11 18h2')}</>,
  ticket: P('M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4zM13 6v2M13 11v2M13 16v2'),
  sliders: P('M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6'),
  logout: P('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9'),
  trophy: P('M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z'),
  chart: P('M3 3v18h18M7 15l4-4 3 3 6-6'),
  layers: P('m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5'),
  sparkle: P('M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'),
  info: <>{C(12, 12, 9)}{P('M12 16v-4M12 8h.01')}</>,
  share: <>{C(18, 5, 3)}{C(6, 12, 3)}{C(18, 19, 3)}{P('m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98')}</>,
  grid: P('M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z'),
  list: P('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'),
  crown: P('m2 6 4 11h12l4-11-6 5-4-7-4 7zM6 21h12'),
  support: P('M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3'),
  globe: <>{C(12, 12, 9)}{P('M3 12h18M12 3a14 14 0 0 1 3.5 9A14 14 0 0 1 12 21a14 14 0 0 1-3.5-9A14 14 0 0 1 12 3z')}</>,
  zap: P('M13 2 3 14h9l-1 8 10-12h-9l1-8z'),
  refresh: P('M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5'),
  filter: P('M22 3H2l8 9.46V19l4 2v-8.54z'),
  qr: P('M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3zM14 20h1M20 14h1'),
  link: P('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'),
  receipt: P('M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM8 8h8M8 12h8M8 16h5'),
  more: <>{C(5, 12, 1)}{C(12, 12, 1)}{C(19, 12, 1)}</>,
  scan: P('M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10'),
};

export default function Icon({ name, size = 22, stroke = 2, className = '', style }) {
  return (
    <svg
      className={`icon ${className}`}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name] || ICONS.info}
    </svg>
  );
}

/** USDT coin mark. */
export function Coin({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="coin">
      <circle cx="16" cy="16" r="16" fill="#26a17b" />
      <path d="M9 9h14v3.4h-5.2v2.2c3.6.2 6.3.9 6.3 1.8s-2.7 1.6-6.3 1.8V25h-3.6v-6.8c-3.6-.2-6.3-.9-6.3-1.8s2.7-1.6 6.3-1.8v-2.2H9z M14.2 15.6c-2.6.1-4.5.5-4.5.9 0 .5 2.8.9 6.3.9s6.3-.4 6.3-.9c0-.4-1.9-.8-4.5-.9v1.5h-3.6z" fill="#fff" />
    </svg>
  );
}

/** Blue verified tick. */
export function Verified({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="verified" className="verified">
      <path fill="#3b82f6" d="M12 1.5 14.6 3.4l3.2-.2 1 3 2.7 1.8-.9 3.1.9 3.1-2.7 1.8-1 3-3.2-.2L12 22.5l-2.6-1.9-3.2.2-1-3L2.5 16l.9-3.1-.9-3.1 2.7-1.8 1-3 3.2.2z" />
      <path d="m8 12.3 2.6 2.5L16 9.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
