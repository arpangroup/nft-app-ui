import { useEffect, useRef } from 'react';
import { Portal } from './Overlays';

const COLORS = ['#8b5cf6', '#22d3ee', '#f472b6', '#facc15', '#34d399', '#fb923c'];

/** One-shot confetti burst over the phone frame. Re-fires whenever `fire` changes to a truthy value. */
export default function Confetti({ fire }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!fire || !ref.current) return undefined;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const parts = Array.from({ length: 140 }, () => ({
      x: width / 2 + (Math.random() - 0.5) * 60,
      y: height * 0.42,
      vx: (Math.random() - 0.5) * 11,
      vy: -Math.random() * 12 - 4,
      w: 5 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    let frame;
    const start = performance.now();
    const draw = (t) => {
      const life = (t - start) / 2200;
      ctx.clearRect(0, 0, width, height);
      for (const p of parts) {
        p.vy += 0.32;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (life < 1) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, width, height);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      // Stopping mid-burst (e.g. the dialog closed) must not leave the last frame painted.
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    };
  }, [fire]);

  return (
    <Portal>
      <canvas ref={ref} className="confetti" />
    </Portal>
  );
}
