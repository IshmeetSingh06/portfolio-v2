"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { play } from "@/lib/sound";
import { EGG_EVENT, EGGS, foundCount, markFound, type EggId } from "@/lib/eggs";
import { profile } from "@/content/profile";
import { CupDoodle, DOODLES, KeycapDoodle, SparkleDoodle, type DoodleProps } from "@/components/art/doodles";
import { EspressoBeans } from "@/components/art/ingredients";
import { Journey } from "@/components/eggs/Journey";

type Drop = { id: number; Art: ComponentType<DoodleProps>; x: number; size: number; dur: number; delay: number; drift: number; rot: number };
type Toast = { id: number; text: string; egg?: EggId; link?: { href: string; label: string } };

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const ALL_DOODLES = Object.values(DOODLES) as ComponentType<DoodleProps>[];
const TYPED: { word: string; id: EggId }[] = [
  { word: "coffee", id: "coffee" },
  { word: "thock", id: "thock" },
];

let dropId = 0;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function makeDrops(arts: ComponentType<DoodleProps>[], count: number): Drop[] {
  return Array.from({ length: count }, () => ({
    id: dropId++,
    Art: arts[Math.floor(Math.random() * arts.length)],
    x: rand(2, 96),
    size: rand(34, 64),
    dur: rand(2.2, 3.8),
    delay: rand(0, 1.1),
    drift: rand(-90, 90),
    rot: rand(-420, 420),
  }));
}

/**
 * Hidden things, one per stage of a cup of coffee (see lib/eggs.ts). Type "coffee" or "thock",
 * enter the Konami code, press ⌘/Ctrl+Z, or poke the latte on the About card a few times.
 */
export function EasterEggs() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dropTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const say = useCallback((t: Omit<Toast, "id">, ms = 3600) => {
    setToast({ id: Date.now(), ...t });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  const rain = useCallback((arts: ComponentType<DoodleProps>[], count: number) => {
    if (prefersReducedMotion()) return;
    setDrops(makeDrops(arts, count));
    clearTimeout(dropTimer.current);
    dropTimer.current = setTimeout(() => setDrops([]), 5200);
  }, []);

  const fire = useCallback(
    (id: EggId) => {
      const first = markFound(id);
      switch (id) {
        case "coffee":
          play("pop");
          rain([EspressoBeans as ComponentType<DoodleProps>], 30);
          say({ text: "one pour-over, coming right up ☕", egg: id });
          break;
        case "thock":
          [0, 110, 220, 340, 470].forEach((ms) => setTimeout(() => play("thock"), ms));
          rain([KeycapDoodle], 24);
          say({ text: "*thock thock thock*", egg: id });
          break;
        case "konami":
          play("boing");
          rain(ALL_DOODLES, 40);
          say({ text: "+30 lives. nothing changed, still ship it ✦", egg: id });
          break;
        case "latte":
          play("pop");
          rain([SparkleDoodle], 16);
          say({ text: "fresh pour ☕ rosetta, no spills", egg: id });
          break;
        case "undo":
          play("gulp");
          say({ text: "ctrl+z? no undo in production.", egg: id });
          break;
      }
      // The last stage pays out once the whole journey is found.
      if (first && foundCount() === EGGS.length) {
        setTimeout(() => {
          rain([CupDoodle], 26);
          say({ text: "journey complete: the first cup's on me ☕", link: { href: `mailto:${profile.email}`, label: "say hi ↗" } }, 9000);
        }, 3000);
      }
    },
    [rain, say],
  );

  useEffect(() => {
    let typed = "";
    let konami = 0;

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName))) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") return void fire("undo");
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      konami = k === KONAMI[konami] ? konami + 1 : k === KONAMI[0] ? 1 : 0;
      if (konami === KONAMI.length) {
        konami = 0;
        fire("konami");
      }

      if (e.key.length === 1) {
        typed = (typed + k).slice(-12);
        const hit = TYPED.find((t) => typed.endsWith(t.word));
        if (hit) {
          typed = "";
          fire(hit.id);
        }
      }
    };
    const onEgg = (e: Event) => fire((e as CustomEvent<EggId>).detail);

    window.addEventListener("keydown", onKey);
    window.addEventListener(EGG_EVENT, onEgg);
    console.log(
      "%c☕ psst%c  there are %d hidden things on this page. Try typing what you came for.",
      "font: 700 14px/1.6 ui-serif, Georgia; color:#b3301b",
      "font: 13px/1.6 ui-sans-serif, system-ui",
      EGGS.length,
    );
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(EGG_EVENT, onEgg);
      clearTimeout(toastTimer.current);
      clearTimeout(dropTimer.current);
    };
  }, [fire]);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
        {drops.map(({ id, Art, x, size, dur, delay, drift, rot }) => (
          <span
            key={id}
            className="egg-drop absolute top-0"
            style={{ left: `${x}%`, width: size, height: size, ["--dur" as string]: `${dur}s`, ["--delay" as string]: `${delay}s`, ["--dx" as string]: `${drift}px`, ["--rot" as string]: `${rot}deg` }}
          >
            <Art className="h-full w-full text-ink" tint="#F5D46B" />
          </span>
        ))}
      </div>

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[75] flex justify-center px-4">
        {toast && (
          <div key={toast.id} className="egg-toast pointer-events-auto flex max-w-[92vw] flex-col items-center gap-2 rounded-sm border-2 border-ink bg-sticker px-5 py-3 shadow-[5px_5px_0_var(--color-ink)]">
            <p className="text-center font-hand text-2xl leading-tight">{toast.text}</p>
            <Journey />
            {toast.link && (
              <a href={toast.link.href} className="font-hand text-2xl text-tomato-deep underline decoration-wavy underline-offset-4" data-cursor="pointer">
                {toast.link.label}
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}
