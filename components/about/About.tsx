"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { colors } from "@/lib/tokens";
import { about, profile } from "@/content/profile";
import { BookDoodle, CupDoodle, KeycapDoodle } from "@/components/art/doodles";
import { ME } from "@/components/art/me";
import { MeBeard, MeTurban } from "@/components/art/MeParts";

const HOBBY_ART = {
  coffee: { Art: CupDoodle, tint: colors.butter, rotate: -3 },
  books: { Art: BookDoodle, tint: colors.sky, rotate: 2 },
  keyboards: { Art: KeycapDoodle, tint: colors.tomato, rotate: -2 },
} as const;

/** Local time in Ishmeet's timezone. Empty on the server so hydration matches. */
function useLocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: profile.timezone, hour: "numeric", minute: "2-digit", hour12: true });
    const tick = () => setTime(fmt.format(new Date()).toUpperCase());
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function MeCard() {
  const time = useLocalTime();
  return (
    <figure className="about-card relative mx-auto w-full max-w-[19rem] rotate-3 rounded-sm border-2 border-ink bg-sticker p-4 pb-5 shadow-[6px_6px_0_var(--color-ink)]">
      {/* masking-tape strip */}
      <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 bg-butter/80 shadow-sm" />
      <div className="grid aspect-[4/5] place-items-center border-2 border-ink bg-lilac/50">
        <svg viewBox="0 0 64 64" className="ink-boil h-4/5 w-4/5" fill="none" stroke={colors.ink} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="A doodle of Ishmeet">
          <path d={ME.ears} />
          <path d={ME.face} fill={colors.sticker} />
          <MeBeard />
          <MeTurban />
          {ME.eyes.map(([cx, cy]) => (
            <circle key={cx} cx={cx} cy={cy} r={1.6} fill={colors.ink} stroke="none" />
          ))}
          <path d={ME.smile} />
          <path d="M14 63c1-8 8-12 18-12s17 4 18 12" fill={colors.sticker} />
        </svg>
      </div>
      <figcaption className="mt-3 flex items-end justify-between gap-3">
        <span className="font-hand text-2xl leading-none">{profile.firstName}, roughly</span>
        <span className="text-right font-hand text-lg leading-tight text-ink-soft">
          {profile.location.split(",")[0]}
          <br />
          <span className="tabular-nums">{time || " "}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const at = (trigger: Element | string, start = "top 82%") => ({ trigger, start, toggleActions: "play none none none" });

      gsap.from(q(".about-eyebrow"), { opacity: 0, x: -12, duration: 0.6, ease: "power3.out", scrollTrigger: at(".about-eyebrow", "top 88%") });
      gsap.from(q(".about-title .word"), {
        yPercent: 118,
        rotation: 5,
        duration: 0.9,
        stagger: 0.06,
        ease: "power4.out",
        scrollTrigger: at(".about-title"),
      });
      gsap.from(q(".about-copy > *"), { y: 22, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power3.out", scrollTrigger: at(".about-copy") });
      gsap.from(q(".about-card"), { scale: 1.25, opacity: 0, rotation: -8, duration: 0.7, ease: "back.out(1.6)", scrollTrigger: at(".about-card", "top 85%") });
      gsap.from(q(".hobby"), { y: 40, opacity: 0, rotation: (i: number) => (i % 2 ? 6 : -6), duration: 0.65, stagger: 0.1, ease: "back.out(1.5)", scrollTrigger: at(".hobbies", "top 88%") });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" className="relative overflow-hidden px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto w-full max-w-7xl">
        <p className="about-eyebrow mb-6 font-hand text-3xl text-espresso">
          01 <span className="mx-1">—</span> about
        </p>

        <div className="grid items-start gap-14 md:grid-cols-[1.5fr_1fr] md:gap-16">
          <div>
            <h2 className="about-title font-display text-[clamp(2.4rem,6.2vw,5.5rem)] leading-[1.02] tracking-[-0.02em]">
              {about.heading.map((line, i) => (
                <span key={line} className="block">
                  {line.split(" ").map((w, j) => (
                    <span key={j} className="word-mask inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
                      <span className={`word inline-block will-change-transform ${i === 2 ? "italic" : ""}`}>
                        {w}
                        {" "}
                      </span>
                    </span>
                  ))}
                </span>
              ))}
            </h2>

            <div className="about-copy mt-10 max-w-[34rem] space-y-5 font-display text-[clamp(1.2rem,1.9vw,1.6rem)] leading-snug">
              {about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className="text-ink/35">{about.fade}</p>
            </div>
          </div>

          <MeCard />
        </div>

        <ul className="hobbies mt-20 grid gap-6 md:mt-28 md:grid-cols-3">
          {about.hobbies.map((h) => {
            const { Art, tint, rotate } = HOBBY_ART[h.id];
            return (
              <li
                key={h.id}
                className="hobby group rounded-sm border-2 border-ink bg-sticker p-5 shadow-[4px_4px_0_var(--color-ink)] transition-[rotate,translate,box-shadow] duration-300 ease-(--ease-pop) hover:-translate-y-1 hover:shadow-[7px_7px_0_var(--color-ink)]"
                style={{ rotate: `${rotate}deg` }}
                data-cursor="default"
              >
                <div className="flex items-center gap-4">
                  <Art tint={tint} className="ink-boil h-14 w-14 shrink-0 text-ink transition-transform duration-300 group-hover:-rotate-6" />
                  <h3 className="font-hand text-3xl leading-none">{h.title}</h3>
                </div>
                <p className="mt-3 font-display text-lg leading-snug text-ink-soft">{h.note}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
