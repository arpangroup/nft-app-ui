import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { LogoMark } from '../components/Brand';
import Field from '../components/Field';
import Icon from '../components/Icon';
import { Spinner } from '../components/States';
import { useApp } from '../context/AppContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { signIn, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(await api.login(form));
      navigate(location.state?.from || '/home', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="screen auth">
      <div className="auth-glow" />
      <div className="auth-head">
        <LogoMark size={56} />
        <h1>Welcome back</h1>
        <p>Sign in to continue trading on TrustAI</p>
      </div>

      <form className="auth-form" onSubmit={submit} autoComplete="off">
        <Field label="Account" icon="user" placeholder="Enter your account" value={form.username} onChange={set('username')} autoCapitalize="none" />
        <Field label="Password" icon="lock" type="password" placeholder="Enter your password" value={form.password} onChange={set('password')} />
        <div className="auth-row">
          <span />
          <button type="button" className="link-btn" onClick={() => showToast('Please contact support to reset your password')}>
            Forgot password?
          </button>
        </div>
        {error && (
          <p className="form-error">
            <Icon name="info" size={16} /> {error}
          </p>
        )}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy || !form.username || !form.password}>
          {busy ? <Spinner /> : 'Sign in'}
        </button>
      </form>

      {/* inline flag so the hint is compiled out of non-mock builds */}
      {import.meta.env.VITE_USE_MOCK === 'true' && (
        <button type="button" className="demo-hint" onClick={() => setForm({ username: 'demo', password: 'demo123' })}>
          <Icon name="sparkle" size={16} />
          <span>
            Mock mode · tap to use <b>demo / demo123</b>
          </span>
        </button>
      )}

      <p className="auth-foot">
        New to TrustAI? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
