"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { inkIn } from "@/lib/ink";
import { prefersReducedMotion } from "@/lib/motion";
import { colors, spring } from "@/lib/tokens";
import { profile } from "@/content/profile";
import { DOODLES, type DoodleName, ArrowDoodle, CupDoodle, KeycapDoodle, OnigiriDoodle, SakuraDoodle } from "@/components/art/doodles";
import { InlineDoodle } from "@/components/ui/InlineDoodle";
import { CupCycler } from "@/components/ui/CupCycler";
import { Sticker } from "@/components/ui/Sticker";
import { Popover } from "@/components/ui/Popover";
import { SquiggleLink } from "@/components/ui/SquiggleLink";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { RotatingBadge } from "@/components/ui/RotatingBadge";

const SWATCHES = [
  { name: "paper", hex: colors.paper, blob: "M52 6c22 2 42 16 42 40s-14 46-44 46S4 76 6 48 30 4 52 6z" },
  { name: "ink", hex: colors.ink, blob: "M48 4c26 0 46 18 44 44s-20 44-46 44S2 72 4 46 22 4 48 4z" },
  { name: "tomato", hex: colors.tomato, blob: "M50 8c24-4 44 20 42 42s-22 42-44 40S6 70 8 46 26 12 50 8z" },
  { name: "matcha", hex: colors.matcha, blob: "M46 6c28 0 46 22 44 44S72 94 46 92 4 72 6 46 18 6 46 6z" },
  { name: "espresso", hex: colors.espresso, blob: "M52 4c22 4 40 20 40 44s-18 44-44 44S6 74 6 48 30 0 52 4z" },
  { name: "sky", hex: colors.sky, blob: "M48 8c26-2 44 16 44 40S76 92 50 92 6 74 6 50 22 10 48 8z" },
  { name: "butter", hex: colors.butter, blob: "M50 6c24 0 44 20 42 44s-20 42-44 42S6 72 8 48 26 6 50 6z" },
  { name: "lilac", hex: colors.lilac, blob: "M50 6c22 2 42 20 42 44S74 94 48 92 6 72 8 48 28 4 50 6z" },
  { name: "sakura", hex: colors.sakura, blob: "M46 8c26-4 46 18 46 42S72 94 48 92 4 70 6 46 20 12 46 8z" },
];

const EASES = [
  { name: "ink", gsap: "power3.out", note: "default for everything that arrives" },
  { name: "snap", gsap: "back.out(2.2)", note: "stickers slapping down" },
  { name: "wobble", gsap: "elastic.out(1, 0.45)", note: "things you let go of" },
];

function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="mb-8 flex items-baseline gap-3">
      <span className="font-hand text-2xl text-tomato">{n}</span>
      <h2 className="font-display text-4xl tracking-tight md:text-5xl">{children}</h2>
    </div>
  );
}

function Word({ children }: { children: ReactNode }) {
  return (
    <span className="word-mask inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
      <span className="word inline-block will-change-transform">{children}</span>
    </span>
  );
}

function Swatch({ name, hex, blob }: (typeof SWATCHES)[number]) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      /* clipboard can be blocked; the flash still confirms the click */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  };
  return (
    <Popover open={copied} content={<>copied {hex} ✓</>} tilt={3}>
      <motion.button
        type="button"
        onClick={copy}
        className="group flex flex-col items-center gap-1"
        whileHover={{ y: -6, rotate: -4 }}
        whileTap={{ scale: 0.9, rotate: 6 }}
        transition={spring.pop}
        data-cursor-label="copy"
        aria-label={`Copy ${name} ${hex}`}
      >
        <svg viewBox="0 0 100 100" className="h-20 w-20 md:h-24 md:w-24">
          <path d={blob} fill={hex} stroke={colors.ink} strokeWidth="2.2" />
          <path d="M28 30c4-6 10-9 16-10" stroke="#fff" strokeOpacity={name === "paper" ? 0.9 : 0.45} strokeWidth="5" strokeLinecap="round" fill="none" />
        </svg>
        <span className="font-hand text-xl leading-none">{name}</span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{hex}</span>
      </motion.button>
    </Popover>
  );
}

function DoodleCell({ name }: { name: DoodleName }) {
  const ref = useRef<HTMLDivElement>(null);
  const Doodle = DOODLES[name];
  const reink = () => {
    const svg = ref.current?.querySelector("svg");
    if (svg && !prefersReducedMotion()) inkIn(svg, { duration: 0.4, stagger: 0.05 });
  };
  return (
    <div
      ref={ref}
      onPointerEnter={reink}
      data-cursor-label="re-ink"
      data-cursor="pointer"
      className="doodle-cell group relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 transition-colors hover:border-ink/40 hover:bg-sticker/60"
    >
      <Doodle className="ink-boil h-16 w-16 md:h-20 md:w-20" />
      <span className="absolute bottom-2 font-hand text-lg text-ink-soft opacity-0 transition-opacity group-hover:opacity-100">
        {name}
      </span>
    </div>
  );
}

function EaseLane({ name, gsap: easeName, note }: (typeof EASES)[number]) {
  const trackRef = useRef<HTMLButtonElement>(null);
  const beanRef = useRef<HTMLSpanElement>(null);
  const play = () => {
    const track = trackRef.current;
    const bean = beanRef.current;
    if (!track || !bean) return;
    const distance = track.clientWidth - bean.clientWidth - 16;
    const atEnd = gsap.getProperty(bean, "x") !== 0;
    gsap.to(bean, {
      x: atEnd ? 0 : distance,
      rotation: atEnd ? 0 : 540,
      duration: 1.1,
      ease: easeName,
      overwrite: true,
    });
  };
  return (
    <button
      ref={trackRef}
      type="button"
      onClick={play}
      data-cursor-label="play"
      className="relative flex h-16 w-full items-center rounded-full border-2 border-ink bg-sticker px-2 text-left"
    >
      <span ref={beanRef} className="relative z-10 grid h-11 w-11 place-items-center rounded-full bg-espresso text-paper">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <ellipse cx="12" cy="12" rx="6.5" ry="8.5" transform="rotate(30 12 12)" />
          <path d="M9 5.5c3 3 3 9 0 13" transform="rotate(30 12 12) translate(3 0)" />
        </svg>
      </span>
      <span className="pointer-events-none absolute inset-x-0 flex justify-center gap-3 font-mono text-xs uppercase tracking-wider text-ink-soft">
        <b className="text-ink">{name}</b> {easeName} <span className="hidden font-hand text-lg normal-case tracking-normal md:inline">— {note}</span>
      </span>
    </button>
  );
}

export function StyleTile() {
  const root = useRef<HTMLDivElement>(null);
  const noteArrowRef = useRef<SVGSVGElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const reduced = prefersReducedMotion();
      if (reduced) return;

      // contextSafe keeps the late (post-font-load) tweens inside this context, so a
      // StrictMode re-run reverts them instead of stacking a second from() on top.
      let alive = true;
      const intro = contextSafe!(() => {
        if (!alive) return;
        const tl = gsap.timeline({ delay: 0.15 });
        tl.from(".tape", { y: -40, rotation: -20, opacity: 0, duration: 0.7, ease: "back.out(2)" })
          .from(
            ".hero-title .word",
            { yPercent: 115, rotation: 7, duration: 0.9, stagger: 0.055, ease: "power4.out" },
            0.1,
          )
          .from(".hero-title .inline-doodle, .hero-title .ink-boil", { scale: 0, rotation: -40, duration: 0.7, stagger: 0.12, ease: "back.out(3)" }, 0.45)
          .from(".hero-sub", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.6)
          .add(noteArrowRef.current ? inkIn(noteArrowRef.current, { duration: 0.6 }) : gsap.timeline(), 0.9)
          .from(".margin-note-text", { opacity: 0, x: -10, duration: 0.5, ease: "power3.out" }, 1.1);
      });
      document.fonts.ready.then(intro);

      gsap.utils.toArray<HTMLElement>(".tile-section").forEach((section) => {
        gsap.from(section.children, {
          y: 50,
          opacity: 0,
          rotation: 1.5,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 80%", once: true },
        });
      });

      ScrollTrigger.batch(".doodle-cell", {
        start: "top 88%",
        once: true,
        onEnter: (cells) =>
          cells.forEach((cell, i) => {
            const svg = cell.querySelector("svg");
            if (svg) inkIn(svg, { delay: i * 0.08, duration: 0.5 });
          }),
      });

      gsap.from(".sticker-slap", {
        scale: 1.8,
        opacity: 0,
        rotation: (i: number) => (i % 2 ? 25 : -25),
        duration: 0.55,
        stagger: 0.12,
        ease: "back.out(1.6)",
        scrollTrigger: { trigger: ".sticker-row", start: "top 80%", once: true },
      });

      return () => {
        alive = false;
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mx-auto max-w-6xl px-5 pb-40 md:px-10">
      {/* ---------- Title ---------- */}
      <header className="relative pb-24 pt-20 md:pt-28">
        <div className="tape mb-10 inline-block -rotate-3 bg-butter/80 px-4 py-1 font-hand text-2xl shadow-[0_2px_0_rgba(0,0,0,0.08)]">
          round 0 · style tile
        </div>
        <h1 className="hero-title font-display text-[13vw] leading-[0.92] tracking-[-0.03em] md:text-[7.2rem]">
          <Word>A</Word>{" "}
          <CupCycler />{" "}
          <Word>sketchbook</Word> <Word>desk</Word>
          <br />
          <Word>for</Word> <Word>tiny,</Word> <Word><em>delightful</em></Word>{" "}
          <InlineDoodle name="keycap" tint={colors.tomato} note="*thock*" />{" "}
          <Word>things.</Word>
        </h1>
        <p className="hero-sub mt-8 max-w-xl text-lg text-ink-soft">
          Warm paper, black ink, die-cut stickers and doodles that never sit still. This page shows the
          building blocks. Hover, click, drag and poke everything.
        </p>
        <div className="pointer-events-none absolute right-0 top-40 hidden w-56 rotate-6 lg:block">
          <span className="margin-note-text block font-hand text-3xl leading-tight text-espresso">
            psst, the lines wobble on purpose
          </span>
          <ArrowDoodle ref={noteArrowRef} className="ink-boil -ml-10 mt-1 h-20 w-24 -scale-100 rotate-[-15deg] text-espresso" />
        </div>
      </header>

      {/* ---------- Palette ---------- */}
      <section className="tile-section py-16">
        <SectionLabel n="01">Palette</SectionLabel>
        <div className="flex flex-wrap gap-x-6 gap-y-10">
          {SWATCHES.map((s) => (
            <Swatch key={s.name} {...s} />
          ))}
        </div>
      </section>

      {/* ---------- Type ---------- */}
      <section className="tile-section py-16">
        <SectionLabel n="02">Type</SectionLabel>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Display · Instrument Serif</p>
            <p className="mt-2 font-display text-6xl leading-none tracking-tight">
              Interfaces that <em className="text-tomato">feel</em> alive.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Japanese · Noto Serif JP</p>
            <p className="mt-2 font-jp text-6xl font-bold leading-none">こんにちは</p>
            <p className="mt-2 font-hand text-xl text-ink-soft">(turns into dust → &ldquo;hello&rdquo; in the hero round)</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Body · Inter</p>
            <p className="mt-2 max-w-md text-lg leading-relaxed">
              I&apos;m a design engineer in New Delhi. I care about the 200ms nobody notices, and I drink more
              coffee than is medically advisable.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Notes · Caveat</p>
            <p className="mt-2 -rotate-2 font-hand text-4xl leading-tight text-espresso">
              margin notes, labels, little asides, and things I scribble at 2am
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Storybook · Averia Serif Libre</p>
            <p className="mt-2 font-averia text-4xl leading-tight">
              Once upon a time, a <em>very</em> caffeinated developer <b className="font-bold text-lilac [-webkit-text-stroke:1px_var(--color-ink)]">shipped</b> it.
            </p>
            <p className="mt-2 font-hand text-xl text-ink-soft">(section intros, book titles, quotes)</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Stickers & popovers · Gochi Hand</p>
            <p className="mt-2 rotate-1 font-gochi text-4xl leading-tight">
              hi! ✦ open to work ✦ 3 cups today ✦ *thock*
            </p>
            <p className="mt-2 font-hand text-xl text-ink-soft">(sticker labels, tooltips, speech bubbles)</p>
          </div>
        </div>
      </section>

      {/* ---------- Doodles ---------- */}
      <section className="tile-section py-16">
        <SectionLabel n="03">Doodles</SectionLabel>
        <p className="-mt-4 mb-8 max-w-lg text-ink-soft">
          Placeholder hand-drawn set (to be swapped for Arrow 2.0 art). Each one boils at 8fps and re-inks on hover.
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-9">
          {(Object.keys(DOODLES) as DoodleName[]).map((n) => (
            <DoodleCell key={n} name={n} />
          ))}
        </div>
      </section>

      {/* ---------- Stickers ---------- */}
      <section className="tile-section py-16">
        <SectionLabel n="04">Stickers</SectionLabel>
        <p className="-mt-4 mb-10 max-w-lg text-ink-soft">
          Die-cut border and a glossy highlight that follows your cursor, all from one SVG filter. They lift when you
          hover and squash when you press.
        </p>
        <div className="sticker-row flex flex-wrap items-center gap-8 md:gap-12">
          <div className="sticker-slap">
            <Sticker rotate={-8} label="coffee cup sticker">
              <CupDoodle tint={colors.butter} className="h-28 w-28 text-ink" />
            </Sticker>
          </div>
          <div className="sticker-slap">
            <Sticker rotate={6} label="keycap sticker">
              <KeycapDoodle tint={colors.tomato} className="h-28 w-28 text-ink" />
            </Sticker>
          </div>
          <div className="sticker-slap">
            <Sticker rotate={-4} label="sakura sticker">
              <SakuraDoodle tint={colors.sakura} className="h-28 w-28 text-ink" />
            </Sticker>
          </div>
          <div className="sticker-slap">
            <Sticker rotate={10} label="onigiri sticker">
              <OnigiriDoodle tint={colors.sticker} className="h-28 w-28 text-ink" />
            </Sticker>
          </div>
          <div className="sticker-slap">
            <Sticker rotate={-3} border={4} label="hello sticker">
              <span className="block rounded-xl bg-lilac px-4 py-2 font-gochi text-4xl text-ink">hi, it&apos;s me!</span>
            </Sticker>
          </div>
          <div className="sticker-slap">
            <RotatingBadge
              text="design engineer • new delhi • coffee • "
              center={<CupDoodle className="h-9 w-9 text-ink" />}
            />
          </div>
        </div>
      </section>

      {/* ---------- Interactions ---------- */}
      <section className="tile-section py-16">
        <SectionLabel n="05">Micro-interactions</SectionLabel>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Squiggle links</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-2xl">
              <SquiggleLink href={profile.socials.github} target="_blank" rel="noreferrer">GitHub</SquiggleLink>
              <SquiggleLink href={profile.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn</SquiggleLink>
              <SquiggleLink href={profile.resume} target="_blank" rel="noreferrer">Resume</SquiggleLink>
              <SquiggleLink href={`mailto:${profile.email}`}>Email</SquiggleLink>
            </div>
          </div>
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Magnetic buttons</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton tone="ink">Hire me ↗</MagneticButton>
              <MagneticButton tone="butter">Resume</MagneticButton>
              <MagneticButton tone="paper">Say hi 👋</MagneticButton>
            </div>
          </div>
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Sticker popovers</p>
            <p className="text-2xl leading-relaxed">
              Hover the{" "}
              <Popover content="oat flat white, obviously">
                <span tabIndex={0} className="rounded-md bg-butter/70 px-1.5" data-cursor="pointer">coffee</span>
              </Popover>
              , the{" "}
              <Popover content={<>linear switches,<br />lubed by hand</>} tilt={4}>
                <span tabIndex={0} className="rounded-md bg-tomato/40 px-1.5" data-cursor="pointer">keyboard</span>
              </Popover>{" "}
              and the{" "}
              <Popover content="currently: Frieren" tilt={-6}>
                <span tabIndex={0} className="rounded-md bg-sakura/60 px-1.5" data-cursor="pointer">anime</span>
              </Popover>
              .
            </p>
          </div>
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Cursor states</p>
            <div className="grid grid-cols-3 gap-3">
              <div data-cursor="view" className="grid h-28 place-items-center rounded-2xl border-2 border-ink bg-sky/60 font-hand text-2xl">view</div>
              <div data-cursor="drag" className="grid h-28 place-items-center rounded-2xl border-2 border-ink bg-tomato/50 font-hand text-2xl">drag</div>
              <input
                aria-label="Type something"
                placeholder="text…"
                className="h-28 rounded-2xl border-2 border-ink bg-sticker px-4 font-hand text-2xl outline-none placeholder:text-ink-soft/60"
              />
            </div>
            <p className="font-hand text-xl text-ink-soft">
              also: click anywhere for ink sparks, and move fast to see the ring stretch
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Motion tokens ---------- */}
      <section className="tile-section py-16">
        <SectionLabel n="06">Motion tokens</SectionLabel>
        <p className="-mt-4 mb-8 max-w-lg text-ink-soft">Click a lane to roll the bean. Three eases cover almost everything on the site.</p>
        <div className="space-y-4">
          {EASES.map((e) => (
            <EaseLane key={e.name} {...e} />
          ))}
        </div>
      </section>
    </div>
  );
}
