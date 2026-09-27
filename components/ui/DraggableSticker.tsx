"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, Draggable, InertiaPlugin } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { Sticker } from "@/components/ui/Sticker";
import { BEAN_TARGET, emitBean, type Ingredient, type Interest } from "@/components/mascot/beanBus";

type Pt = [number, number];

/**
 * Sticker outline used to place the peel: "round" (inscribed ellipse), "rect", or a convex
 * hull in 0–1 box coordinates (e.g. a triangle). The top-left fold is measured from it, so
 * every shape lifts real sticker, never an empty box corner.
 */
export type StickerShape = "round" | "rect" | Pt[];

type Props = {
  children: ReactNode;
  label: string;
  /** Resting rotation, degrees. */
  rotate?: number;
  /** Positioning classes for the anchor (absolute placement, visibility per breakpoint). */
  className?: string;
  /** Scroll parallax depth; the parent reads `data-depth`. */
  depth?: number;
  border?: number;
  shape?: StickerShape;
  /** Makes this sticker an ingredient: dropping it on Bean feeds it. */
  feeds?: Ingredient;
};

const NUDGE = 28;
const EDGE = 8; // px kept clear of the viewport edge
const RESTITUTION = 0.55; // bounce energy kept off a viewport edge
const FRICTION = 3.4; // per second, exponential
const CLOSE_PX = 260; // "is that for me?" radius around Bean
/** The peel always lifts the top-left: fold normal points up-left. */
const PEEL_DIR: Pt = [-Math.SQRT1_2, -Math.SQRT1_2];
/** How much of the lifted flap's length stays visible: < 1 reads as standing up off the page. */
const FORESHORTEN = 0.6;

/** Keep the part of `poly` where n·p <= k (or >= k when `beyond`). One Sutherland–Hodgman pass. */
function clipHalf(poly: Pt[], n: Pt, k: number, beyond: boolean): Pt[] {
  const side = (p: Pt) => (n[0] * p[0] + n[1] * p[1] - k) * (beyond ? -1 : 1);
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const sa = side(a);
    const sb = side(b);
    if (sa <= 0) out.push(a);
    if (sa <= 0 !== sb <= 0) {
      const t = sa / (sa - sb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

const toPolygon = (pts: Pt[]) =>
  pts.length < 3 ? "polygon(0 0)" : `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;

/** Extent of the sticker outline along n, as [min, max] projections from the box centre. */
function extent(shape: StickerShape, W: number, H: number, n: Pt): [number, number] {
  const INSET = 3; // die-cut edge sits a few px inside the box
  if (shape === "round") {
    const r = Math.hypot((W / 2 - INSET) * n[0], (H / 2 - INSET) * n[1]);
    return [-r, r];
  }
  const hull: Pt[] =
    shape === "rect"
      ? [[INSET + 4, INSET + 4], [W - INSET - 4, INSET + 4], [W - INSET - 4, H - INSET - 4], [INSET + 4, H - INSET - 4]]
      : shape.map(([x, y]) => [x * W, y * H]);
  const proj = hull.map(([x, y]) => n[0] * (x - W / 2) + n[1] * (y - H / 2));
  return [Math.min(...proj), Math.max(...proj)];
}

/**
 * Top-left peel. `depth` is the fraction of the sticker's own extent (in the peel direction)
 * that lifts, so a triangle peels as proportionally as a circle. The cut-off part is
 * reflected across the fold and squashed toward it (foreshortened), showing the backing.
 */
function peelGeometry(W: number, H: number, shape: StickerShape, depth: number) {
  const n = PEEL_DIR;
  const [lo, hi] = extent(shape, W, H, n);
  const L = n[0] * (W / 2) + n[1] * (H / 2) + hi - depth * (hi - lo);
  const box: Pt[] = [[0, 0], [W, 0], [W, H], [0, H]];
  // x' = x − (1+f)(n·x − L)·n : a point d beyond the fold lands f·d inside it.
  const k = 1 + FORESHORTEN;
  const fold = ([x, y]: Pt): Pt => {
    const d = k * (n[0] * x + n[1] * y - L);
    return [x - d * n[0], y - d * n[1]];
  };
  const [nx, ny] = n;
  return {
    main: toPolygon(clipHalf(box, n, L, false)),
    flap: toPolygon(clipHalf(box, n, L, true).map(fold)),
    matrix: `matrix(${1 - k * nx * nx},${-k * nx * ny},${-k * nx * ny},${1 - k * ny * ny},${k * L * nx},${k * L * ny})`,
  };
}

/** Draggable bounds (in x/y transform space) that keep `el` inside the viewport. */
function viewportBounds(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const x = gsap.getProperty(el, "x") as number;
  const y = gsap.getProperty(el, "y") as number;
  return {
    minX: x - r.left + EDGE,
    maxX: x + (window.innerWidth - r.right) - EDGE,
    minY: y - r.top + EDGE,
    maxY: y + (window.innerHeight - r.bottom) - EDGE,
  };
}

/**
 * A sticker you can pick up and throw. It stays inside the viewport and bounces off its
 * edges; its top-left corner curls up while you hold it.
 * Layers: anchor (placement + parallax) → drag (x/y) → tilt (lean, lift/slap) → main (clipped) + flap (backing).
 */
export function DraggableSticker({ children, label, rotate = 0, className, depth = 0.4, border, shape = "round", feeds }: Props) {
  const dragRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const flapWrapRef = useRef<HTMLDivElement>(null);
  const flapClipRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const draggable = useRef<Draggable | null>(null);

  useGSAP(
    () => {
      const el = dragRef.current!;
      const tilt = tiltRef.current!;
      const main = mainRef.current!;
      const flapWrap = flapWrapRef.current!;
      const flapClip = flapClipRef.current!;
      const flap = flapRef.current!;
      const reduced = prefersReducedMotion();

      gsap.set(tilt, { rotation: rotate });
      const lean = gsap.quickTo(tilt, "rotation", { duration: 0.35, ease: "power3.out" });
      InertiaPlugin.track(el, "x,y");

      // ---- peel (top-left); p = fraction of the sticker's extent that lifts
      const peel = { p: 0 };
      let dragging = false;
      const renderPeel = () => {
        const W = tilt.offsetWidth;
        const H = tilt.offsetHeight;
        const p = Math.min(peel.p, 0.4);
        if (p < 0.005) {
          main.style.clipPath = "";
          flapWrap.style.visibility = "hidden";
          return;
        }
        const g = peelGeometry(W, H, shape, p);
        main.style.clipPath = g.main;
        flapClip.style.clipPath = g.flap;
        flap.style.transform = g.matrix;
        flapWrap.style.visibility = "visible";
      };
      const peelTo = (p: number, duration = 0.3, ease = "power3.out") =>
        gsap.to(peel, { p, duration, ease, overwrite: "auto", onUpdate: renderPeel });

      const onEnter = (e: PointerEvent) => {
        if (dragging || e.pointerType !== "mouse") return;
        gsap.to(tilt, { scale: 1.05, duration: 0.35, ease: "back.out(2)", overwrite: "auto" });
        if (!reduced) peelTo(0.1, 0.45, "back.out(2)");
      };
      const onLeave = () => {
        if (dragging) return;
        gsap.to(tilt, { scale: 1, duration: 0.35, ease: "power3.out", overwrite: "auto" });
        peelTo(0, 0.35, "power2.inOut");
      };
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);

      const slap = (delay = 0.18) =>
        gsap
          .timeline({ delay })
          .to(tilt, { scale: 0.93, duration: 0.09, ease: "power2.in" })
          .to(tilt, { scale: 1, duration: 0.6, ease: "elastic.out(1.1, 0.42)" });

      // ---- throw: glide with friction, bounce off the viewport edges
      let stopThrow: (() => void) | null = null;
      const bounceSquash = (axis: "x" | "y", strength: number) => {
        const s = Math.min(strength / 2500, 0.18);
        gsap.fromTo(
          tilt,
          { scaleX: axis === "x" ? 1 - s : 1 + s * 0.6, scaleY: axis === "y" ? 1 - s : 1 + s * 0.6 },
          { scaleX: 1, scaleY: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)", overwrite: "auto" },
        );
      };
      const throwIt = (vx: number, vy: number) => {
        stopThrow?.();
        const b = viewportBounds(el);
        let x = gsap.getProperty(el, "x") as number;
        let y = gsap.getProperty(el, "y") as number;
        let last = performance.now();
        const step = () => {
          const now = performance.now();
          const dt = Math.min((now - last) / 1000, 1 / 30);
          last = now;
          x += vx * dt;
          y += vy * dt;
          const f = Math.exp(-FRICTION * dt);
          vx *= f;
          vy *= f;
          if (x < b.minX || x > b.maxX) {
            const hit = Math.abs(vx);
            x = gsap.utils.clamp(b.minX, b.maxX, x);
            vx = (x === b.minX ? 1 : -1) * hit * RESTITUTION;
            if (hit > 120) bounceSquash("x", hit);
          }
          if (y < b.minY || y > b.maxY) {
            const hit = Math.abs(vy);
            y = gsap.utils.clamp(b.minY, b.maxY, y);
            vy = (y === b.minY ? 1 : -1) * hit * RESTITUTION;
            if (hit > 120) bounceSquash("y", hit);
          }
          gsap.set(el, { x, y });
          lean(rotate + gsap.utils.clamp(-22, 22, vx / 70));
          if (Math.hypot(vx, vy) < 12) stop();
        };
        const stop = () => {
          gsap.ticker.remove(step);
          stopThrow = null;
          lean(rotate);
          draggable.current?.update();
        };
        stopThrow = stop;
        gsap.ticker.add(step);
      };

      // ---- Bean: "is that for me?" (close), mouth open (over), sad if carried off (denied)
      let interest: Interest = "none";
      let tempted = false;
      const beanEl = () => document.querySelector<HTMLElement>(BEAN_TARGET);
      const checkBean = (): Interest => {
        if (!feeds) return "none";
        const target = beanEl();
        if (!target) return "none";
        const t = target.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const d = Math.hypot(t.left + t.width / 2 - (r.left + r.width / 2), t.top + t.height / 2 - (r.top + r.height / 2));
        const level: Interest = Draggable.hitTest(el, target, "25%") ? "over" : d < CLOSE_PX ? "close" : "none";
        if (level !== interest) {
          interest = level;
          if (level !== "none") tempted = true;
          emitBean({ type: "interest", ingredient: feeds, level });
        }
        return level;
      };
      const eatAndRespawn = () => {
        const t = beanEl()!.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        // Aim for the cup's rim (upper third of Bean).
        const dx = t.left + t.width / 2 - (r.left + r.width / 2);
        const dy = t.top + t.height * 0.3 - (r.top + r.height / 2);
        draggable.current?.disable();
        gsap
          .timeline({
            onComplete: () => {
              gsap.set(el, { x: 0, y: 0 });
              draggable.current?.update();
              draggable.current?.enable();
            },
          })
          .to(el, { x: `+=${dx}`, y: `+=${dy - 30}`, duration: 0.25, ease: "power2.out" })
          .to(el, { y: `+=${30}`, scale: 0.1, rotation: 200, duration: 0.22, ease: "power2.in" })
          .add(() => emitBean({ type: "feed", ingredient: feeds! }))
          .set(el, { opacity: 0 })
          .set(el, { scale: 1, rotation: 0 }, "+=1.2")
          .set(el, { x: 0, y: 0 })
          .fromTo(el, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" });
      };

      [draggable.current] = Draggable.create(el, {
        type: "x,y",
        zIndexBoost: true,
        edgeResistance: 0.85,
        onPress() {
          stopThrow?.();
          dragging = true;
          el.classList.add("is-lifted");
          this.applyBounds(viewportBounds(el));
          gsap.to(tilt, { scale: 1.12, duration: 0.22, ease: "power2.out", overwrite: "auto" });
          if (!reduced) peelTo(0.17, 0.45, "back.out(1.6)");
        },
        onDrag() {
          lean(rotate + gsap.utils.clamp(-22, 22, this.deltaX * 1.8));
          // Faster drags pull the corner up a little further.
          const speed = Math.hypot(this.deltaX, this.deltaY);
          if (!reduced) peelTo(0.17 + Math.min(speed / 400, 0.07), 0.3);
          checkBean();
        },
        onRelease() {
          dragging = false;
          el.classList.remove("is-lifted");
          peelTo(0, 0.32, "power2.inOut"); // smooth it back down, then slap
          if (feeds) {
            const level = checkBean();
            if (level === "over") {
              emitBean({ type: "interest", ingredient: feeds, level: "none" });
              interest = "none";
              tempted = false;
              gsap.to(tilt, { scale: 1, duration: 0.2 });
              lean(rotate);
              eatAndRespawn();
              return;
            }
            if (tempted) emitBean({ type: "denied", ingredient: feeds });
            interest = "none";
            tempted = false;
          }
          const vx = InertiaPlugin.getVelocity(el, "x") as number;
          const vy = InertiaPlugin.getVelocity(el, "y") as number;
          if (!reduced && !feeds && Math.hypot(vx, vy) > 80) {
            throwIt(vx, vy);
            slap(0.12);
          } else {
            slap();
            lean(rotate);
          }
        },
      });

      return () => {
        stopThrow?.();
        InertiaPlugin.untrack(el);
        draggable.current?.kill();
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { dependencies: [rotate, feeds, shape] },
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (feeds && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      emitBean({ type: "feed", ingredient: feeds });
      return;
    }
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-NUDGE, 0],
      ArrowRight: [NUDGE, 0],
      ArrowUp: [0, -NUDGE],
      ArrowDown: [0, NUDGE],
    };
    const d = map[e.key];
    if (!d || !dragRef.current) return;
    e.preventDefault();
    const b = viewportBounds(dragRef.current);
    const x = gsap.utils.clamp(b.minX, b.maxX, (gsap.getProperty(dragRef.current, "x") as number) + d[0]);
    const y = gsap.utils.clamp(b.minY, b.maxY, (gsap.getProperty(dragRef.current, "y") as number) + d[1]);
    gsap.to(dragRef.current, {
      x,
      y,
      duration: 0.3,
      ease: "back.out(2)",
      onComplete: () => draggable.current?.update(true),
    });
  };

  return (
    <div className={`sticker-anchor absolute ${className ?? ""}`} data-depth={depth}>
      <div
        ref={dragRef}
        className="sticker-drag touch-none select-none"
        data-cursor="drag"
        data-cursor-label={feeds ? "feed" : undefined}
        tabIndex={0}
        role="button"
        aria-roledescription="draggable sticker"
        aria-label={feeds ? `${label}. Drag onto Bean, or press Enter to feed it.` : `${label}. Use arrow keys to move.`}
        onKeyDown={onKeyDown}
      >
        <div ref={tiltRef} className="sticker-tilt relative">
          <div ref={mainRef}>
            <Sticker rotate={0} border={border} interactive={false}>
              {children}
            </Sticker>
          </div>
          {/* Backing flap: the sticker mirrored across the fold, flattened to backing paper. */}
          <div ref={flapWrapRef} aria-hidden className="peel-flap-wrap pointer-events-none absolute inset-0" style={{ visibility: "hidden" }}>
            <div ref={flapClipRef} className="absolute inset-0">
              <div ref={flapRef} className="peel-flap absolute left-0 top-0" style={{ transformOrigin: "0 0" }}>
                <Sticker rotate={0} border={border} interactive={false} gloss={false}>
                  {children}
                </Sticker>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
