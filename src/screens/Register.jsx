import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import Field from '../components/Field';
import Icon from '../components/Icon';
import { TopBar } from '../components/Nav';
import { Spinner } from '../components/States';
import { useApp } from '../context/AppContext';

const validate = (f) => {
  const e = {};
  if (f.username && f.username.trim().length < 4) e.username = 'At least 4 characters';
  if (f.password && f.password.length < 6) e.password = 'At least 6 characters';
  if (f.confirm && f.confirm !== f.password) e.confirm = 'Passwords don’t match';
  if (f.phone && !/^\d{10}$/.test(f.phone)) e.phone = 'Enter a 10-digit mobile number';
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email';
  return e;
};

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ username: '', password: '', confirm: '', phone: '', email: '', inviteCode: params.get('ref') || '' });
  const [agree, setAgree] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useApp();
  const navigate = useNavigate();
  const errors = useMemo(() => validate(form), [form]);
  const set = (k) => (e) => setForm({ ...form, [k]: k === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value });
  const ready = form.username && form.password && form.confirm && form.inviteCode && agree && !Object.keys(errors).length;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { confirm, ...body } = form; // eslint-disable-line no-unused-vars
      await signIn(await api.register({ ...body, phone: form.phone ? `+91${form.phone}` : '' }));
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="screen auth">
      <TopBar title="" transparent />
      <div className="auth-head left">
        <h1>Create account</h1>
        <p>Join TrustAI with an invitation code from a member.</p>
      </div>

      <form className="auth-form" onSubmit={submit} autoComplete="off">
        <Field label="Account" required icon="user" placeholder="Choose an account name" value={form.username} onChange={set('username')} error={errors.username} autoCapitalize="none" />
        <Field label="Password" required icon="lock" type="password" placeholder="At least 6 characters" value={form.password} onChange={set('password')} error={errors.password} />
        <Field label="Confirm password" required icon="lock" type="password" placeholder="Enter your password again" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Field
          label="Phone number"
          icon="phone"
          inputMode="numeric"
          placeholder="Mobile number"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
          prefix="+91"
        />
        <Field label="Email" icon="mail" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Invitation code" required icon="ticket" placeholder="Enter invitation code" value={form.inviteCode} onChange={set('inviteCode')} autoCapitalize="characters" />

        <label className="check-row">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span className="check-box">
            <Icon name="check" size={13} stroke={3} />
          </span>
          <span>
            I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
          </span>
        </label>

        {error && (
          <p className="form-error">
            <Icon name="info" size={16} /> {error}
          </p>
        )}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy || !ready}>
          {busy ? <Spinner /> : 'Create account'}
        </button>
      </form>

      <p className="auth-foot">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
