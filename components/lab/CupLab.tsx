"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { inkIn } from "@/lib/ink";
import { prefersReducedMotion } from "@/lib/motion";
import { CUP_OPTIONS } from "@/components/art/cups";
import { Sticker } from "@/components/ui/Sticker";

function Option({ id, name, note, Cup, tint }: (typeof CUP_OPTIONS)[number]) {
  const lineRef = useRef<HTMLDivElement>(null);
  const reink = () => {
    const svg = lineRef.current?.querySelector("svg");
    if (svg && !prefersReducedMotion()) inkIn(svg, { duration: 0.45, stagger: 0.05 });
  };
  return (
    <article className="cup-card rounded-3xl border-2 border-ink bg-sticker/70 p-6 shadow-[4px_5px_0_var(--color-ink)]">
      <header className="flex items-baseline gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-ink font-gochi text-2xl text-paper">{id}</span>
        <h2 className="font-display text-3xl">{name}</h2>
      </header>
      <p className="mt-1 font-hand text-xl text-ink-soft">{note}</p>
      <div className="mt-4 grid grid-cols-2 items-center gap-4">
        <div
          ref={lineRef}
          onPointerEnter={reink}
          data-cursor-label="re-ink"
          data-cursor="pointer"
          className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-ink/15"
        >
          <Cup className="ink-boil h-32 w-32" />
        </div>
        <div className="grid aspect-square place-items-center">
          <Sticker rotate={id.charCodeAt(0) % 2 ? -6 : 5} label={`${name} sticker`}>
            <Cup tint={tint} className="h-32 w-32 text-ink" />
          </Sticker>
        </div>
      </div>
      <p className="mt-4 font-display text-3xl leading-tight">
        another{" "}
        <span className="ink-boil inline-block h-[1em] w-[1em] align-[-0.18em]">
          <Cup tint={tint} className="h-full w-full" />
        </span>{" "}
        day, another bug.
      </p>
    </article>
  );
}

export function CupLab() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".cup-card", { y: 40, opacity: 0, rotation: 2, stagger: 0.07, duration: 0.8, ease: "power3.out" });
      root.current?.querySelectorAll(".cup-card .ink-boil").forEach((el, i) => {
        const svg = el instanceof SVGSVGElement ? el : el.querySelector("svg");
        if (svg) inkIn(svg, { delay: 0.3 + i * 0.05 });
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} className="mx-auto max-w-6xl px-5 pb-32 pt-16 md:px-10">
      <div className="mb-3 inline-block -rotate-2 bg-butter/80 px-4 py-1 font-hand text-2xl">lab · cup doodle</div>
      <h1 className="font-display text-6xl tracking-tight md:text-7xl">Pick a cup.</h1>
      <p className="mt-3 max-w-xl text-lg text-ink-soft">
        Each option shown three ways: as a line doodle (hover to re-ink), as a sticker, and inline in text.
        Tell me a letter, or mix and match (&ldquo;C&rsquo;s art on G&rsquo;s mug&rdquo;).
      </p>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {CUP_OPTIONS.map((o) => (
          <Option key={o.id} {...o} />
        ))}
      </div>
    </div>
  );
}
