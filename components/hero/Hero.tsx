"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { inkIn } from "@/lib/ink";
import { prefersReducedMotion } from "@/lib/motion";
import { colors } from "@/lib/tokens";
import { profile } from "@/content/profile";
import { ArrowDoodle, KeycapDoodle, OnigiriDoodle, SakuraDoodle } from "@/components/art/doodles";
import { CupTopDown } from "@/components/art/cups";
import { INGREDIENTS } from "@/components/art/ingredients";
import type { Ingredient } from "@/components/mascot/beanBus";
import { DustText } from "@/components/hero/DustText";
import { CupBuddy } from "@/components/mascot/CupBuddy";
import { CupCycler } from "@/components/ui/CupCycler";
import { DraggableSticker, type StickerShape } from "@/components/ui/DraggableSticker";
import { InlineDoodle } from "@/components/ui/InlineDoodle";
import { RotatingBadge } from "@/components/ui/RotatingBadge";

// Stable references: DustText rebuilds its particle clouds when these change.
const HELLO_JP = { text: "こんにちは", fontClass: "font-jp", weight: 700 };
const HELLO_EN = { text: "hello there", fontClass: "font-display", italic: true, scale: 1.45, dy: 0.02 };

/** Faint margin scribbles, like the move notation on the chessboard reference. */
const SCRIBBLES = [
  { text: "v2.0", className: "left-[3%] top-[22%] -rotate-6" },
  { text: "3 cups deep", className: "left-[58%] top-[62%] rotate-3" },
  { text: "60fps or bust", className: "right-[30%] top-[52%] -rotate-3" },
  { text: "ctrl+z", className: "left-[38%] bottom-[16%] rotate-6" },
  { text: "margin: 0 auto;", className: "right-[3%] top-[34%] rotate-2" },
  { text: "wip ✦", className: "left-[1.5%] bottom-[30%] -rotate-12" },
];

/** Onigiri outline (apex + rounded base) in 0–1 box coords, so its peel lifts the left slope. */
const ONIGIRI_SHAPE: StickerShape = [[0.5, 0.12], [0.14, 0.8], [0.86, 0.8]];

/** Ingredient stickers near Bean. Phone shows the first three. */
const PANTRY: { kind: Ingredient; rotate: number; className: string; shape?: StickerShape }[] = [
  { kind: "milk", shape: "rect", rotate: -8, className: "left-[5%] bottom-[13%] md:left-auto md:right-[38%] md:bottom-[5%]" },
  { kind: "sugar", rotate: 10, className: "left-[21%] bottom-[12%] md:left-auto md:right-[34%] md:bottom-[4%]" },
  { kind: "ice", rotate: -4, className: "left-[37%] bottom-[13%] md:left-auto md:right-[30%] md:bottom-[5.5%]" },
  { kind: "espresso", rotate: 14, className: "hidden md:block md:right-[26%] md:bottom-[4%]" },
  { kind: "matcha", rotate: -10, className: "hidden md:block md:right-[22%] md:bottom-[5%]" },
];

function Word({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className="word-mask inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
      <span className={`word inline-block will-change-transform ${className ?? ""}`}>{children}</span>
    </span>
  );
}

/** Words for a phrase, each masked for the rise-in. */
function Words({ text, className }: { text: string; className?: string }) {
  const parts = text.split(" ");
  return (
    <>
      {parts.map((w, i) => (
        <span key={i}>
          <Word className={className}>{w}</Word>
          {i < parts.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const hintArrowRef = useRef<SVGSVGElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const q = gsap.utils.selector(root);
      if (prefersReducedMotion()) return;

      let alive = true;
      const intro = contextSafe!(() => {
        if (!alive) return;
        const tl = gsap.timeline({ delay: 0.25 });
        tl.from(q(".hero-line .word"), { yPercent: 118, rotation: 6, duration: 0.95, stagger: 0.035, ease: "power4.out" }, 0.35)
          .from(q(".hero-line .ink-boil"), { scale: 0, rotation: -45, duration: 0.7, stagger: 0.1, ease: "back.out(3)" }, 0.75)
          .from(
            q(".sticker-anchor"),
            {
              scale: 1.9,
              opacity: 0,
              rotation: (i: number) => (i % 2 ? 22 : -22),
              duration: 0.55,
              stagger: 0.09,
              ease: "back.out(1.7)",
            },
            1.0,
          )
          .from(q(".hero-scribble"), { opacity: 0, y: 8, duration: 0.5, stagger: 0.06, ease: "power2.out" }, 1.5)
          .from(q(".hero-hint-text"), { opacity: 0, x: -8, duration: 0.5, ease: "power3.out" }, 1.7)
          .add(hintArrowRef.current ? inkIn(hintArrowRef.current, { duration: 0.5 }) : gsap.timeline(), 1.6)
          .from(q(".pantry-label"), { opacity: 0, y: 6, duration: 0.5 }, 2.2)
          .from(q(".hero-foot > *"), { y: 16, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, 1.8);
      });
      document.fonts.ready.then(intro);

      // Scroll-away parallax: foreground things leave faster than the text.
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(q(".hero-dust"), { yPercent: -35, ease: "none", scrollTrigger: st });
      gsap.to(q(".hero-line"), { y: -60, ease: "none", scrollTrigger: st });
      q(".sticker-anchor").forEach((el) => {
        const depth = Number((el as HTMLElement).dataset.depth ?? 0.4);
        gsap.to(el, { y: -260 * depth, ease: "none", scrollTrigger: st });
      });

      return () => {
        alive = false;
      };
    },
    { scope: root },
  );

  const hideHint = () => gsap.to(".hero-hint", { opacity: 0, y: -6, duration: 0.3, overwrite: true });

  return (
    <section ref={root} id="top" className="hero relative flex min-h-dvh flex-col overflow-hidden px-5 pb-8 pt-52 md:px-10 md:pt-60">
      {/* margin scribbles */}
      {SCRIBBLES.map((s) => (
        <span
          key={s.text}
          aria-hidden
          className={`hero-scribble pointer-events-auto absolute hidden font-hand text-xl text-ink/30 transition-colors duration-300 hover:text-tomato md:block ${s.className}`}
        >
          {s.text}
        </span>
      ))}

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col">
        {/* dust hello */}
        <div className="relative">
          <div className="hero-hint pointer-events-none absolute -top-12 left-[min(62vw,780px)] hidden items-start gap-1 md:flex">
            <ArrowDoodle ref={hintArrowRef} className="ink-boil mt-3 h-12 w-14 rotate-[150deg] text-espresso" />
            <span className="hero-hint-text -rotate-3 font-hand text-2xl text-espresso">click me, it&apos;s dust</span>
          </div>
          <div className="hero-dust max-w-[1000px]" onClick={hideHint}>
            <DustText a={HELLO_JP} b={HELLO_EN} label="こんにちは — hello there" maxSize={200} />
          </div>
        </div>

        {/* intro line */}
        <h1 className="hero-line mt-6 max-w-[21ch] font-display text-[clamp(2.3rem,5.4vw,5rem)] leading-[1.04] tracking-[-0.02em] md:mt-10">
          <Words text="I'm Ishmeet" /> <CupCycler className="h-[0.92em] w-[0.92em]" start={3} />
          {/* no space, and a small pull-in: the comma hugs the cup's drawing, not its box */}
          <span className="-ml-[0.08em]">
            <Words text=", a design engineer" />
          </span>{" "}
          <InlineDoodle name="keycap" tint={colors.tomato} note="*thock*" className="h-[0.9em] w-[0.9em]" />{" "}
          <Words text="building interfaces that feel" /> <Words text="alive" className="italic" />{" "}
          <InlineDoodle name="sparkle" tint={colors.butter} note="✦ the good kind of extra ✦" className="h-[0.8em] w-[0.8em]" />{" "}
          <Words text="and sweating the 200ms nobody notices." className="text-ink/35" />
        </h1>

        {/* footer row */}
        <div className="hero-foot mt-auto flex flex-wrap items-end justify-between gap-4 pt-10">
          <a
            href={`mailto:${profile.email}`}
            className="group inline-flex items-center gap-3 rounded-full border-2 border-ink bg-sticker px-4 py-2 text-sm font-medium shadow-[3px_3px_0_var(--color-ink)] transition-shadow duration-200 hover:shadow-[6px_6px_0_var(--color-ink)]"
            data-cursor="default"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-matcha opacity-70" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-matcha" />
            </span>
            open to work — say hi
          </a>
          <span className="scroll-cue flex items-center gap-2 font-hand text-2xl text-ink-soft">
            scroll
            <svg viewBox="0 0 24 24" className="h-6 w-6 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4c-.6 5 .4 10 0 15M6.5 13.5c2 2 3.8 3.6 5.5 5.5 1.6-2 3.4-3.6 5.5-5.4" />
            </svg>
          </span>
          <span className="hidden font-mono text-xs uppercase tracking-wider text-ink-soft md:block">
            {profile.location} · est. 2019
          </span>
        </div>
      </div>

      {/* draggable stickers */}
      <DraggableSticker label="open to work badge" rotate={0} depth={0.6} className="right-[4%] top-[13%] hidden md:block">
        <RotatingBadge text="open to work • design engineer • " size={128} color={colors.lilac} center={<SakuraDoodle tint={colors.sakura} className="h-10 w-10" />} />
      </DraggableSticker>
      <DraggableSticker label="onigiri sticker" shape={ONIGIRI_SHAPE} rotate={12} depth={0.9} className="left-[8%] bottom-[32%] md:left-auto md:bottom-auto md:right-[17%] md:top-[40%]">
        <OnigiriDoodle tint={colors.sticker} className="h-20 w-20 text-ink md:h-24 md:w-24" />
      </DraggableSticker>
      <DraggableSticker label="latte art sticker" rotate={-10} depth={0.35} className="right-[27%] bottom-[30%] hidden lg:block">
        <CupTopDown tint={colors.sky} className="h-28 w-28 text-ink" />
      </DraggableSticker>
      <DraggableSticker label="keycap sticker" shape="rect" rotate={-14} depth={0.75} className="right-[6%] top-[4%] md:right-[16%] md:top-[12%]">
        <KeycapDoodle tint={colors.tomato} className="h-16 w-16 text-ink md:h-20 md:w-20" />
      </DraggableSticker>
      <DraggableSticker label="hi it's me sticker" shape="rect" rotate={6} depth={0.5} className="left-[40%] bottom-[25%] md:left-auto md:bottom-auto md:right-[3%] md:top-[45%]" border={4}>
        <span className="block rounded-xl bg-lilac px-3 py-1 font-gochi text-2xl text-ink md:px-4 md:py-1.5 md:text-3xl">hi, it&apos;s me!</span>
      </DraggableSticker>

      {/* pantry: drag onto Bean */}
      <span aria-hidden className="pantry-label pointer-events-none absolute bottom-[21%] left-[8%] -rotate-3 font-hand text-xl text-espresso md:bottom-[13%] md:left-auto md:right-[30%] md:text-2xl">
        feed Bean ↘
      </span>
      {PANTRY.map(({ kind, rotate, className, shape }) => {
        const { Art, label } = INGREDIENTS[kind];
        return (
          <DraggableSticker key={kind} feeds={kind} shape={shape} label={label} rotate={rotate} depth={0.15} border={4} className={className}>
            <Art className="h-11 w-11 text-ink md:h-12 md:w-12" />
          </DraggableSticker>
        );
      })}

      {/* mascot */}
      <div className="absolute bottom-16 right-4 z-10 w-28 md:bottom-10 md:right-[5%] md:w-40">
        <CupBuddy introDelay={1.4} />
      </div>
    </section>
  );
}
