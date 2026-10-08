import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ErrorCodes } from '../api';
import Confetti from '../components/Confetti';
import Icon, { Coin, Verified } from '../components/Icon';
import NftArt, { Avatar } from '../components/NftArt';
import { TopBar } from '../components/Nav';
import { Dialog, Sheet } from '../components/Overlays';
import { ErrorState, Skeleton, Spinner } from '../components/States';
import { Amount, KV, Progress } from '../components/Widgets';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { CURRENCY, dateShort, levelLabel, money } from '../utils';

function StakeSheet({ plan, open, onClose, onDone }) {
  const { wallet, setWallet } = useApp();
  const [amount, setAmount] = useState(String(plan.minAmount));
  const [busy, setBusy] = useState(false);
  const value = Number(amount) || 0;
  const perPayout = (value * plan.roiPercent) / 100;
  const total = perPayout * plan.periods + (plan.capitalBack ? value : 0);
  const outOfRange = value < plan.minAmount || value > plan.maxAmount;
  const mid = Math.round((plan.minAmount + plan.maxAmount) / 2 / 10) * 10;

  const confirm = async () => {
    setBusy(true);
    try {
      const res = await api.subscribeStake({ planId: plan.id, amount: value });
      setWallet(res.wallet);
      onDone({ ok: true, stake: res.stake });
    } catch (err) {
      onDone({ ok: false, error: err });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      title="Stake NFT"
      onClose={onClose}
      footer={
        <button className="btn btn-primary btn-lg btn-block" disabled={busy || outOfRange} onClick={confirm}>
          {busy ? <Spinner /> : `Confirm stake · ${money(value)} ${CURRENCY}`}
        </button>
      }
    >
      <div className="sheet-hero">
        <span className="sheet-thumb">
          <NftArt seed={plan.artSeed} src={plan.imageUrl} />
        </span>
        <div>
          <h4>{plan.title}</h4>
          <p className="muted xs">
            {plan.roiPercent}% {plan.payoutFrequency.toLowerCase()} · {plan.periods} payouts
          </p>
        </div>
      </div>

      <div className="amount-input">
        <span className="muted xs">Amount</span>
        <div className="ai-box">
          <Coin size={22} />
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} />
          <span>{CURRENCY}</span>
        </div>
        <div className="row-between">
          <span className={`xs ${outOfRange ? 'neg' : 'muted'}`}>
            Range {money(plan.minAmount, 0)} – {money(plan.maxAmount, 0)}
          </span>
          <span className="muted xs">Balance {money(wallet?.balance)}</span>
        </div>
        <div className="chips tight">
          {[plan.minAmount, mid, plan.maxAmount].map((v, i) => (
            <button key={v} className={`chip ${value === v ? 'on' : ''}`} onClick={() => setAmount(String(v))}>
              {['Min', 'Mid', 'Max'][i]} · {money(v, 0)}
            </button>
          ))}
        </div>
      </div>

      <div className="kv-list boxed">
        <KV label="Per payout">
          <span className="pos">+{money(perPayout)} {CURRENCY}</span>
        </KV>
        <KV label="Payouts">
          {plan.periods} × {plan.payoutFrequency.toLowerCase()}
        </KV>
        <KV label="Capital back">{plan.capitalBack ? 'Yes, at maturity' : 'No'}</KV>
        <KV label="Total you receive" strong>
          {money(total)} {CURRENCY}
        </KV>
      </div>
    </Sheet>
  );
}

export default function NftDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: plan, loading, error, reload } = useApi(() => api.getStakePlan(id), [id]);
  const [sheet, setSheet] = useState(false);
  const [result, setResult] = useState(null);
  const [liked, setLiked] = useState(false);
  const [more, setMore] = useState(false);

  const onDone = (r) => {
    setSheet(false);
    setResult(r);
    if (r.ok) reload({ silent: true });
  };
  const insufficient = result?.error?.code === ErrorCodes.INSUFFICIENT_BALANCE;

  if (error) {
    return (
      <div className="screen">
        <TopBar title="NFT" />
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="screen detail">
      <TopBar
        transparent
        title=""
        right={
          <>
            <button className={`icon-btn glass ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)} aria-label="Like">
              <Icon name="heart" size={20} />
            </button>
            <button className="icon-btn glass" aria-label="Share">
              <Icon name="share" size={19} />
            </button>
          </>
        }
      />
      <div className="detail-art">{loading ? <Skeleton h="100%" r={0} /> : <NftArt seed={plan.artSeed} src={plan.imageUrl} alt={plan.title} />}</div>

      {!loading && (
        <div className="detail-sheet">
          <p className="plan-col">
            {plan.collection} <Verified size={14} />
          </p>
          <h1 className="detail-title">{plan.title}</h1>
          <div className="detail-tags">
            <span className="tag">
              <Icon name="crown" size={13} /> {levelLabel(plan.levelRange[0])} – {levelLabel(plan.levelRange[1])}
            </span>
            <span className="tag">
              <Icon name="clock" size={13} /> {plan.payoutFrequency}
            </span>
            {plan.capitalBack && (
              <span className="tag tag-green">
                <Icon name="shield" size={13} /> Capital back
              </span>
            )}
          </div>

          <div className="stat-grid">
            <div>
              <span>Price from</span>
              <b>
                <Coin size={14} /> {money(plan.minAmount, 0)}
              </b>
            </div>
            <div>
              <span>{plan.payoutFrequency} ROI</span>
              <b className="accent">{plan.roiPercent}%</b>
            </div>
            <div>
              <span>Period</span>
              <b>
                {plan.periods} {plan.payoutFrequency === 'Weekly' ? 'weeks' : 'days'}
              </b>
            </div>
            <div>
              <span>Max stake</span>
              <b>{money(plan.maxAmount, 0)}</b>
            </div>
          </div>

          <div className="card glass">
            <div className="row-between">
              <span className="muted xs">Pool filled</span>
              <span className="xs strong">
                {plan.sold}/{plan.supply}
              </span>
            </div>
            <Progress value={plan.sold} max={plan.supply} />
          </div>

          <div className="creator-row">
            <Avatar seed={plan.creator} size={40} />
            <div>
              <p className="muted xs">Creator</p>
              <p className="strong">
                {plan.creator} <Verified size={13} />
              </p>
            </div>
            <span className="contract">
              <Icon name="link" size={14} /> Contract
            </span>
          </div>

          <div className="about">
            <h3>About</h3>
            <p className={more ? '' : 'clamp'}>{plan.description}</p>
            <button className="link-btn" onClick={() => setMore(!more)}>
              {more ? 'Show less' : 'Read more'}
            </button>
          </div>
        </div>
      )}

      {!loading && (
        <div className="buy-bar">
          <div>
            <p className="muted xs">Stake from</p>
            <Amount value={plan.minAmount} size={16} className="lg" />
          </div>
          <button className="btn btn-primary btn-lg" disabled={plan.status !== 'OPEN'} onClick={() => setSheet(true)}>
            {plan.status === 'OPEN' ? 'Stake now' : 'Sold out'}
          </button>
        </div>
      )}

      {plan && <StakeSheet plan={plan} open={sheet} onClose={() => setSheet(false)} onDone={onDone} />}

      <Confetti fire={result?.ok ? result.stake.id : null} />
      <Dialog
        open={Boolean(result)}
        tone={result?.ok ? 'success' : 'error'}
        title={result?.ok ? 'Stake successful!' : 'Stake failed'}
        onClose={() => setResult(null)}
        actions={
          result?.ok ? (
            <>
              <button className="btn btn-primary btn-block" onClick={() => navigate('/explore?tab=mystakes', { replace: true })}>
                View my stakes
              </button>
              <button className="btn btn-ghost btn-block" onClick={() => setResult(null)}>
                Done
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary btn-block" onClick={() => (insufficient ? navigate('/deposit') : (setResult(null), setSheet(true)))}>
                {insufficient ? 'Deposit now' : 'Try again'}
              </button>
              <button className="btn btn-ghost btn-block" onClick={() => setResult(null)}>
                Cancel
              </button>
            </>
          )
        }
      >
        {result?.ok ? (
          <div className="kv-list">
            <KV label="Amount">{money(result.stake.investedAmount)} {CURRENCY}</KV>
            <KV label="ROI">
              {result.stake.roiPercent}% {result.stake.payoutFrequency.toLowerCase()}
            </KV>
            <KV label="First payout">{dateShort(result.stake.nextPayoutDate)}</KV>
            <KV label="Matures on">{dateShort(result.stake.maturityAt)}</KV>
          </div>
        ) : (
          <p className="muted center">{result?.error?.message}</p>
        )}
      </Dialog>
    </div>
  );
}
