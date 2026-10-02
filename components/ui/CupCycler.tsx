"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { inkIn } from "@/lib/ink";
import { prefersReducedMotion } from "@/lib/motion";
import { play } from "@/lib/sound";
import { CUP_OPTIONS } from "@/components/art/cups";
import { Popover } from "@/components/ui/Popover";

type Props = { className?: string; start?: number };

/**
 * Inline cup that swaps to the next member of the cup family on every hover:
 * shrinks and spins out, the new cup pops in with a slight overshoot and re-inks.
 */
export function CupCycler({ className, start = 0 }: Props) {
  const [index, setIndex] = useState(start);
  const ref = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);
  const { Cup, tint, name } = CUP_OPTIONS[index];

  const next = () => {
    const el = ref.current;
    if (!el || busy.current) return;
    const advance = () => setIndex((i) => (i + 1) % CUP_OPTIONS.length);
    if (prefersReducedMotion()) return advance();
    busy.current = true;
    play("pop");
    gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .to(el, { scale: 0, rotation: 90, duration: 0.16, ease: "power2.in" })
      .add(() => {
        advance();
        // New cup is in the DOM on the next frame; re-ink it as it lands.
        requestAnimationFrame(() => {
          const svg = el.querySelector("svg");
          if (svg) inkIn(svg, { duration: 0.35, stagger: 0.03 });
        });
      })
      .fromTo(el, { rotation: -60 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.6)" });
  };

  return (
    <Popover content={name.toLowerCase()}>
      <span
        ref={ref}
        tabIndex={0}
        data-cursor="pointer"
        onPointerEnter={next}
        onFocus={next}
        role="img"
        aria-label={`coffee: ${name}`}
        className={`ink-boil inline-block align-[-0.1em] ${className ?? "h-[0.9em] w-[0.9em]"}`}
      >
        <Cup tint={tint} className="h-full w-full text-ink" />
      </span>
    </Popover>
  );
}
