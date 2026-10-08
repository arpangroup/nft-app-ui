import { memo, useId } from 'react';
import { hash, rng } from '../utils';

/**
 * Procedural NFT artwork, so the app looks real with zero network/image assets.
 * artSeed = "<style>:<key>" where style ∈ punk | orb | rings | bauhaus | bloom.
 * If a real `src` (imageUrl from the backend) is given, that image is shown instead.
 */
const PALETTES = [
  ['#7c3aed', '#22d3ee', '#f472b6', '#120a2e'],
  ['#f97316', '#facc15', '#ef4444', '#1c0b05'],
  ['#06b6d4', '#3b82f6', '#a78bfa', '#030a1f'],
  ['#10b981', '#a3e635', '#22d3ee', '#04140f'],
  ['#ec4899', '#8b5cf6', '#fde68a', '#1a0520'],
  ['#f43f5e', '#fb923c', '#fcd34d', '#1f0710'],
  ['#14b8a6', '#6366f1', '#f0abfc', '#0b1020'],
  ['#eab308', '#84cc16', '#38bdf8', '#0d1405'],
];
const STYLES = ['punk', 'orb', 'rings', 'bauhaus', 'bloom'];

function parse(seed = '') {
  const [maybeStyle, ...rest] = String(seed).split(':');
  const style = STYLES.includes(maybeStyle) ? maybeStyle : STYLES[hash(seed) % STYLES.length];
  const key = rest.length ? rest.join(':') : seed;
  return { style, palette: PALETTES[hash(`${key}p`) % PALETTES.length], r: rng(key) };
}

// ---------------- styles ----------------
function Orb({ id, palette: [a, b, c, bg], r }) {
  const blobs = [a, b, c].map((col, i) => ({ col, x: 15 + r() * 70, y: 15 + r() * 70, s: 22 + r() * 22, i }));
  const cx = 38 + r() * 24;
  const cy = 38 + r() * 24;
  return (
    <>
      <defs>
        <filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
        <radialGradient id={`${id}s`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.25" stopColor={c} stopOpacity="0.9" />
          <stop offset="0.75" stopColor={a} />
          <stop offset="1" stopColor={bg} />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={bg} />
      <g filter={`url(#${id}b)`} opacity="0.95">
        {blobs.map((bl) => <circle key={bl.i} cx={bl.x} cy={bl.y} r={bl.s} fill={bl.col} />)}
      </g>
      <ellipse cx={cx} cy={cy + 2} rx="28" ry="8" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" transform={`rotate(-18 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r="19" fill={`url(#${id}s)`} />
      <ellipse cx={cx} cy={cy + 2} rx="28" ry="8" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="1" strokeDasharray="44 200" transform={`rotate(-18 ${cx} ${cy})`} />
    </>
  );
}

function Rings({ id, palette: [a, b, c, bg], r }) {
  const sunY = 46 + r() * 10;
  const stars = Array.from({ length: 22 }, (_, i) => ({ x: r() * 100, y: r() * 55, s: 0.3 + r() * 0.8, i }));
  return (
    <>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg} />
          <stop offset="1" stopColor={a} />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <mask id={`${id}m`}>
          <rect width="100" height="100" fill="#fff" />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="0" y={sunY + 2 + i * 4.2} width="100" height={0.8 + i * 0.55} fill="#000" />)}
        </mask>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}g)`} />
      {stars.map((s) => <circle key={s.i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={0.3 + s.s / 2} />)}
      <circle cx="50" cy={sunY} r="25" fill={`url(#${id}s)`} mask={`url(#${id}m)`} />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx="50" cy={sunY} rx={34 + i * 9} ry={7 + i * 2.5} fill="none" stroke={i === 1 ? c : '#fff'} strokeOpacity={0.55 - i * 0.12} strokeWidth="0.9" transform={`rotate(${-12 + r() * 6} 50 ${sunY})`} />
      ))}
      <path d={`M0 ${78 + r() * 6} Q 25 ${70 + r() * 6} 50 ${78} T 100 ${74 + r() * 6} V100 H0z`} fill={bg} opacity="0.85" />
      <path d={`M0 ${88} Q 30 ${82 + r() * 4} 60 ${88} T 100 ${86} V100 H0z`} fill={bg} />
    </>
  );
}

function Bauhaus({ palette: [a, b, c, bg], r }) {
  const cols = [a, b, c, '#f5f0e6'];
  const pick = () => cols[Math.floor(r() * cols.length)];
  const cells = [];
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      const k = Math.floor(r() * 5);
      const px = x * 33.34;
      const py = y * 33.34;
      const s = 33.34;
      const fill = pick();
      const key = `${x}${y}`;
      cells.push(<rect key={`b${key}`} x={px} y={py} width={s} height={s} fill={r() > 0.5 ? bg : pick()} />);
      if (k === 0) cells.push(<circle key={key} cx={px + s / 2} cy={py + s / 2} r={s * 0.38} fill={fill} />);
      if (k === 1) cells.push(<path key={key} d={`M${px} ${py + s} A ${s} ${s} 0 0 1 ${px + s} ${py} V ${py + s} Z`} fill={fill} />);
      if (k === 2) cells.push(<path key={key} d={`M${px} ${py + s} L ${px + s / 2} ${py} L ${px + s} ${py + s} Z`} fill={fill} />);
      if (k === 3) cells.push(<rect key={key} x={px + s * 0.18} y={py + s * 0.18} width={s * 0.64} height={s * 0.64} fill={fill} transform={`rotate(45 ${px + s / 2} ${py + s / 2})`} />);
      if (k === 4) cells.push(<path key={key} d={`M${px} ${py} H ${px + s} A ${s / 2} ${s / 2} 0 0 1 ${px} ${py} Z`} fill={fill} />);
    }
  }
  return (
    <>
      <rect width="100" height="100" fill={bg} />
      {cells}
      <circle cx={20 + r() * 60} cy={20 + r() * 60} r="9" fill="none" stroke="#f5f0e6" strokeWidth="2.2" />
    </>
  );
}

function Bloom({ id, palette: [a, b, c, bg], r }) {
  const petals = 6 + Math.floor(r() * 7);
  const rot = r() * 360;
  const len = 26 + r() * 8;
  return (
    <>
      <defs>
        <radialGradient id={`${id}bg`} cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor={a} stopOpacity="0.55" />
          <stop offset="1" stopColor={bg} />
        </radialGradient>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}bg)`} />
      {[0, 1].map((layer) =>
        Array.from({ length: petals }, (_, i) => (
          <ellipse
            key={`${layer}-${i}`}
            cx="50"
            cy={50 - len / 2 - (layer ? 0 : 4)}
            rx={layer ? 7 : 10}
            ry={len / 2 + (layer ? 0 : 4)}
            fill={layer ? `url(#${id}p)` : a}
            opacity={layer ? 0.95 : 0.55}
            transform={`rotate(${rot + (360 / petals) * i + (layer ? 0 : 180 / petals)} 50 50)`}
          />
        ))
      )}
      <circle cx="50" cy="50" r="8" fill={bg} />
      <circle cx="50" cy="50" r="5.5" fill={c} />
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={8 + r() * 84} cy={8 + r() * 84} r={0.6 + r()} fill="#fff" opacity="0.7" />
      ))}
    </>
  );
}

const SKINS = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#9be7a1', '#b9a6ff', '#7dd3fc'];
function Punk({ id, palette: [a, b, c, bg], r }) {
  const N = 16;
  const u = 100 / N;
  const px = [];
  const put = (x, y, fill, k = '') => px.push(<rect key={`${x}-${y}-${k}`} x={x * u} y={y * u} width={u + 0.15} height={u + 0.15} fill={fill} />);
  const skin = SKINS[Math.floor(r() * SKINS.length)];
  const shade = 'rgba(0,0,0,0.18)';
  const hairCol = [a, b, c, '#1f2937', '#fafafa'][Math.floor(r() * 5)];
  const shirt = [a, b, c][Math.floor(r() * 3)];
  // shoulders + neck
  for (let x = 3; x <= 12; x++) for (let y = 14; y <= 15; y++) put(x, y, shirt);
  for (let x = 6; x <= 9; x++) put(x, 13, skin);
  put(6, 13, shade, 's');
  // head
  for (let y = 4; y <= 12; y++) {
    for (let x = 4; x <= 11; x++) {
      if ((y === 4 || y === 12) && (x === 4 || x === 11)) continue;
      put(x, y, skin);
    }
  }
  for (let y = 5; y <= 11; y++) put(4, y, shade, 's');
  // hair
  const hair = Math.floor(r() * 4);
  if (hair === 0) { // cap
    for (let x = 4; x <= 11; x++) for (let y = 2; y <= 4; y++) put(x, y, hairCol, 'h');
    for (let x = 9; x <= 13; x++) put(x, 5, hairCol, 'h');
  } else if (hair === 1) { // mohawk
    for (let y = 0; y <= 4; y++) { put(7, y, hairCol, 'h'); put(8, y, hairCol, 'h'); }
  } else if (hair === 2) { // bob
    for (let x = 3; x <= 12; x++) put(x, 3, hairCol, 'h');
    for (let x = 4; x <= 11; x++) put(x, 4, hairCol, 'h');
    for (let y = 4; y <= 10; y++) { put(3, y, hairCol, 'h'); put(12, y, hairCol, 'h'); }
  } else { // beanie
    for (let x = 4; x <= 11; x++) for (let y = 2; y <= 4; y++) put(x, y, y === 4 ? c : hairCol, 'h');
    put(7, 1, c, 'h'); put(8, 1, c, 'h');
  }
  // eyes
  if (r() > 0.5) {
    for (let x = 4; x <= 11; x++) put(x, 7, '#0b0b14', 'e');
    for (const x of [5, 6, 9, 10]) put(x, 8, '#0b0b14', 'e');
    put(5, 7, '#ffffff66', 'g'); put(9, 7, '#ffffff66', 'g');
  } else {
    for (const x of [5, 9]) { put(x, 7, '#fff', 'e'); put(x + 1, 7, '#0b0b14', 'e'); }
    for (const x of [5, 6, 9, 10]) put(x, 6, 'rgba(0,0,0,0.35)', 'b');
  }
  // nose / mouth
  put(8, 9, shade, 'n');
  for (const x of [7, 8, 9]) put(x, 10, '#3f1d1d', 'm');
  if (r() > 0.6) { put(10, 10, '#e5e7eb', 'c'); put(11, 10, '#e5e7eb', 'c'); put(12, 10, '#f97316', 'c'); }
  if (r() > 0.5) put(4, 9, '#facc15', 'r');
  return (
    <>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} stopOpacity="0.9" />
          <stop offset="1" stopColor={bg} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}g)`} />
      <g shapeRendering="crispEdges">{px}</g>
    </>
  );
}

const RENDERERS = { orb: Orb, rings: Rings, bauhaus: Bauhaus, bloom: Bloom, punk: Punk };

function NftArt({ seed, src, className = '', rounded, alt = '' }) {
  const uid = useId().replace(/:/g, '');
  if (src && /^(https?:)?\/\//.test(src)) {
    return <img className={`nft-art ${className}`} src={src} alt={alt} loading="lazy" style={rounded ? { borderRadius: rounded } : undefined} />;
  }
  const p = parse(seed);
  const Render = RENDERERS[p.style];
  return (
    <svg className={`nft-art ${className}`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label={alt} style={rounded ? { borderRadius: rounded } : undefined}>
      <Render id={`a${uid}`} {...p} />
    </svg>
  );
}

export default memo(NftArt);

/** Round avatar using the pixel-punk generator. */
export function Avatar({ seed, size = 40, ring = false }) {
  return (
    <span className={`avatar ${ring ? 'ring' : ''}`} style={{ width: size, height: size }}>
      <NftArt seed={`punk:${seed}`} />
    </span>
  );
}
