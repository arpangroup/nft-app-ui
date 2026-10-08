import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Field from '../components/Field';
import Icon, { Coin } from '../components/Icon';
import { Segmented, TopBar } from '../components/Nav';
import { Dialog } from '../components/Overlays';
import { ErrorState, Skeleton, Spinner } from '../components/States';
import { KV } from '../components/Widgets';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { CURRENCY, money } from '../utils';

export default function Withdraw() {
  const navigate = useNavigate();
  const { wallet, setWallet } = useApp();
  const { data: info, loading, error, reload } = useApi(() => api.getWithdrawInfo(), []);
  const [netId, setNetId] = useState('TRC20');
  const [form, setForm] = useState({ address: '', amount: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);
  const value = Number(form.amount) || 0;
  const fee = info ? (value * info.feePercent) / 100 : 0;
  const set = (k) => (e) => setForm({ ...form, [k]: k === 'amount' ? e.target.value.replace(/[^\d.]/g, '') : e.target.value });

  const submit = async () => {
    setErr('');
    setBusy(true);
    try {
      const res = await api.withdraw({ networkId: netId, address: form.address.trim(), amount: value, password: form.password });
      setWallet(res.wallet);
      setDone(res.transaction);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen">
      <TopBar title="Withdraw USDT" right={<button className="icon-btn" onClick={() => navigate('/transactions?type=WITHDRAW')} aria-label="History"><Icon name="receipt" size={20} /></button>} />
      <div className="page">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading ? (
          <Skeleton h={420} r={24} />
        ) : (
          <>
            <div className="avail-card">
              <span className="muted xs">Available to withdraw</span>
              <h2>
                <Coin size={22} /> {money(wallet?.balance)} <small>{CURRENCY}</small>
              </h2>
            </div>

            <Segmented items={info.networks.map((n) => ({ id: n.id, label: n.id }))} value={netId} onChange={setNetId} />

            <div className="card stack">
              <Field label="Wallet address" icon="wallet" placeholder={`Your USDT ${netId} address`} value={form.address} onChange={set('address')} autoCapitalize="none" />
              <Field
                label="Amount"
                icon="downArrow"
                inputMode="decimal"
                placeholder={`Min ${info.minWithdraw}`}
                value={form.amount}
                onChange={set('amount')}
                trailing={
                  <button type="button" className="field-max" onClick={() => setForm({ ...form, amount: String(Math.floor((wallet?.balance || 0) * 100) / 100) })}>
                    MAX
                  </button>
                }
              />
              <Field label="Login password" icon="lock" type="password" placeholder="Confirm with your password" value={form.password} onChange={set('password')} />

              <div className="kv-list boxed">
                <KV label={`Network fee (${info.feePercent}%)`}>
                  {money(fee)} {CURRENCY}
                </KV>
                <KV label="You will receive" strong>
                  {money(Math.max(0, value - fee))} {CURRENCY}
                </KV>
              </div>

              {err && (
                <p className="form-error">
                  <Icon name="info" size={16} /> {err}
                </p>
              )}
              <button className="btn btn-primary btn-lg btn-block" disabled={busy || !form.address || !value || !form.password} onClick={submit}>
                {busy ? <Spinner /> : 'Withdraw'}
              </button>
            </div>

            <div className="notice">
              <Icon name="shield" size={18} />
              <p>Withdrawals are reviewed for your security and usually arrive within 30 minutes.</p>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={Boolean(done)}
        tone="success"
        title="Withdrawal requested"
        onClose={() => navigate('/wallet', { replace: true })}
        actions={
          <button className="btn btn-primary btn-block" onClick={() => navigate('/wallet', { replace: true })}>
            Done
          </button>
        }
      >
        {done && (
          <div className="kv-list boxed">
            <KV label="Amount">
              {money(Math.abs(done.amount))} {CURRENCY}
            </KV>
            <KV label="Network">{netId}</KV>
            <KV label="Status">
              <span className="status status-pending">pending</span>
            </KV>
          </div>
        )}
      </Dialog>
    </div>
  );
}
