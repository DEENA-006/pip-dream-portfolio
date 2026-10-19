/**
 * Preloader.jsx — Award-Level Storybook Preloader
 * "Pip, The Skull Baby | Junior Dream Engineer at Midnight Nursery"
 *
 * Designed to feel like the opening scene of the vintage storybook:
 *  - Theme: Warm cream (#fffaf3) paper texture with soft amber radial glow
 *  - Pip on his cloud with floating idle animation + depth shadow ellipse
 *  - Amber eye-tracker glow overlay with soft pulse
 *  - 7 pastel orbiting stars with springy entrance + individual twinkle
 *  - Sleeping crescent moon with blush + floating "z" drift particles
 *  - Rotating cozy status headline with raspberry-pink highlighted keyword
 *  - Signature dashed raspberry progress bar with glowing star cursor
 *  - Monospace sparkle counter chip matching the Topbar dream counter
 *  - Climax at 100%: Pip wave wiggle, bright eye flash, 14-star magic burst,
 *    and Web Audio music-box chime (C5 → E5 → G5 → C6)
 *  - Fabric blanket pull-up exit transition with curved hemline
 *  - Full accessibility (aria-live, role="status", prefers-reduced-motion safe)
 *
 * Props:
 *  - onComplete: () => void       Called when exit animation finishes
 *  - minDuration: number           Minimum duration in ms (default: 2800)
 *  - showOncePerSession: boolean   If true, show quick fade on repeat visits (default: false)
 *  - isMuted: boolean              Mute the exit music-box chime (default: false)
 */

import { useEffect, useRef, useState, useMemo } from 'react';

// ─── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_MIN_DURATION = 2800;
const PIP_AVATAR_URL = 'https://hax.baby/baby/assets/pip_avatar_cloud.png';

const PHRASES = [
  { prefix: 'Tucking in the ', highlight: 'dreams', suffix: '…' },
  { prefix: 'Fluffing the ', highlight: 'clouds', suffix: '…' },
  { prefix: 'Polishing the ', highlight: 'nightlights', suffix: '…' },
  { prefix: 'Humming a ', highlight: 'lullaby', suffix: '…' },
  { prefix: 'Counting tiny ', highlight: 'stars', suffix: '…' },
  { prefix: 'Winding brass ', highlight: 'music boxes', suffix: '…' },
];

// 7 pastel stars around Pip: angle (deg), distance (px), size (px), color, anim duration (s)
const ORBIT_STARS = [
  { id: 1, angle:   0, dist: 146, size: 16, color: '#ffb703', dur: 18, delay: 0.05 },
  { id: 2, angle:  51, dist: 162, size: 11, color: '#c084fc', dur: 22, delay: 0.18 },
  { id: 3, angle: 103, dist: 140, size: 14, color: '#a34063', dur: 16, delay: 0.32 },
  { id: 4, angle: 155, dist: 168, size: 10, color: '#86efac', dur: 25, delay: 0.45 },
  { id: 5, angle: 206, dist: 148, size: 18, color: '#fca5a5', dur: 20, delay: 0.58 },
  { id: 6, angle: 257, dist: 160, size: 11, color: '#7dd3fc', dur: 19, delay: 0.72 },
  { id: 7, angle: 308, dist: 142, size: 13, color: '#f9a8d4', dur: 23, delay: 0.85 },
];

// Floating Zzz letters
const ZZZ_PARTICLES = [
  { id: 1, x: -35, size: 18, delay: 0.2 },
  { id: 2, x:  25, size: 13, delay: 1.1 },
  { id: 3, x:  -8, size: 10, delay: 2.0 },
];

// 14 sparkle burst particles for 100% climax
const BURST_PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i * (360 / 14) * Math.PI) / 180;
  const dist = 110 + (i % 3) * 28;
  return {
    id: i,
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    size: 10 + (i % 4) * 4,
    color: ['#ffb703', '#c084fc', '#f9a8d4', '#86efac', '#a34063'][i % 5],
  };
});

// ─── Web Audio Music-Box Chime (C5, E5, G5, C6) ────────────────────────────────
function playMusicBoxChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.75);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.8);
    });
    setTimeout(() => {
      try { ctx.close(); } catch {}
    }, 2200);
  } catch {}
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function OrbitStar({ angle, dist, size, color, dur, delay, prefersRM }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * dist;
  const y = Math.sin(rad) * dist;

  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
        fontSize: `${size}px`,
        color,
        display: 'inline-block',
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
        animation: prefersRM
          ? 'none'
          : `starPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both, orbitTwinkle ${dur}s ease-in-out ${delay + 0.5}s infinite alternate`,
      }}
    >
      ✦
    </span>
  );
}

function SleepingMoon({ prefersRM }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: 'calc(50% - 190px)',
        top: 'calc(50% - 150px)',
        display: 'inline-block',
        userSelect: 'none',
        pointerEvents: 'none',
        animation: prefersRM ? 'none' : 'moonSway 4.5s ease-in-out infinite alternate',
      }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft yellow crescent */}
        <path
          d="M34 22C34 29.18 28.18 35 21 35C13.82 35 8 29.18 8 22C8 14.82 13.82 9 21 9C17.4 9 14.5 12.13 14.5 16C14.5 22.08 19.42 27 25.5 27C29.37 27 32.5 24.1 32.5 20.5C33.43 21 34 21.46 34 22Z"
          fill="#ffb703"
          opacity="0.95"
          filter="drop-shadow(0 2px 8px rgba(255,183,3,0.35))"
        />
        {/* Sleeping eye line */}
        <line x1="18" y1="18" x2="21.5" y2="18" stroke="#5c4033" strokeWidth="1.6" strokeLinecap="round" />
        {/* Cute blush cheeks */}
        <circle cx="16" cy="22" r="2.2" fill="#fca5a5" opacity="0.8" />
        {/* Gentle smile */}
        <path d="M19 22 Q20.5 23.5 22 22" stroke="#5c4033" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      </svg>
    </span>
  );
}

function ZzzParticle({ x, size, delay, prefersRM }) {
  if (prefersRM) return null;
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: `calc(50% + ${x}px)`,
        top: 'calc(50% - 75px)',
        fontSize: `${size}px`,
        color: '#a34063',
        fontFamily: 'var(--font-head, "Fraunces", Georgia, serif)',
        fontStyle: 'italic',
        fontWeight: 900,
        opacity: 0,
        userSelect: 'none',
        pointerEvents: 'none',
        animation: `zzzDrift 2.6s ease-in-out ${delay}s infinite`,
      }}
    >
      z
    </span>
  );
}

// ─── Main Preloader Component ──────────────────────────────────────────────────
export default function Preloader({
  onComplete,
  minDuration = DEFAULT_MIN_DURATION,
  showOncePerSession = false,
  isMuted = false,
}) {
  const [progress, setProgress] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [sparkleCount, setSparkleCount] = useState(0);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'complete' | 'exit'

  const startTimeRef = useRef(Date.now());
  const rafRef = useRef(null);
  const phraseTimerRef = useRef(null);
  const chimedRef = useRef(false);

  // Check reduced motion preference (respect it gracefully without skipping the preloader)
  const prefersRM = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Repeat session check: only if explicitly opted in
  useEffect(() => {
    if (showOncePerSession) {
      try {
        const seen = sessionStorage.getItem('pip_preloader_seen');
        if (seen === 'true') {
          // Soft 400ms quick exit on repeat visits within the same session
          const t = setTimeout(() => {
            onComplete?.();
          }, 400);
          return () => clearTimeout(t);
        }
      } catch {}
    }
  }, [showOncePerSession, onComplete]);

  // Smooth rAF progress loop (ease-out cubic towards 100%)
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const raw = Math.min(elapsed / minDuration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - raw, 3);
      const pct = Math.min(Math.round(eased * 1000) / 10, 100);

      setProgress(pct);
      setSparkleCount(Math.min(Math.round(pct), 100));

      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setSparkleCount(100);
        setPhase('complete');
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [minDuration]);

  // Rotate cozy status phrases every 1.35 seconds
  useEffect(() => {
    if (phase !== 'loading') return;
    phraseTimerRef.current = setInterval(() => {
      setPhraseIdx((idx) => (idx + 1) % PHRASES.length);
    }, 1350);

    return () => {
      if (phraseTimerRef.current) clearInterval(phraseTimerRef.current);
    };
  }, [phase]);

  // Climax when 100% is reached: chime, wave, then trigger exit
  useEffect(() => {
    if (phase !== 'complete') return;

    if (!chimedRef.current) {
      chimedRef.current = true;
      if (!isMuted) {
        playMusicBoxChime();
      }
    }

    // Hold climax for 650ms to let user see Pip wave and sparkle burst
    const t = setTimeout(() => {
      setPhase('exit');
    }, 650);

    return () => clearTimeout(t);
  }, [phase, isMuted]);

  // Exit transition finishes → notify parent
  useEffect(() => {
    if (phase !== 'exit') return;

    try {
      sessionStorage.setItem('pip_preloader_seen', 'true');
    } catch {}

    const t = setTimeout(() => {
      onComplete?.();
    }, 650); // Matches blanketPull duration

    return () => clearTimeout(t);
  }, [phase, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (phraseTimerRef.current) clearInterval(phraseTimerRef.current);
    };
  }, []);

  const currentPhrase = PHRASES[phraseIdx] || PHRASES[0];

  return (
    <>
      {/* Self-contained CSS keyframe animations */}
      <style>{`
        @keyframes pipFloat {
          0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
          50%      { transform: translateY(-13px) rotate(0.8deg); }
        }
        @keyframes pipShadowDepth {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%      { transform: scale(0.84); opacity: 0.55; }
        }
        @keyframes pipWaveWiggle {
          0%   { transform: rotate(0deg) scale(1); }
          25%  { transform: rotate(-5deg) scale(1.05); }
          50%  { transform: rotate(5deg) scale(1.05); }
          75%  { transform: rotate(-3deg) scale(1.02); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes eyeGlowPulse {
          0%, 100% { opacity: 0.45; transform: scale(0.9); }
          50%      { opacity: 0.95; transform: scale(1.25); }
        }
        @keyframes eyeFlashClimax {
          0%   { opacity: 0.5; transform: scale(1); }
          50%  { opacity: 1; transform: scale(1.8); }
          100% { opacity: 0.9; transform: scale(1.2); }
        }
        @keyframes starPopIn {
          0%   { transform: translate(-50%, -50%) scale(0) rotate(-45deg); opacity: 0; }
          70%  { transform: translate(-50%, -50%) scale(1.25) rotate(10deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes orbitTwinkle {
          0%   { transform: translate(-50%, -50%) scale(0.85); opacity: 0.45; }
          100% { transform: translate(-50%, -50%) scale(1.25); opacity: 1; }
        }
        @keyframes moonSway {
          0%   { transform: rotate(-6deg) translateY(0px); }
          100% { transform: rotate(6deg) translateY(-8px); }
        }
        @keyframes zzzDrift {
          0%   { opacity: 0; transform: translateY(0) scale(0.9); }
          20%  { opacity: 0.85; }
          75%  { opacity: 0.5; }
          100% { opacity: 0; transform: translateY(-55px) translateX(22px) scale(0.65) rotate(15deg); }
        }
        @keyframes phraseSlideIn {
          0%   { opacity: 0; transform: translateY(8px); }
          15%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        @keyframes burstParticle {
          0%   { transform: translate(0, 0) scale(0); opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(1.2); opacity: 0; }
        }
        @keyframes blanketPullUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }
      `}</style>

      {/* Main Preloader Root Container */}
      <div
        id="pip-preloader"
        data-testid="midnight-preloader"
        role="status"
        aria-live="polite"
        aria-busy={phase !== 'exit'}
        aria-label="Loading Pip's Dream Nursery"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fffaf3',
          overflow: 'hidden',
          // Storybook horizontal paper texture + soft warm amber radial center glow
          backgroundImage: `
            radial-gradient(circle 380px at 50% 42%, rgba(255, 183, 3, 0.14) 0%, transparent 70%),
            linear-gradient(rgba(92, 64, 51, 0.035) 1px, transparent 1px),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeBlend in='SourceGraphic' mode='multiply'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")
          `,
          backgroundSize: '100% 100%, 100% 28px, 160px 160px',
          // Blanket pull-up exit transition with curved fabric hemline
          animation:
            phase === 'exit'
              ? 'blanketPullUp 0.65s cubic-bezier(0.76, 0, 0.24, 1) forwards'
              : 'none',
          borderBottomLeftRadius: phase === 'exit' ? '48px' : '0px',
          borderBottomRightRadius: phase === 'exit' ? '48px' : '0px',
          boxShadow: phase === 'exit' ? '0 25px 50px -12px rgba(92, 64, 51, 0.35)' : 'none',
        }}
      >
        <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
          Loading Pip's Dream Nursery portfolio. Please wait.
        </span>

        {/* 1. Pip Stage & Orbiting Decor */}
        <div
          aria-hidden="true"
          style={{
            position: 'relative',
            width: '320px',
            height: '280px',
            maxWidth: '90vw',
            maxHeight: '44vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {/* Orbiting Pastel Stars */}
          {ORBIT_STARS.map((s) => (
            <OrbitStar key={s.id} {...s} prefersRM={prefersRM} />
          ))}

          {/* Sleeping Crescent Moon at upper-right */}
          <SleepingMoon prefersRM={prefersRM} />

          {/* Floating Zzz Particles */}
          {ZZZ_PARTICLES.map((z) => (
            <ZzzParticle key={z.id} {...z} prefersRM={prefersRM} />
          ))}

          {/* Magic Climax Sparkle Burst (14 radiating stars at 100%) */}
          {phase !== 'loading' &&
            BURST_PARTICLES.map((p) => (
              <span
                key={p.id}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  fontSize: `${p.size}px`,
                  color: p.color,
                  lineHeight: 1,
                  pointerEvents: 'none',
                  '--dx': `${p.dx}px`,
                  '--dy': `${p.dy}px`,
                  animation: prefersRM ? 'none' : 'burstParticle 0.65s cubic-bezier(0.2, 0.8, 0.3, 1) forwards',
                }}
              >
                ✦
              </span>
            ))}

          {/* Depth Shadow Ellipse Beneath Pip's Cloud */}
          <div
            style={{
              position: 'absolute',
              bottom: '18px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '150px',
              height: '18px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(92, 64, 51, 0.16) 0%, transparent 72%)',
              animation: prefersRM ? 'none' : 'pipShadowDepth 3.2s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />

          {/* Pip Floating on Sleepy Cloud */}
          <div
            style={{
              position: 'relative',
              animation:
                phase === 'complete'
                  ? 'pipWaveWiggle 0.65s ease-in-out'
                  : prefersRM
                  ? 'none'
                  : 'pipFloat 3.2s ease-in-out infinite',
              willChange: 'transform',
            }}
          >
            <img
              src={PIP_AVATAR_URL}
              alt="Pip the Skull Baby floating on a sleepy cloud"
              width="210"
              height="210"
              style={{
                width: 'clamp(150px, 32vw, 210px)',
                height: 'auto',
                display: 'block',
                filter: 'drop-shadow(0 10px 22px rgba(92, 64, 51, 0.12))',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              loading="eager"
            />

            {/* Amber Eye-Glow Overlays (placed over Pip's eye sockets) */}
            <div
              style={{
                position: 'absolute',
                left: '42.5%',
                top: '34%',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#ffb703',
                boxShadow:
                  phase === 'complete'
                    ? '0 0 16px 6px rgba(255, 183, 3, 0.9)'
                    : '0 0 10px 3px rgba(255, 183, 3, 0.75)',
                pointerEvents: 'none',
                animation:
                  phase === 'complete'
                    ? 'eyeFlashClimax 0.6s ease-out'
                    : prefersRM
                    ? 'none'
                    : 'eyeGlowPulse 2.2s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '54.5%',
                top: '34%',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#ffb703',
                boxShadow:
                  phase === 'complete'
                    ? '0 0 16px 6px rgba(255, 183, 3, 0.9)'
                    : '0 0 10px 3px rgba(255, 183, 3, 0.75)',
                pointerEvents: 'none',
                animation:
                  phase === 'complete'
                    ? 'eyeFlashClimax 0.6s ease-out'
                    : prefersRM
                    ? 'none'
                    : 'eyeGlowPulse 2.2s ease-in-out 0.2s infinite',
              }}
            />
          </div>
        </div>

        {/* 2. Status Headline with Raspberry Highlight */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            width: '100%',
            maxWidth: '380px',
            padding: '0 24px',
            marginTop: '6px',
            textAlign: 'center',
          }}
        >
          {/* Reserved height headline container so layout never jumps */}
          <div
            aria-live="polite"
            aria-atomic="true"
            style={{
              height: '2.6em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              overflow: 'hidden',
            }}
          >
            {phase === 'complete' ? (
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-head, "Fraunces", Georgia, serif)',
                  fontWeight: 900,
                  fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
                  color: '#5c4033',
                  letterSpacing: '-0.02em',
                  transform: 'scale(1.05)',
                  transition: 'transform 0.3s ease',
                }}
              >
                Wake up, <span style={{ color: '#a34063' }}>dreamer</span>! ✨
              </h2>
            ) : (
              <h2
                key={phraseIdx}
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-head, "Fraunces", Georgia, serif)',
                  fontWeight: 800,
                  fontSize: 'clamp(1.1rem, 3.8vw, 1.45rem)',
                  color: '#5c4033',
                  letterSpacing: '-0.015em',
                  animation: prefersRM ? 'none' : 'phraseSlideIn 1.35s ease-in-out',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentPhrase.prefix}
                <span style={{ color: '#a34063' }}>{currentPhrase.highlight}</span>
                {currentPhrase.suffix}
              </h2>
            )}
          </div>

          {/* 3. Signature Dashed Raspberry Underline (Progress Bar) */}
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Loading progress"
            style={{
              width: '100%',
              maxWidth: '320px',
              position: 'relative',
              height: '14px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Faint beige baseline track */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '2px',
                borderBottom: '2px dashed rgba(92, 64, 51, 0.2)',
              }}
            />

            {/* Filled raspberry dashed line drawing left-to-right */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                top: '5px',
                width: `${progress}%`,
                height: '4px',
                borderBottom: '2.5px dashed #a34063',
                transition: 'width 0.08s linear',
              }}
            >
              {/* Glowing star cursor riding the leading edge */}
              <span
                style={{
                  position: 'absolute',
                  right: '-7px',
                  top: '-7px',
                  fontSize: '13px',
                  color: '#ffb703',
                  lineHeight: 1,
                  filter: 'drop-shadow(0 0 5px rgba(255, 183, 3, 0.9))',
                  userSelect: 'none',
                }}
              >
                ✦
              </span>
            </div>
          </div>

          {/* 4. Sparkle Counter Chip (Matching Topbar dream odometer styling) */}
          <div
            aria-live="polite"
            aria-label={`${sparkleCount}% loaded`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(92, 64, 51, 0.07)',
              border: '1.5px solid rgba(92, 64, 51, 0.16)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#5c4033',
              letterSpacing: '0.04em',
              userSelect: 'none',
            }}
          >
            <span aria-hidden="true" style={{ fontSize: '0.85rem' }}>✨</span>
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                minWidth: '4.5ch',
                display: 'inline-block',
                textAlign: 'right',
              }}
            >
              {sparkleCount}%
            </span>
          </div>

          {/* 5. Footer Microcopy */}
          <p
            style={{
              margin: '8px 0 0 0',
              fontFamily: 'var(--font-body, "Fredoka", sans-serif)',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#5c4033',
              opacity: 0.52,
              letterSpacing: '0.02em',
              textAlign: 'center',
            }}
          >
            Midnight Nursery is opening… shhh, don't wake the ghosts 👻
          </p>
        </div>
      </div>
    </>
  );
}
