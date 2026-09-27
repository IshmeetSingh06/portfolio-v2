"use client";

import { gsap } from "@/lib/gsap";

const STROKES = "path, circle, line, ellipse, polyline, polygon, rect";

/**
 * "Re-ink" an SVG: strokes draw on one after another, then fills wash in.
 * Returns a paused-able timeline so callers can place it inside their own.
 */
export function inkIn(svg: Element, { duration = 0.5, stagger = 0.07, delay = 0 } = {}) {
  const strokes = svg.querySelectorAll(STROKES);
  const fills = svg.querySelectorAll<SVGElement>("[data-fill]");
  const tl = gsap.timeline({ delay });
  if (!strokes.length) return tl;
  if (fills.length) tl.set(fills, { fillOpacity: 0 });
  tl.fromTo(strokes, { drawSVG: "0%" }, { drawSVG: "100%", duration, stagger, ease: "power2.inOut" });
  if (fills.length) {
    tl.to(
      fills,
      {
        fillOpacity: (_i: number, el: Element) => Number(el.getAttribute("fill-opacity") ?? 1),
        duration: 0.35,
        stagger: 0.04,
        ease: "power1.out",
      },
      `-=${duration * 0.4}`,
    );
  }
  return tl;
}
