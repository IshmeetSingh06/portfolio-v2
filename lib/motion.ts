"use client";

import { useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED).matches;

export const hasFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const subscribeReduced = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/** Re-renders when the OS reduced-motion setting changes. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, prefersReducedMotion, () => false);
}
