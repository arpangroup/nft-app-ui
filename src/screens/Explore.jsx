import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { MyStakeCard, NftCard, StakePlanCard } from '../components/Cards';
import Icon from '../components/Icon';
import NftArt from '../components/NftArt';
import { BellButton, Chips, Segmented } from '../components/Nav';
import { Sheet } from '../components/Overlays';
import { Empty, ErrorState, ListSkeleton } from '../components/States';
import { Amount, KV, Progress } from '../components/Widgets';
import useApi from '../hooks/useApi';
import { CURRENCY, dateTime, money } from '../utils';

const TABS = [
  { id: 'market', label: 'Stake' },
  { id: 'mystakes', label: 'My Stakes' },
  { id: 'collection', label: 'Collection' },
];
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'art', label: 'Art' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'music', label: 'Music' },
];

function Market() {
  const navigate = useNavigate();
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useApi(() => api.getStakePlans({ category: cat }), [cat]);
  const list = (data || []).filter((p) => !q || `${p.title} ${p.collection}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <label className="search-bar input">
        <Icon name="search" size={18} />
        <input placeholder="Search pools or collections" value={q} onChange={(e) => setQ(e.target.value)} />
        {q && (
          <button className="icon-btn sm" onClick={() => setQ('')} aria-label="Clear">
            <Icon name="x" size={16} />
          </button>
        )}
      </label>
      <Chips items={CATEGORIES} value={cat} onChange={setCat} />
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading ? (
        <ListSkeleton rows={3} h={150} />
      ) : list.length === 0 ? (
        <Empty icon="search" title="No pools found" text="Try another category or search term." />
      ) : (
        <div className="list">
          {list.map((p) => (
            <StakePlanCard key={p.id} plan={p} onClick={() => navigate(`/nft/${p.id}`)} />
          ))}
        </div>
      )}
    </>
  );
}

function MyStakes() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const { data, loading, error, reload } = useApi(() => api.getMyStakes(), []);
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading) return <ListSkeleton rows={3} h={140} />;
  if (!data.length) {
    return (
      <Empty
        icon="layers"
        title="No stakes yet"
        text="Stake an NFT from the market to start earning daily rewards."
        action={<button className="btn btn-primary btn-sm" onClick={() => navigate('/explore')}>Browse pools</button>}
      />
    );
  }
  const total = data.reduce((s, x) => s + x.investedAmount, 0);
  const earned = data.reduce((s, x) => s + x.receivedReturn, 0);
  return (
    <>
      <div className="stat-trio card glass">
        <div>
          <span>Total staked</span>
          <b>{money(total)}</b>
        </div>
        <div>
          <span>Earned</span>
          <b className="pos">+{money(earned)}</b>
        </div>
        <div>
          <span>Active</span>
          <b>{data.filter((x) => x.status === 'ACTIVE').length}</b>
        </div>
      </div>
      <div className="list">
        {data.map((s) => (
          <MyStakeCard key={s.id} stake={s} onClick={() => setOpen(s)} />
        ))}
      </div>
      <Sheet
        open={Boolean(open)}
        title="Stake summary"
        onClose={() => setOpen(null)}
        footer={<button className="btn btn-ghost btn-block" onClick={() => setOpen(null)}>Close</button>}
      >
        {open && (
          <>
            <div className="sheet-hero">
              <span className="sheet-thumb">
                <NftArt seed={open.artSeed} src={open.imageUrl} />
              </span>
              <div>
                <h4>{open.name}</h4>
                <Amount value={open.investedAmount} />
              </div>
            </div>
            <div className="sheet-progress">
              <div className="row-between">
                <span className="muted xs">
                  Payouts {open.completedPeriods}/{open.totalPeriods}
                </span>
                <span className="muted xs">{Math.round((open.completedPeriods / open.totalPeriods) * 100)}%</span>
              </div>
              <Progress value={open.completedPeriods} max={open.totalPeriods} />
            </div>
            <div className="kv-list">
              <KV label="ROI">{open.roiPercent}% {open.payoutFrequency.toLowerCase()}</KV>
              <KV label="Per payout">{money(open.perPeriodProfit)} {CURRENCY}</KV>
              <KV label="Received">
                <span className="pos">+{money(open.receivedReturn)} {CURRENCY}</span>
              </KV>
              <KV label="Expected return">{money(open.expectedReturn)} {CURRENCY}</KV>
              <KV label="Total earning potential" strong>{money(open.totalEarningPotential)} {CURRENCY}</KV>
              <KV label="Next payout">{open.nextPayoutDate ? `${money(open.nextReturnAmount)} · ${dateTime(open.nextPayoutDate)}` : '—'}</KV>
              <KV label="Subscribed">{dateTime(open.subscribedAt)}</KV>
              <KV label="Maturity">{dateTime(open.maturityAt)}</KV>
              <KV label="Early exit penalty">
                <span className="neg">{money(open.earlyExitPenalty)} {CURRENCY}</span>
              </KV>
              <KV label="Status">
                <span className={`status status-${open.status === 'ACTIVE' ? 'success' : 'done'}`}>{open.status.toLowerCase()}</span>
              </KV>
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}

function Collection() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi(() => api.getCollection(), []);
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading) return <ListSkeleton rows={2} h={200} />;
  if (!data.length) return <Empty icon="grid" title="Your collection is empty" text="NFTs you own will appear here." />;
  return (
    <div className="grid-2">
      {data.map((n) => (
        <NftCard key={n.id} nft={n} badge="Owned" onClick={() => navigate(`/nft/${n.planId}`)} />
      ))}
    </div>
  );
}

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'market';

  return (
    <div className="screen has-nav">
      <header className="page-head">
        <div>
          <h1>Explore</h1>
          <p className="muted xs">Stake verified NFTs and earn every day</p>
        </div>
        <BellButton />
      </header>
      <div className="page">
        <Segmented items={TABS} value={tab} onChange={(id) => setParams({ tab: id }, { replace: true })} />
        {tab === 'market' && <Market />}
        {tab === 'mystakes' && <MyStakes />}
        {tab === 'collection' && <Collection />}
      </div>
    </div>
  );
}
