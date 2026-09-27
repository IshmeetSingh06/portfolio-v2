"use client";

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** How far the button leans toward the pointer (0–1). */
  strength?: number;
  tone?: "ink" | "tomato" | "butter" | "paper";
};

/**
 * Pill button that leans toward the pointer; its label leans further (parallax),
 * and it snaps back with a wobble. Pressing collapses the hard offset shadow.
 */
export function MagneticButton({ children, strength = 0.35, tone = "ink", className, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const label = labelRef.current;
    if (!el || !label || !hasFinePointer() || prefersReducedMotion()) return;

    // Plain overwriting tweens rather than quickTo: the elastic snap-back on leave
    // would kill cached quickTo tweens and the button would stop following.
    const follow = { duration: 0.5, ease: "power3.out", overwrite: "auto" } as const;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: dx * strength, y: dy * strength, ...follow });
      gsap.to(label, { x: dx * strength * 0.45, y: dy * strength * 0.45, ...follow });
    };
    const leave = () => {
      gsap.to([el, label], { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1.1, 0.35)", overwrite: "auto" });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  return (
    <button ref={ref} {...rest} className={`magnetic-btn tone-${tone} ${className ?? ""}`}>
      <span ref={labelRef} className="inline-flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
