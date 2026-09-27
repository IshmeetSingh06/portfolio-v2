"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { spring } from "@/lib/tokens";

type PopoverProps = {
  children: ReactNode;
  content: ReactNode;
  /** Tilt of the open card, degrees. */
  tilt?: number;
  side?: "top" | "bottom";
  /** Controlled open state (e.g. "copied!" flashes). Hover/focus still work when omitted. */
  open?: boolean;
  className?: string;
};

const OPEN_DELAY = 70;
const CLOSE_DELAY = 120;

/**
 * Sticker popover: a small paper card that pops out of its trigger on a spring,
 * with a hand-drawn tail. Opens on hover and keyboard focus.
 */
export function Popover({ children, content, tilt = -4, side = "top", open, className }: PopoverProps) {
  const [hovered, setHovered] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();
  const isOpen = open ?? hovered;

  const set = (next: boolean) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setHovered(next), next ? OPEN_DELAY : CLOSE_DELAY);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const top = side === "top";

  return (
    <span
      className={`relative inline-block ${className ?? ""}`}
      onPointerEnter={() => set(true)}
      onPointerLeave={() => set(false)}
      onFocus={() => set(true)}
      onBlur={() => set(false)}
      aria-describedby={isOpen ? id : undefined}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.span
            id={id}
            role="tooltip"
            data-side={side}
            className={`popover-card ${top ? "bottom-full mb-3.5" : "top-full mt-3.5"}`}
            style={{ transformOrigin: top ? "50% 100%" : "50% 0%", x: "-50%" }}
            initial={{ opacity: 0, scale: 0.35, rotate: tilt * 3, y: top ? 12 : -12 }}
            animate={{ opacity: 1, scale: 1, rotate: tilt, y: 0, transition: spring.pop }}
            exit={{ opacity: 0, scale: 0.7, y: top ? 6 : -6, transition: { duration: 0.12, ease: "easeIn" } }}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
