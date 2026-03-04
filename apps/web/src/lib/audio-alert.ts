'use client';

/**
 * Web Audio API alert sound.
 * AudioContext is created lazily on first use to comply with browser autoplay policy
 * (browsers block AudioContext created before a user gesture — Pitfall 7).
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  return ctx;
}

function beep(context: AudioContext): void {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  // A5 (880Hz) — clear, pleasant notification tone
  oscillator.type = 'sine';
  oscillator.frequency.value = 880;

  // Short beep: ramp gain from 0.3 to near-zero over 0.5 seconds
  gainNode.gain.setValueAtTime(0.3, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.5);
}

/**
 * Play a short notification beep.
 * Handles suspended AudioContext (browser autoplay policy).
 */
export function playOrderAlert(): void {
  const context = getContext();
  if (context.state === 'suspended') {
    context.resume().then(() => beep(context)).catch(() => {
      // Silently ignore if audio cannot be resumed (e.g., user hasn't interacted yet)
    });
  } else {
    beep(context);
  }
}
