let _ctx = null;
let _masterGain = null;

// lazy init on first user click so chrome autoplay policy doesn't complain
function getCtx() {
  if (typeof window === 'undefined') return null;
  try {
    if (!_ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      _ctx = new C();
      _masterGain = _ctx.createGain();
      _masterGain.gain.setValueAtTime(1, _ctx.currentTime);
      _masterGain.connect(_ctx.destination);
    }
    if (_ctx.state === 'suspended') {
      _ctx.resume().catch(() => {});
    }
  } catch {
    return null;
  }
  return _ctx;
}

// 40ms linear ramp to prevent speaker pop when muting active audio
export function setMasterMute(isMuted) {
  if (!_ctx || !_masterGain) return;
  const now = _ctx.currentTime;
  _masterGain.gain.cancelScheduledValues(now);
  _masterGain.gain.setValueAtTime(_masterGain.gain.value, now);
  _masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 1, now + 0.04);
}

// core tone synth with smooth adsr envelope
function tone({ freq = 440, type = 'sine', dur = 0.15, vol = 0.1, start = 0, isMuted = false }) {
  if (isMuted) return;
  const ctx = getCtx();
  if (!ctx || ctx.state === 'suspended') return;

  const now = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(vol, now + 0.012);
  gain.gain.setValueAtTime(vol, now + dur * 0.65);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start(now);
  osc.stop(now + dur + 0.01);
}

export function playClickChime(isMuted = false) {
  tone({ freq: 880, type: 'triangle', dur: 0.07, vol: 0.09, start: 0, isMuted });
  tone({ freq: 1318.5, type: 'sine', dur: 0.06, vol: 0.04, start: 0.01, isMuted });
}

// c-major pentatonic lullaby sequence
export function playLullabyMelody(isMuted = false) {
  const melody = [
    [523.25, 0.00], [659.25, 0.22], [783.99, 0.44],
    [880.00, 0.68], [783.99, 0.92], [659.25, 1.14],
    [1046.50, 1.38], [880.00, 1.70], [783.99, 1.95],
  ];
  melody.forEach(([freq, start]) => {
    tone({ freq, type: 'sine', dur: 0.38, vol: 0.11, start, isMuted });
    tone({ freq: freq * 2, type: 'triangle', dur: 0.22, vol: 0.03, start: start + 0.005, isMuted });
  });
}

// fanfare for easter egg unlock
export function playVictoryArpeggio(isMuted = false) {
  const arp = [
    [523.25, 0.00], [659.25, 0.09], [783.99, 0.18],
    [987.77, 0.27], [1046.50, 0.36], [1318.51, 0.45],
    [1567.98, 0.54], [2093.00, 0.65],
  ];
  arp.forEach(([freq, start]) =>
    tone({ freq, type: 'triangle', dur: 0.2, vol: 0.10, start, isMuted })
  );
  [1046.50, 1318.51, 1567.98].forEach((f, i) =>
    tone({ freq: f, type: 'sine', dur: 0.9, vol: 0.08, start: 0.68 + i * 0.02, isMuted })
  );
}

export function playSingleNote(freq = 660, isMuted = false, type = 'triangle') {
  tone({ freq, type, dur: 0.18, vol: 0.10, isMuted });
}

export function playToggle(isDark = false, isMuted = false) {
  const base = isDark ? 659.25 : 880.00;
  const hi = isDark ? 440.00 : 1174.66;
  tone({ freq: base, type: 'triangle', dur: 0.10, vol: 0.09, start: 0, isMuted });
  tone({ freq: hi, type: 'sine', dur: 0.14, vol: 0.09, start: 0.08, isMuted });
}

export function playChaos(isChaos = false, isMuted = false) {
  if (isMuted) return;
  const ctx = getCtx();
  if (!ctx || ctx.state === 'suspended') return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = isChaos ? 'sawtooth' : 'triangle';
  osc.frequency.setValueAtTime(isChaos ? 350 : 800, now);
  osc.frequency.exponentialRampToValueAtTime(isChaos ? 1100 : 400, now + 0.2);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start(now);
  osc.stop(now + 0.25);
}
