import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Field from '../components/Field';
import Icon from '../components/Icon';
import { Segmented, TopBar } from '../components/Nav';
import { Dialog } from '../components/Overlays';
import { ErrorState, Skeleton, Spinner } from '../components/States';
import { KV, QrCode } from '../components/Widgets';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { copyText, CURRENCY, money } from '../utils';

export default function Deposit() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { data, loading, error, reload } = useApi(() => api.getDepositInfo(), []);
  const [netId, setNetId] = useState('TRC20');
  const [form, setForm] = useState({ amount: '', txHash: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [err, setErr] = useState('');
  const net = data?.networks.find((n) => n.id === netId);

  const copy = async () => {
    if (await copyText(net.address)) showToast('Address copied', 'success');
  };

  const submit = async () => {
    setErr('');
    setBusy(true);
    try {
      const { transaction } = await api.submitDeposit({ networkId: netId, amount: Number(form.amount), txHash: form.txHash });
      setDone(transaction);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen">
      <TopBar title="Deposit USDT" right={<button className="icon-btn" onClick={() => navigate('/transactions?type=DEPOSIT')} aria-label="History"><Icon name="receipt" size={20} /></button>} />
      <div className="page">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading ? (
          <Skeleton h={360} r={24} />
        ) : (
          <>
            <Segmented items={data.networks.map((n) => ({ id: n.id, label: n.id }))} value={netId} onChange={setNetId} />
            <div className="card deposit-card">
              <p className="muted xs center">{net.name}</p>
              <QrCode value={net.address} size={176} />
              <p className="muted xs center">Scan or copy the deposit address</p>
              <button className="address-box" onClick={copy}>
                <span>{net.address}</span>
                <Icon name="copy" size={18} />
              </button>
              <div className="kv-list">
                <KV label="Minimum deposit">
                  {net.minDeposit} {CURRENCY}
                </KV>
                <KV label="Confirmations">{net.confirmations} blocks</KV>
                <KV label="Arrival">≈ 1–3 minutes</KV>
              </div>
            </div>

            <div className="notice">
              <Icon name="info" size={18} />
              <p>
                Send only <b>USDT</b> on the <b>{net.id}</b> network. Other assets or networks will be lost.
              </p>
            </div>

            <div className="card">
              <p className="card-label">Confirm your transfer</p>
              <div className="stack">
                <Field label="Amount sent" icon="wallet" inputMode="decimal" placeholder={`Min ${net.minDeposit}`} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^\d.]/g, '') })} />
                <Field label="Transaction hash (TxID)" icon="link" placeholder="Paste the TxID from your wallet" value={form.txHash} onChange={(e) => setForm({ ...form, txHash: e.target.value.trim() })} />
                {err && (
                  <p className="form-error">
                    <Icon name="info" size={16} /> {err}
                  </p>
                )}
                <button className="btn btn-primary btn-lg btn-block" disabled={busy || !form.amount || !form.txHash} onClick={submit}>
                  {busy ? <Spinner /> : 'I have transferred'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={Boolean(done)}
        tone="success"
        title="Deposit submitted"
        onClose={() => navigate('/wallet', { replace: true })}
        actions={
          <button className="btn btn-primary btn-block" onClick={() => navigate('/wallet', { replace: true })}>
            Back to wallet
          </button>
        }
      >
        <p className="muted center">We’ll credit your wallet once the network confirms your transfer.</p>
        {done && (
          <div className="kv-list boxed">
            <KV label="Amount">
              {money(done.amount)} {CURRENCY}
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
