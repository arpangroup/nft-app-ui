import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { Avatar } from '../components/NftArt';
import { Chips, TopBar } from '../components/Nav';
import { Empty, ErrorState, ListSkeleton, Skeleton } from '../components/States';
import useApi from '../hooks/useApi';
import { CURRENCY, levelLabel, money, timeAgo } from '../utils';

const TIER_FILTERS = [
  { id: 0, label: 'All' },
  { id: 1, label: 'A · Direct' },
  { id: 2, label: 'B' },
  { id: 3, label: 'C' },
];

export default function Team() {
  const [params] = useSearchParams();
  const byContribution = params.get('view') === 'contrib';
  const [tier, setTier] = useState(0);
  const { data, loading, error, reload } = useApi(() => api.getTeam(), []);
  const members = (data?.members || [])
    .filter((m) => !tier || m.tier === tier)
    .sort((a, b) => (byContribution ? b.contribution - a.contribution : 0));

  return (
    <div className="screen">
      <TopBar title={byContribution ? 'Contributions' : 'My community'} />
      <div className="page">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading ? (
          <>
            <Skeleton h={150} r={24} />
            <ListSkeleton rows={4} h={64} />
          </>
        ) : (
          <>
            <div className="team-hero">
              <div>
                <p>Community rewards</p>
                <h2>
                  {money(data.totalShare)} <small>{CURRENCY}</small>
                </h2>
              </div>
              <div className="team-hero-stats">
                <div>
                  <b>{data.totalUser}</b>
                  <span>Members</span>
                </div>
                <div>
                  <b>{data.totalActive}</b>
                  <span>Active</span>
                </div>
              </div>
            </div>

            <div className="tier-grid">
              {data.tiers.map((t) => (
                <button key={t.tier} className={`tier-card t${t.tier} ${tier === t.tier ? 'on' : ''}`} onClick={() => setTier(tier === t.tier ? 0 : t.tier)}>
                  <span className="tier-name">{t.label}</span>
                  <b>{t.total}</b>
                  <small>{t.active} active</small>
                  <span className="tier-share">+{money(t.share)}</span>
                </button>
              ))}
            </div>

            <Chips items={TIER_FILTERS} value={tier} onChange={setTier} />

            {!members.length ? (
              <Empty icon="users" title="No members yet" text="Share your invitation code to grow your community." />
            ) : (
              <div className="card list-card">
                {members.map((m) => (
                  <div className="member-row" key={m.id}>
                    <Avatar seed={m.avatarSeed} size={42} />
                    <div className="mr-main">
                      <p className="strong">
                        {m.username} <span className="lv-chip sm">{levelLabel(m.level)}</span>
                      </p>
                      <p className="muted xs">
                        Tier {['', 'A', 'B', 'C'][m.tier]} · joined {timeAgo(m.joinedAt)}
                      </p>
                    </div>
                    <div className="mr-right">
                      <p className={m.contribution > 0 ? 'pos strong' : 'muted'}>+{money(m.contribution)}</p>
                      <span className={`status ${m.active ? 'status-success' : 'status-done'}`}>{m.active ? 'active' : 'inactive'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
