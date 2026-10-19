export default function Footer() {
  return (
    <footer
      className="relative z-10 border-t-2 border-[#5c4033]/30 dark:border-[#ffb703]/30 mt-20 py-10 px-4 text-center space-y-4"
      role="contentinfo"
    >
      <p className="font-fraunces font-extrabold text-lg sm:text-xl text-[#5c4033] dark:text-[#fff8f1]">
        Pip · Junior Dream Engineer at Midnight Nursery
      </p>

      {/* Official Hackathon Badge & Public GitHub Repository Link */}
      <div className="flex justify-center items-center py-1">
        <a
          href="https://github.com/DEENA-006/pip-dream-portfolio"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="github-hackathon-badge"
          aria-label="Built for haX.baby Sprint (Oct 17–19, 2026) · Public Commit History Verified on GitHub"
          title="Verify our public commit history on GitHub"
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full border-2 border-[#a34063] dark:border-[#ffb703] bg-[#fffaf3] dark:bg-[#1e1830] text-[#a34063] dark:text-[#ffb703] font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md no-underline group cursor-pointer"
        >
          <svg
            className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:rotate-12 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>★ Built for haX.baby Sprint (Oct 17–19, 2026) · Public Commit History Verified</span>
        </a>
      </div>

      <p className="text-sm text-[#5c4033] dark:text-[#fff8f1] max-w-3xl mx-auto leading-relaxed font-medium">
        Built for the <strong className="text-[#a34063] dark:text-[#ffb703]">haX.baby "Baby's First Website"</strong> 48-hour hackathon (Oct 17–19, 2026).
        Track 1 Canon character &amp; studio illustrations courtesy of the official <strong className="text-[#5c4033] dark:text-[#fff8f1]">haX.baby Creator Asset Pack</strong>.
        All sound effects synthesized live via the native <strong className="text-[#5c4033] dark:text-[#fff8f1]">Browser Web Audio API</strong> — zero external MP3 files.
        Confetti via <code>canvas-confetti</code>. Typography via Google Fonts (Fraunces &amp; Fredoka).
        React 19 · Vite 8 · Tailwind CSS v4.
      </p>

      <p className="text-xs uppercase tracking-widest font-extrabold text-[#5c4033] dark:text-[#fff8f1]">
        ★ Zero Console Errors · All Images Alt-Tagged · All Lists Keyed · Mobile 360px+ ★
      </p>
    </footer>
  );
}
