"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { colors } from "@/lib/tokens";
import { HIGHLIGHTS, range, roles, stats, type Role } from "@/content/work";

const CHIP_TINTS = [colors.butter, colors.sky, colors.sakura, colors.lilac, colors.matcha, colors.tomato];

function RoleCard({ role, id, index }: { role: Role; id: string; index: number }) {
  const [open, setOpen] = useState(false);
  const shown = role.bullets.slice(0, HIGHLIGHTS);
  const rest = role.bullets.slice(HIGHLIGHTS);

  return (
    // From md up each card pins near the top and the next one slides over it; each pins a little lower
    // than the last so the edges of the cards beneath stay visible, like a stack of index cards.
    <li className="role md:sticky" style={{ top: `calc(5.5rem + ${index * 18}px)` }}>
      <article
        className={`role-card origin-top rounded-sm border-2 border-ink p-5 shadow-[4px_4px_0_var(--color-ink)] md:p-7 ${role.oss ? "bg-[color-mix(in_srgb,var(--color-lilac)_40%,var(--color-sticker))]" : "bg-sticker"}`}
        data-cursor="default"
      >
        <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight tracking-[-0.01em]">
            {role.company} <span className="italic text-ink-soft">· {role.title}</span>
          </h3>
          {(role.when || role.where) && (
            <p className="font-hand text-xl text-espresso">{[role.when, role.where].filter(Boolean).join(" · ")}</p>
          )}
        </header>

        <ul className="mt-4 space-y-2.5 font-display text-[1.05rem] leading-snug md:text-lg">
          {shown.map((b) => (
            <li key={b} className="flex gap-3">
              <span aria-hidden className="mt-[0.62em] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {rest.length > 0 && (
          <>
            {/* grid-rows 0fr→1fr gives a smooth height animation with no measuring */}
            <div
              id={`${id}-more`}
              className="grid transition-[grid-template-rows] duration-500 ease-(--ease-ink)"
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
              <ul className="space-y-2.5 overflow-hidden font-display text-[1.05rem] leading-snug md:text-lg" inert={!open}>
                {rest.map((b, i) => (
                  <li key={b} className={`flex gap-3 ${i === 0 ? "pt-2.5" : ""}`}>
                    <span aria-hidden className="mt-[0.62em] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`${id}-more`}
              onClick={() => setOpen((o) => !o)}
              className="mt-4 font-hand text-2xl text-tomato-deep underline decoration-wavy decoration-1 underline-offset-4"
            >
              {open ? "less ↑" : `+ ${rest.length} more`}
            </button>
          </>
        )}

        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Skills">
          {role.skills.map((s, i) => (
            <li
              key={s}
              className="rounded-full border-2 border-ink px-3 py-0.5 font-hand text-lg leading-snug"
              style={{ background: CHIP_TINTS[(i + role.company.length) % CHIP_TINTS.length], rotate: `${(i % 3) - 1}deg` }}
            >
              {s}
            </li>
          ))}
        </ul>
      </article>
    </li>
  );
}

export function Work() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const at = (trigger: Element | string, start = "top 85%") => ({ trigger, start, toggleActions: "play none none none" });

      gsap.from(q(".work-eyebrow"), { opacity: 0, x: -12, duration: 0.6, ease: "power3.out", scrollTrigger: at(".work-eyebrow", "top 90%") });
      gsap.from(q(".work-title .word"), { yPercent: 118, rotation: 5, duration: 0.9, stagger: 0.06, ease: "power4.out", scrollTrigger: at(".work-title") });
      gsap.from(q(".stat"), { y: 36, opacity: 0, rotation: (i: number) => (i % 2 ? 6 : -6), duration: 0.65, stagger: 0.09, ease: "back.out(1.5)", scrollTrigger: at(".stats", "top 88%") });
      // As the next card slides over, the one beneath settles back: a touch smaller and dimmer.
      const cards = q(".role-card");
      q(".role").forEach((next, i) => {
        if (i === 0) return;
        gsap.fromTo(
          cards[i - 1],
          { scale: 1, filter: "brightness(1)" },
          {
            scale: 0.95,
            filter: "brightness(0.93)",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top 90%", end: "top 25%", scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" className="relative overflow-clip px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto w-full max-w-5xl">
        <p className="work-eyebrow mb-6 font-hand text-3xl text-espresso">
          02 <span className="mx-1">—</span> work
        </p>
        <h2 className="work-title font-display text-[clamp(2.4rem,6.2vw,5.5rem)] leading-[1.02] tracking-[-0.02em]">
          {["Shipping", "apps", "to", "millions,"].map((w) => (
            <span key={w} className="word-mask inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
              <span className="word inline-block will-change-transform">{w}&nbsp;</span>
            </span>
          ))}
          <span className="word-mask inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
            <span className="word inline-block italic text-ink/35 will-change-transform">one detail at a time.</span>
          </span>
        </h2>

        <ul className="stats mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {stats.map((s) => (
            <li
              key={s.value}
              className="stat rounded-sm border-2 border-ink p-4 shadow-[4px_4px_0_var(--color-ink)]"
              style={{ background: colors[s.tint], rotate: `${s.rotate}deg` }}
            >
              <p className="font-display text-[clamp(1.5rem,2.6vw,2.2rem)] leading-none tracking-[-0.02em]">{s.value}</p>
              <p className="mt-2 font-hand text-lg leading-tight text-ink/80">{s.label}</p>
            </li>
          ))}
        </ul>

        <div className="range mt-14 rounded-sm border-2 border-dashed border-ink/40 p-5 md:p-7">
          <p className="font-hand text-2xl text-espresso">the range, beyond the job titles</p>
          <dl className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-2">
            {range.map((r) => (
              <div key={r.area} className="flex flex-col gap-1.5">
                <dt className="font-hand text-xl text-ink-soft">{r.area}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {r.items.map((it, i) => (
                    <span
                      key={it}
                      className="rounded-full border-2 border-ink px-2.5 py-0.5 font-hand text-lg leading-snug"
                      style={{ background: CHIP_TINTS[(i + r.area.length) % CHIP_TINTS.length] }}
                    >
                      {it}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <ol className="stack mt-14 space-y-10 md:mt-20 md:space-y-16">
          {roles.map((r, i) => (
            <RoleCard key={`${r.company}-${r.title}`} index={i} role={r} id={`${r.company}-${r.title}`.replace(/\W+/g, "-").toLowerCase()} />
          ))}
        </ol>
      </div>
    </section>
  );
}
