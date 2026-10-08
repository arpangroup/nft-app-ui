import { useEffect, useState } from 'react';

/** Live countdown to an ISO time: { total, h, m, s, done } (h/m/s zero-padded strings). */
export default function useCountdown(target) {
  const end = target ? new Date(target).getTime() : 0;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!end) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [end]);

  const total = Math.max(0, Math.floor((end - now) / 1000));
  const pad = (n) => String(n).padStart(2, '0');
  return { total, h: pad(Math.floor(total / 3600)), m: pad(Math.floor((total % 3600) / 60)), s: pad(total % 60), done: !end || total === 0 };
}
