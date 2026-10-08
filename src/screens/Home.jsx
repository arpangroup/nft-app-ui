import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { CollectionRow, NftCard, StakePlanCard } from '../components/Cards';
import Icon from '../components/Icon';
import NftArt, { Avatar } from '../components/NftArt';
import { BellButton, Chips, SectionHeader } from '../components/Nav';
import { ErrorState, Skeleton } from '../components/States';
import { Amount } from '../components/Widgets';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { levelLabel } from '../utils';

const QUICK = [
  { icon: 'compass', label: 'Explore', to: '/explore', tone: 'violet' },
  { icon: 'zap', label: 'Reserve', to: '/reserve', tone: 'cyan' },
  { icon: 'downArrow', label: 'Deposit', to: '/deposit', tone: 'green' },
  { icon: 'gift', label: 'Invite', to: '/referral', tone: 'pink' },
];

const FEATURES = [
  { icon: 'zap', title: 'Fast settlement', text: 'Rewards land in your wallet the moment a payout runs.' },
  { icon: 'chart', title: 'Growth-oriented', text: 'Daily stake income and reserve profits that compound.' },
  { icon: 'shield', title: 'Verified assets', text: 'Every collection is audited before it is listed.' },
];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

function Banners({ banners }) {
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  }, [i]);

  const onScroll = () => {
    const el = ref.current;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== i) setI(idx);
  };

  return (
    <div className="banners">
      <div className="banner-track" ref={ref} onScroll={onScroll}>
        {banners.map((b) => (
          <div className="banner" key={b.id}>
            <NftArt seed={b.artSeed} className="banner-art" />
            <div className="banner-shade" />
            <div className="banner-copy">
              <span className="banner-kicker">
                <Icon name="sparkle" size={13} /> TrustAI
              </span>
              <h3>{b.title}</h3>
              <p>{b.subtitle}</p>
              <button className="btn btn-light btn-sm" onClick={() => navigate(b.link)}>
                {b.cta} <Icon name="upRight" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="dots small">
        {banners.map((b, k) => (
          <span key={b.id} className={k === i ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user, wallet } = useApp();
  const navigate = useNavigate();
  const [cat, setCat] = useState('all');
  const { data, loading, error, reload } = useApi(() => api.getHomeFeed(), []);
  const trending = data?.trending.filter((n) => cat === 'all' || n.category === cat) || [];

  return (
    <div className="screen has-nav">
      <header className="home-head">
        <button className="home-user" onClick={() => navigate('/profile')}>
          <Avatar seed={user?.avatarSeed || 'me'} size={42} ring />
          <div>
            <p className="muted xs">{greeting()} 👋</p>
            <p className="home-name">
              {user?.username} <span className="lv-chip">{levelLabel(user?.level)}</span>
            </p>
          </div>
        </button>
        <BellButton />
      </header>

      <div className="page">
        <button className="search-bar" onClick={() => navigate('/explore')}>
          <Icon name="search" size={18} />
          <span>Search NFTs, collections, pools…</span>
          <span className="search-kbd">
            <Icon name="sliders" size={16} />
          </span>
        </button>

        <button className="balance-strip" onClick={() => navigate('/wallet')}>
          <div>
            <p className="muted xs">Wallet balance</p>
            {wallet ? <Amount value={wallet.balance} size={16} className="lg" /> : <Skeleton w={140} h={22} />}
          </div>
          <div className="bs-right">
            <p className="muted xs">Today</p>
            <p className="pos strong">+{wallet ? wallet.todayEarning.toFixed(2) : '0.00'}</p>
          </div>
        </button>

        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading ? (
          <>
            <Skeleton h={180} r={24} />
            <Skeleton h={84} r={18} />
            <Skeleton h={240} r={18} />
          </>
        ) : (
          <>
            <Banners banners={data.banners} />

            <div className="quick-row">
              {QUICK.map((q) => (
                <button key={q.label} className="quick" onClick={() => navigate(q.to)}>
                  <span className={`quick-icon tone-${q.tone}`}>
                    <Icon name={q.icon} size={22} />
                  </span>
                  <span>{q.label}</span>
                </button>
              ))}
            </div>

            <section>
              <SectionHeader title="Trending NFTs" icon="flame" action="See all" onAction={() => navigate('/explore')} />
              <Chips items={data.categories} value={cat} onChange={setCat} />
              <div className="h-scroll">
                {trending.map((n) => (
                  <NftCard key={n.id} nft={n} onClick={() => navigate(`/nft/${n.planId}`)} />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="Top collections" icon="trophy" action="24h" />
              <div className="card list-card">
                {data.collections.map((c, k) => (
                  <CollectionRow key={c.id} c={c} rank={k + 1} onClick={() => navigate('/explore')} />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="Stake & earn" icon="layers" action="All pools" onAction={() => navigate('/explore')} />
              <div className="h-scroll wide">
                {data.featured.map((p) => (
                  <StakePlanCard key={p.id} plan={p} compactCard onClick={() => navigate(`/nft/${p.id}`)} />
                ))}
              </div>
            </section>

            <section className="feature-box">
              <h2>
                The amazing NFT art <br />
                <span className="grad-text">of the world</span>
              </h2>
              {FEATURES.map((f) => (
                <div className="feature" key={f.title}>
                  <span className="feature-icon">
                    <Icon name={f.icon} size={20} />
                  </span>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.text}</p>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
