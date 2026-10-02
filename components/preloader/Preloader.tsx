"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { markIntroDone } from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/motion";
import { getLenis } from "@/components/providers/SmoothScroll";
import { SipDoodle } from "@/components/preloader/SipDoodle";

/**
 * Preloader (after moneyincheck.org): a small hand-drawn Ishmeet, centred on the grid paper,
 * sipping coffee on a short loop while handwritten notes pop in and out around him.
 * It plays until the page has loaded (and at least MIN_MS), then fades away.
 *
 * Art, in order of preference: a video named in /public/preloader/frames.json ("video": "loading.mp4",
 * a silent loop on white), then PNG frames from the same manifest (see PRELOADER_FRAMES.md), then the
 * SVG SipDoodle, which is what plays today.
 */

const MIN_MS = 3000;
const NOTE_EVERY_MS = 260;
const NOTES = [
  "07:02", "coffee #1", "git pull", "oat milk", "⌘S", "npm run dev", "60fps", "brb", "ship it",
  "lgtm", "hmm…", "pour-over", "*thock*", "ctrl+z", "v2.0", "200ms", "espresso?", "wip ✦", "sip",
];

type Manifest = { video?: string | null; count: number; fps?: number; pattern?: string; pad?: number };

function frameSrcs(m: Manifest) {
  const pattern = m.pattern ?? "sip-{n}.png";
  const pad = m.pad ?? 2;
  return Array.from({ length: m.count }, (_, i) => `/preloader/${pattern.replace("{n}", String(i).padStart(pad, "0"))}`);
}

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const fpsRef = useRef(12);
  const [srcs, setSrcs] = useState<string[] | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [frame, setFrame] = useState(0);

  // Drawn frames, if present: preload all of them first so the loop never flickers.
  useEffect(() => {
    let cancelled = false;
    fetch("/preloader/frames.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((m: Manifest | null) => {
        if (cancelled || !m) return;
        if (m.video) return void setVideo(`/preloader/${m.video}`);
        if (!m.count) return;
        const list = frameSrcs(m);
        Promise.all(list.map((src) => new Promise((res) => Object.assign(new Image(), { onload: res, onerror: res, src })))).then(() => {
          if (cancelled) return;
          fpsRef.current = m.fps ?? 12;
          setSrcs(list);
        });
      })
      .catch(() => {});
    return () => void (cancelled = true);
  }, []);

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

    // Frame clock: steps at the sequence's fps (12 by default, i.e. drawn "on twos").
    let acc = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      acc += now - last;
      last = now;
      const step = 1000 / fpsRef.current;
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
      <div className="absolute left-1/2 top-1/2 h-[min(300px,42vh)] w-[min(240px,34vh)] -translate-x-1/2 -translate-y-1/2">
        {video ? (
          // White background knocked out by multiply so it sits on the grid paper.
          <video
            src={video}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            onLoadedData={(e) => prefersReducedMotion() && e.currentTarget.pause()}
            className="h-full w-full object-contain mix-blend-multiply"
          />
        ) : srcs ? (
          // eslint-disable-next-line @next/next/no-img-element -- a plain frame swap; next/image would re-layout every frame
          <img src={srcs[frame % srcs.length]} alt="" className="h-full w-full object-contain" draggable={false} />
        ) : (
          <SipDoodle frame={frame} />
        )}
      </div>
    </div>
  );
}
