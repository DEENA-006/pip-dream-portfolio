// Web Audio synth for Pip.baby
// Lightweight, zero-asset music box synthesizer with auto-playable PCM fallback.

let _ctx = null;
let _masterGain = null;
let _cachedChimeUri = null;

// generate a clean 16-bit mono PCM WAV data URI
function generateWav(sampleRate, duration, sampleFn) {
  if (typeof window === 'undefined') return '';
  try {
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new Int16Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const s = Math.max(-1, Math.min(1, sampleFn(t)));
      buffer[i] = s * 32767;
    }
    const wavBytes = new Uint8Array(44 + buffer.byteLength);
    const view = new DataView(wavBytes.buffer);
    const writeStr = (off, str) => {
      for (let j = 0; j < str.length; j++) view.setUint8(off + j, str.charCodeAt(j));
    };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + buffer.byteLength, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, buffer.byteLength, true);
    new Uint8Array(wavBytes.buffer, 44).set(new Uint8Array(buffer.buffer));
    let binary = '';
    for (let j = 0; j < wavBytes.length; j++) binary += String.fromCharCode(wavBytes[j]);
    return 'data:audio/wav;base64,' + btoa(binary);
  } catch {
    return '';
  }
}

// get or lazily synthesize the 4-note music-box chime WAV (C5 -> E5 -> G5 -> C6)
function getChimeWav() {
  if (_cachedChimeUri) return _cachedChimeUri;
  _cachedChimeUri = generateWav(16000, 1.4, (t) => {
    const notes = [
      { f: 523.25, t: 0.0 },
      { f: 659.25, t: 0.12 },
      { f: 783.99, t: 0.24 },
      { f: 1046.50, t: 0.36 },
    ];
    let s = 0;
    for (const n of notes) {
      if (t >= n.t) {
        const dt = t - n.t;
        s += Math.sin(2 * Math.PI * n.f * dt) * Math.exp(-dt * 3.8) * 0.45;
      }
    }
    return s;
  });
  return _cachedChimeUri;
}

// lazy init on user action
export function getCtx() {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!_ctx || _ctx.state === 'closed') {
      _ctx = new AudioCtx();
      _masterGain = _ctx.createGain();
      _masterGain.gain.setValueAtTime(1, _ctx.currentTime);
      _masterGain.connect(_ctx.destination);
    }
  } catch {
    return null;
  }
  return _ctx;
}

// unlock audio context on any user interaction
export function unlockAudio() {
  const ctx = getCtx();
  if (ctx && ctx.state === 'suspended') {
    return ctx.resume().catch(() => {});
  }
  return Promise.resolve();
}

// smooth master mute ramp (avoids clicks/pops)
export function setMasterMute(isMuted) {
  if (!_ctx || !_masterGain) return;
  const now = _ctx.currentTime;
  _masterGain.gain.cancelScheduledValues(now);
  _masterGain.gain.setValueAtTime(_masterGain.gain.value, now);
  _masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 1, now + 0.04);
}

// core tone synth with linear ramps (never throws DOMExceptions)
function tone({ freq = 440, type = 'sine', dur = 0.18, vol = 0.28, start = 0, isMuted = false }) {
  if (isMuted) return;
  const ctx = getCtx();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    const now = ctx.currentTime + Math.max(0, start);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.02);
    gain.gain.setValueAtTime(vol, now + dur * 0.6);
    gain.gain.linearRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(_masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.05);
  } catch {}
}

// playful boop sound for amber eye-tracker / skull clicks
export function playBoopSound(boopCount = 0, isMuted = false) {
  if (isMuted) return;
  const ctx = getCtx();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    const pitches = [
      { start: 587.33, end: 783.99 },  // boop 1 (D5 -> G5)
      { start: 783.99, end: 987.77 },  // boop 2 (G5 -> B5)
      { start: 987.77, end: 1318.51 }, // boop 3 (B5 -> E6)
    ];
    const pitch = pitches[boopCount % pitches.length] || pitches[0];
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch.start, now);
    osc.frequency.linearRampToValueAtTime(pitch.end, now + 0.09);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain.gain.setValueAtTime(0.35, now + 0.08);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.16);

    osc.connect(gain);
    gain.connect(_masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } catch {}
}

// music box chime for preloader exit (C5 -> E5 -> G5 -> C6)
// plays automatically via HTML5 audio element + Web Audio synth
export function playMusicBoxChime(isMuted = false) {
  if (isMuted) return;

  // 1. HTML5 Audio (bypasses Web Audio autoplay lock on reload)
  try {
    const uri = getChimeWav();
    if (uri) {
      const audio = new Audio(uri);
      audio.volume = 0.65;
      audio.play().catch(() => {});
    }
  } catch {}

  // 2. Web Audio synthesis companion
  const ctx = getCtx();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.32, startTime + 0.03);
      gain.gain.linearRampToValueAtTime(0.0001, startTime + 0.85);

      osc.connect(gain);
      gain.connect(_masterGain || ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.9);
    });
  } catch {}
}

export function playClickChime(isMuted = false) {
  tone({ freq: 880, type: 'triangle', dur: 0.08, vol: 0.25, start: 0, isMuted });
  tone({ freq: 1318.5, type: 'sine', dur: 0.07, vol: 0.15, start: 0.01, isMuted });
}

// c-major pentatonic lullaby sequence
export function playLullabyMelody(isMuted = false) {
  const melody = [
    [523.25, 0.00], [659.25, 0.22], [783.99, 0.44],
    [880.00, 0.68], [783.99, 0.92], [659.25, 1.14],
    [1046.50, 1.38], [880.00, 1.70], [783.99, 1.95],
  ];
  melody.forEach(([freq, start]) => {
    tone({ freq, type: 'sine', dur: 0.38, vol: 0.25, start, isMuted });
    tone({ freq: freq * 2, type: 'triangle', dur: 0.22, vol: 0.10, start: start + 0.005, isMuted });
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
    tone({ freq, type: 'triangle', dur: 0.22, vol: 0.28, start, isMuted })
  );
  [1046.50, 1318.51, 1567.98].forEach((f, i) =>
    tone({ freq: f, type: 'sine', dur: 0.9, vol: 0.20, start: 0.68 + i * 0.02, isMuted })
  );
}

export function playSingleNote(freq = 660, isMuted = false, type = 'triangle') {
  tone({ freq, type, dur: 0.18, vol: 0.25, isMuted });
}

export function playToggle(isDark = false, isMuted = false) {
  const base = isDark ? 659.25 : 880.00;
  const hi = isDark ? 440.00 : 1174.66;
  tone({ freq: base, type: 'triangle', dur: 0.10, vol: 0.25, start: 0, isMuted });
  tone({ freq: hi, type: 'sine', dur: 0.14, vol: 0.25, start: 0.08, isMuted });
}

export function playChaos(isChaos = false, isMuted = false) {
  if (isMuted) return;
  const ctx = getCtx();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isChaos ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isChaos ? 350 : 800, now);
    osc.frequency.exponentialRampToValueAtTime(isChaos ? 1100 : 400, now + 0.2);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(_masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch {}
}
