"use client";

import { useId, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { spring } from "@/lib/tokens";

type StickerProps = {
  children: ReactNode;
  /** White die-cut margin in px. */
  border?: number;
  /** Resting rotation in degrees. */
  rotate?: number;
  /** Pointer-tracked glossy highlight. */
  gloss?: boolean;
  /** Hover lift + press squash. Turn off when a parent (e.g. Draggable) owns the transform. */
  interactive?: boolean;
  className?: string;
  label?: string;
};

/**
 * Die-cut sticker. An SVG filter grows the art's alpha into a white border
 * (feMorphology), then lays a specular highlight on top whose light follows the pointer.
 * Works on any child — SVG art, an <img>, even text.
 */
export function Sticker({
  children,
  border = 5,
  rotate = 0,
  gloss = true,
  interactive = true,
  className,
  label,
}: StickerProps) {
  const id = `diecut-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const bodyRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<SVGFEPointLightElement>(null);

  const moveLight = (x: number, y: number, duration = 0.25) => {
    if (!lightRef.current) return;
    gsap.to(lightRef.current, { attr: { x, y }, duration, ease: "power2.out", overwrite: true });
  };

  const onMove = (e: React.PointerEvent) => {
    if (!gloss || !bodyRef.current) return;
    const r = bodyRef.current.getBoundingClientRect();
    // Rect is post-transform; close enough for a highlight.
    moveLight(e.clientX - r.left, e.clientY - r.top);
  };

  const onLeave = () => moveLight(-30, -40, 0.6);

  return (
    <motion.div
      className={`sticker ${className ?? ""}`}
      style={{ rotate, ["--lift" as string]: 0 }}
      whileHover={interactive ? { scale: 1.06, rotate: rotate + (rotate >= 0 ? 3 : -3), ["--lift" as string]: 1 } : undefined}
      whileTap={interactive ? { scale: 0.94, ["--lift" as string]: 0.2 } : undefined}
      transition={spring.pop}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius={border} result="grown" />
          <feFlood floodColor="#FFFDF8" />
          <feComposite in2="grown" operator="in" result="edge" />
          <feGaussianBlur in="grown" stdDeviation="4" result="height" />
          <feSpecularLighting
            in="height"
            surfaceScale="5"
            specularConstant="0.85"
            specularExponent="26"
            lightingColor="#ffffff"
            result="spec"
          >
            <fePointLight ref={lightRef} x={-30} y={-40} z={140} />
          </feSpecularLighting>
          <feComposite in="spec" in2="grown" operator="in" result="specIn" />
          <feColorMatrix
            in="specIn"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.38 0"
            result="shine"
          />
          <feMerge>
            <feMergeNode in="edge" />
            <feMergeNode in="SourceGraphic" />
            {gloss ? <feMergeNode in="shine" /> : null}
          </feMerge>
        </filter>
      </svg>
      <div ref={bodyRef} className="sticker-body" style={{ filter: `url(#${id})`, padding: border + 2 }}>
        {children}
      </div>
    </motion.div>
  );
}
