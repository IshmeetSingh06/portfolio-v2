"use client";

import { useSyncExternalStore } from "react";

/**
 * The coffee journey: five hidden things to find, one per stage of a cup. Found eggs persist in
 * localStorage; a tiny external store lets the toast and the footer share the same progress.
 */
export const EGGS = [
  { id: "coffee", stage: "bean", clue: "type what you came for" },
  { id: "thock", stage: "grind", clue: "type the sound of a good keyboard" },
  { id: "konami", stage: "brew", clue: "an old cheat code from a gamepad" },
  { id: "latte", stage: "pour", clue: "pour a fresh one: poke the latte" },
  { id: "undo", stage: "sip", clue: "the shortcut for regrets" },
] as const;

export type EggId = (typeof EGGS)[number]["id"];

const KEY = "ishfolio:eggs";
const EVENT = "ishfolio:egg";
const EMPTY: readonly EggId[] = [];
let found: readonly EggId[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(raw)) found = EGGS.map((e) => e.id).filter((id) => raw.includes(id));
  } catch {
    /* private mode etc.: progress just lasts for the visit */
  }
}

export function markFound(id: EggId) {
  load();
  if (found.includes(id)) return false;
  found = [...found, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(found));
  } catch {}
  listeners.forEach((l) => l());
  return true;
}

export const foundCount = () => (load(), found.length);

/** Fire an egg from anywhere in the app (the listener lives in <EasterEggs/>). */
export const triggerEgg = (id: EggId) => window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));
export const EGG_EVENT = EVENT;

export function useFoundEggs() {
  return useSyncExternalStore(
    (cb) => {
      load();
      listeners.add(cb);
      return () => void listeners.delete(cb);
    },
    () => {
      load();
      return found;
    },
    () => EMPTY,
  );
}
