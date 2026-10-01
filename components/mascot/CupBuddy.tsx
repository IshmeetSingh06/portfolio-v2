"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { play } from "@/lib/sound";
import { colors, spring } from "@/lib/tokens";
import { onBean, type Ingredient } from "@/components/mascot/beanBus";

const CREMA = "#C98B55";
const MILK = "#FFFDF8";
const BODY = colors.butter;
const FOOT = "#E2B43F";

/** Bean stands on this point (viewBox units); squash, lean and hops pivot around it. */
const GROUND = { x: 70, y: 122 };

const heart = (cx: number, cy: number, s = 1) =>
  `M${cx} ${cy + 3.4 * s}c${-4.4 * s} ${-1.6 * s} ${-6.2 * s} ${-3.4 * s} ${-4.6 * s} ${-4.8 * s} ${1.4 * s} ${-1.2 * s} ${3.4 * s} ${-0.4 * s} ${4.6 * s} ${1 * s} ${1.2 * s} ${-1.4 * s} ${3.2 * s} ${-2.2 * s} ${4.6 * s} ${-1 * s} ${1.6 * s} ${1.4 * s} ${-0.2 * s} ${3.2 * s} ${-4.6 * s} ${4.8 * s}z`;

const star = (cx: number, cy: number, r: number) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`;
  });
  return `M${pts.join("L")}Z`;
};

const MOUTH = {
  smile: "M63 93 C66 98.5 74 98.5 77 93",
  grin: "M61.5 92 C61.5 103 78.5 103 78.5 92 C73 94 67 94 61.5 92 Z",
  oh: "M66 94.5 C66 100.5 74 100.5 74 94.5 C74 89.5 66 89.5 66 94.5 Z",
  gape: "M63 91 C63 104 77 104 77 91 C77 87 63 87 63 91 Z",
  yawn: "M64.5 90 C64.5 105 75.5 105 75.5 90 C75.5 85 64.5 85 64.5 90 Z",
  flat: "M64 95 C68 94.6 72 94.6 76 94",
  wobble: "M62 95 C64 92.5 66 92.5 68 95 C70 97.5 72 97.5 74 95 C76 92.5 78 92.5 79 94",
};
type Mouth = keyof typeof MOUTH;

type Brows = "neutral" | "up" | "happy" | "sad" | "angry" | "skeptical" | "sleepy";
const BROWS: Record<Brows, [{ y: number; r: number }, { y: number; r: number }]> = {
  neutral: [{ y: 0, r: 0 }, { y: 0, r: 0 }],
  up: [{ y: -3.2, r: 0 }, { y: -3.2, r: 0 }],
  happy: [{ y: -2, r: -4 }, { y: -2, r: 4 }],
  sad: [{ y: -1, r: -16 }, { y: -1, r: 16 }],
  angry: [{ y: 1.5, r: 16 }, { y: 1.5, r: -16 }],
  skeptical: [{ y: -3.6, r: -8 }, { y: 1.2, r: 6 }],
  sleepy: [{ y: 2, r: 0 }, { y: 2, r: 0 }],
};

type Eyes = "open" | "happy" | "squeeze" | "sleep" | "stars" | "hearts";

/** Shoulders sit just inside the cup's edge; the arms are drawn behind the body, hands in front. */
const SHOULDER = { l: { x: 30, y: 84 }, r: { x: 110, y: 84 } };
type ArmPose = { hx: number; hy: number; bend: number };
/** Poses are written for Bean's left arm (screen left); the right arm mirrors them. */
const ARM = {
  rest: { hx: 17, hy: 103, bend: 5 },
  droop: { hx: 21, hy: 110, bend: 3 },
  dip: { hx: 22, hy: 107, bend: 6 },
  up: { hx: 11, hy: 57, bend: -9 },
  gimme: { hx: 6, hy: 72, bend: -7 },
  cheek: { hx: 40, hy: 98, bend: -11 },
  stretch: { hx: 16, hy: 40, bend: -3 },
  clasp: { hx: 37, hy: 95, bend: -12 }, // hands up by the cheeks: pleading 🥺
  hug: { hx: 47, hy: 99, bend: -12 }, // arms around itself: cold
} satisfies Record<string, ArmPose>;
const mirror = (p: ArmPose): ArmPose => ({ hx: 140 - p.hx, hy: p.hy, bend: -p.bend });

const HOVER_LINES = [
  "hi! i'm Bean ☕",
  "psst… feed me something ←",
  "the stickers peel, try it",
  "this is my 3rd latte today",
  "hire Ishmeet, pls 🙏",
  "press and hold me…",
];
const SIP_LINES = ["wheee!", "*slurp*", "boing!", "boop received", "again!"];

const FEED: Record<Ingredient, { line: string; after?: string }> = {
  milk: { line: "ooh, extra creamy 🥛" },
  sugar: { line: "SUGAR RUSH!!!" },
  ice: { line: "brrr… iced latte era 🧊" },
  espresso: { line: "DOUBLE. SHOT." },
  matcha: { line: "…this is not coffee.", after: "…ok it's kinda good" },
};

const IDLE_SLEEP_MS = 15000;
const LOOK_RESET_S = 14;
const GRAVITY = 1500; // viewBox units / s²

/** Damped spring, integrated on the GSAP ticker. */
type Spring = { v: number; vel: number; to: number; k: number; c: number };
const mkSpring = (v: number, k: number, c: number): Spring => ({ v, vel: 0, to: v, k, c });
const stepSpring = (s: Spring, dt: number) => {
  s.vel += (-s.k * (s.v - s.to) - s.c * s.vel) * dt;
  s.v += s.vel * dt;
};

type Props = { className?: string; introDelay?: number };

/**
 * Bean, the site mascot. The body runs on springs plus gravity (squash, lean, hops), so
 * every reaction blends into the next instead of snapping. Eyes track the cursor, a
 * rubber-hose arm swings with follow-through, eyebrows carry the emotion, it eats
 * ingredient stickers, and it nods off when you go idle.
 */
export function CupBuddy({ className, introDelay = 0 }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [bubble, setBubble] = useState<string | null>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const one = (sel: string) => q(sel)[0] as unknown as SVGElement;
      const svg = root.current!.querySelector("svg")!;
      const body = one(".bb-body");
      const shadow = one(".bb-shadow");
      const face = one(".bb-face");
      const eyeSets: Record<Eyes, Element[]> = {
        open: q(".bb-eye"),
        happy: q(".bb-eyes-happy"),
        squeeze: q(".bb-eyes-squeeze"),
        sleep: q(".bb-eyes-sleep"),
        stars: q(".bb-eyes-stars > *"),
        hearts: q(".bb-eyes-hearts > *"),
      };
      const [browL, browR] = q(".bb-brow");
      const mouth = one(".bb-mouth");
      const blush = q(".bb-blush");
      const armLines = [one(".bb-arm-l"), one(".bb-arm-r")];
      const hands = [one(".bb-hand-l"), one(".bb-hand-r")];
      const [footL] = q(".bb-foot");
      const steamGroup = one(".bb-steam");
      const wisps = q(".bb-wisp");
      const steamHeart = one(".bb-steam-heart");
      const zzz = q(".bb-z");
      const bodyFill = one(".bb-cup");
      const rim = one(".bb-rim");
      const iceCubes = q(".bb-ice > *");
      const sparkles = q(".bb-sparkles > *");
      const drops = q(".bb-drops > *");
      const fx = one(".bb-fx");
      const hit = q(".bb-hit")[0] as HTMLElement;
      const reduced = prefersReducedMotion();

      // ---------- setup
      const hiddenEyes = [...eyeSets.happy, ...eyeSets.squeeze, ...eyeSets.sleep, ...eyeSets.stars, ...eyeSets.hearts];
      gsap.set(hiddenEyes, { opacity: 0 });
      gsap.set([...eyeSets.stars, ...eyeSets.hearts], { transformOrigin: "50% 50%", scale: 0 });
      gsap.set(zzz, { opacity: 0 });
      const extras = [...iceCubes, ...sparkles, ...drops];
      gsap.set(extras, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
      gsap.set(eyeSets.open, { transformOrigin: "50% 50%" });
      gsap.set(browL, { svgOrigin: "56 72" });
      gsap.set(browR, { svgOrigin: "84 72" });
      gsap.set(footL, { svgOrigin: "48 118" });

      // ---------- body physics: squash (sy), lean (rot), hop (y with gravity), arm follow-through
      const sy = mkSpring(1, 320, 13); // bouncy
      const rot = mkSpring(0, 70, 11);
      const swing = mkSpring(0, 55, 5.5); // arm pendulum
      const body3 = { y: 0, vy: 0, airborne: false };
      let pressing = false;
      let leanTarget = 0;
      let breathe = 1; // scales the idle breath (sleep breathes slower & deeper)
      let t0 = performance.now();

      const hop = (v: number) => {
        body3.vy = -v;
        body3.airborne = true;
        sy.vel += v * 0.012; // stretch on take-off
      };
      const land = (impact: number) => {
        sy.vel -= Math.min(impact * 0.011, 7); // squash on landing
        if (impact > 250) play("thud");
        if (impact > 380) poof();
      };

      // ---------- rubber-hose arms (+ mittens that turn with the forearm)
      const armL = { ...ARM.rest };
      const armR = mirror(ARM.rest);
      const drawOne = (arm: ArmPose, sh: { x: number; y: number }, line: SVGElement, hand: SVGElement) => {
        const hx = arm.hx + swing.v;
        const hy = arm.hy;
        const mx = (sh.x + hx) / 2;
        const my = (sh.y + hy) / 2;
        const dx = hx - sh.x;
        const dy = hy - sh.y;
        const len = Math.hypot(dx, dy) || 1;
        const cx = mx + (-dy / len) * arm.bend;
        const cy = my + (dx / len) * arm.bend;
        line.setAttribute("d", `M${sh.x} ${sh.y}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${hx.toFixed(2)} ${hy.toFixed(2)}`);
        const tangent = (Math.atan2(hy - cy, hx - cx) * 180) / Math.PI;
        hand.setAttribute("transform", `translate(${hx.toFixed(2)} ${hy.toFixed(2)}) rotate(${tangent.toFixed(1)})`);
      };
      const drawArm = () => {
        drawOne(armL, SHOULDER.l, armLines[0], hands[0]);
        drawOne(armR, SHOULDER.r, armLines[1], hands[1]);
      };
      /** Both arms (right mirrors left) unless `only` says otherwise; `rightPose` overrides the mirror. */
      const armTo = (pose: ArmPose, duration = 0.5, ease = "back.out(1.6)", only?: "l" | "r", rightPose?: ArmPose) => {
        if (only !== "r") gsap.to(armL, { ...pose, duration, ease, overwrite: "auto" });
        if (only !== "l") gsap.to(armR, { ...(rightPose ?? mirror(pose)), duration, ease, overwrite: "auto" });
      };

      // ---------- per-frame: integrate springs, apply transforms
      const tick = () => {
        const now = performance.now();
        const dt = Math.min((now - t0) / 1000, 1 / 30);
        t0 = now;
        const t = now / 1000;
        // Idle life: slow breath + a wandering, non-repeating sway (sum of incommensurate sines).
        const breath = Math.sin(t * 1.9) * 0.009 * breathe;
        const drift = (Math.sin(t * 0.63) * 0.7 + Math.sin(t * 1.37 + 1.3) * 0.4) * (reduced ? 0 : 1);
        sy.to = pressing ? 0.8 : 1 + breath;
        rot.to = leanTarget + drift;
        for (let i = 0; i < 2; i++) {
          const h = dt / 2;
          stepSpring(sy, h);
          stepSpring(rot, h);
          // The hand lags the body: pendulum driven by lean speed and vertical motion.
          swing.to = -rot.vel * 0.22 + body3.vy * 0.006;
          stepSpring(swing, h);
          if (body3.airborne) {
            body3.vy += GRAVITY * h;
            body3.y += body3.vy * h;
            if (body3.y >= 0) {
              const impact = body3.vy;
              body3.y = 0;
              body3.vy = 0;
              body3.airborne = false;
              land(impact);
            }
          }
        }
        const s = sy.v;
        const sx = 1 + (1 - s) * 0.75; // keep the volume roughly constant
        body.setAttribute(
          "transform",
          `translate(${GROUND.x} ${(GROUND.y + body3.y).toFixed(2)}) rotate(${rot.v.toFixed(2)}) scale(${sx.toFixed(4)} ${s.toFixed(4)}) translate(${-GROUND.x} ${-GROUND.y})`,
        );
        const lift = Math.min(-body3.y / 70, 0.7);
        shadow.setAttribute("transform", `translate(${GROUND.x} 126) scale(${(1 - lift * 0.6).toFixed(3)} 1) translate(${-GROUND.x} -126)`);
        shadow.setAttribute("fill-opacity", (0.12 * (1 - lift)).toFixed(3));
        drawArm();
      };
      gsap.ticker.add(tick);

      // ---------- face vocabulary
      let state: "awake" | "sleep" = "awake";
      let busy = false; // mid-reaction (feeding, jitter): ignore hover faces
      let hovering = false;
      let eyesNow: Eyes = "open";
      const eyes = (next: Eyes) => {
        if (next === eyesNow) return;
        const popped = eyesNow === "stars" || eyesNow === "hearts";
        gsap.to(eyeSets[eyesNow], { opacity: 0, scale: popped ? 0 : 1, duration: 0.08, overwrite: "auto" });
        const els = eyeSets[next];
        if (next === "stars" || next === "hearts") {
          gsap.fromTo(els, { opacity: 1, scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(3)", overwrite: "auto" });
        } else {
          gsap.to(els, { opacity: 1, duration: 0.08, overwrite: "auto" });
        }
        eyesNow = next;
      };
      const brows = (mood: Brows, duration = 0.35) => {
        const [l, r] = BROWS[mood];
        gsap.to(browL, { y: l.y, rotation: l.r, duration, ease: "back.out(1.8)", overwrite: "auto" });
        gsap.to(browR, { y: r.y, rotation: r.r, duration, ease: "back.out(1.8)", overwrite: "auto" });
      };
      const mouthTo = (m: Mouth, duration = 0.3) => {
        const filled = m !== "smile" && m !== "flat" && m !== "wobble";
        gsap.to(mouth, { morphSVG: MOUTH[m], fillOpacity: filled ? 1 : 0, duration, ease: "power3.out", overwrite: "auto" });
      };
      let moodTimer: gsap.core.Tween | null = null;
      const neutral = () => {
        if (state === "sleep" || pressing) return;
        eyes("open");
        brows("neutral");
        mouthTo("smile");
        // scale only: x/y belong to the eye-tracking setters
        gsap.to(eyeSets.open, { scale: 1, duration: 0.3, overwrite: "auto" });
      };
      /** Hold an expression, then drift back to neutral. */
      const express = (e: Eyes, b: Brows, m: Mouth, hold = 1.4) => {
        eyes(e);
        brows(b);
        mouthTo(m);
        moodTimer?.kill();
        moodTimer = gsap.delayedCall(hold, neutral);
      };

      // ---------- speech bubble
      let bubbleTimer: ReturnType<typeof setTimeout>;
      const say = (text: string, ms = 1800) => {
        clearTimeout(bubbleTimer);
        setBubble(text);
        bubbleTimer = setTimeout(() => setBubble(null), ms);
      };

      // ---------- cloud poof at the feet
      function poof() {
        if (reduced) return;
        const ns = "http://www.w3.org/2000/svg";
        [-1, 1].forEach((dir) => {
          for (let i = 0; i < 3; i++) {
            const c = document.createElementNS(ns, "circle");
            c.setAttribute("cx", String(GROUND.x + dir * (30 + i * 4)));
            c.setAttribute("cy", String(GROUND.y - 2 - i * 2));
            c.setAttribute("r", String(5 - i));
            c.setAttribute("fill", MILK);
            c.setAttribute("stroke", colors.ink);
            c.setAttribute("stroke-width", "1.8");
            fx.appendChild(c);
            gsap.fromTo(
              c,
              { scale: 0.3, opacity: 1, transformOrigin: "50% 50%" },
              {
                scale: 1.3 - i * 0.2,
                x: dir * (14 + i * 9),
                y: -4 - i * 4,
                opacity: 0,
                duration: 0.55 + i * 0.08,
                ease: "power2.out",
                onComplete: () => c.remove(),
              },
            );
          }
        });
      }

      // ---------- steam: wisps that ink upward, curl and fade (continuous, staggered)
      gsap.set(wisps, { opacity: 0 });
      const steamTls = wisps.map((w, i) =>
        gsap
          .timeline({ repeat: -1, delay: i * 0.7, repeatDelay: 0.25 })
          .fromTo(w, { drawSVG: "0% 0%", y: 4, opacity: 0 }, { drawSVG: "0% 100%", y: -2, opacity: 0.9, duration: 0.9, ease: "sine.out" })
          .to(w, { drawSVG: "100% 100%", y: -9, opacity: 0, duration: 0.8, ease: "sine.in" }),
      );
      const heartTl = gsap
        .timeline({ repeat: -1, repeatDelay: 1.4 })
        .fromTo(steamHeart, { y: 6, scale: 0.4, opacity: 0, transformOrigin: "50% 50%" }, { y: -2, scale: 1, opacity: 1, duration: 0.9, ease: "back.out(2)" })
        .to(steamHeart, { y: -12, opacity: 0, rotation: 12, duration: 1.1, ease: "sine.in" }, "+=0.5");
      const steamSpeed = (k: number) => [...steamTls, heartTl].forEach((tl) => tl.timeScale(k));
      if (reduced) steamSpeed(0);

      // ---------- gestures
      let lastWave = 0;
      const wave = () => {
        if (reduced) return;
        const t = performance.now();
        if (t - lastWave < 2200) return;
        lastWave = t;
        leanTarget = 2.5; // counter-lean away from the waving arm
        armTo(ARM.rest, 0.4, "power2.out", "r");
        gsap
          .timeline({ onComplete: () => void (leanTarget = 0) })
          .to(armL, { ...ARM.dip, duration: 0.14, ease: "power2.inOut" }) // anticipation
          .to(armL, { ...ARM.up, duration: 0.34, ease: "back.out(2.2)" })
          .to(armL, { hx: 21, hy: 60, duration: 0.2, ease: "sine.inOut" })
          .to(armL, { hx: 8, hy: 55, duration: 0.2, ease: "sine.inOut" })
          .to(armL, { hx: 18, hy: 58.5, duration: 0.18, ease: "sine.inOut" })
          .to(armL, { hx: 10, hy: 56, duration: 0.16, ease: "sine.inOut" })
          .to(armL, { ...ARM.rest, duration: 1.0, ease: "elastic.out(1, 0.55)" }, "+=0.08");
      };

      if (!reduced) {
        // ---------- intro: drop in, squash on landing, poof, wave
        gsap.set(root.current, { opacity: 0 });
        gsap.delayedCall(introDelay, () => {
          gsap.to(root.current, { opacity: 1, duration: 0.15 });
          body3.y = -230;
          body3.vy = 0;
          body3.airborne = true;
          Object.assign(armL, ARM.up);
          Object.assign(armR, mirror(ARM.up));
          express("open", "up", "oh", 0.9);
          gsap.delayedCall(0.5, () => {
            armTo(ARM.rest, 0.9, "elastic.out(1, 0.5)");
            gsap.delayedCall(0.35, () => {
              wave();
              express("happy", "happy", "grin", 1.6);
              say("hi! i'm Bean ☕", 1800);
            });
          });
        });
      }

      // ---------- blink: quick close, hold, slower open
      let blinkTimer: ReturnType<typeof setTimeout>;
      const blink = () => {
        if (state === "awake" && eyesNow === "open" && !pressing) {
          const tl = gsap.timeline();
          for (let i = 0; i < (Math.random() < 0.2 ? 2 : 1); i++) {
            tl.to(eyeSets.open, { scaleY: 0.08, duration: 0.06, ease: "power2.in" }).to(eyeSets.open, {
              scaleY: 1,
              duration: 0.14,
              ease: "power2.out",
              delay: 0.03,
            });
          }
        }
        blinkTimer = setTimeout(blink, 2400 + Math.random() * 3800);
      };
      blinkTimer = setTimeout(blink, 2800);

      // ---------- eye tracking + curiosity
      const lookX = eyeSets.open.map((e) => gsap.quickTo(e, "x", { duration: 0.25, ease: "power3.out" }));
      const lookY = eyeSets.open.map((e) => gsap.quickTo(e, "y", { duration: 0.25, ease: "power3.out" }));
      const faceX = gsap.quickTo(face, "x", { duration: 0.55, ease: "power3.out" });
      const faceY = gsap.quickTo(face, "y", { duration: 0.55, ease: "power3.out" });
      const EYES = [[56, 83], [84, 83]];
      let curious = false;
      let lastPointer = performance.now();
      const look = (cx: number, cy: number) => {
        const r = svg.getBoundingClientRect();
        const s = r.width / 140;
        let fx = 0, fy = 0;
        EYES.forEach(([ex, ey], i) => {
          const dx = cx - (r.left + ex * s);
          const dy = cy - (r.top + ey * s);
          const d = Math.hypot(dx, dy) || 1;
          const m = (d / (d + 140)) * 3.4;
          lookX[i]((dx / d) * m);
          lookY[i]((dy / d) * m);
          fx += (dx / d) * (d / (d + 300)) * 3;
          fy += (dy / d) * (d / (d + 300)) * 2.2;
        });
        faceX(fx / 2);
        faceY(fy / 2);
        const bx = r.left + r.width / 2, by = r.top + r.height / 2;
        const near = Math.hypot(cx - bx, cy - by) < r.width * 1.8;
        if (!busy) leanTarget = near ? gsap.utils.clamp(-5, 5, (cx - bx) / 40) : 0;
        if (near !== curious && !busy && !hovering) {
          curious = near;
          brows(near ? "up" : "neutral");
        }
      };

      // ---------- idle fidgets (only while nobody's interacting)
      let fidgetTimer: ReturnType<typeof setTimeout>;
      const fidget = () => {
        const idleFor = performance.now() - lastPointer;
        if (!reduced && state === "awake" && !busy && !hovering && !pressing && idleFor > 2500) {
          const pick = Math.random();
          if (pick < 0.3) {
            // glance around
            gsap
              .timeline()
              .add(() => lookX.forEach((f) => f(-3)))
              .add(() => lookX.forEach((f) => f(3)), 0.9)
              .add(() => lookX.forEach((f) => f(0)), 1.8);
            brows("up");
            gsap.delayedCall(2, () => brows("neutral"));
          } else if (pick < 0.55) {
            // stretch + yawn
            armTo(ARM.stretch, 0.8, "power2.inOut");
            sy.vel += 1.2;
            express("sleep", "sleepy", "yawn", 1.5);
            gsap.delayedCall(1.4, () => void armTo(ARM.rest, 1, "elastic.out(1, 0.5)"));
          } else if (pick < 0.8) {
            // foot tap
            gsap
              .timeline()
              .to(footL, { rotation: -16, duration: 0.12, ease: "power2.out", repeat: 5, yoyo: true })
              .set(footL, { rotation: 0 });
            express("open", "neutral", "flat", 1.4);
          } else {
            // hmm… hand to cheek
            armTo(ARM.cheek, 0.55, "power3.out", "l");
            express("open", "skeptical", "flat", 1.7);
            gsap.delayedCall(1.8, () => void armTo(ARM.rest, 0.9, "elastic.out(1, 0.5)"));
          }
        }
        fidgetTimer = setTimeout(fidget, 5000 + Math.random() * 5000);
      };
      fidgetTimer = setTimeout(fidget, 8000);

      // ---------- sleep / wake
      let idleTimer: ReturnType<typeof setTimeout>;
      let zzzTl: gsap.core.Timeline | null = null;
      const fallAsleep = () => {
        if (busy || pressing) return resetIdle();
        state = "sleep";
        setBubble(null);
        moodTimer?.kill();
        eyes("sleep");
        brows("sleepy", 0.8);
        mouthTo("oh", 0.5);
        gsap.to(mouth, { scale: 0.7, transformOrigin: "50% 50%", duration: 0.5 });
        leanTarget = 5;
        breathe = 2.6;
        steamSpeed(0.4);
        faceX(0);
        faceY(2);
        zzzTl = gsap
          .timeline({ repeat: -1 })
          .fromTo(zzz, { opacity: 0, x: 0, y: 0, scale: 0.6 }, { opacity: 1, x: 10, y: -16, scale: 1, duration: 1, stagger: 0.45, ease: "sine.out" })
          .to(zzz, { opacity: 0, x: 16, y: -28, duration: 0.6, stagger: 0.45 }, 0.9);
      };
      const wake = () => {
        if (state !== "sleep") return;
        state = "awake";
        zzzTl?.kill();
        gsap.to(zzz, { opacity: 0, duration: 0.2 });
        gsap.to(mouth, { scale: 1, duration: 0.3 });
        eyes("open");
        gsap.fromTo(eyeSets.open, { scale: 1.45 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" });
        express("open", "up", "oh", 0.9);
        leanTarget = 0;
        breathe = 1;
        hop(260);
        steamSpeed(1);
        say("i was NOT sleeping", 1600);
      };
      function resetIdle() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(fallAsleep, IDLE_SLEEP_MS);
      }

      const onMove = (e: PointerEvent) => {
        lastPointer = performance.now();
        wake();
        resetIdle();
        if (state === "awake") look(e.clientX, e.clientY);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      resetIdle();

      // Cursor leaves the window → sad face (not too often).
      let lastMissYou = 0;
      const onDocLeave = (e: MouseEvent) => {
        if (e.relatedTarget || state !== "awake" || busy) return;
        const t = performance.now();
        if (t - lastMissYou < 20000) return;
        lastMissYou = t;
        express("open", "sad", "wobble", 2.2);
        say("wait, come back!", 2000);
      };
      document.addEventListener("mouseout", onDocLeave);

      // ---------- hover
      const carrying = () => !!document.querySelector(".sticker-drag.is-lifted");
      let hoverLine = 0;
      const onEnter = () => {
        hovering = true;
        if (state !== "awake" || busy || carrying()) return;
        gsap.to(blush, { opacity: 1, scale: 1.2, transformOrigin: "50% 50%", duration: 0.3 });
        moodTimer?.kill();
        eyes("open");
        brows("happy");
        mouthTo("grin");
        wave();
        say(HOVER_LINES[hoverLine++ % HOVER_LINES.length], 2400);
      };
      const onLeave = () => {
        hovering = false;
        gsap.to(blush, { opacity: 0.55, scale: 1, duration: 0.4 });
        if (pressing) release(false);
        if (state === "awake" && !busy && !carrying()) neutral();
      };

      // ---------- press & hold → squish; release → spring up into a hop (longer hold, bigger hop)
      const popHeart = (x = 70, y = 40, color?: string) => {
        const ns = "http://www.w3.org/2000/svg";
        const p = document.createElementNS(ns, "path");
        p.setAttribute("d", heart(x, y, 1.1));
        p.setAttribute("fill", color ?? (Math.random() < 0.5 ? colors.tomato : colors.sakura));
        p.setAttribute("stroke", colors.ink);
        p.setAttribute("stroke-width", "1.6");
        fx.appendChild(p);
        gsap.fromTo(
          p,
          { x: 0, y: 0, scale: 0.4, opacity: 1, transformOrigin: "50% 50%" },
          {
            x: (Math.random() - 0.5) * 60,
            y: -40 - Math.random() * 30,
            scale: 1 + Math.random() * 0.5,
            rotation: (Math.random() - 0.5) * 50,
            opacity: 0,
            duration: 1.1,
            ease: "power2.out",
            onComplete: () => p.remove(),
          },
        );
      };

      const jitter = (line: string) => {
        busy = true;
        moodTimer?.kill();
        say(line, 2000);
        eyes("open");
        gsap.to(eyeSets.open, { scale: 1.5, duration: 0.2 });
        brows("angry");
        mouthTo("gape");
        armTo(ARM.up, 0.25);
        steamSpeed(5);
        gsap.fromTo(
          root.current,
          { x: 0 },
          {
            x: 3,
            duration: 0.04,
            repeat: 34,
            yoyo: true,
            ease: "none",
            onComplete: () => {
              busy = false;
              gsap.set(root.current, { x: 0 });
              gsap.to(eyeSets.open, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" });
              armTo(ARM.rest, 0.8, "elastic.out(1, 0.45)");
              steamSpeed(1);
              neutral();
            },
          },
        );
      };

      let pressStart = 0;
      const clicks: number[] = [];
      const press = () => {
        wake();
        resetIdle();
        if (busy) return;
        pressing = true;
        pressStart = performance.now();
        moodTimer?.kill();
        eyes("squeeze");
        brows("up");
        mouthTo("oh", 0.2);
        armTo(ARM.dip, 0.25, "power2.out");
      };
      function release(jump = true) {
        if (!pressing) return;
        pressing = false;
        const held = Math.min((performance.now() - pressStart) / 1000, 1);
        armTo(ARM.rest, 0.9, "elastic.out(1, 0.5)");
        if (!jump) return neutral();
        const t = performance.now();
        clicks.push(t);
        while (clicks.length && t - clicks[0] > 2500) clicks.shift();
        if (clicks.length >= 6) {
          clicks.length = 0;
          return jitter("too. much. caffeine.");
        }
        if (!reduced) hop(200 + held * 360);
        play("boing");
        express(held > 0.5 ? "stars" : Math.random() < 0.4 ? "hearts" : "happy", "happy", "grin", 1.1);
        const n = held > 0.5 ? 5 : 3;
        for (let i = 0; i < n; i++) gsap.delayedCall(i * 0.08, () => popHeart());
        say(held > 0.6 ? "WHEEEE!" : SIP_LINES[Math.floor(Math.random() * SIP_LINES.length)], 1400);
      }
      const onDown = (e: PointerEvent) => {
        hit.setPointerCapture?.(e.pointerId);
        press();
      };
      const onUp = () => release(true);
      // Keyboard "click" (detail 0): a quick press + release.
      const onKeyClick = (e: MouseEvent) => {
        if (e.detail !== 0) return;
        press();
        gsap.delayedCall(0.18, () => release(true));
      };

      hit.addEventListener("pointerenter", onEnter);
      hit.addEventListener("pointerleave", onLeave);
      hit.addEventListener("pointerdown", onDown);
      hit.addEventListener("pointerup", onUp);
      hit.addEventListener("pointercancel", onUp);
      hit.addEventListener("click", onKeyClick);

      // ---------- looks: what Bean has been fed
      const BASE = { body: BODY, rim: CREMA };
      let lookReset: gsap.core.Tween | null = null;
      const setLook = (bodyColor: string, rimColor: string) => {
        gsap.to(bodyFill, { attr: { fill: bodyColor }, duration: 0.6, ease: "power2.out" });
        gsap.to(rim, { attr: { fill: rimColor }, duration: 0.6, ease: "power2.out" });
      };
      /** Instant: a lingering fade-out would fight the next ingredient's pop-in. */
      const clearExtras = () => {
        gsap.killTweensOf(extras);
        gsap.set(extras, { opacity: 0, scale: 0, y: 0, rotation: 0 });
        gsap.to(steamGroup, { autoAlpha: 1, duration: 0.4 });
      };
      const backToBasics = () => {
        setLook(BASE.body, BASE.rim);
        gsap.to(extras, { opacity: 0, scale: 0, duration: 0.3, overwrite: true });
        gsap.to(steamGroup, { autoAlpha: 1, duration: 0.4 });
        if (state === "awake") {
          express("happy", "happy", "smile", 1.2);
          say("phew. back to normal ☕", 1600);
        }
      };

      const feed = (ing: Ingredient) => {
        wake();
        resetIdle();
        moodTimer?.kill();
        clearExtras();
        armTo(ARM.rest, 0.6, "elastic.out(1, 0.5)");
        sy.vel -= 3.2; // gulp
        const { line, after } = FEED[ing];
        say(line, 2200);
        if (after) gsap.delayedCall(2.4, () => say(after, 1800));
        switch (ing) {
          case "milk":
            setLook(BASE.body, "#E6C8A4");
            gsap.fromTo(drops, { opacity: 1, scale: 0, y: 0 }, { scale: 1, y: -14, duration: 0.5, stagger: 0.06, ease: "back.out(3)" });
            gsap.to(drops, { opacity: 0, y: -4, delay: 0.9, duration: 0.4 });
            express("happy", "happy", "grin", 2);
            popHeart(70, 40, MILK);
            break;
          case "sugar":
            setLook(colors.sakura, "#D9A06A");
            express("stars", "up", "gape", 3.2);
            gsap.fromTo(sparkles, { opacity: 1, scale: 0, rotation: 0 }, { scale: 1, rotation: 180, duration: 0.6, stagger: 0.08, ease: "back.out(3)" });
            gsap.to(sparkles, { scale: 0.6, duration: 0.3, yoyo: true, repeat: 7, stagger: 0.1, delay: 0.6 });
            gsap.to(sparkles, { opacity: 0, scale: 0, delay: 3.2, duration: 0.3 });
            if (!reduced) [0.15, 0.62, 1.1].forEach((d) => gsap.delayedCall(d, () => hop(330)));
            wave();
            break;
          case "ice":
            setLook("#BFE0F3", "#8A5A3B");
            gsap.to(steamGroup, { autoAlpha: 0, duration: 0.4 });
            gsap.fromTo(iceCubes, { opacity: 1, scale: 0, y: -20 }, { scale: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "bounce.out" });
            express("open", "sad", "wobble", 2.4);
            armTo(ARM.hug, 0.5, "back.out(1.4)");
            gsap.delayedCall(2.6, () => armTo(ARM.rest, 0.9, "elastic.out(1, 0.5)"));
            gsap.fromTo(root.current, { x: -1.5 }, { x: 1.5, duration: 0.05, repeat: 23, yoyo: true, ease: "none", onComplete: () => void gsap.set(root.current, { x: 0 }) });
            break;
          case "espresso":
            setLook(BASE.body, "#5A3522");
            jitter(line);
            break;
          case "matcha":
            setLook(BASE.body, colors.matcha);
            express("open", "skeptical", "flat", 2.3);
            lookX.forEach((set) => set(-2.8)); // side-eye
            gsap.delayedCall(2.4, () => express("happy", "happy", "smile", 1.4));
            break;
        }
        lookReset?.kill();
        lookReset = gsap.delayedCall(LOOK_RESET_S, backToBasics);
      };

      // A tear that rolls down from the left eye.
      const tear = () => {
        if (reduced) return;
        const ns = "http://www.w3.org/2000/svg";
        const d = document.createElementNS(ns, "path");
        d.setAttribute("d", "M62 86c-1.6 2.4-2.4 3.8-2.4 5a2.4 2.4 0 0 0 4.8 0c0-1.2-.8-2.6-2.4-5z");
        d.setAttribute("fill", colors.sky);
        d.setAttribute("stroke", colors.ink);
        d.setAttribute("stroke-width", "1.4");
        face.appendChild(d);
        gsap.fromTo(d, { y: -2, opacity: 0 }, { y: 12, opacity: 1, duration: 1.1, ease: "power1.in", onComplete: () => d.remove() });
      };

      let askedForMe = false;
      const offBean = onBean((e) => {
        if (e.type === "feed") {
          askedForMe = false;
          gsap.to(eyeSets.open, { scale: 1, duration: 0.2 });
          feed(e.ingredient);
          return;
        }
        if (busy) return;
        wake();
        resetIdle();
        if (e.type === "denied") {
          askedForMe = false;
          gsap.to(eyeSets.open, { scale: 1, duration: 0.3 });
          express("open", "sad", "wobble", 2.8);
          armTo(ARM.droop, 0.7, "power2.out");
          gsap.delayedCall(2.8, () => armTo(ARM.rest, 1, "elastic.out(1, 0.5)"));
          sy.vel -= 1.8; // deflate a little
          tear();
          say("oh… ok 🥲", 2200);
          return;
        }
        // interest
        moodTimer?.kill();
        if (e.level === "close") {
          eyes("open");
          gsap.to(eyeSets.open, { scale: 1.2, duration: 0.3, ease: "back.out(2)" });
          brows("up");
          mouthTo("oh");
          armTo(ARM.clasp, 0.4, "back.out(1.8)");
          faceY(-2);
          if (!askedForMe) {
            askedForMe = true;
            sy.vel += 1.4; // perk up
            say("is that for me? 👀", 2400);
          }
        } else if (e.level === "over") {
          eyes("open");
          gsap.to(eyeSets.open, { scale: 1.35, duration: 0.25, ease: "back.out(2)" });
          brows("up");
          mouthTo("gape");
          armTo(ARM.gimme, 0.3);
          sy.vel += 1.2;
          faceY(-3);
        } else {
          // carried back out of reach, still in hand
          gsap.to(eyeSets.open, { scale: 1, duration: 0.3 });
          armTo(ARM.rest, 0.7, "elastic.out(1, 0.5)");
          express("open", "sad", "flat", 1.2);
        }
      });

      return () => {
        gsap.ticker.remove(tick);
        clearTimeout(blinkTimer);
        clearTimeout(fidgetTimer);
        clearTimeout(idleTimer);
        clearTimeout(bubbleTimer);
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("mouseout", onDocLeave);
        hit.removeEventListener("pointerenter", onEnter);
        hit.removeEventListener("pointerleave", onLeave);
        hit.removeEventListener("pointerdown", onDown);
        hit.removeEventListener("pointerup", onUp);
        hit.removeEventListener("pointercancel", onUp);
        hit.removeEventListener("click", onKeyClick);
        offBean();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`cup-buddy relative ${className ?? ""}`}>
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble}
            className="popover-card pointer-events-none bottom-full mb-1"
            data-side="top"
            style={{ x: "-50%", transformOrigin: "50% 100%" }}
            initial={{ opacity: 0, scale: 0.4, rotate: -10, y: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: -3, y: 0, transition: spring.pop }}
            exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.12 } }}
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        className="bb-hit block w-full touch-none select-none"
        aria-label="Bean the coffee cup mascot. Press to make it hop."
        data-cursor="default"
      >
        <svg viewBox="0 0 140 150" className="block w-full overflow-visible" fill="none" stroke={colors.ink} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <ellipse className="bb-shadow" cx="70" cy="126" rx="40" ry="5" fill={colors.ink} fillOpacity={0.12} stroke="none" />
          <g className="bb-body">
            <g className="bb-steam">
              <path className="bb-wisp" d="M55 38c-4.5-3.6 3.6-7.2-.4-11.6s3.2-7.4-.2-11" strokeWidth={2.6} />
              <path className="bb-wisp" d="M70 34c-4.5-3.6 3.6-7.6-.4-12s3.2-7.6-.2-11.4" strokeWidth={2.6} />
              <path className="bb-wisp" d="M85 38c-4.5-3.6 3.6-7.2-.4-11.6s3.2-7.4-.2-11" strokeWidth={2.6} />
              <path className="bb-steam-heart" d={heart(70, 6, 1)} fill={colors.tomato} strokeWidth={2} />
            </g>
            <g className="bb-sparkles" fill={colors.butter} strokeWidth={2}>
              <path d={star(18, 44, 7)} />
              <path d={star(122, 40, 6)} />
              <path d={star(12, 70, 5)} />
              <path d={star(128, 102, 6)} />
            </g>
            <ellipse className="bb-foot" cx="54" cy="118" rx="9" ry="5" fill={FOOT} />
            <ellipse cx="86" cy="118" rx="9" ry="5" fill={FOOT} />
            {/* arms behind the cup, so only the part outside the body shows */}
            <path className="bb-arm-l" />
            <path className="bb-arm-r" />
            <path className="bb-cup" d="M26 54c0 26 4 46 13 55 7 7 55 7 62 0 9-9 13-29 13-55" fill={BODY} />
            <path className="bb-rim" d="M26 54c12-12 76-12 88 0-12 12-76 12-88 0z" fill={CREMA} />
            <path d={heart(70, 51, 1.55)} fill={MILK} strokeWidth={2} />
            <g className="bb-ice" fill="#EAF6FD" strokeWidth={2.2}>
              <rect x="44" y="44" width="13" height="12" rx="3" transform="rotate(-14 50 50)" />
              <rect x="84" y="42" width="12" height="11" rx="3" transform="rotate(12 90 47)" />
            </g>
            <g className="bb-drops" fill={MILK} strokeWidth={1.8}>
              <circle cx="56" cy="44" r="3" />
              <circle cx="70" cy="38" r="3.6" />
              <circle cx="84" cy="44" r="2.8" />
            </g>
            {/* mittens in front of the cup */}
            <ellipse className="bb-hand-l" rx="5.6" ry="5" fill={BODY} strokeWidth={2.6} />
            <ellipse className="bb-hand-r" rx="5.6" ry="5" fill={BODY} strokeWidth={2.6} />
            <g className="bb-face">
              <ellipse className="bb-blush" cx="45" cy="94" rx="6" ry="3.4" fill={colors.sakura} stroke="none" opacity={0.55} />
              <ellipse className="bb-blush" cx="95" cy="94" rx="6" ry="3.4" fill={colors.sakura} stroke="none" opacity={0.55} />
              <path className="bb-brow" d="M51 72.5c3-2 7-2 10 0" strokeWidth={2.6} />
              <path className="bb-brow" d="M79 72.5c3-2 7-2 10 0" strokeWidth={2.6} />
              <g className="bb-eye">
                <ellipse cx="56" cy="83" rx="4.4" ry="5.8" fill={colors.ink} stroke="none" />
                <circle cx="57.6" cy="80.6" r="1.5" fill={MILK} stroke="none" />
              </g>
              <g className="bb-eye">
                <ellipse cx="84" cy="83" rx="4.4" ry="5.8" fill={colors.ink} stroke="none" />
                <circle cx="85.6" cy="80.6" r="1.5" fill={MILK} stroke="none" />
              </g>
              <path className="bb-eyes-happy" d="M50 85c2-5 10-5 12 0M78 85c2-5 10-5 12 0" />
              <path className="bb-eyes-squeeze" d="M51 79.5l8 3.5-8 3.5M89 79.5l-8 3.5 8 3.5" />
              <path className="bb-eyes-sleep" d="M50 82c2 4.4 10 4.4 12 0M78 82c2 4.4 10 4.4 12 0" />
              <g className="bb-eyes-stars" fill={colors.butter} strokeWidth={1.8}>
                <path d={star(56, 83, 7)} />
                <path d={star(84, 83, 7)} />
              </g>
              <g className="bb-eyes-hearts" fill={colors.tomato} strokeWidth={1.8}>
                <path d={heart(56, 81, 1.3)} />
                <path d={heart(84, 81, 1.3)} />
              </g>
              <path className="bb-mouth" d={MOUTH.smile} fill={colors.espresso} fillOpacity={0} />
            </g>
          </g>
          <g className="bb-fx" />
          <g fontFamily="var(--font-gochi)" fill={colors.ink} stroke="none" fontSize="16">
            <text className="bb-z" x="104" y="44">z</text>
            <text className="bb-z" x="112" y="34" fontSize="20">z</text>
            <text className="bb-z" x="122" y="22" fontSize="24">Z</text>
          </g>
        </svg>
      </button>
    </div>
  );
}
