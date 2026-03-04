/**
 * Morse Code Audio Player
 *
 * Uses the Web Audio API to schedule precise tones for dots, dashes,
 * and the correct silences between them.
 *
 * All oscillators route through a shared master GainNode so that
 * volume can be adjusted dynamically — even mid-playback.
 */

import { parseMorseToSymbols } from "./morseCode";

/* ── Timing constants (in seconds) ── */
const DOT_DURATION = 0.08; // Length of a dot tone
const DASH_DURATION = DOT_DURATION * 3; // Length of a dash tone
const INTRA_CHAR_GAP = DOT_DURATION; // Silence between dots/dashes in a letter
const CHAR_GAP = DOT_DURATION * 3; // Silence between letters
const WORD_GAP = DOT_DURATION * 7; // Silence between words

const TONE_FREQ = 600; // Hz – a pleasant mid-range beep

/* ── Playback controller returned to the caller ── */
export interface PlaybackController {
  /** Stops playback immediately and releases resources. */
  cancel: () => void;
  /** Dynamically adjusts volume (0 – 1) while audio is playing. */
  setVolume: (v: number) => void;
}

/**
 * Plays a morse code string as audio.
 *
 * @param morse       - A morse code string (e.g. ".... . .-.. .-.. ---").
 * @param volume      - Initial volume level (0 – 1).
 * @param onComplete  - Optional callback fired when playback finishes.
 * @returns A {@link PlaybackController} with `cancel` and `setVolume`.
 */
export function playMorseAudio(
  morse: string,
  volume: number = 0.5,
  onComplete?: () => void
): PlaybackController {
  // Parse the morse string into a sequence of playable symbols
  const symbols = parseMorseToSymbols(morse);

  // Edge case: nothing to play
  if (symbols.length === 0) {
    onComplete?.();
    return { cancel: () => {}, setVolume: () => {} };
  }

  /* ── Audio graph setup ── */
  const ctx = new AudioContext();

  // Master volume node – every oscillator connects here.
  // Adjusting this single node changes overall volume in real time.
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(clamp(volume), ctx.currentTime);
  masterGain.connect(ctx.destination);

  /* ── Schedule each symbol ── */
  let currentTime = ctx.currentTime + 0.05; // small initial offset

  symbols.forEach((sym) => {
    if (sym === "." || sym === "-") {
      const duration = sym === "." ? DOT_DURATION : DASH_DURATION;

      const oscillator = ctx.createOscillator();
      const noteGain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = TONE_FREQ;

      // Smooth fade-in / fade-out per note to avoid audible clicks
      noteGain.gain.setValueAtTime(0, currentTime);
      noteGain.gain.linearRampToValueAtTime(1, currentTime + 0.005);
      noteGain.gain.setValueAtTime(1, currentTime + duration - 0.005);
      noteGain.gain.linearRampToValueAtTime(0, currentTime + duration);

      // Route: oscillator → per-note gain → master gain → destination
      oscillator.connect(noteGain).connect(masterGain);
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);

      currentTime += duration + INTRA_CHAR_GAP;
    } else if (sym === "cs") {
      // Character space (subtract the intra-char gap already added)
      currentTime += CHAR_GAP - INTRA_CHAR_GAP;
    } else if (sym === "ws") {
      currentTime += WORD_GAP - INTRA_CHAR_GAP;
    }
  });

  /* ── Completion timer ── */
  const totalDuration = (currentTime - ctx.currentTime) * 1000;
  const timeout = setTimeout(() => {
    ctx.close();
    onComplete?.();
  }, totalDuration + 100);

  /* ── Return playback controller ── */
  return {
    cancel: () => {
      clearTimeout(timeout);
      ctx.close();
      onComplete?.();
    },
    setVolume: (v: number) => {
      // Smoothly ramp to the new volume to avoid pops
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(clamp(v), ctx.currentTime + 0.04);
    },
  };
}

/** Clamp a number between 0 and 1. */
function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}
