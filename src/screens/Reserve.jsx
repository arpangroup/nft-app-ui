import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, ErrorCodes } from '../api';
import { OrderCard } from '../components/Cards';
import Confetti from '../components/Confetti';
import Icon, { Coin } from '../components/Icon';
import NftArt from '../components/NftArt';
import { BellButton, Chips, Segmented } from '../components/Nav';
import { Dialog, Sheet } from '../components/Overlays';
import { Empty, ErrorState, ListSkeleton, Skeleton, Spinner } from '../components/States';
import { Countdown, KV } from '../components/Widgets';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { CURRENCY, money } from '../utils';

const STEPS = [
  { icon: 'zap', title: 'Reserve', text: 'Pick your level and amount once per round.' },
  { icon: 'scan', title: 'Get matched', text: 'The system matches a verified NFT to you.' },
  { icon: 'swap', title: 'Sell for profit', text: 'Sell the NFT and collect your income.' },
];

function ReserveForm({ summary, onReserved }) {
  const navigate = useNavigate();
  const { data: options, loading } = useApi(() => api.getReserveOptions(), []);
  const [rank, setRank] = useState(null);
  const [amount, setAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const opt = options?.find((o) => o.rankCode === rank);

  useEffect(() => {
    if (!options) return;
    const best = [...options].reverse().find((o) => o.enabled) || options[0];
    setRank(best.rankCode);
  }, [options]);

  useEffect(() => {
    if (opt) setAmount(Math.max(opt.minAmount, Math.min(opt.maxAmount, Math.floor(summary.walletBalance / 10) * 10)));
  }, [opt, summary.walletBalance]);

  if (summary.nextRoundAt) {
    return (
      <div className="card round-card">
        <span className="round-icon">
          <Icon name="check" size={26} stroke={3} />
        </span>
        <h3>You’re in this round</h3>
        <p className="muted">
          {summary.reservedToday}/{summary.maxReservationsPerDay} reservation used today. The next round opens in
        </p>
        <Countdown to={summary.nextRoundAt} />
        <button className="btn btn-ghost btn-block" onClick={() => navigate('/reserve?tab=orders', { replace: true })}>
          View my orders
        </button>
      </div>
    );
  }

  const submit = async () => {
    setBusy(true);
    try {
      const { order } = await api.reserve({ rankCode: rank, amount });
      onReserved(order);
    } catch (e) {
      setErr(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="card">
        <p className="card-label">1 · Choose level</p>
        {loading ? (
          <Skeleton h={86} />
        ) : (
          <div className="level-scroll">
            {options.map((o) => (
              <button
                key={o.rankCode}
                className={`level-card ${o.rankCode === rank ? 'on' : ''} ${o.enabled ? '' : 'locked'}`}
                onClick={() => (o.enabled ? setRank(o.rankCode) : setErr({ message: `Reach ${o.label} to unlock the ${money(o.minAmount, 0)} – ${money(o.maxAmount, 0)} range.` }))}
              >
                <span className="lc-top">
                  {o.label}
                  {!o.enabled && <Icon name="lock" size={12} />}
                </span>
                <b>{o.incomeRange}</b>
                <small>
                  {money(o.minAmount, 0)}–{money(o.maxAmount, 0)}
                </small>
              </button>
            ))}
          </div>
        )}

        <p className="card-label mt">2 · Reservation amount</p>
        {opt && (
          <div className="slider-box">
            <div className="slider-value">
              <Coin size={22} />
              <b>{money(amount, 0)}</b>
              <span>{CURRENCY}</span>
            </div>
            <input
              type="range"
              min={opt.minAmount}
              max={opt.maxAmount}
              step={10}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ '--p': `${((amount - opt.minAmount) / (opt.maxAmount - opt.minAmount)) * 100}%` }}
            />
            <div className="row-between muted xs">
              <span>{money(opt.minAmount, 0)}</span>
              <span>Est. income +{money((amount * parseFloat(opt.incomeRange)) / 100)}</span>
              <span>{money(opt.maxAmount, 0)}</span>
            </div>
          </div>
        )}
        <button className="btn btn-primary btn-lg btn-block mt" disabled={busy || !opt} onClick={submit}>
          {busy ? <Spinner /> : 'Reserve now'}
        </button>
      </div>

      <div className="steps">
        {STEPS.map((s, i) => (
          <div className="step" key={s.title}>
            <span className="step-icon">
              <Icon name={s.icon} size={18} />
            </span>
            <b>{s.title}</b>
            <p>{s.text}</p>
            {i < STEPS.length - 1 && <i className="step-line" />}
          </div>
        ))}
      </div>

      <Dialog
        open={Boolean(err)}
        tone="error"
        title="Can’t reserve"
        onClose={() => setErr(null)}
        actions={
          <>
            {err?.code === ErrorCodes.INSUFFICIENT_BALANCE && (
              <button className="btn btn-primary btn-block" onClick={() => navigate('/deposit')}>
                Deposit now
              </button>
            )}
            <button className="btn btn-ghost btn-block" onClick={() => setErr(null)}>
              OK
            </button>
          </>
        }
      >
        <p className="muted center">{err?.message}</p>
      </Dialog>
    </>
  );
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'PROCESSING', label: 'Matching' },
  { id: 'BOUGHT', label: 'Ready to sell' },
  { id: 'SOLD', label: 'Sold' },
];

function Orders({ onlySellable, onChanged }) {
  const [filter, setFilter] = useState('all');
  const [selling, setSelling] = useState(null);
  const [busy, setBusy] = useState(false);
  const { refreshWallet, showToast } = useApp();
  const status = onlySellable ? 'BOUGHT' : filter === 'all' ? undefined : filter;
  const { data, loading, error, reload } = useApi(() => api.getOrders({ status }), [status]);
  const matching = data?.some((o) => o.status === 'PROCESSING');

  useEffect(() => {
    if (!matching) return undefined;
    const t = setInterval(() => reload({ silent: true }).then(onChanged), 2500);
    return () => clearInterval(t);
  }, [matching, reload, onChanged]);

  const sell = async () => {
    setBusy(true);
    try {
      await api.sellOrder(selling.id);
      showToast(`Sold ${selling.nftName} · +${money(selling.incomeEarned)} ${CURRENCY} income`, 'success');
      setSelling(null);
      await Promise.all([reload({ silent: true }), refreshWallet()]);
      onChanged();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!onlySellable && <Chips items={FILTERS} value={filter} onChange={setFilter} />}
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading ? (
        <ListSkeleton rows={3} h={150} />
      ) : !data.length ? (
        <Empty icon={onlySellable ? 'swap' : 'receipt'} title={onlySellable ? 'Nothing to sell' : 'No orders'} text={onlySellable ? 'Matched NFTs from your reservations appear here.' : 'Reserve an NFT to create your first order.'} />
      ) : (
        <div className="list">
          {data.map((o) => (
            <OrderCard key={o.id} order={o} onSell={setSelling} selling={busy} />
          ))}
        </div>
      )}

      <Sheet
        open={Boolean(selling)}
        title="Sell NFT"
        onClose={() => setSelling(null)}
        footer={
          <button className="btn btn-primary btn-lg btn-block" disabled={busy} onClick={sell}>
            {busy ? <Spinner /> : `Sell for ${money(selling?.price)} ${CURRENCY}`}
          </button>
        }
      >
        {selling && (
          <>
            <div className="sell-hero">
              <NftArt seed={selling.artSeed} src={selling.imageUrl} />
            </div>
            <h4 className="center">{selling.nftName}</h4>
            <div className="kv-list boxed">
              <KV label="Reserved amount">{money(selling.reservedAmount)} {CURRENCY}</KV>
              <KV label="Income rate">{selling.returnRate}%</KV>
              <KV label="Income">
                <span className="pos">+{money(selling.incomeEarned)} {CURRENCY}</span>
              </KV>
              <KV label="Handling fee">{money(selling.handlingFee)} {CURRENCY}</KV>
              <KV label="You receive" strong>
                {money(selling.price - selling.handlingFee)} {CURRENCY}
              </KV>
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}

const TABS = [
  { id: 'reserve', label: 'Reserve' },
  { id: 'orders', label: 'Orders' },
  { id: 'sell', label: 'Sell' },
];

export default function Reserve() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'reserve';
  const { data: s, loading, error, reload } = useApi(() => api.getStoreSummary(), []);
  const { refreshWallet } = useApp();
  const [placed, setPlaced] = useState(null);
  const navigate = useNavigate();
  const refresh = useCallback(() => reload({ silent: true }), [reload]);

  const onReserved = (order) => {
    setPlaced(order);
    refresh();
    refreshWallet();
  };

  const tabs = TABS.map((t) => (t.id === 'sell' && s?.boughtOrders ? { ...t, badge: s.boughtOrders } : t));

  return (
    <div className="screen has-nav">
      <header className="page-head">
        <div>
          <h1>Reserve</h1>
          <p className="muted xs">Reserve · match · sell for daily income</p>
        </div>
        <BellButton />
      </header>
      <div className="page">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading ? (
          <Skeleton h={190} r={24} />
        ) : (
          <div className="earn-card">
            <div className="earn-top">
              <div>
                <p>Today’s earnings</p>
                <h2>
                  +{money(s.todayEarning)} <small>{CURRENCY}</small>
                </h2>
              </div>
              <div className="right">
                <p>Cumulative income</p>
                <h3>{money(s.cumulativeIncome)}</h3>
              </div>
            </div>
            <div className="earn-stats">
              <div>
                <span>Range</span>
                <b>
                  {money(s.reservationRange.min, 0)} – {money(s.reservationRange.max, 0)}
                </b>
              </div>
              <div>
                <span>Wallet</span>
                <b>{money(s.walletBalance)}</b>
              </div>
              <div>
                <span>Available</span>
                <b>{money(Math.min(s.walletBalance, s.reservationRange.max))}</b>
              </div>
            </div>
          </div>
        )}

        <Segmented items={tabs} value={tab} onChange={(id) => setParams({ tab: id }, { replace: true })} />

        {tab === 'reserve' && s && <ReserveForm summary={s} onReserved={onReserved} />}
        {tab === 'orders' && <Orders onChanged={refresh} />}
        {tab === 'sell' && <Orders onlySellable onChanged={refresh} />}
      </div>

      <Confetti fire={placed?.id} />
      <Dialog
        open={Boolean(placed)}
        tone="success"
        title="Reservation placed!"
        onClose={() => setPlaced(null)}
        actions={
          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              setPlaced(null);
              navigate('/reserve?tab=orders', { replace: true });
            }}
          >
            Track my order
          </button>
        }
      >
        <p className="muted center">We’re matching a verified NFT to your reservation. This usually takes a few seconds.</p>
        {placed && (
          <div className="kv-list boxed">
            <KV label="Order No.">#{placed.orderNo.slice(-8)}</KV>
            <KV label="Amount">{money(placed.reservedAmount)} {CURRENCY}</KV>
            <KV label="Income rate">{placed.returnRate}%</KV>
          </div>
        )}
      </Dialog>
    </div>
  );
}
