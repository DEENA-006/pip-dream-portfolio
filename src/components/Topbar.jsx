import { useState } from 'react';
import confetti from 'canvas-confetti';
import { playSingleNote, playToggle, playChaos, setMasterMute } from '../utils/sound';
import { Gamepad2, MessageSquare, User, Plus, Volume2, VolumeX, Sun, Moon, Sparkles } from 'lucide-react';

const NAV_LINKS = [
  { href: '#projects',  label: 'Projects',  icon: Gamepad2,      note: 523.25 },
  { href: '#story',     label: 'Story',     icon: User,          note: 587.33 },
  { href: '#guestbook', label: 'Guestbook', icon: MessageSquare, note: 659.25 },
];

export default function Topbar({
  isMuted,
  isDark,
  isChaos,
  dreamsCount = 1492,
  onMuteToggle,
  onDarkToggle,
  onChaosToggle,
  onDispatchDream,
}) {
  const [hoveredNav, setHoveredNav] = useState(null);
  const [popups, setPopups] = useState([]);

  const toggleDark = () => {
    playToggle(isDark, isMuted);
    onDarkToggle();
  };

  const toggleChaos = () => {
    playChaos(!isChaos, isMuted);
    onChaosToggle();
  };

  const toggleMute = () => {
    const next = !isMuted;
    setMasterMute(next);
    onMuteToggle();
    if (!next) playSingleNote(880, false, 'triangle');
  };

  const dispatchDream = (e) => {
    playSingleNote(1046.5, isMuted, 'triangle');
    if (onDispatchDream) onDispatchDream();

    const id = Date.now() + Math.random();
    setPopups((prev) => [...prev.slice(-4), { id }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1150);

    try {
      const rect = e?.currentTarget?.getBoundingClientRect();
      if (rect) {
        confetti({
          particleCount: 16,
          spread: 45,
          startVelocity: 16,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          },
          colors: ['#ffb703', '#a34063', '#fff8f1'],
          disableForReducedMotion: true,
        });
      }
    } catch {}
  };

  return (
    <div className="sticky top-6 z-50 flex justify-center px-3 sm:px-4 w-full pointer-events-none">
      <nav
        data-testid="topbar"
        aria-label="Unified Navigation"
        className="pointer-events-auto unified-glass-capsule rounded-full px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-5 w-full max-w-fit mx-auto transition-all duration-300 ease-out"
      >
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <a
            href="#hero"
            onClick={() => playSingleNote(659.25, isMuted)}
            aria-label="Pip.baby — Return to home hero section"
            title="Pip.baby — Home"
            className="bg-[#fff8f1] dark:bg-[#201833] border-2 border-[#5c4033]/15 dark:border-white/15 px-3.5 sm:px-4 py-2 min-h-[44px] rounded-full shadow-sm font-bold text-xs uppercase flex items-center gap-1.5 active:scale-95 transition-all text-[#5c4033] dark:text-[#fff8f1] no-underline shrink-0"
          >
            <span role="img" aria-label="skull and bow" className="text-base select-none">💀🎀</span>
            <span className="font-fraunces font-extrabold text-xs sm:text-sm text-[#a34063] dark:text-[#ffb703] tracking-tight">Pip.baby</span>
          </a>

          {/* horizontal expanding pills on hover */}
          <div className="hidden sm:flex items-center gap-1 text-[#5c4033] dark:text-[#fff8f1] shrink-0">
            {NAV_LINKS.map(({ href, label, icon: Icon, note }) => {
              const isHovered = hoveredNav === href;
              return (
                <a
                  key={href}
                  href={href}
                  onClick={() => playSingleNote(note, isMuted)}
                  onMouseEnter={() => setHoveredNav(href)}
                  onMouseLeave={() => setHoveredNav(null)}
                  onFocus={() => setHoveredNav(href)}
                  onBlur={() => setHoveredNav(null)}
                  aria-label={`Jump to ${label} section`}
                  title={`Jump to ${label}`}
                  className={`nav-pill-item text-[#5c4033] dark:text-[#fff8f1] no-underline ${
                    isHovered ? 'is-expanded' : ''
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform duration-200" />
                  <span className={`nav-pill-label ${isHovered ? 'is-expanded' : ''}`}>
                    {label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* central action: live odometer increment */}
        <div className="flex items-center gap-1.5 shrink-0 relative">
          <button
            type="button"
            id="dispatch-dream-btn"
            data-testid="dispatch-dream-btn"
            onClick={dispatchDream}
            aria-label={`Dispatch a Dream (+1 to Odometer, current: ${dreamsCount})`}
            title="Dispatch +1 Dream to global odometer"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center cursor-pointer shadow-md active:scale-90 transition-all bg-gradient-to-tr from-[#a34063] to-[#ffb703] text-[#fff8f1] hover:shadow-[0_0_18px_rgba(255,183,3,0.7)] hover:scale-105 shrink-0 border border-white/40"
          >
            <Plus className="w-5 h-5 stroke-[3] transition-transform active:rotate-90" />
          </button>

          <button
            type="button"
            data-testid="odometer-topbar"
            onClick={dispatchDream}
            aria-label={`Current dream odometer: ${dreamsCount}. Click to dispatch another dream.`}
            title="Live dream odometer — click to dispatch +1 dream!"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-full bg-[#5c4033]/10 dark:bg-[#ffb703]/15 border border-[#5c4033]/20 dark:border-[#ffb703]/30 font-mono text-xs font-bold text-[#5c4033] dark:text-[#ffb703] cursor-pointer hover:bg-[#5c4033]/15 active:scale-95 transition-all select-none"
          >
            <span>✨</span>
            <span>{Number(dreamsCount).toLocaleString()}</span>
          </button>

          {popups.map((p) => (
            <span key={p.id} className="floating-dream-badge">
              +1 Dream! ✨
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            id="mute-toggle"
            data-testid="mute-toggle"
            type="button"
            onClick={toggleMute}
            onMouseEnter={() => setHoveredNav('mute')}
            onMouseLeave={() => setHoveredNav(null)}
            onFocus={() => setHoveredNav('mute')}
            onBlur={() => setHoveredNav(null)}
            aria-label={isMuted ? 'Unmute sound effects (Sound is currently off)' : 'Mute sound effects (Web Audio API active)'}
            title={isMuted ? 'Unmute sound effects (Sound is currently off)' : 'Mute sound effects (Web Audio synthesis active)'}
            aria-pressed={isMuted}
            className={`nav-pill-item text-[#5c4033] dark:text-[#fff8f1] ${
              hoveredNav === 'mute' ? 'is-expanded' : ''
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 shrink-0 text-[#a34063] dark:text-[#c85a82]" />
            ) : (
              <Volume2 className="w-4 h-4 shrink-0" />
            )}
            <span className={`nav-pill-label ${hoveredNav === 'mute' ? 'is-expanded' : ''}`}>
              {isMuted ? 'Muted' : 'Sound'}
            </span>
          </button>

          <button
            id="dark-toggle"
            data-testid="dark-toggle"
            type="button"
            onClick={toggleDark}
            onMouseEnter={() => setHoveredNav('dark')}
            onMouseLeave={() => setHoveredNav(null)}
            onFocus={() => setHoveredNav('dark')}
            onBlur={() => setHoveredNav(null)}
            aria-label={isDark ? 'Switch to Day Nursery theme' : 'Switch to Midnight Torch mode'}
            title={isDark ? 'Switch to Day Nursery theme' : 'Switch to Midnight mode (Torchlight glow)'}
            aria-pressed={isDark}
            className={`nav-pill-item text-[#5c4033] dark:text-[#fff8f1] ${
              hoveredNav === 'dark' ? 'is-expanded' : ''
            }`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 shrink-0 text-[#ffb703]" />
            ) : (
              <Moon className="w-4 h-4 shrink-0 text-[#a34063]" />
            )}
            <span className={`nav-pill-label ${hoveredNav === 'dark' ? 'is-expanded' : ''}`}>
              {isDark ? 'Day' : 'Midnight'}
            </span>
          </button>

          <button
            id="chaos-toggle"
            data-testid="chaos-toggle"
            type="button"
            onClick={toggleChaos}
            onMouseEnter={() => setHoveredNav('chaos')}
            onMouseLeave={() => setHoveredNav(null)}
            onFocus={() => setHoveredNav('chaos')}
            onBlur={() => setHoveredNav(null)}
            aria-label={isChaos ? 'Disable Hackathon Chaos Mode' : 'Enable Hackathon Chaos Mode'}
            title={isChaos ? 'Disable Hackathon Chaos Mode' : 'Enable Hackathon Chaos Mode (Early-web stickers)'}
            aria-pressed={isChaos}
            className={`nav-pill-item ${
              hoveredNav === 'chaos' ? 'is-expanded' : ''
            } ${
              isChaos
                ? 'bg-[#ffb703] text-[#14101f] shadow-sm'
                : 'text-[#5c4033] dark:text-[#fff8f1]'
            }`}
          >
            <Sparkles
              className={`w-4 h-4 shrink-0 ${isChaos ? 'animate-spin' : ''}`}
              style={isChaos ? { animationDuration: '3s' } : {}}
            />
            <span className={`nav-pill-label ${hoveredNav === 'chaos' ? 'is-expanded' : ''}`}>
              Chaos
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
