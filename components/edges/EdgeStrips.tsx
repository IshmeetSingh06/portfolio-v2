"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { play } from "@/lib/sound";
import { BookDoodle, CloudDoodle, CupDoodle, KeycapDoodle, OnigiriDoodle, SakuraDoodle, SparkleDoodle, type DoodleProps } from "@/components/art/doodles";

const TILE = 52; // px
const GAP = 8;
const SPEED = 0.35; // strip travel per px scrolled

function CursorMotif({ strokeW = 2.8, tint, ...props }: DoodleProps) {
  void tint;
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 13h48M8 13v38h48V13" strokeWidth={2.4} />
      <path d="M13 8.4h1M18 8.4h1M23 8.4h1" strokeWidth={3.4} />
      <path d="M26 22l18 9.6-7.6 2.4-3.4 7.6z" fill="currentColor" />
    </svg>
  );
}

function GateMotif({ strokeW = 2.8, tint, ...props }: DoodleProps) {
  void tint;
  // India Gate, roughly: an arch with a cornice and steps.
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 54V22h36v32M10 22h44M14 16h36v6M20 11h24v5" />
      <path d="M24 54V38c0-5 3.6-8.6 8-8.6s8 3.6 8 8.6v16" />
      <path d="M8 58h48" />
    </svg>
  );
}

function BeanMotif({ strokeW = 2.8, tint, ...props }: DoodleProps) {
  void tint;
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 22c0 15 2.4 26 8 31 4 3.4 18 3.4 22 0 5.6-5 8-16 8-31" />
      <path d="M13 22c6-6.6 32-6.6 38 0-6 6.6-32 6.6-38 0z" />
      <circle cx="26" cy="36" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="38" cy="36" r="2.2" fill="currentColor" stroke="none" />
      <path d="M27.4 42.4c2.6 2.8 6.6 2.8 9.2 0" />
      <path d="M26 12c-2.4-2.4 1.6-4 0-7M38 12c-2.4-2.4 1.6-4 0-7" strokeWidth={2.2} />
    </svg>
  );
}

type Motif = { Art: ComponentType<DoodleProps>; solid: boolean };

/** One repeat of the strip; solid tiles have the motif "cut out" in paper, outlined ones are printed in black ink. */
const SET: Motif[] = [
  { Art: CupDoodle, solid: true },
  { Art: SakuraDoodle, solid: false },
  { Art: CursorMotif, solid: true },
  { Art: KeycapDoodle, solid: true },
  { Art: BeanMotif, solid: false },
  { Art: GateMotif, solid: true },
  { Art: OnigiriDoodle, solid: true },
  { Art: SparkleDoodle, solid: false },
  { Art: BookDoodle, solid: true },
  { Art: CloudDoodle, solid: true },
];

const SET_H = SET.length * (TILE + GAP);
// Fixed per-tile wobble so the column looks hand-stamped (not random per render: SSR-safe).
const TILTS = [-2.4, 1.6, -0.8, 2.2, -1.6, 0.6, -2, 1.2, -0.4, 1.8];

function Tile({ motif, i }: { motif: Motif; i: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { Art, solid } = motif;
  const stamp = () => {
    play("thock");
    if (prefersReducedMotion() || !ref.current) return;
    gsap
      .timeline()
      .to(ref.current, { scale: 0.86, rotation: TILTS[i % TILTS.length] * -2, duration: 0.09, ease: "power2.in" })
      .to(ref.current, { scale: 1, rotation: TILTS[i % TILTS.length], duration: 0.6, ease: "elastic.out(1.2, 0.4)" });
  };
  return (
    <button
      ref={ref}
      type="button"
      tabIndex={-1}
      aria-hidden
      onPointerEnter={stamp}
      className={`stamp-tile ${solid ? "is-solid" : "is-outline"}`}
      style={{ width: TILE, height: TILE, rotate: `${TILTS[i % TILTS.length]}deg` }}
      data-cursor="default"
    >
      <Art className="h-[78%] w-[78%]" strokeW={solid ? 3 : 3.2} />
    </button>
  );
}

function Strip({ side }: { side: "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    // Left drifts down, right drifts up; three repeats so the loop never shows an edge.
    const dir = side === "left" ? 1 : -1;
    let last = -1;
    const tick = () => {
      const y = window.scrollY;
      if (y === last) return;
      last = y;
      const off = (y * SPEED) % SET_H;
      el.style.transform = `translate3d(0, ${dir === 1 ? off - SET_H : -off}px, 0)`;
    };
    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [side]);

  const tiles = [...SET, ...SET, ...SET, ...SET];
  // Offset the right strip's sequence so the two edges don't mirror each other.
  const order = side === "right" ? [...tiles.slice(5), ...tiles.slice(0, 5)] : tiles;
  return (
    <div className={`edge-strip ${side === "left" ? "left-0" : "right-0"}`} aria-hidden>
      <div ref={ref} className="flex flex-col items-center will-change-transform" style={{ gap: GAP, paddingTop: GAP }}>
        {order.map((m, i) => (
          <Tile key={i} motif={m} i={i + (side === "right" ? 3 : 0)} />
        ))}
      </div>
    </div>
  );
}

/** Block-print stamp columns down both edges of the page (after jackiezhang.co.za). */
export function EdgeStrips() {
  return (
    <>
      <Strip side="left" />
      <Strip side="right" />
    </>
  );
}
