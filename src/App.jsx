import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Topbar from './components/Topbar.jsx';
import Hero from './components/Hero.jsx';
import Projects from './components/Projects.jsx';
import StoryScroll from './components/StoryScroll.jsx';
import Guestbook from './components/Guestbook.jsx';
import Footer from './components/Footer.jsx';
import AchievementModal from './components/AchievementModal.jsx';
import SparkleTrail from './components/SparkleTrail.jsx';
import Preloader from './components/Preloader.jsx';
import { playVictoryArpeggio } from './utils/sound.js';

const CHAOS_STICKERS = [
  { char: '🎀', top: '12%', left: '4%', delay: '0s' },
  { char: '💀', top: '22%', right: '5%', delay: '0.6s' },
  { char: '⭐', top: '55%', left: '2%', delay: '1.2s' },
  { char: '🌙', top: '68%', right: '3%', delay: '1.8s' },
];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [toggles, setToggles] = useState({ muted: false, dark: false, chaos: false });
  const [cursor, setCursor] = useState({ x: -999, y: -999, pupil: { x: 0, y: 0 } });
  const [egg, setEgg] = useState({ boops: 0, unlocked: false, open: false });
  const [dreams, setDreams] = useState(() => {
    try {
      return parseInt(localStorage.getItem('pip_odometer_count') || '1492', 10);
    } catch {
      return 1492;
    }
  });

  const skullRef = useRef(null);
  const modalTimerRef = useRef(null);

  // dev easter egg for curious inspectors
  useEffect(() => {
    console.log(
      `%c
   .---.
  /     \\     🎀
 | () () |  .-'
  \\  ^  /  '
   |||||
  '-----'
%c💀 PIP.BABY // Midnight Nursery v2.4
%cHey curious dev! Pip says hello from the Midnight Nursery.
The secret is in the pink bow. (Try booping it 3 times...)
`,
      'color: #ffb703; font-family: monospace; font-weight: bold; font-size: 11px; line-height: 1.1;',
      'color: #a34063; font-weight: 900; font-size: 13px; font-family: sans-serif; padding: 2px 0;',
      'color: #8b6355; font-size: 11px; font-family: sans-serif; font-style: italic;'
    );
  }, []);

  // lock body scrolling while preloader is active
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  // sync theme class to root for tailwind v4
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (toggles.dark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, [toggles.dark]);

  // TODO: refactor this if odometer exceeds 999k
  useEffect(() => {
    try {
      localStorage.setItem('pip_odometer_count', String(dreams));
    } catch {
      // storage blocked or private browsing
    }
  }, [dreams]);

  // track cursor position + clamp skull pupil offset to max 5px
  useEffect(() => {
    const onMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;

      let px = 0;
      let py = 0;
      if (skullRef.current) {
        const r = skullRef.current.getBoundingClientRect();
        const ox = cx - (r.left + r.width / 2);
        const oy = cy - (r.top + r.height / 2);
        const dist = Math.hypot(ox, oy);
        const scale = dist > 0 ? Math.min(5, dist / 16) / dist : 0;
        px = ox * scale;
        py = oy * scale;
      }

      setCursor({ x: cx, y: cy, pupil: { x: px, y: py } });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
    };
  }, []);

  const addDreams = useCallback((n = 1) => {
    setDreams((prev) => prev + n);
  }, []);

  const closeModal = useCallback(() => {
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = null;
    }
    setEgg((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    return () => {
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    };
  }, []);

  const boopPip = useCallback(() => {
    setEgg((prev) => {
      const nextBoops = prev.boops + 1;
      if (nextBoops >= 3) {
        addDreams(5);
        playVictoryArpeggio(toggles.muted);
        try {
          confetti({
            particleCount: 100,
            spread: 85,
            origin: { y: 0.5 },
            colors: ['#a34063', '#ffb703', '#fff8f1', '#5c4033', '#c084fc'],
            disableForReducedMotion: true,
          });
        } catch {}

        if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
        modalTimerRef.current = setTimeout(() => {
          setEgg((curr) => ({ ...curr, open: false }));
          modalTimerRef.current = null;
        }, 4500);

        return { boops: 0, unlocked: true, open: true };
      }
      return { ...prev, boops: nextBoops };
    });
  }, [addDreams, toggles.muted]);

  return (
    <>
      {isLoading && (
        <Preloader
          onComplete={() => setIsLoading(false)}
          showOncePerSession={false}
          isMuted={toggles.muted}
        />
      )}

      <div
        data-testid="app-container"
        className={`min-h-screen relative font-fredoka bg-[#fffaf3] dark:bg-[#161124] text-[#5c4033] dark:text-[#fff8f1] transition-colors duration-300 ${toggles.chaos ? 'chaos-active' : ''}`}
        aria-hidden={isLoading}
      >
      {toggles.dark && (
        <div
          data-testid="midnight-torch-mask"
          className="pointer-events-none fixed inset-0 z-[40] transition-[background] duration-150"
          style={{
            background: cursor.x > -500
              ? `radial-gradient(circle 240px at ${cursor.x}px ${cursor.y}px, transparent 10%, rgba(12, 8, 22, 0.88) 100%)`
              : `radial-gradient(circle 240px at 50% 50%, transparent 10%, rgba(12, 8, 22, 0.88) 100%)`,
          }}
          aria-hidden="true"
        />
      )}

      <SparkleTrail isDark={toggles.dark} />

      {toggles.chaos && CHAOS_STICKERS.map((s) => (
        <span
          key={s.char + s.top}
          className="chaos-sticker"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            animationDelay: s.delay,
          }}
          aria-hidden="true"
        >
          {s.char}
        </span>
      ))}

      <Topbar
        isMuted={toggles.muted}
        isDark={toggles.dark}
        isChaos={toggles.chaos}
        dreamsCount={dreams}
        onMuteToggle={() => setToggles((t) => ({ ...t, muted: !t.muted }))}
        onDarkToggle={() => setToggles((t) => ({ ...t, dark: !t.dark }))}
        onChaosToggle={() => setToggles((t) => ({ ...t, chaos: !t.chaos }))}
        onDispatchDream={() => addDreams(1)}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-14 space-y-28 relative z-10" role="main">
        <Hero
          isMuted={toggles.muted}
          isDark={toggles.dark}
          dreamsDelivered={dreams}
          boopCount={egg.boops}
          secretUnlocked={egg.unlocked}
          onBoop={boopPip}
          onWave={() => addDreams(1)}
          pupilOffset={cursor.pupil}
          skullRef={skullRef}
        />

        <Projects
          isMuted={toggles.muted}
          isDark={toggles.dark}
          onDreamsEarned={addDreams}
        />

        <StoryScroll isMuted={toggles.muted} />

        <Guestbook
          isMuted={toggles.muted}
          onDreamsEarned={addDreams}
        />
      </main>

      <Footer />

      <AchievementModal
        show={egg.open}
        onClose={closeModal}
      />
    </div>
    </>
  );
}