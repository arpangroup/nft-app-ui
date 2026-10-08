import { CURRENCY, compact, dateTime, levelLabel, money, pct } from '../utils';
import Icon, { Coin, Verified } from './Icon';
import NftArt from './NftArt';
import { Progress } from './Widgets';

/** Square NFT tile for grids/carousels. */
export function NftCard({ nft, onClick, badge }) {
  return (
    <button className="nft-card" onClick={onClick}>
      <div className="nft-card-art">
        <NftArt seed={nft.artSeed} src={nft.imageUrl} alt={nft.name} />
        <span className="like-pill">
          <Icon name="heart" size={12} /> {compact(nft.likes)}
        </span>
        {badge && <span className="corner-badge">{badge}</span>}
      </div>
      <div className="nft-card-info">
        <p className="nft-col">{nft.collection}</p>
        <p className="nft-name">{nft.name}</p>
        <div className="nft-price-row">
          <span className="price">
            <Coin size={13} /> {money(nft.price)}
          </span>
          <span className={`delta ${nft.change24h >= 0 ? 'up' : 'down'}`}>{pct(nft.change24h)}</span>
        </div>
      </div>
    </button>
  );
}

/** Ranked collection row (Top collections). */
export function CollectionRow({ c, rank, onClick }) {
  return (
    <button className="col-row" onClick={onClick}>
      <span className={`rank rank-${rank}`}>{rank}</span>
      <span className="col-thumb">
        <NftArt seed={c.artSeed} alt={c.name} />
      </span>
      <div className="col-main">
        <p className="col-name">
          {c.name} {c.verified && <Verified size={13} />}
        </p>
        <p className="col-sub">Floor {money(c.floor)} {CURRENCY}</p>
      </div>
      <div className="col-right">
        <p className="col-vol">{compact(c.volume)}</p>
        <p className={`delta ${c.change >= 0 ? 'up' : 'down'}`}>{pct(c.change)}</p>
      </div>
    </button>
  );
}

/** Stake pool card (Explore → Stake market). */
export function StakePlanCard({ plan, onClick, compactCard = false }) {
  const soldOut = plan.status !== 'OPEN';
  return (
    <button className={`plan-card ${compactCard ? 'compact' : ''}`} onClick={onClick}>
      <div className="plan-art">
        <NftArt seed={plan.artSeed} src={plan.imageUrl} alt={plan.title} />
        <span className="plan-level">
          {levelLabel(plan.levelRange[0])}–{levelLabel(plan.levelRange[1])}
        </span>
        {soldOut && <span className="plan-soldout">Sold out</span>}
      </div>
      <div className="plan-body">
        <p className="plan-col">
          {plan.collection} <Verified size={12} />
        </p>
        <p className="plan-title">{plan.title}</p>
        <div className="plan-stats">
          <div>
            <span>Price</span>
            <b>
              <Coin size={12} /> {money(plan.minAmount, 0)}+
            </b>
          </div>
          <div>
            <span>{plan.payoutFrequency} ROI</span>
            <b className="accent">{plan.roiPercent}%</b>
          </div>
          <div>
            <span>Period</span>
            <b>
              {plan.periods} {plan.payoutFrequency === 'Weekly' ? 'wk' : 'd'}
            </b>
          </div>
        </div>
        {!compactCard && (
          <div className="plan-progress">
            <Progress value={plan.sold} max={plan.supply} />
            <span>
              {Math.round((plan.sold / plan.supply) * 100)}% staked · {plan.supply - plan.sold} left
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

/** An active/matured stake the user holds. */
export function MyStakeCard({ stake, onClick }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(stake.maturityAt) - Date.now()) / 86400000));
  return (
    <button className="mystake-card" onClick={onClick}>
      <div className="ms-top">
        <span className="ms-thumb">
          <NftArt seed={stake.artSeed} src={stake.imageUrl} alt={stake.name} />
        </span>
        <div className="ms-main">
          <p className="ms-name">{stake.name}</p>
          <p className="ms-sub">
            <Coin size={12} /> {money(stake.investedAmount)} · {stake.roiPercent}% {stake.payoutFrequency.toLowerCase()}
          </p>
        </div>
        <span className={`status status-${stake.status === 'ACTIVE' ? 'success' : 'done'}`}>{stake.status.toLowerCase()}</span>
      </div>
      <Progress value={stake.completedPeriods} max={stake.totalPeriods} />
      <div className="ms-foot">
        <div>
          <span>Earned</span>
          <b className="pos">+{money(stake.receivedReturn)}</b>
        </div>
        <div>
          <span>Potential</span>
          <b>{money(stake.totalEarningPotential)}</b>
        </div>
        <div>
          <span>{stake.status === 'ACTIVE' ? 'Remaining' : 'Matured'}</span>
          <b>{stake.status === 'ACTIVE' ? `${daysLeft} days` : '✓'}</b>
        </div>
      </div>
    </button>
  );
}

const ORDER_STATUS = { PROCESSING: 'Matching', BOUGHT: 'Ready to sell', SOLD: 'Sold' };

/** Reservation order card (Reserve → Orders). */
export function OrderCard({ order, onSell, selling }) {
  const processing = order.status === 'PROCESSING';
  return (
    <div className={`order-card st-${order.status.toLowerCase()}`}>
      <div className="oc-head">
        <div>
          <p className="oc-label">Order No.</p>
          <p className="oc-no">{order.orderNo}</p>
        </div>
        <span className={`status status-${order.status.toLowerCase()}`}>{ORDER_STATUS[order.status]}</span>
      </div>
      <div className="oc-body">
        <span className={`oc-thumb ${processing ? 'scanning' : ''}`}>
          {processing ? <Icon name="scan" size={26} /> : <NftArt seed={order.artSeed} src={order.imageUrl} alt={order.nftName} />}
        </span>
        <div className="oc-main">
          <p className="oc-name">{processing ? 'Matching an NFT…' : order.nftName}</p>
          <p className="oc-sub">{dateTime(order.reservedAt)}</p>
          <div className="oc-figs">
            <span>
              Reserved <b>{money(order.reservedAmount)}</b>
            </span>
            <span>
              Income <b className="pos">+{money(order.incomeEarned)}</b>
            </span>
          </div>
        </div>
      </div>
      {order.status === 'BOUGHT' && (
        <div className="oc-foot">
          <span>
            Sell price <b>{money(order.price)} {CURRENCY}</b>
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => onSell(order)} disabled={selling}>
            Sell now
          </button>
        </div>
      )}
    </div>
  );
}
