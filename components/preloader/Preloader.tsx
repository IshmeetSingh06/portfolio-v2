"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { markIntroDone } from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/motion";
import { getLenis } from "@/components/providers/SmoothScroll";
import { LatteArt } from "@/components/preloader/LatteArt";

/**
 * Preloader (after moneyincheck.org): a latte being poured, centred on the grid paper, while
 * handwritten notes pop in and out around it. It plays until the page has loaded (and at least
 * MIN_MS), then fades away.
 */

const MIN_MS = 3000;
const FPS = 12; // drawn "on twos"
const NOTE_EVERY_MS = 260;
const NOTES = [
  "07:02", "coffee #1", "git pull", "oat milk", "⌘S", "npm run dev", "60fps", "brb", "ship it",
  "lgtm", "hmm…", "pour-over", "*thock*", "ctrl+z", "v2.0", "200ms", "espresso?", "wip ✦", "pour",
];

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const root = rootRef.current!;
    const notes = notesRef.current!;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    requestAnimationFrame(() => getLenis()?.stop());
    const started = performance.now();
    const reduced = prefersReducedMotion();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      html.style.overflow = "";
      window.scrollTo(0, 0);
      getLenis()?.start();
      gsap.to(root, {
        opacity: 0,
        duration: reduced ? 0.3 : 0.6,
        ease: "power2.inOut",
        onStart: () => markIntroDone(),
        onComplete: () => void (root.style.display = "none"),
      });
    };

    // Frame clock: steps at FPS, i.e. drawn "on twos".
    let acc = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      acc += now - last;
      last = now;
      const step = 1000 / FPS;
      if (acc >= step) {
        acc %= step;
        setFrame((f) => f + 1);
      }
    };
    if (!reduced) gsap.ticker.add(tick);

    // Handwritten notes popping in and out around the character.
    let noteTimer: ReturnType<typeof setInterval> | undefined;
    if (!reduced) {
      let n = Math.floor(Math.random() * NOTES.length);
      noteTimer = setInterval(() => {
        const el = document.createElement("span");
        el.textContent = NOTES[n++ % NOTES.length];
        const angle = Math.random() * Math.PI * 2;
        const rx = 150 + Math.random() * 90;
        const ry = 120 + Math.random() * 70;
        const faint = Math.random() < 0.3;
        el.className = "pl-note";
        el.style.left = `calc(50% + ${(Math.cos(angle) * rx).toFixed(0)}px)`;
        el.style.top = `calc(50% + ${(Math.sin(angle) * ry).toFixed(0)}px)`;
        el.style.rotate = `${((Math.random() - 0.5) * 14).toFixed(1)}deg`;
        notes.appendChild(el);
        gsap
          .timeline({ onComplete: () => el.remove() })
          .fromTo(el, { autoAlpha: 0, y: 4 }, { autoAlpha: faint ? 0.45 : 1, y: 0, duration: 0.18, ease: "steps(3)" })
          .to(el, { autoAlpha: 0, duration: 0.18, ease: "steps(3)" }, "+=1.1");
      }, NOTE_EVERY_MS);
    }

    Promise.all([
      document.fonts.ready,
      document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true })),
    ]).then(() => {
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      setTimeout(finish, reduced ? 200 : wait);
    });

    const skip = () => finish();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    return () => {
      gsap.ticker.remove(tick);
      clearInterval(noteTimer);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      html.style.overflow = "";
    };
  }, []);

  return (
    <div ref={rootRef} role="status" aria-label="Loading" className="preloader fixed inset-0 z-[90]" data-cursor="default">
      <div ref={notesRef} aria-hidden className="pointer-events-none absolute inset-0" />
      <div className="absolute left-1/2 top-1/2 h-[min(300px,40vh)] w-[min(300px,40vh)] -translate-x-1/2 -translate-y-1/2">
        <LatteArt frame={frame} />
      </div>
    </div>
  );
}
