"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";
import { colors } from "@/lib/tokens";

type CursorState = "default" | "pointer" | "view" | "drag" | "dragging" | "text" | "hide";

type Look = {
  w: number;
  h: number;
  radius: number;
  /** CSS colour; `var(--cursor-ink)` follows the surface (chalk on the desk, ink on paper). */
  bg: string;
  dot: number;
  label: string;
};

const FILL = "var(--cursor-ink)";
const CLEAR = "transparent";

const LOOKS: Record<CursorState, Look> = {
  default: { w: 22, h: 22, radius: 999, bg: CLEAR, dot: 1, label: "" },
  pointer: { w: 46, h: 46, radius: 999, bg: "rgba(245,212,107,0.5)", dot: 0, label: "" },
  view: { w: 84, h: 84, radius: 999, bg: FILL, dot: 0, label: "view" },
  // Stickers: keep the ring small so the hover curl stays visible; the label rides alongside as a tag.
  drag: { w: 34, h: 34, radius: 999, bg: "rgba(232,85,61,0.18)", dot: 1, label: "drag" },
  // Small outline ring so whatever you're holding (and its peel) stays visible; the label becomes a side tag.
  dragging: { w: 22, h: 22, radius: 999, bg: CLEAR, dot: 1, label: "wheee" },
  text: { w: 3, h: 30, radius: 2, bg: FILL, dot: 0, label: "" },
  hide: { w: 0, h: 0, radius: 999, bg: CLEAR, dot: 0, label: "" },
};

const INTERACTIVE = "[data-cursor], a, button, [role='button'], input, textarea, select, label";
const SPARK_COLORS = ["var(--cursor-ink)", "var(--cursor-ink)", colors.tomato, colors.butter, colors.matcha];

function resolveState(target: EventTarget | null): { state: CursorState; label?: string } {
  if (!(target instanceof Element)) return { state: "default" };
  const el = target.closest<HTMLElement>(INTERACTIVE);
  if (!el) return { state: "default" };
  const explicit = el.dataset.cursor as CursorState | undefined;
  if (explicit && explicit in LOOKS) return { state: explicit, label: el.dataset.cursorLabel };
  if (el.matches("input, textarea")) return { state: "text" };
  return { state: "pointer", label: el.dataset.cursorLabel };
}

/**
 * Ink cursor: an instant dot plus a lagging ring that stretches along its velocity.
 * Elements opt into states with `data-cursor="view|drag|text|hide"` and `data-cursor-label`.
 */
export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stretchRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const dotPosRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const sparkLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasFinePointer()) return;
    const root = rootRef.current!;
    const stretch = stretchRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    const dotPos = dotPosRef.current!;
    const dot = dotRef.current!;
    const sparkLayer = sparkLayerRef.current!;
    const reduced = prefersReducedMotion();

    document.documentElement.classList.add("has-custom-cursor");
    // Centre the label with GSAP's percent offsets (recomputed per frame, so they track
    // label width) rather than CSS `translate`, which GSAP bakes into fixed px on first tween.
    gsap.set(label, { xPercent: -50, yPercent: -50 });

    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    const press = { s: 1 };
    let current: CursorState = "default";
    let hoverState: CursorState = "default";
    let hoverLabel: string | undefined;
    let visible = false;

    const apply = (state: CursorState, customLabel?: string) => {
      const look = LOOKS[state];
      const text = customLabel ?? look.label;
      if (state === current && label.textContent === text) return;
      current = state;
      ring.style.backgroundColor = look.bg; // colour eases via CSS transition
      ring.style.borderColor = state === "hide" ? "transparent" : "";
      gsap.to(ring, {
        width: look.w,
        height: look.h,
        borderRadius: look.radius,
        duration: 0.42,
        ease: "elastic.out(1, 0.6)",
        overwrite: "auto",
      });
      gsap.to(dot, { scale: look.dot, duration: 0.2, ease: "power2.out", overwrite: "auto" });
      // overwrite: true — a delayed "show" from a state we only brushed past must not fire later.
      if (text) {
        label.textContent = text;
        gsap.fromTo(
          label,
          { opacity: 0, scale: 0.6, rotate: -12 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.35, delay: 0.05, ease: "back.out(2.5)", overwrite: true },
        );
      } else {
        gsap.to(label, { opacity: 0, scale: 0.6, duration: 0.12, overwrite: true });
      }
      // Dragging: label becomes a tag beside the cursor (added after, so the overwrite above can't kill it).
      const tag = state === "dragging" || state === "drag";
      label.classList.toggle("is-tag", tag);
      gsap.to(label, { x: tag ? 46 : 0, y: tag ? 30 : 0, duration: 0.3, ease: "back.out(2)" });
    };

    const show = (on: boolean) => {
      if (on === visible) return;
      visible = on;
      gsap.to([root, dotPos], { opacity: on ? 1 : 0, duration: 0.2, overwrite: true });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        ringPos.x = target.x;
        ringPos.y = target.y;
        show(true);
      }
      // Position lives on the wrapper; GSAP only ever scales the inner dot, so the two never fight.
      dotPos.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
    };

    // Ink on paper (the default); chalk over anything marked data-surface="dark".
    let onDark = false;
    const setSurface = (target: EventTarget | null) => {
      const dark = target instanceof Element && !!target.closest('[data-surface="dark"]');
      if (dark === onDark) return;
      onDark = dark;
      const s = document.documentElement.style;
      s.setProperty("--cursor-ink", dark ? colors.chalk : colors.ink);
      s.setProperty("--cursor-contrast", dark ? colors.desk : colors.paper);
    };

    const onOver = (e: PointerEvent) => {
      setSurface(e.target);
      const { state, label: l } = resolveState(e.target);
      hoverState = state;
      hoverLabel = l;
      if (current !== "dragging") apply(state, l);
    };

    const spark = (x: number, y: number) => {
      if (reduced) return;
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("width", "80");
      svg.setAttribute("height", "80");
      svg.setAttribute("viewBox", "-40 -40 80 80");
      svg.style.cssText = `position:absolute;left:${x - 40}px;top:${y - 40}px;overflow:visible;`;
      const count = 7;
      const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
      const offset = Math.random() * Math.PI;
      const lines: SVGLineElement[] = [];
      for (let i = 0; i < count; i++) {
        const a = offset + (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        const r0 = 9 + Math.random() * 3;
        const r1 = r0 + 8 + Math.random() * 9;
        const line = document.createElementNS(ns, "line");
        line.setAttribute("x1", String(Math.cos(a) * r0));
        line.setAttribute("y1", String(Math.sin(a) * r0));
        line.setAttribute("x2", String(Math.cos(a) * r1));
        line.setAttribute("y2", String(Math.sin(a) * r1));
        line.style.stroke = color; // style, not attribute: presentation attributes can't resolve var()
        line.setAttribute("stroke-width", "2.4");
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
        lines.push(line);
      }
      sparkLayer.appendChild(svg);
      gsap
        .timeline({ onComplete: () => svg.remove() })
        .fromTo(lines, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.18, ease: "power2.out" })
        .to(lines, { drawSVG: "100% 100%", duration: 0.26, ease: "power2.in" }, 0.14);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      gsap.to(press, { s: 0.78, duration: 0.12, ease: "power2.out", overwrite: true });
      if (hoverState === "drag") apply("dragging");
      spark(e.clientX, e.clientY);
    };
    const onUp = () => {
      gsap.to(press, { s: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)", overwrite: true });
      if (current === "dragging") apply(hoverState, hoverLabel);
    };
    const onLeaveWindow = (e: MouseEvent) => {
      if (!e.relatedTarget) show(false);
    };
    const onBlur = () => show(false);

    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = 1 - Math.exp(-dt * 22);
      const dx = target.x - ringPos.x;
      const dy = target.y - ringPos.y;
      ringPos.x += dx * k;
      ringPos.y += dy * k;
      root.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      // Stretch along the direction of travel; the gap to the target stands in for velocity.
      const speed = Math.hypot(dx, dy);
      const s = reduced || current === "text" ? 0 : Math.min(speed / 140, 0.35);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      stretch.style.transform = `rotate(${angle}deg) scale(${(1 + s) * press.s}, ${(1 - s * 0.6) * press.s})`;
    };

    gsap.ticker.add(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseout", onLeaveWindow);
    window.addEventListener("blur", onBlur);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseout", onLeaveWindow);
      window.removeEventListener("blur", onBlur);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div aria-hidden className="cursor-layer">
      <div ref={sparkLayerRef} className="fixed inset-0 pointer-events-none" />
      <div ref={rootRef} className="cursor-root" style={{ opacity: 0 }}>
        <div ref={stretchRef} className="cursor-stretch">
          <div ref={ringRef} className="cursor-ring" style={{ width: 22, height: 22 }} />
        </div>
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotPosRef} className="cursor-dot-pos" style={{ opacity: 0 }}>
        <div ref={dotRef} className="cursor-dot" />
      </div>
    </div>
  );
}
