"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";
import { play } from "@/lib/sound";
import { colors } from "@/lib/tokens";

type Word = {
  text: string;
  /** Tailwind font-family class; the resolved family is read from a hidden probe span. */
  fontClass: string;
  weight?: number;
  italic?: boolean;
  /** Max size relative to the first word; the second word is otherwise fitted to the first word's width. */
  scale?: number;
  /** Vertical nudge as a fraction of the font size (italic Latin sits visually low on "middle"). */
  dy?: number;
};

type Props = {
  a: Word;
  b: Word;
  /** Accessible text (the canvas is aria-hidden). */
  label: string;
  /** Max font size in px; the text otherwise fits the container width. */
  maxSize?: number;
  className?: string;
};

const STEP_DT = 1 / 60;
const PAD = 0.45; // canvas bleed around the text box, in em, so flying dust isn't clipped

type Cloud = { x: Float32Array; y: Float32Array; count: number };

function sample(word: Word, family: string, size: number, w: number, h: number, step: number, padPx: number): Cloud {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";
  ctx.font = `${word.italic ? "italic " : ""}${word.weight ?? 400} ${size}px ${family}`;
  ctx.fillText(word.text, padPx, h / 2 + (word.dy ?? 0) * size);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const xs: number[] = [];
  const ys: number[] = [];
  for (let y = 0; y < c.height; y += step) {
    for (let x = 0; x < c.width; x += step) {
      const i = (Math.floor(y) * c.width + Math.floor(x)) * 4 + 3;
      if (data[i] > 110) {
        xs.push(x + (Math.random() - 0.5) * step * 0.5);
        ys.push(y + (Math.random() - 0.5) * step * 0.5);
      }
    }
  }
  // Sort left→right so particle i travels to a roughly matching spot in the other word.
  const order = xs.map((_, i) => i).sort((i, j) => xs[i] - xs[j] || ys[i] - ys[j]);
  return {
    x: Float32Array.from(order, (i) => xs[i]),
    y: Float32Array.from(order, (i) => ys[i]),
    count: order.length,
  };
}

/**
 * Text made of dust. Clicking blows the first word apart left→right on a curl-ish wind
 * and it re-gathers as the second word; the cursor brushes particles aside.
 * The loop sleeps once everything settles.
 */
export function DustText({ a, b, label, maxSize = 200, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const probeA = useRef<HTMLSpanElement>(null);
  const probeB = useRef<HTMLSpanElement>(null);
  const [boxH, setBoxH] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const [showB, setShowB] = useState(false);
  const toggleRef = useRef<(toB: boolean) => void>(() => {});

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const abort = new AbortController();
    let disposed = false;

    // Simulation state
    let n = 0;
    let px = new Float32Array(0), py = new Float32Array(0), vx = new Float32Array(0), vy = new Float32Array(0);
    let ax = new Float32Array(0), ay = new Float32Array(0), bx = new Float32Array(0), by = new Float32Array(0);
    let release = new Float32Array(0);
    let kicked = new Uint8Array(0);
    let mode: 0 | 1 = 0;
    let prevMode: 0 | 1 | -1 = -1; // -1: intro, particles hold still until released
    let switchAt = 0;
    let W = 0, H = 0, padPx = 0, dot = 2, dpr = 1;
    // Pointer in client coords; converted to canvas space every step so scrolling can't leave it stale.
    const mouse = { cx: -1e4, cy: -1e4, x: -1e4, y: -1e4, inside: false };
    let scrollingUntil = 0;
    let running = false;
    let visible = true;
    let acc = 0;
    let last = 0;

    const now = () => performance.now() / 1000;

    const scheduleRelease = (sweep: number, jitter: number) => {
      for (let i = 0; i < n; i++) {
        release[i] = (px[i] / W) * sweep + Math.random() * jitter;
        kicked[i] = 0;
      }
    };

    const build = async (intro: boolean) => {
      const famA = getComputedStyle(probeA.current!).fontFamily;
      const famB = getComputedStyle(probeB.current!).fontFamily;
      const width = wrap.clientWidth;
      // Fit word A to the width.
      const m = document.createElement("canvas").getContext("2d")!;
      const fontA = (s: number) => `${a.italic ? "italic " : ""}${a.weight ?? 400} ${s}px ${famA}`;
      const fontB = (s: number) => `${b.italic ? "italic " : ""}${b.weight ?? 400} ${s}px ${famB}`;
      await Promise.all([document.fonts.load(fontA(100), a.text), document.fonts.load(fontB(100), b.text)]);
      if (disposed) return;
      m.font = fontA(100);
      const perPx = m.measureText(a.text).width / 100;
      const size = Math.min(maxSize, (width * 0.98) / perPx);
      m.font = fontB(100);
      const perPxB = m.measureText(b.text).width / 100;
      const widthA = perPx * size;
      // Same visual width as word A, unless that would make B much taller than A.
      const sizeB = Math.min(widthA / perPxB, size * (b.scale ?? 1.45));
      const boxHeight = size * 1.18;
      padPx = size * PAD;
      W = width + padPx * 2;
      H = boxHeight + padPx * 2;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      canvas.style.left = `${-padPx}px`;
      canvas.style.top = `${-padPx}px`;
      setBoxH(boxHeight);

      const step = Math.max(2, Math.min(3.4, size / 58));
      dot = step * 0.72;
      const A = sample(a, famA, size, W, H, step, padPx);
      const B = sample(b, famB, sizeB, W, H, step, padPx);
      n = Math.max(A.count, B.count);
      const pick = (c: Cloud, i: number) => Math.min(c.count - 1, Math.floor((i * c.count) / n));
      ax = new Float32Array(n); ay = new Float32Array(n); bx = new Float32Array(n); by = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const ia = pick(A, i), ib = pick(B, i);
        ax[i] = A.x[ia]; ay[i] = A.y[ia]; bx[i] = B.x[ib]; by[i] = B.y[ib];
      }
      vx = new Float32Array(n); vy = new Float32Array(n);
      release = new Float32Array(n);
      kicked = new Uint8Array(n);
      if (intro) {
        // Start as a loose drift of dust below and to the left, then gather.
        px = Float32Array.from({ length: n }, () => Math.random() * W * 0.7 - W * 0.1);
        py = Float32Array.from({ length: n }, () => H * (0.7 + Math.random() * 0.9));
        prevMode = -1;
        mode = 0;
        switchAt = now() + 0.05;
        for (let i = 0; i < n; i++) {
          release[i] = (ax[i] / W) * 0.55 + Math.random() * 0.35;
          kicked[i] = 1;
        }
      } else {
        const tx = mode ? bx : ax, ty = mode ? by : ay;
        px = Float32Array.from(tx);
        py = Float32Array.from(ty);
        prevMode = mode;
        switchAt = now() - 10;
      }
      start();
    };

    const toggle = (toB: boolean) => {
      const next = toB ? 1 : 0;
      if (next === mode) return;
      prevMode = mode;
      mode = next;
      switchAt = now();
      scheduleRelease(0.42, 0.2);
      start();
    };
    toggleRef.current = toggle;

    const step = (t: number) => {
      let moving = 0;
      if (mouse.inside) {
        const r = canvas.getBoundingClientRect();
        mouse.x = mouse.cx - r.left;
        mouse.y = mouse.cy - r.top;
      }
      const tX = mode ? bx : ax, tY = mode ? by : ay;
      const pX = prevMode === 1 ? bx : ax, pY = prevMode === 1 ? by : ay;
      const R = 70, R2 = R * R;
      for (let i = 0; i < n; i++) {
        const age = t - (switchAt + release[i]);
        let fx = 0, fy = 0;
        if (age < 0) {
          if (prevMode === -1) {
            vx[i] *= 0.9; vy[i] *= 0.9;
          } else {
            fx = (pX[i] - px[i]) * 0.18;
            fy = (pY[i] - py[i]) * 0.18;
          }
        } else {
          if (!kicked[i]) {
            kicked[i] = 1;
            vx[i] += 1.2 + Math.random() * 2.8;
            vy[i] -= 0.4 + Math.random() * 2.4;
          }
          const grab = Math.min(1, Math.max(0, (age - 0.1) / 0.75));
          const k = 0.008 + 0.085 * grab * grab * (3 - 2 * grab);
          fx = (tX[i] - px[i]) * k;
          fy = (tY[i] - py[i]) * k;
          const drift = Math.max(0, 1 - age / 0.95);
          if (drift > 0) {
            const ang = Math.sin(py[i] * 0.02 + t * 1.8 + i) * 2.4 + Math.cos(px[i] * 0.012 - t * 1.2);
            fx += (Math.cos(ang) * 0.75 + 0.35) * drift;
            fy += (Math.sin(ang) * 0.75 - 0.3) * drift;
          }
        }
        if (mouse.inside && t > scrollingUntil) {
          const dx = px[i] - mouse.x, dy = py[i] - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / R) * 2.2;
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
        }
        vx[i] = (vx[i] + fx) * 0.84;
        vy[i] = (vy[i] + fy) * 0.84;
        px[i] += vx[i];
        py[i] += vy[i];
        if (vx[i] * vx[i] + vy[i] * vy[i] > 0.004 || age < 0) moving++;
      }
      return moving;
    };

    const render = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // Settled dust is ink; fast-moving dust flashes warm, like sparks off a grinder.
      ctx.fillStyle = colors.ink;
      for (let i = 0; i < n; i++) {
        if (vx[i] * vx[i] + vy[i] * vy[i] < 1.4) ctx.fillRect(px[i], py[i], dot, dot);
      }
      ctx.fillStyle = colors.tomato;
      for (let i = 0; i < n; i++) {
        if (vx[i] * vx[i] + vy[i] * vy[i] >= 1.4) ctx.fillRect(px[i], py[i], dot, dot);
      }
    };

    const tick = () => {
      const t = now();
      acc = Math.min(acc + (t - last), STEP_DT * 3);
      last = t;
      let moving = 1;
      while (acc >= STEP_DT) {
        moving = step(t);
        acc -= STEP_DT;
      }
      render();
      if (moving === 0 && !mouse.inside) stop();
    };

    function start() {
      if (running || !visible || disposed) return;
      running = true;
      last = now();
      gsap.ticker.add(tick);
    }
    function stop() {
      if (!running) return;
      running = false;
      gsap.ticker.remove(tick);
    }

    const onMove = (e: PointerEvent) => {
      mouse.cx = e.clientX;
      mouse.cy = e.clientY;
      mouse.inside = true;
      start();
    };
    const onLeave = () => {
      mouse.inside = false;
      mouse.x = mouse.y = -1e4;
    };

    // While the page scrolls under a still cursor, the text sweeps past the pointer and would
    // get brushed in a streak. Pause the brush until scrolling settles, then re-check the cursor.
    let settleTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      scrollingUntil = now() + 0.25;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        const r = wrap.getBoundingClientRect();
        mouse.inside = mouse.cx >= r.left && mouse.cx <= r.right && mouse.cy >= r.top && mouse.cy <= r.bottom;
      }, 260);
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", (e) => {
      mouse.cx = e.clientX;
      mouse.cy = e.clientY;
    }, { passive: true, signal: abort.signal });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(wrap);

    let lastWidth = wrap.clientWidth;
    let resizeTimer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      if (Math.abs(wrap.clientWidth - lastWidth) < 2) return;
      lastWidth = wrap.clientWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => build(false), 150);
    });
    ro.observe(wrap);

    build(true);

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      clearTimeout(resizeTimer);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(settleTimer);
      abort.abort();
    };
  }, [a, b, maxSize, reduced]);

  const modeRef = useRef(false);
  const setMode = (toB: boolean) => {
    play("whoosh");
    modeRef.current = toB;
    setShowB(toB);
    toggleRef.current(toB);
  };

  return (
    <div
      ref={wrapRef}
      className={`dust-text relative w-full ${className ?? ""}`}
      style={{ height: boxH ?? undefined }}
      onClick={() => setMode(!modeRef.current)}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        setMode(!modeRef.current);
      }}
      tabIndex={0}
      role="button"
      aria-pressed={showB}
      aria-label={label}
      data-cursor="pointer"
    >
      {/* Probes resolve next/font's generated family names for the canvas. */}
      <span ref={probeA} aria-hidden className={`${a.fontClass} pointer-events-none absolute opacity-0`}>
        {a.text}
      </span>
      <span ref={probeB} aria-hidden className={`${b.fontClass} pointer-events-none absolute opacity-0`}>
        {b.text}
      </span>
      {reduced ? (
        <span aria-hidden className="relative block">
          <span className={`${a.fontClass} block leading-none transition-opacity duration-300 ${showB ? "opacity-0" : "opacity-100"}`} style={{ fontSize: `min(${maxSize}px, 17vw)`, fontWeight: a.weight }}>
            {a.text}
          </span>
          <span className={`${b.fontClass} absolute left-0 top-0 leading-none transition-opacity duration-300 ${showB ? "opacity-100" : "opacity-0"}`} style={{ fontSize: `min(${maxSize}px, 17vw)`, fontStyle: b.italic ? "italic" : undefined }}>
            {b.text}
          </span>
        </span>
      ) : (
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute" />
      )}
    </div>
  );
}
