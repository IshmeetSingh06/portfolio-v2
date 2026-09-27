"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  text: string;
  center?: ReactNode;
  size?: number;
  color?: string;
  className?: string;
};

/** Circular text badge that idles slowly, spins up on hover and coasts back down. */
export function RotatingBadge({ text, center, size = 140, color = "#F5D46B", className }: Props) {
  const ringRef = useRef<SVGGElement>(null);
  const tweenRef = useRef<gsap.core.Tween>(null);
  const pathId = `badge-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    tweenRef.current = gsap.to(ringRef.current, {
      rotation: 360,
      svgOrigin: "50 50",
      duration: 18,
      ease: "none",
      repeat: -1,
    });
    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  const speed = (to: number) => {
    if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: to, duration: to > 1 ? 0.4 : 1.4, ease: "power2.out" });
  };

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      onPointerEnter={() => speed(6)}
      onPointerLeave={() => speed(1)}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={text}>
        <defs>
          <path id={pathId} d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0" />
        </defs>
        <circle cx="50" cy="50" r="48" fill={color} stroke="#1A1714" strokeWidth="1.6" />
        <circle cx="50" cy="50" r="27" fill="none" stroke="#1A1714" strokeWidth="1.2" strokeDasharray="2 3" />
        <g ref={ringRef}>
          <text fontSize="7.6" fontWeight="600" letterSpacing="1.15" fill="#1A1714" style={{ textTransform: "uppercase" }}>
            <textPath href={`#${pathId}`}>{text}</textPath>
          </text>
        </g>
        <foreignObject x="28" y="28" width="44" height="44">
          <div className="flex h-full w-full items-center justify-center">{center}</div>
        </foreignObject>
      </svg>
    </div>
  );
}
