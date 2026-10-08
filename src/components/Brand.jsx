/** TrustAI logo mark + wordmark. */
export function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="0.55" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#lm-g)" />
      <path d="M12 14h16M20 14v14" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="29" cy="27" r="3" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function Logo({ size = 32 }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-text">
        Trust<b>AI</b>
      </span>
    </span>
  );
}
