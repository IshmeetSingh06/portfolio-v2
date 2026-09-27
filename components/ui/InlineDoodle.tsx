"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { inkIn } from "@/lib/ink";
import { prefersReducedMotion } from "@/lib/motion";
import { DOODLES, type DoodleName } from "@/components/art/doodles";
import { Popover } from "@/components/ui/Popover";

type Props = {
  name: DoodleName;
  tint?: string;
  /** Sticker-popover content shown on hover. */
  note?: ReactNode;
  className?: string;
};

/**
 * A doodle that sits inside a line of text (like the chessboard reference).
 * Boils while idle; on hover it wiggles, re-inks itself and pops a note.
 */
export function InlineDoodle({ name, tint, note, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const Doodle = DOODLES[name];

  const wiggle = () => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || gsap.isTweening(el)) return;
    gsap.fromTo(
      el,
      { rotation: 0, scale: 1 },
      {
        keyframes: [
          { rotation: -14, scale: 1.18, duration: 0.12 },
          { rotation: 10, duration: 0.12 },
          { rotation: -6, duration: 0.12 },
          { rotation: 0, scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" },
        ],
        ease: "power2.inOut",
      },
    );
    const svg = el.querySelector("svg");
    if (svg) inkIn(svg, { duration: 0.35, stagger: 0.05 });
  };

  const chip = (
    <span
      ref={ref}
      tabIndex={note ? 0 : -1}
      data-cursor="pointer"
      onPointerEnter={wiggle}
      onFocus={wiggle}
      className={`inline-doodle ink-boil inline-block align-[-0.1em] ${className ?? "h-[0.9em] w-[0.9em]"}`}
    >
      <Doodle tint={tint} className="h-full w-full" aria-hidden />
    </span>
  );

  return note ? <Popover content={note}>{chip}</Popover> : chip;
}
