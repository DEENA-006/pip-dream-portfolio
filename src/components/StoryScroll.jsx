import { useState, useCallback } from 'react';
import { playSingleNote } from '../utils/sound';

const SCENES = [
  {
    id: 1,
    icon: '🌠',
    tag: 'Chapter 01 · The First Giggle',
    wordCount: '61 Words',
    title: 'Born from a Stray Wishing Star',
    text: 'One crisp October evening, a sleepy wishing star tumbled down the chimney of the Midnight Nursery and landed inside a basket of warm quilt scraps. Out popped Pip — a tiny skull baby with glowing amber eye-pinpricks and a crooked little smile. Because Pip hated awkward silence, their very first giggle turned every scary shadow in the room into cozy velvet!',
    reaction: '✨ Wishing Star Twinkled! +1 Starlight Memory',
    noteFreq: 659.25,
    accentColor: '#a34063',
  },
  {
    id: 2,
    icon: '🔑',
    tag: 'Chapter 02 · The Silence Problem',
    wordCount: '60 Words',
    title: 'Tinkering with Brass Keys & Porcelain',
    text: 'Whenever the night wind howled outside, the neighborhood baby ghosts and cloud bunnies couldn\'t fall asleep. Determined to fix the noise, Pip crawled into the nursery workshop with three wooden rattle blocks, a brass winding key, and a crescent porcelain lamp. Before even learning to walk, Pip tuned the first Lullaby Box to the exact frequency of a contented yawn.',
    reaction: '🎵 Brass Key Wound! Soothing harmonic calibrated!',
    noteFreq: 783.99,
    accentColor: '#ffb703',
  },
  {
    id: 3,
    icon: '☁️',
    tag: 'Chapter 03 · Nightly Rooftop Flights',
    wordCount: '50 Words',
    title: 'Junior Dream Engineer on Patrol',
    text: 'Now, every evening when the nursery clock strikes 17:17, Pip straightens the pink bow on their starry nightcap and hops onto a fluffy cumulus cloud. Gliding from chimney to chimney with a warm lantern in hand, Pip delivers custom-built dreams so every creature on the internet wakes up brighter tomorrow.',
    reaction: '☁️ Cloud Glider Whooshed! Sweet dreams dispatched!',
    noteFreq: 880.00,
    accentColor: '#c084fc',
  },
];

const STARDUST_CHARS = ['✦', '★', '✧', '⋆', '✿', '💫'];

export default function StoryScroll({ isMuted }) {
  const [activeReaction, setActiveReaction] = useState(null);
  const [stardusts, setStardusts] = useState([]);

  // scatter stardust particles on click
  const readChapter = useCallback((scene, e) => {
    setActiveReaction(scene.id);
    playSingleNote(scene.noteFreq, isMuted, 'triangle');

    const rect = e.currentTarget.getBoundingClientRect();
    const originX = e.clientX || (rect.left + rect.width / 2);
    const originY = e.clientY || (rect.top + rect.height / 2);

    const newDust = Array.from({ length: 7 }, (_, i) => ({
      id: Date.now() + i,
      x: originX,
      y: originY,
      char: STARDUST_CHARS[Math.floor(Math.random() * STARDUST_CHARS.length)],
      sx: (Math.random() - 0.5) * 90,
      sy: (Math.random() - 0.5) * 80 - 30,
      sr: Math.random() * 360,
    }));

    setStardusts((prev) => [...prev.slice(-28), ...newDust]);
    newDust.forEach(({ id }) => {
      setTimeout(() => setStardusts((prev) => prev.filter((d) => d.id !== id)), 950);
    });
  }, [isMuted]);

  return (
    <section id="story" className="space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-editorial text-3xl sm:text-4xl font-extrabold text-[#5c4033] dark:text-[#fff8f1] leading-tight">
          The Bedtime Tale of{' '}
          <span className="text-[#a34063] dark:text-[#ffb703] dashed-underline">Pip</span>
        </h2>
        <p className="text-sm text-[#5c4033] dark:text-[#fff8f1] font-medium">
          Click any storybook page to scatter stardust and trigger a nursery memory!
        </p>
      </div>

      <div className="space-y-8">
        {SCENES.map((scene, idx) => (
          <div
            key={scene.id}
            role="button"
            tabIndex={0}
            aria-label={`Chapter ${idx + 1}: ${scene.title}. Press Enter or Space to read chapter and scatter stardust.`}
            title="Click or press Enter to read chapter"
            onClick={(e) => readChapter(scene, e)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                readChapter(scene, e);
              }
            }}
            className="storybook-page p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row gap-6 items-start cursor-pointer group select-none transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl active:scale-98 active:shadow-inner"
            style={{ '--page-depth': `${(idx + 1) * 4}px` }}
          >
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <div
                className="text-4xl sm:text-5xl bg-[#a34063]/12 dark:bg-[#ffb703]/15 p-5 rounded-2xl border-2 border-dashed transition-transform duration-300 group-hover:scale-105"
                style={{ borderColor: scene.accentColor + '55' }}
                aria-hidden="true"
              >
                {scene.icon}
              </div>
              <span className="text-xs font-extrabold text-[#5c4033] dark:text-[#fff8f1]">CH. {String(idx + 1).padStart(2, '0')}</span>
            </div>

            <div className="flex-1 space-y-3 relative z-10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span
                    className="retro-tag"
                    style={{ color: scene.accentColor }}
                  >
                    {scene.tag}
                  </span>
                  <div className="text-[10px] text-[#5c4033] dark:text-[#fff8f1] font-bold uppercase tracking-widest pl-1">
                    {scene.wordCount} · bedtime dispatch
                  </div>
                </div>
                {activeReaction === scene.id && (
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full text-[#14101f] animate-pulse"
                    style={{ background: scene.accentColor }}
                    role="status"
                    aria-live="polite"
                  >
                    {scene.reaction}
                  </span>
                )}
              </div>

              <h3 className="text-editorial text-2xl sm:text-3xl font-extrabold text-[#5c4033] dark:text-[#fff8f1]">
                {scene.title}
              </h3>

              <p className="drop-cap text-base sm:text-lg leading-relaxed text-[#5c4033] dark:text-[#fff8f1] font-medium">
                {scene.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {stardusts.map((d) => (
        <span
          key={d.id}
          className="stardust text-[#a34063] dark:text-[#ffb703] text-base font-bold select-none"
          style={{
            left: d.x,
            top:  d.y,
            '--sx': `${d.sx}px`,
            '--sy': `${d.sy}px`,
            '--sr': `${d.sr}deg`,
          }}
          aria-hidden="true"
        >
          {d.char}
        </span>
      ))}
    </section>
  );
}
