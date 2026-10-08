import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { Chips, TopBar } from '../components/Nav';
import { Empty, ErrorState, ListSkeleton } from '../components/States';
import { TxRow } from '../components/Widgets';
import useApi from '../hooks/useApi';
import { dateShort, dateTime } from '../utils';

const FILTERS = [
  { id: 'all', label: 'All', type: undefined },
  { id: 'DEPOSIT', label: 'Deposits', type: 'DEPOSIT' },
  { id: 'WITHDRAW', label: 'Withdrawals', type: 'WITHDRAW' },
  { id: 'income', label: 'Income', type: 'PROFIT,REWARD,REFERRAL' },
  { id: 'trade', label: 'Trades', type: 'STAKE,RESERVE,SELL' },
];

/** Groups transactions under "Today", "Yesterday" or a date. */
function groupByDay(list) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups = [];
  for (const t of list) {
    const d = new Date(t.createdAt).toDateString();
    const label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : dateShort(t.createdAt);
    if (groups.at(-1)?.label !== label) groups.push({ label, items: [] });
    groups.at(-1).items.push(t);
  }
  return groups;
}

export default function Transactions() {
  const [params, setParams] = useSearchParams();
  const filter = FILTERS.find((f) => f.id === params.get('type')) || FILTERS[0];
  const { data, loading, error, reload } = useApi(() => api.getTransactions({ type: filter.type }), [filter.id]);

  return (
    <div className="screen">
      <TopBar title="History record" />
      <div className="page">
        <Chips items={FILTERS} value={filter.id} onChange={(id) => setParams(id === 'all' ? {} : { type: id }, { replace: true })} />
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading ? (
          <ListSkeleton rows={6} h={60} />
        ) : !data.length ? (
          <Empty icon="receipt" title="No transactions" text="Your activity will show up here." />
        ) : (
          groupByDay(data).map((g) => (
            <section key={g.label}>
              <p className="group-label">{g.label}</p>
              <div className="card list-card">
                {g.items.map((t) => (
                  <TxRow key={t.id} tx={t} time={dateTime(t.createdAt)} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
