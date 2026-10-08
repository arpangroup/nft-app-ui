import qrcode from 'qrcode-generator';
import { useMemo } from 'react';
import useCountdown from '../hooks/useCountdown';
import { CURRENCY, money } from '../utils';
import Icon, { Coin } from './Icon';

/** Scannable QR code as crisp SVG. */
export function QrCode({ value, size = 168 }) {
  const { cells, n } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value || ' ');
    qr.make();
    const count = qr.getModuleCount();
    const list = [];
    for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (qr.isDark(r, c)) list.push(`M${c} ${r}h1v1h-1z`);
    return { cells: list.join(''), n: count };
  }, [value]);
  return (
    <div className="qr" style={{ width: size, height: size }}>
      <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} shapeRendering="crispEdges" width="100%" height="100%">
        <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#fff" />
        <path d={cells} fill="#0b0b14" />
      </svg>
    </div>
  );
}

/** "12.50 USDT" with coin icon. */
export function Amount({ value, digits = 2, size = 14, unit = true, className = '' }) {
  return (
    <span className={`amount ${className}`}>
      <Coin size={size} />
      <span>{money(value, digits)}</span>
      {unit && <small>{CURRENCY}</small>}
    </span>
  );
}

/** HH : MM : SS boxes. */
export function Countdown({ to, label }) {
  const { h, m, s } = useCountdown(to);
  return (
    <div className="countdown">
      {label && <p className="countdown-label">{label}</p>}
      <div className="countdown-boxes">
        <span>{h}<small>HRS</small></span>
        <i>:</i>
        <span>{m}<small>MIN</small></span>
        <i>:</i>
        <span>{s}<small>SEC</small></span>
      </div>
    </div>
  );
}

/** Label / value row. */
export function KV({ label, children, strong }) {
  return (
    <div className={`kv ${strong ? 'strong' : ''}`}>
      <span>{label}</span>
      <span>{children}</span>
    </div>
  );
}

export function Progress({ value, max = 100 }) {
  const p = Math.min(100, Math.round((value / (max || 1)) * 100));
  return (
    <div className="progress" aria-valuenow={p} role="progressbar">
      <span style={{ width: `${p}%` }} />
    </div>
  );
}

const TX_META = {
  DEPOSIT: { icon: 'downArrow', tone: 'green' },
  WITHDRAW: { icon: 'up', tone: 'red' },
  STAKE: { icon: 'layers', tone: 'violet' },
  RESERVE: { icon: 'zap', tone: 'violet' },
  SELL: { icon: 'swap', tone: 'cyan' },
  PROFIT: { icon: 'chart', tone: 'green' },
  REWARD: { icon: 'gift', tone: 'amber' },
  REFERRAL: { icon: 'users', tone: 'pink' },
};

export function TxRow({ tx, time }) {
  const meta = TX_META[tx.type] || { icon: 'receipt', tone: 'violet' };
  return (
    <div className="tx-row">
      <span className={`tx-icon tone-${meta.tone}`}>
        <Icon name={meta.icon} size={18} />
      </span>
      <div className="tx-main">
        <p className="tx-title">{tx.title}</p>
        <p className="tx-sub">{time}</p>
      </div>
      <div className="tx-right">
        <p className={`tx-amt ${tx.amount >= 0 ? 'pos' : 'neg'}`}>
          {tx.amount >= 0 ? '+' : '−'}
          {money(Math.abs(tx.amount))}
        </p>
        <span className={`status status-${tx.status.toLowerCase()}`}>{tx.status.toLowerCase()}</span>
      </div>
    </div>
  );
}
