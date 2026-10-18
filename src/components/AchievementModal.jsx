import { useEffect } from 'react';

export default function AchievementModal({ show, onClose }) {
  // dismiss on Esc
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  // prevent body scrolling behind modal backdrop
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Achievement Unlocked: Starlight Rattle Master"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#14101f]/65 backdrop-blur-sm" aria-hidden="true" />

      <div
        className="achievement-modal relative z-10 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="backdrop-blur-xl bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 shadow-lg rounded-2xl p-1.5">
          <div className="backdrop-blur-2xl bg-[#fffaf3]/92 dark:bg-[#161124]/92 border border-white/40 dark:border-white/10 rounded-xl p-6 sm:p-8 text-center space-y-4 relative overflow-hidden shadow-2xl">
            <span className="absolute top-2 left-3 text-[#ffb703] text-xl" aria-hidden="true">✦</span>
            <span className="absolute top-2 right-3 text-[#ffb703] text-xl" aria-hidden="true">✦</span>
            <span className="absolute bottom-2 left-3 text-[#a34063] text-lg" aria-hidden="true">★</span>
            <span className="absolute bottom-2 right-3 text-[#a34063] text-lg" aria-hidden="true">★</span>

            <div className="text-5xl sm:text-6xl" role="img" aria-label="Trophy">🏆</div>

            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#a34063] dark:text-[#ffb703]">
                Achievement Unlocked
              </p>
              <h2 className="font-fraunces text-2xl sm:text-3xl font-black text-[#5c4033] dark:text-[#fff8f1] leading-tight">
                Starlight Rattle Master!
              </h2>
            </div>

            <p className="text-sm text-[#5c4033] dark:text-[#fff8f1] leading-relaxed font-fredoka font-medium">
              You booped Pip's pink bow 3 times and discovered the secret nursery melody! 
              <strong className="text-[#a34063] dark:text-[#ffb703]"> +5 Dream Credits</strong> awarded!
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {['🎀 BOW MASTER', '✨ DREAM CRAFTER', '🌙 NIGHT OWL'].map((badge) => (
                <span
                  key={badge}
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#a34063] text-white shadow-sm"
                >
                  {badge}
                </span>
              ))}
            </div>

            <button
              id="achievement-close-btn"
              onClick={onClose}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#a34063] hover:bg-[#c85a82] text-white font-bold text-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:scale-95 active:shadow-inner cursor-pointer mt-2"
              aria-label="Close achievement modal"
            >
              Awesome, let's keep building! 💀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
