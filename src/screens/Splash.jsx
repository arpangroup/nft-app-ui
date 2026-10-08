import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoMark } from '../components/Brand';
import { useApp } from '../context/AppContext';

export const ONBOARDED_KEY = 'trustai.onboarded';

export default function Splash() {
  const navigate = useNavigate();
  const { isLoggedIn } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      let seen = false;
      try {
        seen = localStorage.getItem(ONBOARDED_KEY) === '1';
      } catch {
        /* ignore */
      }
      navigate(isLoggedIn ? '/home' : seen ? '/login' : '/welcome', { replace: true });
    }, 1700);
    return () => clearTimeout(t);
  }, [isLoggedIn, navigate]);

  return (
    <div className="screen splash">
      <div className="splash-glow" />
      <div className="splash-center">
        <div className="splash-logo">
          <LogoMark size={86} />
        </div>
        <h1 className="splash-title">
          Trust<b>AI</b>
        </h1>
        <p className="splash-tag">Collect · Stake · Earn</p>
      </div>
      <div className="splash-foot">
        <span className="loader-bar" />
        <p>Secured by on-chain verification</p>
      </div>
    </div>
  );
}
