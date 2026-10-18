import { useEffect, useState, useCallback, useRef } from 'react';

const SHAPES = ['★', '✦', '✧', '♡', '⋆', '✿', '💤'];
const LIGHT_COLORS = ['#a34063', '#ffb703', '#5c4033', '#c85a82', '#9d8189'];
const DARK_COLORS  = ['#ffb703', '#ffd54f', '#a34063', '#fff8f1', '#b8c0ff'];

export default function SparkleTrail({ isDark = false }) {
  const [items, setItems] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const lastPos  = useRef({ x: -999, y: -999 });
  const idRef    = useRef(0);
  const colors   = isDark ? DARK_COLORS : LIGHT_COLORS;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const spawnSparkle = useCallback((x, y) => {
    if (reducedMotion) return;
    idRef.current += 1;
    const id = idRef.current;
    const item = {
      id,
      x, y,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size:  Math.round(Math.random() * 10 + 13),
      rot:   Math.round(Math.random() * 360),
      dx:    (Math.random() - 0.5) * 44,
      dy:    (Math.random() - 0.5) * 38 - 14,
    };

    setItems((prev) => {
      const trimmed = prev.length > 28 ? prev.slice(-24) : prev;
      return [...trimmed, item];
    });

    // Remove after animation completes
    const t = setTimeout(() => {
      setItems((prev) => prev.filter((s) => s.id !== id));
    }, 820);

    return () => clearTimeout(t);
  }, [colors, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const onMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const dist = Math.hypot(cx - lastPos.current.x, cy - lastPos.current.y);
      if (dist > 20) {
        lastPos.current = { x: cx, y: cy };
        spawnSparkle(cx, cy);
      }
    };

    const onTap = (e) => {
      if (e.touches?.length) {
        spawnSparkle(e.touches[0].clientX, e.touches[0].clientY);
        spawnSparkle(e.touches[0].clientX + 10, e.touches[0].clientY - 8);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove',  onMove, { passive: true });
    window.addEventListener('touchstart', onTap,  { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove',  onMove);
      window.removeEventListener('touchstart', onTap);
    };
  }, [spawnSparkle, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[52] overflow-hidden" aria-hidden="true">
      {items.map((s) => (
        <span
          key={s.id}
          className="sparkle-item select-none font-bold"
          style={{
            left:      s.x,
            top:       s.y,
            color:     s.color,
            fontSize:  `${s.size}px`,
            transform: `translate(-50%,-50%) rotate(${s.rot}deg)`,
            textShadow: isDark
              ? `0 0 8px ${s.color}cc`
              : `0 0 5px ${s.color}66`,
            '--dx': `${s.dx}px`,
            '--dy': `${s.dy}px`,
          }}
        >
          {s.shape}
        </span>
      ))}
    </div>
  );
}
