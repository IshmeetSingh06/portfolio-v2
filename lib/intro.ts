"use client";

/**
 * One-shot signal for "the preloader has lifted". Entrance animations wait on it so they
 * play when they can actually be seen, not behind the curtain.
 */
let resolve!: () => void;
const done = new Promise<void>((r) => (resolve = r));
let finished = false;

export const whenIntroDone = () => done;
export const isIntroDone = () => finished;

export function markIntroDone() {
  if (finished) return;
  finished = true;
  resolve();
}
