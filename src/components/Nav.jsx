import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

/** Sticky screen header with back button: <TopBar title="Deposit" right={…} /> */
export function TopBar({ title, right, onBack, transparent = false }) {
  const navigate = useNavigate();
  const back = onBack || (() => (window.history.length > 1 ? navigate(-1) : navigate('/home')));
  return (
    <header className={`topbar ${transparent ? 'transparent' : ''}`}>
      <button className="icon-btn" onClick={back} aria-label="Back">
        <Icon name="back" size={22} />
      </button>
      <h1>{title}</h1>
      <div className="topbar-right">{right}</div>
    </header>
  );
}

export function BellButton() {
  const { unread } = useApp();
  const navigate = useNavigate();
  return (
    <button className="icon-btn" onClick={() => navigate('/notifications')} aria-label="Notifications">
      <Icon name="bell" size={21} />
      {unread > 0 && <span className="dot-badge">{unread}</span>}
    </button>
  );
}

const TABS = [
  { to: '/home', icon: 'home', label: 'Home' },
  { to: '/explore', icon: 'compass', label: 'Explore' },
  { to: '/reserve', icon: 'zap', label: 'Reserve', center: true },
  { to: '/wallet', icon: 'wallet', label: 'Wallet' },
  { to: '/profile', icon: 'user', label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => `bn-item ${t.center ? 'bn-center' : ''} ${isActive ? 'active' : ''}`}>
          <span className="bn-icon">
            <Icon name={t.icon} size={t.center ? 24 : 22} stroke={t.center ? 2.4 : 2} />
          </span>
          <span className="bn-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/** Segmented control with sliding pill: <Segmented items={[{id,label}]} value onChange /> */
export function Segmented({ items, value, onChange, variant = 'pill' }) {
  const idx = Math.max(0, items.findIndex((i) => i.id === value));
  return (
    <div className={`segmented ${variant}`} style={{ '--n': items.length, '--i': idx }} role="tablist">
      <span className="seg-thumb" />
      {items.map((it) => (
        <button key={it.id} role="tab" aria-selected={it.id === value} className={it.id === value ? 'on' : ''} onClick={() => onChange(it.id)}>
          {it.label}
          {it.badge ? <span className="seg-badge">{it.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** Horizontal scrolling chips. */
export function Chips({ items, value, onChange }) {
  return (
    <div className="chips">
      {items.map((it) => (
        <button key={it.id} className={`chip ${it.id === value ? 'on' : ''}`} onClick={() => onChange(it.id)}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function SectionHeader({ title, action, onAction, icon }) {
  return (
    <div className="section-head">
      <h2>
        {icon && <Icon name={icon} size={18} className="section-icon" />}
        {title}
      </h2>
      {action && (
        <button className="link-btn" onClick={onAction}>
          {action} <Icon name="chevron" size={14} />
        </button>
      )}
    </div>
  );
}
