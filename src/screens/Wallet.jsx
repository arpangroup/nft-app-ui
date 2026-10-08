import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Icon from '../components/Icon';
import { BellButton, SectionHeader } from '../components/Nav';
import { ErrorState, ListSkeleton, Skeleton } from '../components/States';
import { TxRow } from '../components/Widgets';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { CURRENCY, money, timeAgo } from '../utils';

const ACTIONS = [
  { icon: 'downArrow', label: 'Deposit', to: '/deposit' },
  { icon: 'up', label: 'Withdraw', to: '/withdraw' },
  { icon: 'zap', label: 'Reserve', to: '/reserve' },
  { icon: 'receipt', label: 'History', to: '/transactions' },
];

export default function Wallet() {
  const navigate = useNavigate();
  const { wallet, refreshWallet } = useApp();
  const [hidden, setHidden] = useState(false);
  const txns = useApi(() => api.getTransactions({}), []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const mask = (v) => (hidden ? '••••••' : money(v));

  return (
    <div className="screen has-nav">
      <header className="page-head">
        <div>
          <h1>Wallet</h1>
          <p className="muted xs">USDT · multi-network</p>
        </div>
        <BellButton />
      </header>
      <div className="page">
        <div className="wallet-card">
          <div className="wc-top">
            <span className="wc-label">
              Total balance
              <button className="icon-btn sm ghost" onClick={() => setHidden(!hidden)} aria-label="Toggle balance">
                <Icon name={hidden ? 'eyeOff' : 'eye'} size={16} />
              </button>
            </span>
            <span className="wc-chip">{CURRENCY}</span>
          </div>
          {wallet ? (
            <h2 className="wc-amount">
              {mask(wallet.balance + wallet.frozen)} <small>{CURRENCY}</small>
            </h2>
          ) : (
            <Skeleton h={38} w={200} />
          )}
          <div className="wc-split">
            <div>
              <span>Available</span>
              <b>{wallet ? mask(wallet.balance) : '—'}</b>
            </div>
            <div>
              <span>In reservation</span>
              <b>{wallet ? mask(wallet.frozen) : '—'}</b>
            </div>
            <div>
              <span>Today</span>
              <b className="pos">+{wallet ? money(wallet.todayEarning) : '—'}</b>
            </div>
          </div>
        </div>

        <div className="action-row">
          {ACTIONS.map((a) => (
            <button key={a.label} className="action" onClick={() => navigate(a.to)}>
              <span className="action-icon">
                <Icon name={a.icon} size={20} />
              </span>
              {a.label}
            </button>
          ))}
        </div>

        <button className="promo" onClick={() => navigate('/referral')}>
          <span className="promo-icon">📢</span>
          <div>
            <b>Cashback 100%</b>
            <p>Invite your friends and get cashback on their first reserve</p>
          </div>
          <Icon name="chevron" size={18} />
        </button>

        <section>
          <SectionHeader title="Recent activity" action="View all" onAction={() => navigate('/transactions')} />
          {txns.error ? (
            <ErrorState error={txns.error} onRetry={txns.reload} />
          ) : txns.loading ? (
            <ListSkeleton rows={4} h={60} />
          ) : (
            <div className="card list-card">
              {txns.data.slice(0, 6).map((t) => (
                <TxRow key={t.id} tx={t} time={timeAgo(t.createdAt)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
