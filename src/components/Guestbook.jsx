import { useState, useRef, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { playSingleNote } from '../utils/sound';
import { Heart, Sparkles, Pin } from 'lucide-react';

const DEFAULT_ENTRIES = [
  { id: 1, avatar: '👻', name: 'barnaby', wish: 'left the lantern on all night in the closet lol 10/10 cozy', time: 'just now', stamp: 'verified', likes: 14 },
  { id: 2, avatar: '🐰', name: 'muffins', wish: 'zzzzz', time: '14m ago', stamp: 'zzz', likes: 8 },
  { id: 3, avatar: '🤖', name: 'dev_alex', wish: 'yo whoever tuned the pentatonic audio curve on the music box... huge props. 3am hackathon builds hit different', time: '42m ago', stamp: 'cool build', likes: 21 },
  { id: 4, avatar: '🦉', name: 'hootie', wish: 'chimney #3 parcel delivered', time: '2h ago', stamp: 'delivered', likes: 5 },
  { id: 5, avatar: '🐱', name: 'kiki', wish: 'booped the bow like 30 times already where is my certificate lol', time: 'yesterday', stamp: 'curious', likes: 19 },
  { id: 6, avatar: '☁️', name: 'sam', wish: 'pls make a dark mode screensaver', time: '2d ago', stamp: 'night owl', likes: 11 },
];

const STAMP_COLORS = ['#a34063', '#5c4033', '#2563eb', '#059669', '#7c3aed', '#d97706'];

const STICKER_PALETTE = [
  { emoji: '👻', label: 'Ghost' },
  { emoji: '🐰', label: 'Bunny' },
  { emoji: '☁️',  label: 'Cloud' },
  { emoji: '🤖', label: 'Robot' },
  { emoji: '🌟', label: 'Star'  },
  { emoji: '🦉', label: 'Owl'   },
  { emoji: '🐱', label: 'Cat'   },
  { emoji: '🎀', label: 'Bow'   },
  { emoji: '🌙', label: 'Moon'  },
  { emoji: '🍼', label: 'Pip'   },
];

const QUICK_PROMPTS = [
  '✨ Extra blanket delivery',
  '🌙 Wake me up at 7am',
  '🎀 Boop Pip\'s bow 3x',
  '☕ Hot cocoa chimney drop',
];

// strip html tags and zero-width unicode tricks
function sanitize(str, maxLen = 100) {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]))
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .slice(0, maxLen)
    .trim();
}

export default function Guestbook({ isMuted, onDreamsEarned }) {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('pip_guestbook_v4');
      return saved ? JSON.parse(saved) : DEFAULT_ENTRIES;
    } catch {
      return DEFAULT_ENTRIES;
    }
  });

  const [form, setForm] = useState({ name: '', wish: '', avatar: '👻' });
  const [signed, setSigned] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [heartFloats, setHeartFloats] = useState([]);
  const cooldownRef = useRef(false);
  const toastTimerRef = useRef(null);
  const successTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const saveEntries = (newEntries) => {
    setEntries(newEntries);
    try {
      localStorage.setItem('pip_guestbook_v4', JSON.stringify(newEntries));
    } catch {
      // storage quota
    }
  };

  const submitGuestbook = (e) => {
    e.preventDefault();
    if (cooldownRef.current || signed) return;

    const cleanName = sanitize(form.name, 30);
    const cleanWish = sanitize(form.wish, 100);

    if (cleanName.replace(/\s+/g, '').length < 2 || cleanWish.replace(/\s+/g, '').length < 3) {
      setFormError('Oops! Please write a name and a wish first 🌟');
      playSingleNote(349.23, isMuted, 'sawtooth');
      return;
    }

    setFormError('');

    // throttled to prevent spam clicks
    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
    }, 1500);

    const stamps = ['DREAM ★', 'COZY ✦', 'MAGIC ♡', 'STAR ✧', 'SWEET DREAMS ♪'];
    const newEntry = {
      id: Date.now(),
      avatar: form.avatar,
      name: cleanName,
      wish: cleanWish,
      time: 'Just now',
      stamp: stamps[Math.floor(Math.random() * stamps.length)],
      likes: 1,
    };

    // cap at 24 entries so localStorage doesn't choke
    const nextEntries = [newEntry, ...entries.slice(0, 23)];
    saveEntries(nextEntries);

    setForm((prev) => ({ ...prev, name: '', wish: '' }));
    setSigned(true);
    setIsSuccess(true);
    playSingleNote(987.77, isMuted, 'triangle');
    onDreamsEarned(1);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ffb703', '#a34063', '#fff8f1', '#c084fc'],
        disableForReducedMotion: true,
      });
    } catch {}

    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => {
      setIsSuccess(false);
      successTimerRef.current = null;
    }, 2000);

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setSigned(false);
      toastTimerRef.current = null;
    }, 3500);
  };

  const likeEntry = (id, e) => {
    e.stopPropagation();
    playSingleNote(880, isMuted, 'triangle');

    const floatId = Date.now() + Math.random();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX || rect.left + rect.width / 2;
    const clientY = e.clientY || rect.top;

    setHeartFloats((prev) => [...prev.slice(-6), { id: floatId, x: clientX, y: clientY }]);
    setTimeout(() => {
      setHeartFloats((prev) => prev.filter((h) => h.id !== floatId));
    }, 900);

    const updated = entries.map((entry) =>
      entry.id === id ? { ...entry, likes: (entry.likes || 0) + 1 } : entry
    );
    saveEntries(updated);
  };

  const filteredEntries = useMemo(() => {
    if (activeFilter === 'loved') {
      return [...entries].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    if (activeFilter === 'recent') {
      return entries;
    }
    return entries;
  }, [entries, activeFilter]);

  const charCount = form.wish.length;

  return (
    <section id="guestbook" className="space-y-8 scroll-mt-24">
      {/* section header without hackathon rubric tags */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#5c4033]/20 dark:border-[#ffb703]/25 pb-4">
        <div>
          <h2 className="text-editorial text-3xl sm:text-4xl font-extrabold text-[#5c4033] dark:text-[#fff8f1] leading-tight">
            Sign Pip's{' '}
            <span className="text-[#a34063] dark:text-[#ffb703] dashed-underline">
              Midnight Guestbook
            </span>
          </h2>
          <p className="text-sm text-[#5c4033]/80 dark:text-[#fff8f1]/80 mt-1 font-medium">
            Leave a bedtime wish or cozy note on the corkboard before drifting off to sleep.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#a34063] text-white font-bold text-xs shadow-sm">
            <span>📌</span>
            <span>{entries.length} Wishes Pinned</span>
          </span>
          <span className="hidden sm:inline text-xs font-mono opacity-50 font-bold uppercase tracking-wider">
            ★ Click any note to send ❤️
          </span>
        </div>
      </div>

      {/* interactive writing desk: form + live polaroid draft */}
      <div className="backdrop-blur-xl bg-white/30 dark:bg-[#161124]/40 border border-white/50 dark:border-white/10 p-5 sm:p-7 rounded-3xl shadow-xl grid lg:grid-cols-12 gap-7 items-start">
        {/* left column: interactive inputs */}
        <form onSubmit={submitGuestbook} className="lg:col-span-7 space-y-4" aria-label="Sign the guestbook">
          <div>
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <label htmlFor="guestbook-avatar-select" className="text-xs font-extrabold uppercase tracking-wider text-[#5c4033] dark:text-[#ffb703] flex items-center gap-1 cursor-pointer">
                <span>✦</span> Pick Your Dream Sticker
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="guestbook-avatar-select"
                  data-testid="guestbook-avatar-select"
                  value={form.avatar}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, avatar: e.target.value }));
                    playSingleNote(659.25, isMuted, 'sine');
                  }}
                  aria-label="Select avatar sticker dropdown"
                  className="retro-input text-xs font-bold py-1 px-2 rounded-lg border border-[#5c4033]/20 dark:border-white/10 bg-[#fffaf3] dark:bg-[#1e1830] text-[#5c4033] dark:text-[#fff8f1] cursor-pointer"
                >
                  {STICKER_PALETTE.map((stk) => (
                    <option key={stk.emoji} value={stk.emoji}>
                      {stk.emoji} {stk.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] font-mono text-[#a34063] dark:text-[#ffb703] font-bold">
                  {form.avatar}
                </span>
              </div>
            </div>

            {/* visual sticker palette */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5" role="radiogroup" aria-label="Choose avatar sticker (44px touch targets)">
              {STICKER_PALETTE.map((stk) => (
                <button
                  key={stk.emoji}
                  data-testid={`guestbook-avatar-${stk.emoji}`}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, avatar: stk.emoji }));
                    playSingleNote(659.25, isMuted, 'sine');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setForm((prev) => ({ ...prev, avatar: stk.emoji }));
                      playSingleNote(659.25, isMuted, 'sine');
                    }
                  }}
                  className={`py-2 px-1 min-h-[44px] min-w-[44px] rounded-xl text-xl transition-all duration-200 cursor-pointer flex flex-col items-center justify-center border-2 ${
                    form.avatar === stk.emoji
                      ? 'bg-[#ffb703] border-[#5c4033] dark:border-[#ffb703] scale-110 shadow-md ring-2 ring-[#a34063]/30'
                      : 'bg-[#fffaf3] dark:bg-[#1e1830] border-[#5c4033]/20 dark:border-white/10 hover:border-[#a34063] hover:scale-105 active:scale-90'
                  }`}
                  aria-label={`Select ${stk.label} sticker avatar`}
                  title={`Select ${stk.label}`}
                  aria-checked={form.avatar === stk.emoji}
                  role="radio"
                >
                  <span className="select-none" aria-hidden="true">{stk.emoji}</span>
                  <span className="text-[8px] font-bold opacity-60 mt-0.5 truncate w-full text-center">
                    {stk.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 flex flex-col gap-1">
              <label htmlFor="guestbook-name" className="text-xs font-extrabold uppercase tracking-wider text-[#5c4033] dark:text-[#ffb703]">
                ✦ Your Name
              </label>
              <input
                id="guestbook-name"
                data-testid="guestbook-name-input"
                type="text"
                maxLength={30}
                value={form.name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, name: e.target.value }));
                  if (formError) setFormError('');
                }}
                placeholder="e.g. sleepy_wanderer"
                aria-label="Your name"
                className="retro-input w-full px-3.5 py-2.5 min-h-[44px] text-sm font-semibold"
              />
            </div>

            <div className="sm:col-span-7 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label htmlFor="guestbook-wish" className="text-xs font-extrabold uppercase tracking-wider text-[#5c4033] dark:text-[#ffb703]">
                  ✦ Bedtime Wish or Note
                </label>
                <span className={`text-[10px] font-mono font-bold ${charCount > 85 ? 'text-[#a34063]' : 'opacity-60'}`}>
                  {charCount}/100
                </span>
              </div>
              <input
                id="guestbook-wish"
                data-testid="guestbook-wish-input"
                type="text"
                maxLength={100}
                value={form.wish}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, wish: e.target.value }));
                  if (formError) setFormError('');
                }}
                placeholder="Leave a sweet dream request for Pip…"
                aria-label="Your bedtime message for Pip"
                className="retro-input w-full px-3.5 py-2.5 min-h-[44px] text-sm font-semibold"
              />
            </div>
          </div>

          {/* quick inspiration chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5" role="group" aria-label="Quick prompt suggestions">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-[#ffb703]" aria-hidden="true" /> Ideas:
            </span>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, wish: prompt.slice(2) }));
                  if (formError) setFormError('');
                  playSingleNote(783.99, isMuted, 'sine');
                }}
                aria-label={`Use idea: ${prompt}`}
                className="text-[11px] font-bold px-3 py-2 min-h-[44px] sm:min-h-[38px] rounded-full bg-[#f5eadc] dark:bg-[#1e1830] border border-[#5c4033]/20 dark:border-white/10 hover:border-[#a34063] dark:hover:border-[#ffb703] text-[#5c4033] dark:text-[#f0e6d6] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Inline gentle validation error message */}
          {formError && (
            <div
              className="text-xs font-bold text-[#a34063] dark:text-[#ffb703] bg-[#a34063]/10 dark:bg-[#ffb703]/15 border border-[#a34063]/30 dark:border-[#ffb703]/40 rounded-xl px-3.5 py-2.5 flex items-center gap-2"
              role="alert"
              aria-live="assertive"
            >
              <span aria-hidden="true">⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
            <button
              id="guestbook-submit"
              data-testid="guestbook-submit-btn"
              type="submit"
              disabled={signed && !isSuccess}
              aria-label={isSuccess ? 'Success! Wish pinned to corkboard' : 'Pin to Midnight Corkboard'}
              className="retro-btn-chunky min-h-[44px] py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold cursor-pointer inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Pin className="w-4 h-4" aria-hidden="true" />
              <span>
                {isSuccess
                  ? '✨ Success! Wish Pinned!'
                  : signed
                  ? '✅ Pinned on Corkboard!'
                  : 'Pin to Midnight Corkboard ✨'}
              </span>
            </button>

            {signed && (
              <p className="text-xs text-[#a34063] dark:text-[#ffb703] font-bold animate-pulse" role="status" aria-live="polite">
                🏮 Wish pinned! +1 Dream delivered to Pip!
              </p>
            )}
          </div>
        </form>

        {/* right column: real-time live polaroid draft */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 sm:p-4 bg-[#f5eadc]/50 dark:bg-[#120d1c]/50 rounded-2xl border-2 border-dashed border-[#5c4033]/20 dark:border-[#ffb703]/20 relative">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a34063] dark:text-[#ffb703] mb-3 flex items-center gap-1">
            <span>✦</span> Live Draft Preview on Pip's Desk
          </span>

          <div className="polaroid w-full max-w-xs transform rotate-1 shadow-2xl relative transition-all duration-200">
            <div className="washi-tape-strip" aria-hidden="true" />
            <span className="polaroid-stamp !bg-[#ffb703] !text-[#14101f]" aria-hidden="true">
              DRAFT ✦
            </span>

            <div className="bg-[#f5eadc] dark:bg-[#231b38] rounded-sm mb-3 flex items-center gap-3 p-3 min-h-[72px] border border-[#5c4033]/15">
              <span className="text-3xl flex-shrink-0 animate-bounce select-none" role="img" aria-label="Avatar preview">
                {form.avatar}
              </span>
              <p
                className="text-xs leading-snug text-[#5c4033] dark:text-[#f0e6d6]/90 flex-1 italic"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                "{form.wish.trim() || 'Type a bedtime note or choose an idea chip above…'}"
              </p>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <span className="font-bold text-xs text-[#5c4033] dark:text-[#f0e6d6]">
                  {form.name.trim() || 'your_name'}
                </span>
                <span className="text-[9px] opacity-50 italic">Drafting now</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#a34063]/15 text-[#a34063] dark:text-[#ffb703]">
                Ready to Pin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* corkboard noticeboard wall */}
      <div className="corkboard-frame p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none" aria-hidden="true">📌</span>
            <h3 className="font-fraunces font-extrabold text-xl text-[#5c4033] dark:text-[#fff8f1]">
              The Midnight Corkboard
            </h3>
            <span className="text-xs font-mono font-bold opacity-60">
              ({filteredEntries.length} notes)
            </span>
          </div>

          {/* filter tabs */}
          <div className="flex items-center gap-1.5 bg-[#fff8f1]/80 dark:bg-[#14101f]/80 p-1 rounded-xl border border-[#5c4033]/20 dark:border-white/10 shadow-sm" role="tablist" aria-label="Filter guestbook notes">
            {[
              { id: 'all', label: 'All Notes' },
              { id: 'loved', label: '❤️ Most Loved' },
              { id: 'recent', label: '🌙 Recent' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeFilter === id}
                aria-label={`Filter notes by ${label}`}
                onClick={() => {
                  setActiveFilter(id);
                  playSingleNote(523.25, isMuted, 'sine');
                }}
                className={`text-xs font-bold px-3.5 py-2 min-h-[44px] rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  activeFilter === id
                    ? 'bg-[#a34063] text-white shadow-sm'
                    : 'text-[#5c4033] dark:text-[#f0e6d6] hover:bg-[#a34063]/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* polaroids wall */}
        <div
          data-testid="guestbook-entries"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[560px] overflow-y-auto pr-1 py-3"
          role="feed"
          aria-label="Guestbook entries pinned on corkboard"
        >
          {filteredEntries.map((entry, idx) => (
            <div
              key={entry.id}
              data-testid="guestbook-entry"
              tabIndex={0}
              onClick={(e) => likeEntry(entry.id, e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  likeEntry(entry.id, e);
                }
              }}
              className="polaroid transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl active:scale-95 cursor-pointer group select-none"
              role="article"
              aria-label={`Guestbook note from ${entry.name}. Press Enter or click to send love.`}
              title="Click or press Enter to send love ❤️"
            >
              <div className="washi-tape-strip" aria-hidden="true" />
              <span
                className="polaroid-stamp"
                style={{ background: STAMP_COLORS[idx % STAMP_COLORS.length] }}
                aria-hidden="true"
              >
                {entry.stamp || 'DREAM ★'}
              </span>

              <div className="bg-[#f5eadc] dark:bg-[#231b38] rounded-sm mb-3 flex items-start gap-2.5 p-3 min-h-[72px] border border-[#5c4033]/10 dark:border-white/5">
                <span data-testid="entry-avatar" className="text-2xl flex-shrink-0 select-none group-hover:scale-110 transition-transform" role="img" aria-label={`Avatar: ${entry.avatar}`}>
                  {entry.avatar}
                </span>
                <p
                  data-testid="entry-wish"
                  className="text-xs leading-relaxed text-[#5c4033] dark:text-[#f0e6d6]/95"
                  style={{ fontFamily: "'Courier New', Courier, monospace" }}
                >
                  "{entry.wish}"
                </p>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                  <span data-testid="entry-name" className="font-bold text-xs text-[#5c4033] dark:text-[#f0e6d6]">{entry.name}</span>
                  <span className="text-[10px] opacity-50 italic">{entry.time}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => likeEntry(entry.id, e)}
                  aria-label={`Send love to ${entry.name}'s note, currently ${entry.likes || 1} hearts`}
                  className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-full bg-[#a34063]/10 hover:bg-[#a34063]/25 dark:bg-[#ffb703]/15 dark:hover:bg-[#ffb703]/30 text-[#a34063] dark:text-[#ffb703] text-xs font-bold transition-all active:scale-90 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>{entry.likes || 1}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* floating hearts on like */}
      {heartFloats.map((h) => (
        <span
          key={h.id}
          className="floating-heart-particle fixed"
          style={{ left: h.x, top: h.y }}
          aria-hidden="true"
        >
          ❤️
        </span>
      ))}
    </section>
  );
}

