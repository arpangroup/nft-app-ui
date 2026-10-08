import { api } from '../api';
import Icon from '../components/Icon';
import { TopBar } from '../components/Nav';
import { ErrorState, Skeleton } from '../components/States';
import { QrCode } from '../components/Widgets';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { copyText, CURRENCY, money } from '../utils';

export default function Referral() {
  const { showToast } = useApp();
  const { data, loading, error, reload } = useApi(() => api.getReferral(), []);

  const copy = async (text, what) => {
    if (await copyText(text)) showToast(`${what} copied`, 'success');
  };
  const share = async () => {
    const payload = { title: 'Join me on TrustAI', text: `Use my invitation code ${data.code}`, url: data.link };
    if (navigator.share) await navigator.share(payload).catch(() => undefined);
    else copy(data.link, 'Invite link');
  };

  return (
    <div className="screen">
      <TopBar title="Invite friends" />
      <div className="page">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading ? (
          <Skeleton h={520} r={24} />
        ) : (
          <>
            <div className="ref-hero">
              <span className="ref-gift">🎁</span>
              <h2>
                Invite friends,
                <br />
                <span className="grad-text">earn 100% cashback</span>
              </h2>
              <p>Earn rewards from three tiers of your community, every single day.</p>
            </div>

            <div className="card ref-card">
              <div className="ref-stats">
                <div>
                  <b>{data.invitedCount}</b>
                  <span>Invited</span>
                </div>
                <div>
                  <b>{data.activeCount}</b>
                  <span>Active</span>
                </div>
                <div>
                  <b className="pos">{money(data.rewards)}</b>
                  <span>Rewards {CURRENCY}</span>
                </div>
              </div>
              <QrCode value={data.link} size={150} />
              <p className="muted xs center">Your invitation code</p>
              <button className="code-box" onClick={() => copy(data.code, 'Code')}>
                <span>{data.code}</span>
                <Icon name="copy" size={18} />
              </button>
              <button className="address-box" onClick={() => copy(data.link, 'Invite link')}>
                <span>{data.link}</span>
                <Icon name="link" size={16} />
              </button>
              <button className="btn btn-primary btn-lg btn-block" onClick={share}>
                <Icon name="share" size={18} /> Share invite link
              </button>
            </div>

            <div className="card">
              <p className="card-label">How it works</p>
              <ol className="rules">
                {data.rules.map((r, i) => (
                  <li key={r}>
                    <span>{i + 1}</span>
                    <p>{r}</p>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
