/**
 * useMorsePlayer Hook
 *
 * Encapsulates the playback state, volume control, and lifecycle for
 * morse code audio. Exposes:
 *   - `isPlaying` – whether audio is currently playing
 *   - `volume`    – current volume level (0 – 1)
 *   - `setVolume` – update volume (applies immediately, even mid-playback)
 *   - `toggle`    – start / stop playback
 */

import { useCallback, useRef, useState } from "react";
import { playMorseAudio, PlaybackController } from "../utils/audioPlayer";

const DEFAULT_VOLUME = 0.5;

export function useMorsePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);

  // Persist the active playback controller across renders
  const controllerRef = useRef<PlaybackController | null>(null);

  // Keep volume in a ref so the toggle callback always sees the latest value
  const volumeRef = useRef(DEFAULT_VOLUME);

  /**
   * Update volume. If audio is currently playing, the change is
   * forwarded to the active playback controller immediately.
   */
  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    volumeRef.current = clamped;
    setVolumeState(clamped);

    // Dynamically adjust live audio
    controllerRef.current?.setVolume(clamped);
  }, []);

  /**
   * Start playing morse audio, or stop if already playing.
   * @param morse - The morse code string to play.
   */
  const toggle = useCallback((morse: string) => {
    // If currently playing → stop
    if (controllerRef.current) {
      controllerRef.current.cancel();
      controllerRef.current = null;
      setIsPlaying(false);
      return;
    }

    // Start playback with the current volume
    setIsPlaying(true);
    controllerRef.current = playMorseAudio(morse, volumeRef.current, () => {
      controllerRef.current = null;
      setIsPlaying(false);
    });
  }, []);

  return { isPlaying, volume, setVolume, toggle };
}
