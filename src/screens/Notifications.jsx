import { useEffect } from 'react';
import { api } from '../api';
import Icon from '../components/Icon';
import { TopBar } from '../components/Nav';
import { Empty, ErrorState, ListSkeleton } from '../components/States';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { timeAgo } from '../utils';

const META = {
  ORDER: { icon: 'zap', tone: 'violet' },
  PAYOUT: { icon: 'chart', tone: 'green' },
  TEAM: { icon: 'users', tone: 'pink' },
  SYSTEM: { icon: 'sparkle', tone: 'cyan' },
  WALLET: { icon: 'wallet', tone: 'amber' },
};

export default function Notifications() {
  const { setUnread } = useApp();
  const { data, loading, error, reload } = useApi(() => api.getNotifications(), []);

  // Show the unread dots on this visit, then mark everything read.
  useEffect(() => {
    if (!data?.some((n) => !n.viewed)) return;
    api.markNotificationsRead().then(() => setUnread(0)).catch(() => undefined);
  }, [data, setUnread]);

  return (
    <div className="screen">
      <TopBar title="Notifications" />
      <div className="page">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading ? (
          <ListSkeleton rows={5} h={76} />
        ) : !data.length ? (
          <Empty icon="bell" title="All caught up" text="We’ll let you know when something happens." />
        ) : (
          <div className="list">
            {data.map((n) => {
              const m = META[n.type] || META.SYSTEM;
              return (
                <div key={n.id} className={`note ${n.viewed ? '' : 'unread'}`}>
                  <span className={`tx-icon tone-${m.tone}`}>
                    <Icon name={m.icon} size={18} />
                  </span>
                  <div className="note-main">
                    <div className="row-between">
                      <b>{n.title}</b>
                      <span className="muted xs">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p>{n.message}</p>
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
