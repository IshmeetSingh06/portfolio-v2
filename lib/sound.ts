"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny synthesized sound kit (Web Audio, no files). Off by default; the choice is
 * remembered. Browsers only allow audio after a user gesture, so the context is created
 * lazily on the first pointerdown/keydown once sound is enabled.
 */

export type SoundName = "tick" | "pop" | "peel" | "slap" | "thock" | "boing" | "gulp" | "whoosh" | "thud" | "toggle";

const STORAGE_KEY = "ishfolio:sound";
let enabled = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
const listeners = new Set<() => void>();

try {
  enabled = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "on";
} catch {
  enabled = false;
}

function ensureContext() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

if (typeof window !== "undefined") {
  const unlock = () => {
    if (enabled) ensureContext();
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
}

const emit = () => listeners.forEach((l) => l());

export function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* storage can be unavailable (private mode); the toggle still works for this visit */
  }
  if (on) ensureContext();
  emit();
}

export const isSoundEnabled = () => enabled;

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useSoundEnabled() {
  return useSyncExternalStore(subscribe, isSoundEnabled, () => false);
}

// ---------- voices

function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(c: AudioContext, type: OscillatorType, f0: number, f1: number, dur: number, peak: number, when = 0) {
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
  env(g, t, peak, 0.005, dur);
  o.connect(g).connect(master!);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(c: AudioContext, filter: BiquadFilterType, f0: number, f1: number, dur: number, peak: number, q = 1, when = 0) {
  const t = c.currentTime + when;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
  const bq = c.createBiquadFilter();
  bq.type = filter;
  bq.Q.value = q;
  bq.frequency.setValueAtTime(f0, t);
  bq.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
  const g = c.createGain();
  env(g, t, peak, 0.003, dur);
  src.connect(bq).connect(g).connect(master!);
  src.start(t);
  src.stop(t + dur + 0.05);
}

/** Small random detune so repeated sounds don't feel machine-gunned. */
const vary = (f: number) => f * (0.94 + Math.random() * 0.12);

let lastPlayed: Partial<Record<SoundName, number>> = {};

export function play(name: SoundName) {
  if (!enabled) return;
  const c = ensureContext();
  if (!c || !master) return;
  // Rate-limit identical sounds (e.g. ticks while sweeping across links).
  const now = performance.now();
  if (now - (lastPlayed[name] ?? 0) < 45) return;
  lastPlayed = { ...lastPlayed, [name]: now };

  switch (name) {
    case "tick":
      noise(c, "bandpass", vary(3200), 2600, 0.025, 0.12, 4);
      break;
    case "toggle":
      noise(c, "bandpass", 2600, 2200, 0.02, 0.14, 5);
      noise(c, "bandpass", 3400, 3000, 0.02, 0.12, 5, 0.06);
      break;
    case "pop":
      tone(c, "sine", vary(520), vary(1100), 0.09, 0.16);
      break;
    case "peel":
      noise(c, "bandpass", 1800, 5200, 0.16, 0.08, 1.2);
      break;
    case "slap":
      noise(c, "lowpass", 1600, 300, 0.07, 0.3);
      tone(c, "sine", vary(140), 70, 0.08, 0.2);
      break;
    case "thock":
      tone(c, "sine", vary(190), 90, 0.07, 0.22);
      noise(c, "highpass", 2400, 2000, 0.02, 0.08);
      break;
    case "boing":
      tone(c, "triangle", vary(260), vary(620), 0.22, 0.14);
      tone(c, "sine", vary(620), 330, 0.2, 0.08, 0.12);
      break;
    case "gulp":
      tone(c, "sine", vary(420), 140, 0.2, 0.2);
      break;
    case "whoosh":
      noise(c, "bandpass", 380, 2400, 0.45, 0.1, 0.8);
      break;
    case "thud":
      tone(c, "sine", vary(110), 55, 0.1, 0.22);
      break;
  }
}
