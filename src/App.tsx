/**
 * App – Morse Code Translator
 *
 * A minimalistic, single-screen translator that converts plain text
 * to morse code in real time and can play it back as audio beeps.
 * Includes a dynamic volume slider that adjusts sound mid-playback.
 */

import { useState, useMemo } from "react";
import { textToMorse } from "./utils/morseCode";
import { useMorsePlayer } from "./hooks/useMorsePlayer";

/* ── Icon Components ── */

/** Speaker icon that visually reflects the current volume level. */
function SpeakerIcon({ volume }: { volume: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-gray-400 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Speaker body – always visible */}
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {/* Volume arcs – shown based on level */}
      {volume > 0 && (
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      )}
      {volume > 0.5 && (
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      )}
      {/* Mute slash */}
      {volume === 0 && <line x1="23" y1="9" x2="17" y2="15" />}
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <rect x="5" y="4" width="3" height="12" rx="1" />
      <rect x="12" y="4" width="3" height="12" rx="1" />
    </svg>
  );
}

/* ── Main App ── */

export default function App() {
  /* ── State ── */
  const [input, setInput] = useState("");
  const { isPlaying, volume, setVolume, toggle } = useMorsePlayer();

  /* ── Derived ── */
  const morseOutput = useMemo(() => textToMorse(input), [input]);
  const hasContent = morseOutput.length > 0;

  /* ── Handlers ── */
  const handlePlay = () => toggle(morseOutput);

  const handleClear = () => {
    setInput("");
    if (isPlaying) toggle(morseOutput); // stop playback on clear
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const volumePercent = Math.round(volume * 100);

  /* ── Render ── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
      {/* ── Card Container ── */}
      <div className="w-full max-w-2xl rounded-2xl bg-gray-900/70 border border-gray-800 shadow-2xl backdrop-blur-sm p-8 space-y-6">

        {/* ── Header ── */}
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Morse Code Translator
          </h1>
          <p className="text-sm text-gray-400">
            Type text below and hear it in morse code
          </p>
        </header>

        {/* ── Input Text Area ── */}
        <section>
          <label
            htmlFor="text-input"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2"
          >
            Plain Text
          </label>
          <textarea
            id="text-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hello World"
            rows={3}
            className="w-full resize-none rounded-xl bg-gray-800/60 border border-gray-700 
                       text-white placeholder-gray-600 px-4 py-3 text-base
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60
                       transition-all"
          />
        </section>

        {/* ── Morse Output Area ── */}
        <section>
          <label
            htmlFor="morse-output"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2"
          >
            Morse Code
          </label>
          <textarea
            id="morse-output"
            value={morseOutput}
            readOnly
            rows={3}
            placeholder=".... . .-.. .-.. --- / .-- --- .-. .-.. -.."
            className="w-full resize-none rounded-xl bg-gray-800/40 border border-gray-700 
                       text-indigo-300 font-mono placeholder-gray-600 px-4 py-3 text-base tracking-widest
                       focus:outline-none cursor-default selection:bg-indigo-500/30"
          />
        </section>

        {/* ── Volume Slider ── */}
        <section className="flex items-center gap-3 px-1">
          <SpeakerIcon volume={volume} />

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            className="flex-1 h-1.5 appearance-none rounded-full bg-gray-700 cursor-pointer
                       accent-indigo-500
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-indigo-400
                       [&::-webkit-slider-thumb]:shadow-md
                       [&::-webkit-slider-thumb]:shadow-indigo-500/30
                       [&::-webkit-slider-thumb]:hover:bg-indigo-300
                       [&::-webkit-slider-thumb]:transition-colors
                       [&::-moz-range-thumb]:h-4
                       [&::-moz-range-thumb]:w-4
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-indigo-400
                       [&::-moz-range-thumb]:border-0
                       [&::-moz-range-thumb]:shadow-md
                       [&::-moz-range-thumb]:shadow-indigo-500/30
                       [&::-moz-range-thumb]:hover:bg-indigo-300
                       [&::-moz-range-track]:bg-gray-700
                       [&::-moz-range-track]:rounded-full"
          />

          <span className="text-xs tabular-nums text-gray-400 w-8 text-right">
            {volumePercent}%
          </span>
        </section>

        {/* ── Action Buttons ── */}
        <div className="flex items-center gap-3">
          {/* Play / Stop Button */}
          <button
            onClick={handlePlay}
            disabled={!hasContent}
            className={`
              flex-1 flex items-center justify-center gap-2 rounded-xl px-6 py-3 
              text-sm font-semibold tracking-wide uppercase transition-all duration-200
              ${
                hasContent
                  ? isPlaying
                    ? "bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-indigo-500/90 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
              }
            `}
          >
            {isPlaying ? <StopIcon /> : <PlayIcon />}
            {isPlaying ? "Stop" : "Play Sound"}
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            disabled={!hasContent && !input}
            className={`
              rounded-xl px-5 py-3 text-sm font-semibold tracking-wide uppercase transition-all duration-200
              ${
                hasContent || input
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-800"
              }
            `}
          >
            Clear
          </button>
        </div>

        {/* ── Morse Legend (compact) ── */}
        <footer className="pt-2 border-t border-gray-800">
          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            <span className="text-gray-400 font-medium">·</span> = dot
            &nbsp;&nbsp;
            <span className="text-gray-400 font-medium">—</span> = dash
            &nbsp;&nbsp;
            <span className="text-gray-400 font-medium">/</span> = word
            separator
          </p>
        </footer>
      </div>
    </div>
  );
}
