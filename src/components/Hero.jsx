import { useRef, useState } from 'react';
import { playSingleNote, playBoopSound } from '../utils/sound';

const GREETINGS = [
  'Zzz... almost slept through this!',
  'Got my nightcap on! 🎓',
  "Let's build a dream! ✨",
  'Boop me again! Hehehe 😄',
  'My bow is my power source 🎀',
  'Shh, ghosts are sleeping 👻',
  '17:17 — dream delivery time!',
];

export default function Hero({ isMuted, _isDark, dreamsDelivered, boopCount, secretUnlocked, onBoop, onWave, pupilOffset, skullRef }) {
  const [greeting, setGreeting] = useState(GREETINGS[0]);
  const [showSpeech, setShowSpeech] = useState(false);
  const [isTilting, setIsTilting] = useState(false);
  const greetIdx = useRef(0);

  // cycle through quotes and play boop sound on every click
  const boop = () => {
    greetIdx.current = (greetIdx.current + 1) % GREETINGS.length;
    setGreeting(GREETINGS[greetIdx.current]);
    setShowSpeech(true);
    setIsTilting(true);
    setTimeout(() => setIsTilting(false), 600);
    setTimeout(() => setShowSpeech(false), 2400);
    playBoopSound(boopCount, isMuted);
    onBoop();
  };

  const startTilt = () => {
    if (!showSpeech) {
      setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
      setShowSpeech(true);
    }
    setIsTilting(true);
  };

  const stopTilt = () => {
    setShowSpeech(false);
    setIsTilting(false);
  };

  // format hit counter with commas e.g. 0,001,492
  const odometer = String(dreamsDelivered)
    .padStart(7, '0')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <section id="hero" className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center pt-4">
      <div className="md:col-span-7 space-y-6">
        <h1 className="text-editorial text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-[#5c4033] dark:text-[#fff8f1]">
          "I build the dreams you{' '}
          <span className="text-[#a34063] dark:text-[#ffb703] dashed-underline">
            fall asleep
          </span>{' '}
          inside."
        </h1>

        <p className="text-base sm:text-lg leading-relaxed text-[#5c4033] dark:text-[#fff8f1] max-w-xl font-medium">
          Hi! I'm <strong>Pip</strong> — a curious, sleepy skull baby with a smooth round cranium, warm amber glow-pinprick eyes, a tiny crooked smile, and a starry nightcap with a signature pink bow. I giggle at everything, hate silence, and craft lullabies &amp; nightlights so every ghost and cloud bunny in the neighborhood sleeps tight.
        </p>

        <div className="flex flex-wrap gap-2 text-xs sm:text-sm font-bold">
          {[
            ['💀', 'Species: Friendly Skull Baby'],
            ['🎵', 'Hates Silence & Giggles Nonstop'],
            ['🎀', 'Starry Nightcap + Pink Bow'],
            ['🌙', 'Junior Dream Engineer'],
          ].map(([icon, label]) => (
            <span
              key={label}
              className="px-3 py-1.5 rounded-xl bg-[#f5eadc] dark:bg-[#1e1830] border border-[#5c4033]/20 dark:border-[#ffb703]/25 inline-flex items-center gap-1.5 text-[#5c4033] dark:text-[#fff8f1] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default"
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </span>
          ))}
        </div>

        <div className="cozy-card bg-[#f5eadc] dark:bg-[#1e1830] p-4 sm:p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {showSpeech && (
                <div
                  className="speech-bubble absolute -top-14 left-1/2 -translate-x-1/2 text-[#5c4033] dark:text-[#f0e6d6]"
                  role="status"
                  aria-live="polite"
                >
                  {greeting}
                </div>
              )}

              <button
                id="pip-skull-boop"
                data-testid="pip-skull-boop"
                ref={skullRef}
                onClick={boop}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    boop();
                  }
                }}
                onMouseEnter={startTilt}
                onMouseLeave={stopTilt}
                aria-label={`Boop Pip's pink bow (${boopCount}/3 boops to secret melody)`}
                title="Boop Pip's pink bow (Click or press Enter)"
                className={`relative w-16 h-16 sm:w-20 sm:h-20 min-w-[44px] min-h-[44px] rounded-full bg-[#fff8f1] dark:bg-[#2a1f3d] border-[3px] border-[#5c4033] dark:border-[#ffb703] flex items-center justify-center cursor-pointer shadow-md transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl active:scale-95 active:shadow-inner ${
                  isTilting ? 'rotate-3 scale-110' : ''
                }`}
                style={{ transformOrigin: 'bottom center' }}
              >
                <span className="absolute -top-3 -right-1.5 text-2xl select-none" aria-hidden="true">🎀</span>
                <div className="w-4 h-5 sm:w-5 sm:h-6 bg-[#14101f] rounded-full mx-0.5 flex items-center justify-center overflow-hidden">
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffb703] shadow-[0_0_10px_#ffb703aa] transition-transform duration-75"
                    style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}
                    aria-hidden="true"
                  />
                </div>
                <div className="w-4 h-5 sm:w-5 sm:h-6 bg-[#14101f] rounded-full mx-0.5 flex items-center justify-center overflow-hidden">
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffb703] shadow-[0_0_10px_#ffb703aa] transition-transform duration-75"
                    style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}
                    aria-hidden="true"
                  />
                </div>
                <div
                  className="absolute bottom-2.5 w-5 h-2 sm:w-6 sm:h-2.5 border-b-2 border-[#5c4033] dark:border-[#f0e6d6]/70 rounded-full rotate-6"
                  aria-hidden="true"
                />
              </button>
            </div>

            <button
              type="button"
              onClick={boop}
              className="text-left cursor-pointer bg-transparent border-0 p-0 transition-opacity hover:opacity-80 active:scale-95"
              aria-label="Amber Eye-Tracker — Click to boop Pip's skull & eyes"
            >
              <p className="font-bold text-sm sm:text-base text-[#5c4033] dark:text-[#fff8f1]">Amber Eye-Tracker</p>
              <p className="text-xs leading-snug mt-0.5 text-[#5c4033] dark:text-[#fff8f1] font-medium">
                {boopCount === 0
                  ? 'Eyes follow your cursor! Boop bow 3× 🎀'
                  : `Hehe! That tickles! ${boopCount}/3 boops…`}
              </p>
            </button>
          </div>

          <div
            data-testid="odometer-hero"
            className="bg-[#14101f] text-[#ffb703] rounded-2xl border-2 border-[#ffb703]/70 px-4 py-2 shadow-inner text-right flex-shrink-0"
            aria-label={`Dreams delivered: ${dreamsDelivered}`}
          >
            <span className="block text-[9px] uppercase tracking-[0.2em] text-[#fff8f1]/55 font-bold mb-0.5">
              Dreams Delivered
            </span>
            <span data-testid="odometer-value" className="odometer-display text-xl font-extrabold">{odometer}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              onWave();
              playSingleNote(1046.5, isMuted, 'triangle');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onWave();
                playSingleNote(1046.5, isMuted, 'triangle');
              }
            }}
            className="stamp-hover cursor-pointer inline-flex items-center gap-2 min-h-[44px] border-2 border-dashed border-[#a34063] dark:border-[#ffb703] text-[#a34063] dark:text-[#ffb703] rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-widest select-none transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:shadow-inner"
            aria-label="Good things start small — vintage stamp (Click or press Enter to earn +1 Dream)"
            title="Click or press Enter to earn +1 Dream"
          >
            <span aria-hidden="true">✦</span>
            Good Things Start Small
            <span aria-hidden="true">✦</span>
          </button>
          <p className="text-xs opacity-60 italic hidden sm:block">↑ Click to spin &amp; dispatch +1!</p>
        </div>
      </div>

      <div className="md:col-span-5">
        <div className="cozy-card bg-gradient-to-b from-[#fff8f1] to-[#f5eadc] dark:from-[#1e1830] dark:to-[#14101f] p-6 rounded-3xl text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {['10% 20%', '80% 15%', '25% 75%', '70% 65%', '50% 45%'].map((pos, i) => (
              <span
                key={i}
                className="absolute text-[#ffb703]/40 text-xs"
                style={{ left: pos.split(' ')[0], top: pos.split(' ')[1] }}
              >★</span>
            ))}
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              onWave();
              playSingleNote(880, isMuted);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onWave();
                playSingleNote(880, isMuted);
              }
            }}
            aria-label="Pip the Skull Baby floating on a cloud — click or press Enter to wave back and earn +1 Dream"
            title="Click or press Enter to wave back at Pip!"
            className="cursor-pointer inline-block rounded-2xl transition-transform hover:scale-105 active:scale-95"
          >
            <img
              src="https://hax.baby/baby/assets/pip_avatar_cloud.png"
              alt="Pip the Skull Baby floating on a sleepy cloud, waving hello"
              className="w-full max-w-[280px] mx-auto motion-safe:animate-float-cloud drop-shadow-xl relative z-10"
              loading="eager"
              width="280"
              height="280"
            />
          </div>

          <button
            id="wave-back-btn"
            onClick={() => {
              onWave();
              playSingleNote(880, isMuted);
            }}
            className="mt-4 relative z-10 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#a34063] hover:bg-[#c85a82] text-white font-bold text-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl active:scale-95 active:shadow-inner cursor-pointer"
            aria-label="Wave back at Pip to earn +1 Dream"
          >
            👋 Wave Back at Pip (+1 Dream!)
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
          {[
            ['4.5', 'Blocks Tall', 587.33],
            ['∞', 'Giggles/sec', 880.00],
            ['17:17', 'Flight Time', 1046.50],
          ].map(([val, label, freq]) => (
            <button
              key={label}
              type="button"
              onClick={() => playSingleNote(freq, isMuted, 'sine')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  playSingleNote(freq, isMuted, 'sine');
                }
              }}
              aria-label={`Pip metric: ${val} ${label}. Press Enter or Space to play chime note.`}
              title={`Play note for ${label}`}
              className="cozy-card bg-[#f5eadc] dark:bg-[#1e1830] p-2.5 min-h-[44px] rounded-2xl transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer text-left sm:text-center"
            >
              <div className="text-editorial text-lg text-[#a34063] dark:text-[#ffb703]">{val}</div>
              <div className="opacity-70 text-[10px] mt-0.5">{label}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
