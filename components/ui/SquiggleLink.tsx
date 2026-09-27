"use client";

import { useRef, type AnchorHTMLAttributes } from "react";
import { gsap } from "@/lib/gsap";

const HEIGHT = 10;

/** A wave sized in real pixels, so the stroke stays even and DrawSVG can measure it. */
function wave(width: number) {
  const step = 12;
  let d = `M0 ${HEIGHT / 2}`;
  for (let x = 0, i = 0; x < width; x += step, i++) {
    d += ` Q ${x + step / 2} ${i % 2 ? HEIGHT - 1 : 1} ${Math.min(x + step, width)} ${HEIGHT / 2}`;
  }
  return d;
}

/**
 * Link whose straight underline retracts while a squiggle inks in behind it.
 * On leave the squiggle carries on off the right edge and the line returns.
 */
export function SquiggleLink({ children, className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const enter = () => {
    const w = linkRef.current?.offsetWidth ?? 0;
    svgRef.current?.setAttribute("viewBox", `0 0 ${w} ${HEIGHT}`);
    pathRef.current?.setAttribute("d", wave(w));
    gsap.to(lineRef.current, { scaleX: 0, transformOrigin: "100% 50%", duration: 0.25, ease: "power2.in", overwrite: true });
    gsap.fromTo(pathRef.current, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.55, ease: "power3.out", overwrite: true });
  };
  const leave = () => {
    gsap.to(pathRef.current, { drawSVG: "100% 100%", duration: 0.35, ease: "power2.in", overwrite: true });
    gsap.fromTo(
      lineRef.current,
      { scaleX: 0, transformOrigin: "0% 50%" },
      { scaleX: 1, duration: 0.45, delay: 0.15, ease: "power3.out", overwrite: true },
    );
  };

  return (
    <a
      ref={linkRef}
      {...rest}
      className={`squiggle-link ${className ?? ""}`}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={enter}
      onBlur={leave}
    >
      {children}
      <span ref={lineRef} aria-hidden className="squiggle-line" />
      <svg ref={svgRef} aria-hidden className="squiggle-wave" viewBox={`0 0 100 ${HEIGHT}`}>
        <path ref={pathRef} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </a>
  );
}
