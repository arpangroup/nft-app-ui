import { api } from '../api';
import Icon from '../components/Icon';
import { TopBar } from '../components/Nav';
import { ErrorState, ListSkeleton } from '../components/States';
import { Progress } from '../components/Widgets';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { levelLabel } from '../utils';

export default function Levels() {
  const { user } = useApp();
  const levels = useApi(() => api.getLevels(), []);
  const team = useApi(() => api.getTeam(), []);
  const current = user?.level ?? 0;
  const next = levels.data?.find((l) => l.level === current + 1);
  const direct = team.data?.tiers[0].total ?? 0;
  const size = team.data?.totalUser ?? 0;

  return (
    <div className="screen">
      <TopBar title="Levels & benefits" />
      <div className="page">
        <div className="level-hero">
          <span className="lh-badge">
            <Icon name="crown" size={28} />
          </span>
          <div>
            <p>Your level</p>
            <h2>
              {levelLabel(current)} · {levels.data?.[current]?.name || '…'}
            </h2>
          </div>
        </div>

        {next && team.data && (
          <div className="card">
            <p className="card-label">
              Progress to {levelLabel(next.level)} · {next.name}
            </p>
            <div className="req">
              <div className="row-between xs">
                <span>Direct referrals</span>
                <b>
                  {Math.min(direct, next.minDirect)}/{next.minDirect}
                </b>
              </div>
              <Progress value={direct} max={next.minDirect} />
            </div>
            <div className="req">
              <div className="row-between xs">
                <span>Team size</span>
                <b>
                  {Math.min(size, next.minTeam)}/{next.minTeam}
                </b>
              </div>
              <Progress value={size} max={next.minTeam} />
            </div>
          </div>
        )}

        {levels.error ? (
          <ErrorState error={levels.error} onRetry={levels.reload} />
        ) : levels.loading ? (
          <ListSkeleton rows={4} h={110} />
        ) : (
          <div className="level-list">
            {levels.data.map((l) => {
              const state = l.level < current ? 'done' : l.level === current ? 'current' : 'locked';
              return (
                <div key={l.code} className={`level-row ${state}`}>
                  <span className="lr-dot">{state === 'locked' ? <Icon name="lock" size={14} /> : state === 'done' ? <Icon name="check" size={14} stroke={3} /> : <Icon name="crown" size={14} />}</span>
                  <div className="lr-body">
                    <div className="row-between">
                      <b>
                        {levelLabel(l.level)} · {l.name}
                      </b>
                      {state === 'current' && <span className="status status-success">current</span>}
                    </div>
                    <p className="muted xs">
                      {l.minDirect} direct · {l.minTeam} team members
                    </p>
                    <ul>
                      {l.perks.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
