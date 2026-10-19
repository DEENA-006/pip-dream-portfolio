import { useState, useCallback, useEffect, useRef } from 'react';
import { playSingleNote, playLullabyMelody } from '../utils/sound';

const NOTE_CHARS = ['♩', '♪', '♫', '♬', '🎵', '🎶'];
const LULLABY_NOTES = [
  { label: 'C5', icon: '★', freq: 523.25 },
  { label: 'D5', icon: '🌙', freq: 587.33 },
  { label: 'E5', icon: '☁️', freq: 659.25 },
  { label: 'G5', icon: '✧', freq: 783.99 },
  { label: 'A5', icon: '♡', freq: 880.00 },
];

const LANTERN_COLORS = [
  { name: 'Warm Amber',    hex: '#ffb703', bg: 'rgba(255,183,3,0.22)' },
  { name: 'Berry Rose',    hex: '#a34063', bg: 'rgba(163,64,99,0.22)' },
  { name: 'Starlight Cyan',hex: '#38bdf8', bg: 'rgba(56,189,248,0.22)' },
  { name: 'Lavender Mist', hex: '#c084fc', bg: 'rgba(192,132,252,0.22)' },
];

export default function Projects({ isMuted, _isDark, onDreamsEarned }) {
  // pragmatic state grouping per toy
  const [box, setBox] = useState({ key: null, playing: false, spinning: false, notes: [] });
  const [lantern, setLantern] = useState({ color: LANTERN_COLORS[0], brightness: 85 });
  const [glider, setGlider] = useState({ tab: 'map', progress: 0, flying: false, viewMode: 'diorama' });

  const lullabyTimerRefs = useRef([]);
  const gliderIntervalRef = useRef(null);

  // cleanup in-flight intervals and timeouts on unmount
  useEffect(() => {
    return () => {
      lullabyTimerRefs.current.forEach((id) => clearTimeout(id));
      if (gliderIntervalRef.current) clearInterval(gliderIntervalRef.current);
    };
  }, []);

  const spawnBoxNote = useCallback((x, y, noteChar) => {
    const id = Date.now() + Math.random();
    const note = { id, x, y, char: noteChar };
    setBox((prev) => ({ ...prev, notes: [...prev.notes.slice(-12), note] }));
    setTimeout(() => {
      setBox((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
    }, 1450);
  }, []);

  const pressKey = useCallback((noteObj, idx, e) => {
    setBox((prev) => ({ ...prev, key: idx }));
    playSingleNote(noteObj.freq, isMuted, 'triangle');
    const char = NOTE_CHARS[Math.floor(Math.random() * NOTE_CHARS.length)];
    const rect = e.currentTarget.getBoundingClientRect();
    spawnBoxNote(rect.left + rect.width / 2, rect.top, char);
    setTimeout(() => setBox((prev) => ({ ...prev, key: null })), 270);
  }, [isMuted, spawnBoxNote]);

  const playSong = () => {
    if (box.playing) return;
    setBox((prev) => ({ ...prev, playing: true, spinning: true }));
    playLullabyMelody(isMuted);

    lullabyTimerRefs.current.forEach((id) => clearTimeout(id));
    lullabyTimerRefs.current = [];

    const SEQ = [0, 2, 3, 2, 4, 3, 2, 1, 0];
    SEQ.forEach((noteIdx, step) => {
      const t1 = setTimeout(() => {
        setBox((prev) => ({ ...prev, key: noteIdx }));
        const char = NOTE_CHARS[step % NOTE_CHARS.length];
        spawnBoxNote(window.innerWidth / 2 + (noteIdx - 2) * 45, window.innerHeight * 0.45, char);
        const t2 = setTimeout(() => setBox((prev) => ({ ...prev, key: null })), 220);
        lullabyTimerRefs.current.push(t2);
      }, step * 235);
      lullabyTimerRefs.current.push(t1);
    });

    const finalTimer = setTimeout(() => {
      setBox((prev) => ({ ...prev, playing: false, spinning: false }));
    }, SEQ.length * 235 + 500);
    lullabyTimerRefs.current.push(finalTimer);
  };

  const flyGlider = () => {
    if (glider.flying || gliderIntervalRef.current) return;
    setGlider((prev) => ({ ...prev, flying: true, progress: 0 }));
    playSingleNote(587.33, isMuted, 'sine');

    let step = 0;
    gliderIntervalRef.current = setInterval(() => {
      step += 1;
      setGlider((prev) => ({ ...prev, progress: step }));
      playSingleNote(523.25 + step * 110, isMuted, 'triangle');
      if (step >= 3) {
        clearInterval(gliderIntervalRef.current);
        gliderIntervalRef.current = null;
        onDreamsEarned(3);
        setTimeout(() => setGlider((prev) => ({ ...prev, flying: false })), 700);
      }
    }, 560);
  };

  const gliderPos = [
    { x: 14, y: 50 },
    { x: 22, y: 52 },
    { x: 126, y: 40 },
    { x: 232, y: 20 },
  ][glider.progress] || { x: 14, y: 50 };

  return (
    <section id="projects" className="space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-editorial text-3xl sm:text-4xl font-extrabold text-[#5c4033] dark:text-[#fff8f1] leading-tight">
          Inside Pip's{' '}
          <span className="text-[#a34063] dark:text-[#ffb703] dashed-underline">
            Midnight Workshop
          </span>
        </h2>
        <p className="text-sm sm:text-base text-[#5c4033] dark:text-[#fff8f1] max-w-lg mx-auto font-medium">
          Every invention is 100% interactive — compose a lullaby, mix a nightlight glow, or fly Pip's rooftop delivery route!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-7">
        {/* toy 1: lullaby box */}
        <article
          className="cozy-card bg-[#f5eadc] dark:bg-[#1e1830] rounded-3xl overflow-hidden flex flex-col"
          aria-label="Project 1: Vintage Celesta Lullaby Box"
        >
          <div className="p-4 pb-0">
            <div
              role="button"
              tabIndex={0}
              className="velvet-showcase-box h-56 flex items-center justify-center relative cursor-pointer group select-none brass-corner-filigree overflow-hidden"
              onClick={playSong}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  playSong();
                }
              }}
              aria-label="Pentatonic Lullaby Music Box — press Enter, Space, or click to wind key and play melody"
              title="Click or press Enter to wind key & play melody"
            >
              {/* Rich 3D handcrafted lullaby box image */}
              <img
                src="/assets/lullaby_box_3d.jpg"
                alt="Vintage wooden music box with painted floral lacquer and brass winding key"
                className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out ${
                  box.playing ? 'scale-105' : 'group-hover:scale-105'
                }`}
                loading="lazy"
                width="400"
                height="280"
              />

              {/* ambient spotlight vignette */}
              <div className={`absolute inset-0 bg-radial from-transparent via-black/15 to-black/65 pointer-events-none transition-opacity duration-500 ${box.playing ? 'opacity-85' : 'opacity-65'}`} />

              {/* golden glow aura when melody plays */}
              {box.playing && (
                <div className="absolute inset-0 bg-radial from-[#ffb703]/25 via-transparent to-transparent pointer-events-none animate-pulse" />
              )}

              {/* Glass sheen highlight reflection */}
              <div className="absolute inset-0 glint-glass-reflection opacity-40 group-hover:opacity-70 transition-opacity duration-500" />

              {/* Floating dancing musical notes when playing */}
              {box.playing && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                  <span className="absolute left-[28%] top-[30%] text-lg text-[#ffb703] drop-shadow-[0_0_8px_#ffb703] animate-bounce" style={{ animationDuration: '1s' }}>♩</span>
                  <span className="absolute left-[50%] top-[20%] text-xl text-[#ffb703] drop-shadow-[0_0_10px_#ffb703] animate-bounce" style={{ animationDuration: '0.8s' }}>♫</span>
                  <span className="absolute left-[70%] top-[35%] text-base text-[#ffb703] drop-shadow-[0_0_8px_#ffb703] animate-bounce" style={{ animationDuration: '1.2s' }}>♪</span>
                  <span className="absolute left-[40%] top-[12%] text-xs text-[#fff8f1] drop-shadow-[0_0_6px_#fff8f1] animate-ping">✦</span>
                </div>
              )}

              {/* live audio equalizer bars & key indicator */}
              <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 bg-[#14101f]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#ffb703]/40 text-[10px] text-[#ffb703] font-mono z-20 shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-ping" />
                <span className="font-bold">432Hz Celesta</span>
                {box.playing && (
                  <div className="flex items-end gap-0.5 h-3 ml-1">
                    <span className="w-0.5 bg-[#ffb703] rounded-full eq-bar-1" />
                    <span className="w-0.5 bg-[#ffb703] rounded-full eq-bar-2" />
                    <span className="w-0.5 bg-[#ffb703] rounded-full eq-bar-3" />
                  </div>
                )}
              </div>

              {/* brass windup key status badge */}
              <div className="absolute bottom-2.5 right-3 bg-[#14101f]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#ffb703]/40 text-[10px] text-[#fff8f1] font-bold z-20 flex items-center gap-1.5 shadow-lg group-hover:border-[#ffb703] transition-colors">
                <span className={`inline-block ${box.spinning ? 'animate-spin' : ''}`} style={box.spinning ? { animationDuration: '1.2s' } : {}}>🔑</span>
                <span>{box.playing ? 'Playing Melody…' : 'Wind & Play'}</span>
              </div>
            </div>
          </div>

          <div className="p-5 flex flex-col flex-1 gap-4">
            <div>
              <h3 className="text-editorial text-2xl font-bold text-[#5c4033] dark:text-[#fff8f1] mt-1">
                Pentatonic Lullaby Box
              </h3>
              <p className="text-sm text-[#5c4033] dark:text-[#fff8f1] mt-1 leading-relaxed font-medium">
                Tap individual celesta keys to synthesize soothing harmonic chimes, or wind the brass key for Pip's nursery melody.
              </p>
            </div>

            <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Interactive celesta chime keys (44px touch targets)">
              {LULLABY_NOTES.map((n, idx) => (
                <button
                  key={n.label}
                  id={`lullaby-key-${n.label.toLowerCase()}`}
                  onClick={(e) => pressKey(n, idx, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      pressKey(n, idx, e);
                    }
                  }}
                  aria-label={`Play chime note ${n.label} (${n.freq}Hz)`}
                  title={`Play ${n.label} (${n.freq}Hz)`}
                  className={`lullaby-key min-h-[48px] min-w-[44px] py-2.5 px-1 rounded-xl text-xs font-bold border-2 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-95 active:shadow-inner flex flex-col items-center justify-center ${
                    box.key === idx
                      ? 'bg-[#ffb703] border-[#5c4033] text-[#14101f] active shadow-lg'
                      : 'bg-[#fff8f1] dark:bg-[#14101f] border-[#5c4033]/30 dark:border-[#ffb703]/30 hover:border-[#a34063] text-[#5c4033] dark:text-[#fff8f1]'
                  }`}
                >
                  <div className="text-sm select-none" aria-hidden="true">{n.icon}</div>
                  <div className="text-[10px] mt-0.5">{n.label}</div>
                </button>
              ))}
            </div>

            <button
              id="wind-music-box-btn"
              onClick={playSong}
              disabled={box.playing}
              aria-label={box.playing ? 'Currently playing nursery lullaby' : 'Wind key and play nursery lullaby melody'}
              className="mt-auto w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#a34063] hover:bg-[#c85a82] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl active:scale-95 active:shadow-inner cursor-pointer flex items-center justify-center gap-2"
            >
              <span className={`text-base select-none inline-block ${box.spinning ? 'animate-spin' : ''}`} style={box.spinning ? { animationDuration: '2s' } : {}} aria-hidden="true">
                🔑
              </span>
              <span>{box.playing ? 'Playing Nursery Lullaby…' : 'Wind Key & Play Melody'}</span>
            </button>
          </div>
        </article>

        {/* toy 2: porcelain lantern */}
        <article
          className="cozy-card bg-[#f5eadc] dark:bg-[#1e1830] rounded-3xl overflow-hidden flex flex-col"
          aria-label="Project 2: Porcelain Moon Lantern CAD"
        >
          <div className="p-4 pb-0">
            <div
              role="button"
              tabIndex={0}
              className="cad-hologram-chamber h-56 flex items-center justify-center relative overflow-hidden group select-none cursor-pointer"
              onClick={() => {
                const nextIdx = (LANTERN_COLORS.findIndex((c) => c.name === lantern.color.name) + 1) % LANTERN_COLORS.length;
                setLantern((prev) => ({ ...prev, color: LANTERN_COLORS[nextIdx] }));
                playSingleNote(740, isMuted, 'sine');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const nextIdx = (LANTERN_COLORS.findIndex((c) => c.name === lantern.color.name) + 1) % LANTERN_COLORS.length;
                  setLantern((prev) => ({ ...prev, color: LANTERN_COLORS[nextIdx] }));
                  playSingleNote(740, isMuted, 'sine');
                }
              }}
              aria-label={`Porcelain Moon Lantern — currently ${lantern.color.name} at ${lantern.brightness}% brightness. Press Enter, Space, or click to cycle colors`}
              title="Click or press Enter to cycle glow colors"
            >
              {/* Rich 3D porcelain lantern artwork */}
              <img
                src="/assets/porcelain_lantern_3d.jpg"
                alt="Pip's porcelain moon dream lantern glowing warmly in nursery"
                className="w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105"
                style={{
                  filter: `brightness(${0.85 + lantern.brightness / 350}) drop-shadow(0 0 ${lantern.brightness * 0.25}px ${lantern.color.hex})`,
                }}
                loading="lazy"
                width="400"
                height="280"
              />

              {/* Dynamic colored aura directly over the moon cutout */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 64%, ${lantern.color.hex}99 0%, ${lantern.color.hex}33 30%, transparent 65%)`,
                  opacity: (lantern.brightness / 100) * 0.9,
                  mixBlendMode: 'screen',
                }}
                aria-hidden="true"
              />

              {/* volumetric spotlight beam from ceiling */}
              <div
                className="absolute -top-10 inset-x-0 h-48 transition-all duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 160px 120px at 50% 0%, ${lantern.color.hex}55 0%, transparent 80%)`,
                  opacity: (lantern.brightness / 100) * 0.85,
                  mixBlendMode: 'screen',
                }}
                aria-hidden="true"
              />

              {/* vertical hologram laser scan line */}
              <div className="hologram-laser" aria-hidden="true" />

              {/* rotating holographic calibration rings */}
              <div className="absolute w-48 h-48 rounded-full border border-cyan-400/20 border-dashed orbit-ring-spin pointer-events-none" />

              {/* Glass sheen highlight reflection */}
              <div className="absolute inset-0 glint-glass-reflection opacity-35 pointer-events-none" />

              {/* corner telemetry label */}
              <div className="absolute top-2.5 left-3 font-mono text-[9px] font-bold text-cyan-300 tracking-widest pointer-events-none z-20 flex items-center gap-1.5 bg-[#040e1f]/85 backdrop-blur-sm px-2 py-0.5 rounded-full border border-cyan-400/40 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>CAD NOCTURNAL-LUMEN</span>
              </div>

              {/* Live color badge */}
              <span
                className="absolute bottom-2.5 right-3 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full text-white shadow-lg font-mono border border-white/30 z-20 transition-all duration-300 backdrop-blur-sm"
                style={{ background: lantern.color.hex }}
              >
                {lantern.color.name} · {lantern.brightness}%
              </span>
            </div>
          </div>

          <div className="p-5 flex flex-col flex-1 gap-4">
            <div>
              <h3 className="text-editorial text-2xl font-bold text-[#5c4033] dark:text-[#fff8f1] mt-1">
                Porcelain Moon Lantern
              </h3>
              <p className="text-sm text-[#5c4033] dark:text-[#fff8f1] mt-1 leading-relaxed font-medium">
                Designed for afraid-of-the-dark ghost toddlers. Pick a dream aura color and tune the stardust dimmer slider!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Lantern dream aura color swatches (44px touch targets)">
              {LANTERN_COLORS.map((c) => (
                <button
                  key={c.name}
                  id={`lantern-color-${c.name.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => {
                    setLantern((prev) => ({ ...prev, color: c }));
                    playSingleNote(740, isMuted, 'sine');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setLantern((prev) => ({ ...prev, color: c }));
                      playSingleNote(740, isMuted, 'sine');
                    }
                  }}
                  aria-label={`Set lantern color to ${c.name}`}
                  title={`Set color: ${c.name}`}
                  aria-pressed={lantern.color.name === c.name}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold border-2 flex items-center gap-2 cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:shadow-inner ${
                    lantern.color.name === c.name
                      ? 'bg-[#5c4033] dark:bg-[#ffb703] text-white dark:text-[#14101f] border-[#5c4033] dark:border-[#ffb703] swatch-active shadow-md'
                      : 'bg-[#fff8f1] dark:bg-[#14101f] border-[#5c4033]/40 dark:border-[#ffb703]/30 hover:border-[#5c4033]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ background: c.hex }} aria-hidden="true" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>

            <div className="bg-[#fff8f1] dark:bg-[#14101f] p-3 rounded-xl border border-[#5c4033]/25 dark:border-[#ffb703]/20">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <label htmlFor="lantern-dimmer-slider" className="cursor-pointer">🏮 Stardust Dimmer</label>
                <span className="font-mono">{lantern.brightness}%</span>
              </div>
              <input
                id="lantern-dimmer-slider"
                type="range"
                min="20"
                max="100"
                value={lantern.brightness}
                onChange={(e) => setLantern((prev) => ({ ...prev, brightness: Number(e.target.value) }))}
                aria-label={`Lantern brightness dimmer, currently ${lantern.brightness} percent`}
                aria-valuemin="20"
                aria-valuemax="100"
                aria-valuenow={lantern.brightness}
                className="w-full accent-[#a34063] cursor-pointer h-3 min-h-[32px]"
              />
            </div>
          </div>
        </article>

        {/* toy 3: flight routes / growth chart */}
        <article
          className="cozy-card bg-[#f5eadc] dark:bg-[#1e1830] rounded-3xl overflow-hidden flex flex-col"
          aria-label="Project 3: Dream Delivery Routes and Growth Chart"
        >
          <div className="p-4 pb-0">
            <div
              className="grid grid-cols-2 gap-1.5 bg-[#fff8f1] dark:bg-[#14101f] p-1 rounded-xl border-2 border-[#5c4033] dark:border-[#ffb703]/40"
              role="tablist"
              aria-label="Project 3 view selector"
            >
              {[
                { key: 'map',    label: '☁️ Rooftop Route'  },
                { key: 'growth', label: '📏 Growth Chart' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  id={`p3-tab-${key}`}
                  role="tab"
                  aria-selected={glider.tab === key}
                  aria-label={`Switch view to ${label}`}
                  onClick={() => { setGlider((prev) => ({ ...prev, tab: key })); playSingleNote(440, isMuted, 'sine'); }}
                  className={`py-2 px-3 min-h-[44px] rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 ease-out active:scale-95 active:shadow-inner flex items-center justify-center ${
                    glider.tab === key ? 'bg-[#a34063] text-white shadow-sm' : 'text-[#5c4033] dark:text-[#f0e6d6] hover:bg-[#a34063]/12'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {glider.tab === 'map' ? (
            <div className="p-5 flex flex-col flex-1 gap-4">
              {glider.viewMode === 'radar' ? (
                /* Tactical Radar scope */
                <div
                  className="nocturnal-skyline-box h-56 p-3 flex flex-col relative overflow-hidden"
                  aria-label="Animated rooftop delivery flight map"
                >
                  {/* rotating radar sweep cone */}
                  <div className="radar-sweep-beam" aria-hidden="true" />

                  {/* starfield with glowing moon */}
                  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <span className="absolute top-3 right-6 text-xl select-none" style={{ filter: 'drop-shadow(0 0 10px #ffb703)' }}>🌙</span>
                    {[
                      [12, 15], [28, 22], [48, 12], [68, 24], [84, 10],
                      [22, 38], [60, 32], [78, 36], [92, 28],
                    ].map(([cx, cy], i) => (
                      <svg
                        key={i}
                        className="twinkle absolute w-1 h-1"
                        style={{ left: `${cx}%`, top: `${cy}%` }}
                        viewBox="0 0 4 4"
                      >
                        <circle cx="2" cy="2" r="1.5" fill="#ffb703" />
                      </svg>
                    ))}
                  </div>

                  <span className="cloud-drift-1 absolute text-lg opacity-35" style={{ left: '6%', top: '50%' }} aria-hidden="true">☁️</span>
                  <span className="cloud-drift-2 absolute text-sm opacity-25" style={{ left: '52%', top: '65%' }} aria-hidden="true">☁️</span>

                  <div className="flex justify-between items-center text-[10px] text-[#ffb703] font-bold z-10 relative">
                    <span className="flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-ping" />
                      CHIMNEY LANE RADAR
                    </span>
                    <button
                      type="button"
                      onClick={() => setGlider((prev) => ({ ...prev, viewMode: 'diorama' }))}
                      aria-label="Switch to 3D Diorama view"
                      title="Switch to 3D Diorama view"
                      className="bg-[#14101f]/85 hover:bg-[#ffb703] hover:text-[#14101f] px-3 py-1.5 min-h-[44px] sm:min-h-[38px] rounded-full border border-[#ffb703]/30 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      🌟 3D Diorama
                    </button>
                  </div>

                  {/* detailed victorian rooftop skyline svg */}
                  <svg viewBox="0 0 260 95" className="flex-1 w-full overflow-visible z-10 relative">
                    <defs>
                      <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2c1a3b" />
                        <stop offset="100%" stopColor="#150a22" />
                      </linearGradient>
                      <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" mode="over" />
                      </filter>
                    </defs>

                    {/* flight trajectory path */}
                    <path
                      d="M 22 70 Q 90 12, 132 58 T 242 38"
                      fill="none"
                      stroke="#ffb703"
                      strokeWidth="2.5"
                      strokeDasharray="5 4"
                      opacity="0.6"
                    />

                    {/* House 1 */}
                    <polygon points="6,74 24,56 42,74" fill="url(#roofGrad)" stroke="#ffb70344" strokeWidth="1" />
                    <rect x="10" y="74" width="28" height="22" fill="#1b1029" stroke="#ffb70333" rx="2" />
                    <rect x="15" y="78" width="6" height="7" fill="#ffb703" rx="1" filter="url(#glowGold)" />
                    <rect x="27" y="78" width="6" height="7" fill="#ffb703" rx="1" filter="url(#glowGold)" />
                    {/* chimney 1 */}
                    <rect x="16" y="52" width="7" height="9" fill={glider.progress >= 1 ? '#ffb703' : '#a34063'} rx="1" />
                    <text x="14" y="47" fontSize="8" className="chimney-smoke-puff">💭</text>

                    {/* House 2 */}
                    <polygon points="112,62 131,44 150,62" fill="url(#roofGrad)" stroke="#ffb70344" strokeWidth="1" />
                    <rect x="116" y="62" width="30" height="34" fill="#1b1029" stroke="#ffb70333" rx="2" />
                    <rect x="122" y="66" width="6" height="8" fill="#ffb703" rx="1" filter="url(#glowGold)" />
                    <rect x="134" y="66" width="6" height="8" fill="#ffb703" rx="1" filter="url(#glowGold)" />
                    {/* chimney 2 */}
                    <rect x="126" y="42" width="7" height="10" fill={glider.progress >= 2 ? '#ffb703' : '#a34063'} rx="1" />
                    <text x="124" y="37" fontSize="8" className="chimney-smoke-puff-2">💭</text>

                    {/* House 3 */}
                    <polygon points="224,42 242,22 260,42" fill="url(#roofGrad)" stroke="#ffb70344" strokeWidth="1" />
                    <rect x="228" y="42" width="28" height="54" fill="#1b1029" stroke="#ffb70333" rx="2" />
                    <circle cx="242" cy="52" r="5" fill="#ffb703" filter="url(#glowGold)" />
                    <rect x="234" y="64" width="6" height="8" fill="#ffb703" rx="1" filter="url(#glowGold)" />
                    <rect x="244" y="64" width="6" height="8" fill="#ffb703" rx="1" filter="url(#glowGold)" />
                    {/* chimney 3 */}
                    <rect x="236" y="24" width="7" height="11" fill={glider.progress >= 3 ? '#ffb703' : '#a34063'} rx="1" />
                    <text x="234" y="19" fontSize="8" className="chimney-smoke-puff-3">💭</text>

                    {/* pip cloud glider */}
                    <text
                      x={gliderPos.x}
                      y={gliderPos.y}
                      fontSize="20"
                      style={{ transition: 'x 0.55s ease, y 0.55s ease', filter: 'drop-shadow(0 0 8px #ffb703)' }}
                      aria-label="Pip's cloud glider"
                    >
                      ☁️
                    </text>
                  </svg>

                  <p className="text-[10px] text-center text-white/60 z-10 relative font-medium">
                    {glider.flying ? '✨ Parachuting bottled dreams into chimneys…' : 'Click Launch to fly Pip across Victorian rooftops!'}
                  </p>
                </div>
              ) : (
                /* 3D Handcrafted Shadowbox Diorama */
                <div
                  className="shadowbox-diorama-frame h-56 flex flex-col relative overflow-hidden group select-none"
                  aria-label="Pip's 3D clay rooftop dream delivery diorama"
                >
                  {/* Rich 3D Shadowbox Diorama artwork */}
                  <img
                    src="/assets/cloud_glider_route.jpg"
                    alt="Pip's 3D clay shadowbox diorama of midnight rooftop dream delivery"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                    width="400"
                    height="280"
                  />

                  {/* Ambient shadowbox vignette */}
                  <div className="absolute inset-0 bg-radial from-transparent via-black/15 to-black/65 pointer-events-none" />

                  {/* Glass sheen highlight reflection */}
                  <div className="absolute inset-0 glint-glass-reflection opacity-35 pointer-events-none" />

                  {/* Top telemetry & mode switch */}
                  <div className="absolute top-2.5 inset-x-3 flex justify-between items-center z-20">
                    <div className="flex items-center gap-1.5 bg-[#14101f]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#ffb703]/40 text-[10px] text-[#ffb703] font-mono shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-ping" />
                      <span>FLIGHT DIORAMA</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGlider((prev) => ({ ...prev, viewMode: 'radar' }))}
                      className="text-[10px] bg-[#14101f]/85 hover:bg-[#ffb703] text-[#fff8f1] hover:text-[#14101f] px-3 py-1.5 min-h-[44px] sm:min-h-[38px] rounded-full border border-[#ffb703]/30 font-bold transition-all shadow-md cursor-pointer flex items-center gap-1"
                      aria-label="Switch to Tactical Radar Scope view"
                      title="Switch to Tactical Radar Scope view"
                    >
                      <span>📡 Radar Scope</span>
                    </button>
                  </div>

                  {/* Stop 1 checkpoint: Left cottage chimney */}
                  <div className="absolute left-[24%] top-[65%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 shadow-lg ${
                      glider.progress >= 1 
                        ? 'bg-[#ffb703] text-[#14101f] border-white checkpoint-active' 
                        : 'bg-[#14101f]/90 text-[#ffb703] border-[#ffb703]/50'
                    }`}>
                      {glider.progress >= 1 ? '✓' : '1'}
                    </div>
                    <span className="text-[8px] font-mono font-bold text-white bg-black/75 px-1.5 py-0.5 rounded-full mt-0.5 shadow-sm whitespace-nowrap">
                      {glider.progress >= 1 ? 'Delivered' : 'Chimney Lane'}
                    </span>
                  </div>

                  {/* Stop 2 checkpoint: Center cottage chimney */}
                  <div className="absolute left-[64%] top-[62%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 shadow-lg ${
                      glider.progress >= 2 
                        ? 'bg-[#ffb703] text-[#14101f] border-white checkpoint-active' 
                        : 'bg-[#14101f]/90 text-[#ffb703] border-[#ffb703]/50'
                    }`}>
                      {glider.progress >= 2 ? '✓' : '2'}
                    </div>
                    <span className="text-[8px] font-mono font-bold text-white bg-black/75 px-1.5 py-0.5 rounded-full mt-0.5 shadow-sm whitespace-nowrap">
                      {glider.progress >= 2 ? 'Delivered' : 'Stardust Row'}
                    </span>
                  </div>

                  {/* Stop 3 checkpoint: Right cottage chimney */}
                  <div className="absolute left-[83%] top-[66%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 shadow-lg ${
                      glider.progress >= 3 
                        ? 'bg-[#ffb703] text-[#14101f] border-white checkpoint-active' 
                        : 'bg-[#14101f]/90 text-[#ffb703] border-[#ffb703]/50'
                    }`}>
                      {glider.progress >= 3 ? '✓' : '3'}
                    </div>
                    <span className="text-[8px] font-mono font-bold text-white bg-black/75 px-1.5 py-0.5 rounded-full mt-0.5 shadow-sm whitespace-nowrap">
                      {glider.progress >= 3 ? 'Delivered' : 'Cradle Court'}
                    </span>
                  </div>

                  {/* Animated Cloud Glider indicator in diorama */}
                  {glider.flying && (
                    <div
                      className="absolute z-30 transition-all duration-500 ease-out text-2xl select-none"
                      style={{
                        left: `${18 + glider.progress * 22}%`,
                        top: `${30 - (glider.progress % 2) * 8}%`,
                        filter: 'drop-shadow(0 0 10px #ffb703)',
                      }}
                    >
                      ✨✈️
                    </div>
                  )}

                  {/* Bottom flight telemetry status */}
                  <div className="absolute bottom-2.5 inset-x-3 flex justify-between items-center z-20">
                    <span className="bg-[#14101f]/85 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#ffb703]/40 text-[10px] font-bold text-[#ffb703] shadow-md">
                      {glider.flying ? '✨ Parachuting dream parcels…' : `Delivered: ${glider.progress}/3 stops`}
                    </span>

                    <span className="text-[10px] text-[#fff8f1] bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full font-mono border border-white/20">
                      Alt: 180m · Wind: 4kts
                    </span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-editorial text-2xl font-bold text-[#5c4033] dark:text-[#fff8f1] mt-1">Dream Delivery Routes</h3>
                <p className="text-sm text-[#5c4033] dark:text-[#fff8f1] mt-1 leading-relaxed font-medium">
                  Every night at 17:17, Pip charts wind currents across Chimney Lane to parachute dream parcels into nurseries.
                </p>
              </div>

              <button
                id="launch-glider-btn"
                data-testid="launch-glider-btn"
                onClick={flyGlider}
                disabled={glider.flying}
                aria-label={glider.flying ? 'Cloud Glider is in flight across rooftops' : 'Launch Cloud Glider (+3 Dreams)'}
                className="mt-auto w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#a34063] hover:bg-[#c85a82] disabled:opacity-55 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl active:scale-95 active:shadow-inner cursor-pointer"
              >
                {glider.flying ? '☁️ Gliding across rooftops...' : '🚀 Launch Cloud Glider (+3 Dreams)'}
              </button>
            </div>
          ) : (
            <div className="p-5 flex flex-col flex-1 gap-4">
              <div className="doorframe-height-wall h-52 p-3 flex items-center gap-3.5 relative overflow-hidden">
                {/* wooden doorframe ruler marks */}
                <div className="h-full w-8 bg-[#3d2415] rounded-xl p-1 flex flex-col justify-between items-center text-[8px] font-mono font-bold text-[#ffb703] border border-[#ffb703]/30 shadow-inner flex-shrink-0" aria-label="Doorframe ruler height marks">
                  <div className="flex items-center gap-0.5"><span>5</span><span className="w-1.5 h-0.5 bg-[#ffb703]" /></div>
                  <div className="flex items-center gap-0.5 text-[#ffb703] bg-[#a34063] px-1 rounded-sm"><span className="text-[7px]">4.5</span></div>
                  <div className="flex items-center gap-0.5"><span>4</span><span className="w-1.5 h-0.5 bg-[#ffb703]" /></div>
                  <div className="flex items-center gap-0.5"><span>3</span><span className="w-1.5 h-0.5 bg-[#ffb703]" /></div>
                  <div className="flex items-center gap-0.5"><span>2</span><span className="w-1.5 h-0.5 bg-[#ffb703]" /></div>
                  <div className="flex items-center gap-0.5"><span>1</span><span className="w-1.5 h-0.5 bg-[#ffb703]" /></div>
                </div>

                {/* pip portrait */}
                <div
                  role="button"
                  tabIndex={0}
                  className="h-full bg-white/40 dark:bg-black/30 rounded-xl p-2 border border-[#5c4033]/20 flex items-center justify-center flex-shrink-0 shadow-md cursor-pointer group"
                  onClick={() => playSingleNote(880, isMuted, 'triangle')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      playSingleNote(880, isMuted, 'triangle');
                    }
                  }}
                  aria-label="Pip character standing by doorframe — click or press Enter to hear Pip giggle"
                  title="Click or press Enter to hear Pip giggle!"
                >
                  <img
                    src="https://hax.baby/baby/assets/pip_portrait.png"
                    alt="Pip's studio character portrait standing by doorframe"
                    className="h-full object-contain group-hover:scale-105 transition-transform drop-shadow"
                    loading="lazy"
                    width="76"
                    height="152"
                  />
                </div>

                {/* telemetry & growth stats */}
                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold border-b border-[#5c4033]/20 dark:border-white/10 pb-1">
                    <span className="text-[#a34063] dark:text-[#ffb703] font-fraunces text-xs">Doorframe Scale</span>
                    <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-[#ffb703] text-[#14101f] font-bold">4.5 BLOCKS</span>
                  </div>
                  {[
                    { label: 'Giggle Output',    pct: 99,  color: '#a34063' },
                    { label: 'Lullaby Pitch',    pct: 94,  color: '#ffb703' },
                    { label: 'Shadow Proofing',  pct: 100, color: '#22c55e' },
                    { label: 'Dream Delivery',   pct: 88,  color: '#38bdf8' },
                  ].map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between font-bold text-[9px] mb-0.5">
                        <span>{label}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#5c4033]/15 dark:bg-[#ffb703]/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-editorial text-2xl font-bold text-[#5c4033] dark:text-[#fff8f1] mt-1">Pip's Growth Chart</h3>
                <p className="text-sm text-[#5c4033] dark:text-[#fff8f1] mt-1 leading-relaxed font-medium">
                  Measured in stacked wooden blocks on the Midnight Nursery doorframe. Currently 4.5 blocks tall and growing!
                </p>
              </div>

              <button
                onClick={() => {
                  setGlider((prev) => ({ ...prev, tab: 'map' }));
                  setTimeout(() => flyGlider(), 60);
                }}
                disabled={glider.flying}
                aria-label="Switch back to map and fly cloud glider (+3 Dreams)"
                className="mt-auto w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#a34063] hover:bg-[#c85a82] disabled:opacity-55 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl active:scale-95 active:shadow-inner cursor-pointer"
              >
                {glider.flying ? '☁️ Gliding across rooftops...' : '🚀 Switch to Map & Fly (+3 Dreams)'}
              </button>
            </div>
          )}
        </article>
      </div>

      {box.notes.map((n) => (
        <span
          key={n.id}
          className="note-float text-[#a34063] dark:text-[#ffb703]"
          style={{ left: n.x, top: n.y }}
          aria-hidden="true"
        >
          {n.char}
        </span>
      ))}
    </section>
  );
}
