"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { play, setSoundEnabled, useSoundEnabled } from "@/lib/sound";
import { colors, spring } from "@/lib/tokens";
import { profile } from "@/content/profile";
import { getLenis } from "@/components/providers/SmoothScroll";
import { ME } from "@/components/art/me";

// Hobbies (coffee, books, keyboards) live inside "about".
type LinkId = "about" | "work" | "connect";
const LINKS: { id: LinkId; href: string }[] = [
  { id: "about", href: "#about" },
  { id: "work", href: "#work" },
  { id: "connect", href: "#contact" },
];

const INK = colors.ink;
/** The doodle's box, px. */
const HEAD = 72;

// ---------- Ishmeet, doodled in plain ink (after Jackie's head doodle, with a cap instead of
// hair). At rest only the tiny face shows, as the logo mark; on hover the head draws in around it.

const MOUTH = {
  smile: "M27.4 42.4C29.8 45.4 34.2 45.4 36.6 42.4",
  grin: "M26.8 41.4C26.8 47.6 37.2 47.6 37.2 41.4 34 42.6 30 42.6 26.8 41.4Z",
  oh: "M30 44C30 47 34 47 34 44 34 41 30 41 30 44Z",
};

function Buddy() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full overflow-visible" fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* work: ID badge around the head, hanging from a cord + a wide strap tucked over its top */}
      <g className="bd-badge" opacity={0}>
        {/* lanyard: two straps opening up toward the neck, with a stitch line down each */}
        <path d="M27.4 -6 14.6 -50h7.6L32.6 -6z" fill={colors.paper} strokeWidth={2.2} />
        <path d="M36.6 -6 49.4 -50h-7.6L31.4 -6z" fill={colors.paper} strokeWidth={2.2} />
        <path d="M24.6 -12 18.8 -42M39.4 -12 45.2 -42" strokeWidth={1.2} strokeDasharray="2.4 3" />
        {/* clip + ring */}
        <circle cx="32" cy="-7" r="3.6" fill={colors.paper} strokeWidth={2.2} />
        <rect x="28.4" y="-4.4" width="7.2" height="8.6" rx="1.6" fill={colors.paper} strokeWidth={2.2} />
        {/* the card, its punched slot, and "name" lines under the face */}
        <rect x="4" y="0" width="56" height="72" rx="6" fill={colors.paper} strokeWidth={2.8} />
        <rect x="26" y="4" width="12" height="3.2" rx="1.6" strokeWidth={1.8} />
        <path d="M21 60.4h22M25.4 65.6h13.2" strokeWidth={2.4} strokeOpacity={0.45} />
        {/* motion ticks */}
        <path d="M-12 12l7 2M-8 1l4.4 5.6M1.4 -4l.8 6.6" strokeWidth={2.6} />
      </g>
      <g className="bd-full">
        {/* spiky hair, face, ears (Jackie's head doodle) */}
        <path d={ME.hair} />
        <path d={ME.face} />
        <path d={ME.ears} />
      </g>
      <g className="bd-mark">
        <g className="bd-eyes">
          <circle className="bd-eye" cx="27.4" cy="36" r="1.9" fill={INK} stroke="none" />
          <circle className="bd-eye" cx="36.6" cy="36" r="1.9" fill={INK} stroke="none" />
        </g>
        <path className="bd-happy" d="M25.4 36.8c1-1.8 3-1.8 4 0M34.6 36.8c1-1.8 3-1.8 4 0" strokeWidth={2.2} opacity={0} />
        <path className="bd-mouth" d={MOUTH.smile} fill={INK} fillOpacity={0} />
      </g>
    </svg>
  );
}

// ---------- props that appear around the doodle for each link

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" aria-hidden>
      <path d="M12 2.5c.8 6.2 3.2 8.8 9.5 9.5-6.3.7-8.7 3.3-9.5 9.5-.8-6.2-3.2-8.8-9.5-9.5 6.3-.7 8.7-3.3 9.5-9.5z" />
    </svg>
  );
}

const pop = {
  initial: { scale: 0, opacity: 0, rotate: -30 },
  animate: { scale: 1, opacity: 1, rotate: 0 },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.12 } },
};

function AboutProps() {
  return (
    <>
      <motion.div className="absolute -left-11 top-1" {...pop} transition={{ ...spring.pop, delay: 0.12 }}>
        <Sparkle className="h-7 w-7 -rotate-12" />
      </motion.div>
      <motion.svg className="absolute -right-9 top-5 h-7 w-7" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" {...pop} transition={{ ...spring.pop, delay: 0.18 }} aria-hidden>
        <path d="M5 20c3.4-2.2 6.8-6.6 7.6-10.2.6-2.4-1.6-3.4-2.8-1.4-1.6 2.6.4 6 3.8 5.8 2.2-.2 4-1.6 5.4-3.6" />
      </motion.svg>
      <motion.svg className="absolute -left-8 -bottom-7 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" {...pop} transition={{ ...spring.pop, delay: 0.22 }} aria-hidden>
        <path d="M3 8l6 3M8 18l3-5M15 20l-1-6" />
      </motion.svg>
    </>
  );
}

// Module-level so re-renders don't hand motion a "new" animation and restart it.
const CURSOR_ANIM = {
  initial: { x: 18, y: 14, opacity: 0 },
  animate: { x: 0, y: 0, opacity: 1, scale: [1, 1, 0.8, 1] },
  exit: { opacity: 0, transition: { duration: 0.1 } },
  // fade/slide in, then a separate "click" squish on scale
  transition: { delay: 0.75, duration: 0.35, ease: "easeOut" as const, scale: { delay: 1.1, duration: 0.3, times: [0, 0.3, 0.6, 1] } },
};

function WorkProps() {
  return (
    <motion.svg
      className="absolute -right-5 top-10 h-7 w-7"
      viewBox="0 0 24 24"
      fill={colors.paper}
      stroke={INK}
      strokeWidth={2.2}
      strokeLinejoin="round"
      {...CURSOR_ANIM}
      aria-hidden
    >
      <path d="M5 3l13 7-5.6 1.8L10 17z" />
    </motion.svg>
  );
}

function Social({ href, label, children, i }: { href: string; label: string; children: ReactNode; i: number }) {
  return (
    <motion.a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel="noreferrer"
      aria-label={label}
      className="pointer-events-auto grid h-9 w-9 place-items-center"
      initial={{ opacity: 0, x: -16, scale: 0.5, rotate: -20 }}
      animate={{ opacity: 1, x: 0, scale: 1, rotate: (i % 2 ? 1 : -1) * 6 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.1 } }}
      transition={{ ...spring.pop, delay: 0.08 + i * 0.07 }}
      whileHover={{ scale: 1.2, rotate: 0 }}
      onPointerEnter={() => play("tick")}
      data-cursor="pointer"
    >
      {children}
    </motion.a>
  );
}

function ConnectProps() {
  const icon = "h-7 w-7";
  return (
    <div className="absolute -right-[92px] -top-3 grid grid-cols-2 gap-1">
      <Social href={profile.socials.github} label="GitHub" i={0}>
        <svg viewBox="0 0 24 24" className={icon} fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.4 19.6v-2.2c-2.6.6-3.2-1-3.6-1.8M14.6 19.6v-2.6c0-.8-.2-1.4-.8-1.8 2.2-.2 4-1.2 4-4.2 0-.8-.2-1.6-.8-2.2.2-.6.2-1.4-.2-2.2 0 0-.8-.2-2.4.8a8 8 0 0 0-4 0C8.8 6.4 8 6.6 8 6.6c-.4.8-.4 1.6-.2 2.2-.6.6-.8 1.4-.8 2.2 0 3 1.8 4 4 4.2-.4.4-.6.8-.6 1.4" />
        </svg>
      </Social>
      <Social href={profile.socials.linkedin} label="LinkedIn" i={1}>
        <span className="font-gochi text-[26px] leading-none text-transparent [-webkit-text-stroke:1.4px_var(--color-ink)]">in</span>
      </Social>
      <Social href={profile.socials.instagram} label="Instagram" i={2}>
        <svg viewBox="0 0 24 24" className={icon} fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17 7v.1" strokeWidth={2.6} />
        </svg>
      </Social>
      <Social href={`mailto:${profile.email}`} label="Email" i={3}>
        <svg viewBox="0 0 24 24" className={icon} fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="5.6" width="18" height="13" rx="2.4" />
          <path d="M3.6 7l8.4 6 8.4-6" />
        </svg>
      </Social>
    </div>
  );
}

const PROPS: Record<LinkId, () => ReactNode> = {
  about: AboutProps,
  work: WorkProps,
  connect: ConnectProps,
};

// ---------- the scribbled oval around a hovered word

/** Loop drawn on a 120×50 grid; the tail overshoots past the start like a quick pen circle. */
const OVAL = [96, 8, 80, 1, 30, 1, 12, 12, 0, 20, 4, 38, 30, 44, 56, 50, 100, 47, 114, 36, 124, 28, 118, 14, 100, 8, 94, 6, 88, 6, 84, 7];

/** The loop scaled to real pixels, so the stroke stays even and DrawSVG can measure it. */
function ovalPath(w: number, h: number) {
  const sx = w / 120;
  const sy = h / 50;
  const p = OVAL.map((v, i) => (i % 2 ? v * sy : v * sx).toFixed(1));
  let d = `M${p[0]} ${p[1]}`;
  for (let i = 2; i < p.length; i += 6) d += `C${p[i]} ${p[i + 1]} ${p[i + 2]} ${p[i + 3]} ${p[i + 4]} ${p[i + 5]}`;
  return d;
}

function Oval({ drawn, tilt }: { drawn: boolean; tilt: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const svg = svgRef.current;
    const path = ref.current;
    if (!svg || !path) return;
    if (drawn) {
      const { width, height } = svg.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      path.setAttribute("d", ovalPath(width, height));
    }
    if (prefersReducedMotion()) {
      gsap.set(path, { drawSVG: drawn ? "0% 100%" : "0% 0%" });
      return;
    }
    if (drawn) gsap.fromTo(path, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.45, ease: "power2.inOut", overwrite: true });
    else gsap.to(path, { drawSVG: "100% 100%", duration: 0.25, ease: "power2.in", overwrite: true });
  }, [drawn]);
  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="pointer-events-none absolute -left-5 -top-3 h-[calc(100%+24px)] w-[calc(100%+40px)] overflow-visible"
      style={{ rotate: `${tilt}deg` }}
    >
      <path ref={ref} fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" style={{ strokeDasharray: "0 999" }} />
    </svg>
  );
}

const TILTS: Record<LinkId, number> = { about: -2, work: 3, connect: 2 };
/** Extra height above some links, so bigger props (the work badge) clear the oval. */
const LIFT: Partial<Record<LinkId, number>> = { work: 0 };
/** Doodle scale above each link (the work badge is big, so it shrinks there). */
const SIZE: Partial<Record<LinkId, number>> = { work: 0.74 };

// ---------- nav

/**
 * Minimal handwritten nav (after jackiezhang.co.za). A line-drawn doodle of Ishmeet sits as
 * the logo; hovering a link circles it with a scribbled oval and the doodle flies up above it,
 * fills in as a full portrait, and brings a prop for that link. Links whose section doesn't exist yet say so in red.
 */
export function Nav() {
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLAnchorElement>(null);
  const buddyRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Partial<Record<LinkId, HTMLAnchorElement | null>>>({});
  const activeRef = useRef<LinkId | null>(null);
  const [active, setActive] = useState<LinkId | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [missing, setMissing] = useState<Partial<Record<LinkId, boolean>>>({});
  const [nudge, setNudge] = useState<LinkId | null>(null);
  const sound = useSoundEnabled();

  // Which sections exist yet (re-checked on hover, so this updates as rounds land).
  const checkMissing = () =>
    setMissing(Object.fromEntries(LINKS.map((l) => [l.id, !document.querySelector(l.href)])) as Record<LinkId, boolean>);
  useEffect(() => {
    const id = requestAnimationFrame(checkMissing);
    return () => cancelAnimationFrame(id);
  }, []);

  /** Where the doodle's 56px box goes, in the nav's coordinate space. */
  const spotFor = (id: LinkId | null) => {
    const root = rootRef.current!.getBoundingClientRect();
    if (!id) {
      const m = markRef.current!.getBoundingClientRect();
      return { x: m.left - root.left + m.width / 2 - HEAD / 2, y: m.top - root.top + m.height / 2 - HEAD / 2, cx: 0, cy: 0 };
    }
    const r = itemRefs.current[id]!.getBoundingClientRect();
    const cx = r.left - root.left + r.width / 2;
    const top = r.top - root.top - (LIFT[id] ?? 0);
    return { x: cx - HEAD / 2, y: top - HEAD - 12, cx, cy: top };
  };

  // Only ever called from event handlers.
  const faceTimer = useRef<gsap.core.Tween | null>(null);

  /** Expression for the face: eyes (open/happy), mouth shape, optional wink; drifts back after `hold`. */
  const express = (eyes: "open" | "happy", mouth: keyof typeof MOUTH, hold = 0, wink = false) => {
    const buddy = buddyRef.current;
    if (!buddy) return;
    const q = gsap.utils.selector(buddy);
    gsap.to(q(".bd-eyes"), { opacity: eyes === "open" ? 1 : 0, duration: 0.08, overwrite: "auto" });
    gsap.to(q(".bd-happy"), { opacity: eyes === "happy" ? 1 : 0, duration: 0.08, overwrite: "auto" });
    gsap.to(q(".bd-mouth"), { morphSVG: MOUTH[mouth], fillOpacity: mouth === "smile" ? 0 : 1, duration: 0.25, ease: "power3.out", overwrite: "auto" });
    if (wink) {
      const right = q(".bd-eye")[1];
      gsap.fromTo(right, { scaleY: 1, transformOrigin: "50% 50%" }, { scaleY: 0.1, duration: 0.08, yoyo: true, repeat: 1, repeatDelay: 0.35 });
    }
    faceTimer.current?.kill();
    if (hold) faceTimer.current = gsap.delayedCall(hold, () => express("open", "smile"));
  };

  const flyTo = (id: LinkId | null) => {
    const buddy = buddyRef.current;
    if (!buddy) return;
    const q = gsap.utils.selector(buddy);
    const s = spotFor(id);
    const reduced = prefersReducedMotion();
    const fromX = gsap.getProperty(buddy, "x") as number;
    const badge = q(".bd-badge");
    if (id) setAnchor({ x: s.cx, y: s.cy });

    // The badge is part of the doodle: over "work" it's simply there, travelling with the head.
    gsap.set(badge, { opacity: id === "work" ? 1 : 0, y: 0 });
    gsap.to(buddy, {
      x: s.x,
      y: s.y,
      scale: id ? (SIZE[id] ?? 1) : 0.7,
      // lean into the direction of travel, then settle
      rotation: reduced ? 0 : gsap.utils.clamp(-18, 18, (s.x - fromX) / 12),
      duration: reduced ? 0 : 0.55,
      ease: "back.out(1.3)",
      overwrite: "auto",
      onComplete: () => void gsap.to(buddy, { rotation: id ? 0 : -14, duration: 0.5, ease: "elastic.out(1, 0.45)" }),
    });
    // Draw the head in around the face when it lands above a link; just the face at rest.
    gsap.to(q(".bd-full"), {
      scale: id ? 1 : 0,
      opacity: id ? 1 : 0,
      transformOrigin: "50% 60%",
      duration: id ? 0.45 : 0.2,
      delay: id ? 0.15 : 0,
      ease: id ? "back.out(2.2)" : "power2.in",
      overwrite: "auto",
    });
    // A face for each link.
    if (id === "about") express("happy", "grin", 1.1);
    else if (id === "work") express("open", "grin");
    else if (id === "connect") express("open", "grin", 0, true);
    else express("open", "smile");
  };

  // Eyes follow the cursor; random blinks.
  useEffect(() => {
    const buddy = buddyRef.current;
    if (!buddy || prefersReducedMotion()) return;
    const eyes = buddy.querySelectorAll(".bd-eye");
    const ex = [...eyes].map((e) => gsap.quickTo(e, "x", { duration: 0.25, ease: "power3.out" }));
    const ey = [...eyes].map((e) => gsap.quickTo(e, "y", { duration: 0.25, ease: "power3.out" }));
    const onMove = (e: PointerEvent) => {
      const r = buddy.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.56);
      const d = Math.hypot(dx, dy) || 1;
      const m = (d / (d + 120)) * 1.7;
      ex.forEach((f) => f((dx / d) * m));
      ey.forEach((f) => f((dy / d) * m));
    };
    let blinkTimer: ReturnType<typeof setTimeout>;
    const blink = () => {
      gsap.fromTo(eyes, { scaleY: 1, transformOrigin: "50% 50%" }, { scaleY: 0.1, duration: 0.06, yoyo: true, repeat: Math.random() < 0.2 ? 3 : 1 });
      blinkTimer = setTimeout(blink, 2400 + Math.random() * 3200);
    };
    blinkTimer = setTimeout(blink, 2000);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      clearTimeout(blinkTimer);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // Park the doodle on the mark on mount and whenever layout shifts.
  useEffect(() => {
    const park = () => {
      const buddy = buddyRef.current;
      if (!buddy || activeRef.current) return;
      const s = spotFor(null);
      gsap.set(buddy, { x: s.x, y: s.y, scale: 0.7, rotation: -14 });
      gsap.set(buddy.querySelector(".bd-full"), { scale: 0, opacity: 0, transformOrigin: "50% 60%" });
    };
    park();
    document.fonts.ready.then(park);
    window.addEventListener("resize", park);
    return () => window.removeEventListener("resize", park);
  }, []);

  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const leaveSoon = () => {
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(leaveAll, 140);
  };

  const enter = (id: LinkId) => {
    clearTimeout(leaveTimer.current);
    if (id === activeRef.current) return;
    activeRef.current = id;
    checkMissing();
    setActive(id);
    flyTo(id);
    play("tick");
  };
  const leaveAll = () => {
    if (!activeRef.current) return;
    activeRef.current = null;
    setActive(null);
    flyTo(null);
  };

  const onClick = (e: React.MouseEvent, id: LinkId, href: string) => {
    e.preventDefault();
    express("open", "oh", 0.6);
    const target = document.querySelector(href);
    if (target) {
      getLenis()?.scrollTo(target as HTMLElement, { offset: -40, duration: 1.4 });
      return;
    }
    if (id === "connect") {
      // no contact section yet: the socials are the destination (tap shows them on touch)
      enter(id);
      return;
    }
    enter(id);
    setNudge(id);
    play("pop");
    const el = itemRefs.current[id];
    if (el && !prefersReducedMotion()) gsap.fromTo(el, { rotation: -6 }, { rotation: 0, duration: 0.6, ease: "elastic.out(1.2, 0.3)" });
    setTimeout(() => setNudge(null), 900);
  };

  const Props = active ? PROPS[active] : null;

  return (
    <header className="site-nav pointer-events-none absolute inset-x-0 top-0 z-[58] px-5 md:px-34 lg:px-42" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div ref={rootRef} className="relative mx-auto flex h-[190px] max-w-7xl items-end justify-center pb-5" onPointerLeave={() => leaveSoon()}>
        <nav aria-label="Main" className="relative flex items-end gap-6 md:gap-14">
        <a
          ref={markRef}
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            getLenis()?.scrollTo(0, { duration: 1.2 });
          }}
          onPointerEnter={leaveAll}
          className="pointer-events-auto absolute bottom-0 right-full -mb-1 mr-5 block h-11 w-11 md:mr-12"
          aria-label={`${profile.firstName}, back to top`}
        >
          {/* The doodle parks here as the logo (see the stage below); this box reserves the slot. */}
        </a>

          {LINKS.map(({ id, href }) => (
            <a
              key={id}
              ref={(el) => void (itemRefs.current[id] = el)}
              href={href}
              onPointerEnter={(e) => e.pointerType === "mouse" && enter(id)}
              onFocus={() => enter(id)}
              onClick={(e) => onClick(e, id, href)}
              className="pointer-events-auto relative px-1 font-gochi text-[21px] leading-none md:text-[26px]"
              data-cursor="default"
            >
              <Oval drawn={active === id} tilt={TILTS[id]} />
              <span className="relative">{id}</span>
              <AnimatePresence>
                {(active === id || nudge === id) && missing[id] && id !== "connect" && (
                  <motion.span
                    className="absolute left-1/2 top-full mt-3 whitespace-nowrap font-gochi text-base text-tomato md:text-lg"
                    style={{ x: "-50%" }}
                    initial={{ opacity: 0, y: -6, rotate: -8 }}
                    animate={{ opacity: 1, y: 0, rotate: -3, scale: nudge === id ? [1, 1.25, 1] : 1 }}
                    exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                    transition={spring.pop}
                  >
                    coming soon
                  </motion.span>
                )}
              </AnimatePresence>
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => {
            setSoundEnabled(!sound);
            setTimeout(() => play("toggle"), 30);
          }}
          onPointerEnter={leaveAll}
          aria-pressed={sound}
          className="pointer-events-auto absolute bottom-5 right-0 mb-0.5 hidden items-center gap-1.5 font-gochi text-lg text-ink-soft transition-colors hover:text-ink md:flex"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 9.4h3.2L12 5.6v12.8l-4.8-3.8H4z" />
            {sound ? <path d="M15.4 9.2c1.4 1.6 1.4 4 0 5.6M17.8 6.8c2.8 3 2.8 7.4 0 10.4" /> : <path d="M15.6 10l4 4M19.6 10l-4 4" />}
          </svg>
          sound {sound ? "on" : "off"}
        </button>

        {/* ---------- stage: the active link's props (under) and the doodle (over) ---------- */}
        <AnimatePresence>
          {Props && anchor && (
            <motion.div
              key={active}
              className="pointer-events-none absolute z-[1]"
              style={{ left: anchor.x - HEAD / 2, top: anchor.y - HEAD - 12, width: HEAD, height: HEAD }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              <Props />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={buddyRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-[2]" style={{ width: HEAD, height: HEAD }}>
          <Buddy />
        </div>
      </div>
    </header>
  );
}
