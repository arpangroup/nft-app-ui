import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import NftArt from '../components/NftArt';
import { ONBOARDED_KEY } from './Splash';

const SLIDES = [
  { title: 'Discover rare digital art', text: 'Curated, verified NFT collections from top creators — all in one place.', seeds: ['punk:w1', 'orb:w2', 'rings:w3'] },
  { title: 'Stake NFTs, earn daily', text: 'Lock NFTs in stake pools and receive rewards straight to your wallet.', seeds: ['bloom:w4', 'bauhaus:w5', 'punk:w6'] },
  { title: 'Reserve, sell & grow', text: 'Reserve an NFT each round, sell it for profit, and level up with your team.', seeds: ['rings:w7', 'punk:w8', 'orb:w9'] },
];

export default function Welcome() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  const finish = (to) => {
    try {
      localStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      /* ignore */
    }
    navigate(to, { replace: true });
  };

  return (
    <div className="screen welcome">
      <button className="skip-btn" onClick={() => finish('/login')}>
        Skip
      </button>
      <div className="welcome-art" key={i}>
        <div className="wa-card wa-1">
          <NftArt seed={slide.seeds[0]} />
        </div>
        <div className="wa-card wa-2">
          <NftArt seed={slide.seeds[1]} />
        </div>
        <div className="wa-card wa-3">
          <NftArt seed={slide.seeds[2]} />
          <div className="wa-tag">
            <span>Current bid</span>
            <b>1,284.00 USDT</b>
          </div>
        </div>
      </div>

      <div className="welcome-copy" key={`c${i}`}>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>
      </div>

      <div className="welcome-foot">
        <div className="dots">
          {SLIDES.map((_, k) => (
            <span key={k} className={k === i ? 'on' : ''} />
          ))}
        </div>
        {last ? (
          <div className="stack">
            <button className="btn btn-primary btn-lg btn-block" onClick={() => finish('/register')}>
              Create account
            </button>
            <button className="btn btn-ghost btn-lg btn-block" onClick={() => finish('/login')}>
              I already have an account
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-lg btn-block" onClick={() => setI(i + 1)}>
            Next <Icon name="chevron" size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
