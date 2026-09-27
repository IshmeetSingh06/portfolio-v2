"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

let lenis: Lenis | null = null;
/** The live Lenis instance (null before mount), e.g. for scrollTo or stop/start during the preloader. */
export const getLenis = () => lenis;

/** Lenis driven by gsap.ticker, so scroll, ScrollTrigger and every tween share one rAF clock. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.11,
      smoothWheel: !prefersReducedMotion(),
    });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis = instance;
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, []);

  return children;
}
