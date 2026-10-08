import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Icon from '../components/Icon';
import { Avatar } from '../components/NftArt';
import { BellButton, SectionHeader } from '../components/Nav';
import { Skeleton } from '../components/States';
import { env } from '../config/env';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { copyText, CURRENCY, levelLabel, money } from '../utils';

/** 4 big numbers + 4 shortcut tiles, like the original "My Team" / "My Orders" panels. */
function Panel({ title, stats, links, action, onAction }) {
  const navigate = useNavigate();
  return (
    <section className="card panel">
      <SectionHeader title={title} action={action} onAction={onAction} />
      <div className="panel-grid">
        {stats.map((s, i) => (
          <div key={s.label} className={`panel-stat c${i}`}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
        {links.map((l) => (
          <button key={l.label} className="panel-link" onClick={() => navigate(l.to)}>
            <span className={`panel-icon tone-${l.tone}`}>
              <Icon name={l.icon} size={19} />
            </span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, wallet, signOut, showToast } = useApp();
  const income = useApi(() => api.getIncomeSummary(), []);
  const team = useApi(() => api.getTeam(), []);
  const store = useApi(() => api.getStoreSummary(), []);

  const copyUid = async () => {
    if (await copyText(user.uid)) showToast('UID copied', 'success');
  };
  const logout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const MENU = [
    { icon: 'crown', label: 'Levels & benefits', to: '/levels' },
    { icon: 'bell', label: 'Notifications', to: '/notifications' },
    { icon: 'shield', label: 'Security', toast: 'Password & 2FA settings are coming soon' },
    { icon: 'globe', label: 'Language', value: 'English', toast: 'More languages coming soon' },
    { icon: 'support', label: 'Help & support', toast: 'support@trustai.co.in' },
  ];

  return (
    <div className="screen has-nav">
      <header className="page-head">
        <h1>Profile</h1>
        <BellButton />
      </header>
      <div className="page">
        <div className="profile-card">
          <div className="pc-top">
            <Avatar seed={user?.avatarSeed || 'me'} size={64} ring />
            <div className="pc-main">
              <h2>{user?.username}</h2>
              <button className="uid" onClick={copyUid}>
                UID {user?.uid} <Icon name="copy" size={13} />
              </button>
            </div>
            <button className="lv-badge" onClick={() => navigate('/levels')}>
              <Icon name="crown" size={14} /> {levelLabel(user?.level)}
            </button>
          </div>
          <div className="pc-bottom">
            <div>
              <span>Points</span>
              <b>{user?.points?.toLocaleString()}</b>
            </div>
            <div>
              <span>Wallet</span>
              <b>{wallet ? money(wallet.balance) : '—'}</b>
            </div>
            <div>
              <span>In reservation</span>
              <b>{wallet ? money(wallet.frozen) : '—'}</b>
            </div>
          </div>
        </div>

        <section className="card">
          <SectionHeader title="Income" icon="chart" />
          {income.loading ? (
            <Skeleton h={180} />
          ) : (
            <table className="income-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Today</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(income.data || []).map((r) => (
                  <tr key={r.type}>
                    <td>{r.label}</td>
                    <td className={r.today > 0 ? 'pos' : ''}>{r.today > 0 ? `+${money(r.today)}` : money(r.today)}</td>
                    <td>{money(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="muted xs mt">All amounts in {CURRENCY}</p>
        </section>

        {team.data ? (
          <Panel
            title="My team"
            action="Members"
            onAction={() => navigate('/team')}
            stats={[
              { label: 'Community rewards', value: money(team.data.totalShare) },
              { label: 'Valid members', value: team.data.totalActive },
              { label: 'A enthusiasts', value: team.data.tiers[0].total },
              { label: 'B+C enthusiasts', value: team.data.tiers[1].total + team.data.tiers[2].total },
            ]}
            links={[
              { icon: 'users', label: 'Members', to: '/team', tone: 'violet' },
              { icon: 'chart', label: 'Contributions', to: '/team?view=contrib', tone: 'cyan' },
              { icon: 'bag', label: 'Orders', to: '/reserve?tab=orders', tone: 'amber' },
              { icon: 'gift', label: 'Invite', to: '/referral', tone: 'pink' },
            ]}
          />
        ) : (
          <Skeleton h={220} r={20} />
        )}

        {store.data ? (
          <Panel
            title="My orders"
            action="Check orders"
            onAction={() => navigate('/reserve?tab=orders')}
            stats={[
              { label: 'Orders', value: store.data.totalOrders },
              { label: 'Matching', value: store.data.processingOrders },
              { label: 'Bought', value: store.data.boughtOrders },
              { label: 'Sold', value: store.data.soldOrders },
            ]}
            links={[
              { icon: 'layers', label: 'My stakes', to: '/explore?tab=mystakes', tone: 'violet' },
              { icon: 'receipt', label: 'History', to: '/transactions', tone: 'cyan' },
              { icon: 'downArrow', label: 'Deposit', to: '/deposit', tone: 'green' },
              { icon: 'up', label: 'Withdraw', to: '/withdraw', tone: 'red' },
            ]}
          />
        ) : (
          <Skeleton h={220} r={20} />
        )}

        <div className="card menu">
          {MENU.map((m) => (
            <button key={m.label} className="menu-row" onClick={() => (m.to ? navigate(m.to) : showToast(m.toast))}>
              <span className="menu-icon">
                <Icon name={m.icon} size={18} />
              </span>
              <span className="menu-label">{m.label}</span>
              {m.value && <span className="muted xs">{m.value}</span>}
              <Icon name="chevron" size={16} className="muted" />
            </button>
          ))}
          <button className="menu-row danger" onClick={logout}>
            <span className="menu-icon">
              <Icon name="logout" size={18} />
            </span>
            <span className="menu-label">Log out</span>
          </button>
        </div>
        <p className="muted xs center">
          TrustAI v0.1.0 · {env.name}
          {env.useMock ? ' · mock data' : ''}
        </p>
      </div>
    </div>
  );
}
