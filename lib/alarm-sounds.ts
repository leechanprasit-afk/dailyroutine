// Alarm sound engine — 5 distinct sounds via Web Audio API only, no files needed

export type AlarmSoundId = 'bell' | 'chime' | 'pulse' | 'nature' | 'digital';

export interface AlarmSoundOption {
  id: AlarmSoundId;
  name: string;
  emoji: string;
  description: string;
}

export const ALARM_SOUNDS: AlarmSoundOption[] = [
  { id: 'bell',    name: 'Classic Bell',   emoji: '🔔', description: 'Traditional alarm bell' },
  { id: 'chime',   name: 'Gentle Chime',   emoji: '🎵', description: 'Soft ascending tones' },
  { id: 'pulse',   name: 'Pulse',          emoji: '💓', description: 'Rhythmic heartbeat beeps' },
  { id: 'nature',  name: 'Nature Wake',    emoji: '🌿', description: 'Soft bird-like warbles' },
  { id: 'digital', name: 'Digital',        emoji: '📱', description: 'Electronic alert tones' },
];

// ─── Audio context (singleton) ────────────────────────────────────────────────
let _ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// ─── Low-level helpers ────────────────────────────────────────────────────────
function osc(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  startAt: number,
  duration: number,
  vol: number,
  gainNode: GainNode,
) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(gainNode);
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, startAt);
  g.gain.linearRampToValueAtTime(vol, startAt + 0.01);
  g.gain.setValueAtTime(vol, startAt + duration - 0.05);
  g.gain.linearRampToValueAtTime(0, startAt + duration);
  o.start(startAt);
  o.stop(startAt + duration);
}

// ─── Sound generators — each returns a stop() function ───────────────────────

function makeBell(masterGain: GainNode, ctx: AudioContext): () => void {
  // Repeating ding every 1.2s: fundamental + harmonics
  let running = true;
  function ring(startAt: number) {
    if (!running) return;
    const freqs = [880, 1760, 2640];
    freqs.forEach((f, i) => osc(ctx, f, 'sine', startAt, 0.6, 0.5 / (i + 1), masterGain));
    setTimeout(() => ring(ctx.currentTime), 1200);
  }
  ring(ctx.currentTime);
  return () => { running = false; };
}

function makeChime(masterGain: GainNode, ctx: AudioContext): () => void {
  // Ascending pentatonic arpeggio C5 D5 E5 G5 A5 repeating
  const notes = [523, 587, 659, 784, 880, 784, 659, 587];
  let running = true;
  let noteIdx = 0;
  function playNote() {
    if (!running) return;
    osc(ctx, notes[noteIdx % notes.length], 'sine', ctx.currentTime, 0.5, 0.6, masterGain);
    noteIdx++;
    setTimeout(playNote, 500);
  }
  playNote();
  return () => { running = false; };
}

function makePulse(masterGain: GainNode, ctx: AudioContext): () => void {
  // Double-beep pattern like a heart monitor
  let running = true;
  function beat(startAt: number) {
    if (!running) return;
    osc(ctx, 660, 'square', startAt,       0.12, 0.4, masterGain);
    osc(ctx, 660, 'square', startAt + 0.18, 0.12, 0.4, masterGain);
    setTimeout(() => beat(ctx.currentTime), 900);
  }
  beat(ctx.currentTime);
  return () => { running = false; };
}

function makeNature(masterGain: GainNode, ctx: AudioContext): () => void {
  // Warbling bird-like: frequency sweep on sine
  let running = true;
  function warble(startAt: number) {
    if (!running) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(masterGain);
    o.type = 'sine';
    o.frequency.setValueAtTime(800, startAt);
    o.frequency.linearRampToValueAtTime(1200, startAt + 0.15);
    o.frequency.linearRampToValueAtTime(900, startAt + 0.3);
    o.frequency.linearRampToValueAtTime(1100, startAt + 0.45);
    o.frequency.linearRampToValueAtTime(800, startAt + 0.6);
    g.gain.setValueAtTime(0, startAt);
    g.gain.linearRampToValueAtTime(0.5, startAt + 0.05);
    g.gain.setValueAtTime(0.5, startAt + 0.55);
    g.gain.linearRampToValueAtTime(0, startAt + 0.65);
    o.start(startAt);
    o.stop(startAt + 0.7);
    setTimeout(() => warble(ctx.currentTime), 1400);
  }
  warble(ctx.currentTime);
  return () => { running = false; };
}

function makeDigital(masterGain: GainNode, ctx: AudioContext): () => void {
  // Fast electronic chirp pattern
  let running = true;
  const pattern = [1200, 800, 1400, 600];
  let pi = 0;
  function chirp(startAt: number) {
    if (!running) return;
    osc(ctx, pattern[pi % pattern.length], 'sawtooth', startAt, 0.09, 0.3, masterGain);
    pi++;
    const gap = pi % 4 === 0 ? 700 : 130;
    setTimeout(() => chirp(ctx.currentTime), gap);
  }
  chirp(ctx.currentTime);
  return () => { running = false; };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface PlayingAlarm {
  stop: () => void;
  setVolume: (vol: number) => void; // 0–1
}

export function playAlarm(soundId: AlarmSoundId, volume: number): PlayingAlarm {
  const ctx = getCtx();
  const masterGain = ctx.createGain();
  masterGain.gain.value = volume;
  masterGain.connect(ctx.destination);

  // 3-minute auto-stop
  const autoStop = setTimeout(() => stop(), 3 * 60 * 1000);

  const generators: Record<AlarmSoundId, (g: GainNode, c: AudioContext) => () => void> = {
    bell:    makeBell,
    chime:   makeChime,
    pulse:   makePulse,
    nature:  makeNature,
    digital: makeDigital,
  };

  const stopGen = generators[soundId](masterGain, ctx);

  function stop() {
    clearTimeout(autoStop);
    stopGen();
    try {
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      setTimeout(() => masterGain.disconnect(), 400);
    } catch { /* already disconnected */ }
  }

  return {
    stop,
    setVolume: (vol: number) => {
      masterGain.gain.setValueAtTime(vol, ctx.currentTime);
    },
  };
}

// Preview a sound for 2 seconds (for settings picker)
export function previewAlarm(soundId: AlarmSoundId, volume: number) {
  const alarm = playAlarm(soundId, volume);
  setTimeout(() => alarm.stop(), 2000);
}

// ─── Alarm preference storage ─────────────────────────────────────────────────
const PREF_KEY = 'fwl_alarm_prefs';

export interface AlarmPrefs {
  soundId: AlarmSoundId;
  volume: number; // 0–1
}

export function getAlarmPrefs(): AlarmPrefs {
  if (typeof window === 'undefined') return { soundId: 'bell', volume: 0.7 };
  try {
    const stored = localStorage.getItem(PREF_KEY);
    return stored ? JSON.parse(stored) : { soundId: 'bell', volume: 0.7 };
  } catch { return { soundId: 'bell', volume: 0.7 }; }
}

export function saveAlarmPrefs(prefs: AlarmPrefs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}
