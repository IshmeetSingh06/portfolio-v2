"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { play } from "@/lib/sound";
import { colors } from "@/lib/tokens";
import { profile } from "@/content/profile";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SquiggleLink } from "@/components/ui/SquiggleLink";

const LINKS = [
  { label: "GitHub", href: profile.socials.github, tint: colors.lilac, rotate: -3 },
  { label: "LinkedIn", href: profile.socials.linkedin, tint: colors.sky, rotate: 2 },
  { label: "Instagram", href: profile.socials.instagram, tint: colors.sakura, rotate: -2 },
  { label: "Résumé", href: profile.resume, tint: colors.butter, rotate: 3 },
] as const;

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const at = (trigger: Element | string, start = "top 85%") => ({ trigger, start, toggleActions: "play none none none" });

      gsap.from(q(".contact-eyebrow"), { opacity: 0, x: -12, duration: 0.6, ease: "power3.out", scrollTrigger: at(".contact-eyebrow", "top 92%") });
      gsap.from(q(".contact-title .word"), { yPercent: 118, rotation: 5, duration: 0.9, stagger: 0.06, ease: "power4.out", scrollTrigger: at(".contact-title") });
      gsap.from(q(".contact-cta > *"), { y: 24, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", scrollTrigger: at(".contact-cta") });
      gsap.from(q(".contact-link"), { y: 30, opacity: 0, rotation: (i: number) => (i % 2 ? 7 : -7), duration: 0.6, stagger: 0.08, ease: "back.out(1.6)", scrollTrigger: at(".contact-links", "top 90%") });
    },
    { scope: root },
  );

  const copy = async () => {
    play("pop");
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section ref={root} id="contact" className="relative overflow-hidden px-5 pb-10 pt-28 md:px-10 md:pt-40">
      <div className="mx-auto w-full max-w-5xl">
        <p className="contact-eyebrow mb-6 font-hand text-3xl text-espresso">
          03 <span className="mx-1">—</span> connect
        </p>

        <h2 className="contact-title font-display text-[clamp(2.6rem,7.4vw,6.5rem)] leading-[1] tracking-[-0.02em]">
          {["Let's", "build", "something"].map((w) => (
            <span key={w} className="word-mask inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
              <span className="word inline-block will-change-transform">{w}&nbsp;</span>
            </span>
          ))}
          <span className="word-mask inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
            <span className="word inline-block italic will-change-transform">that feels alive.</span>
          </span>
        </h2>

        <div className="contact-cta mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
          <MagneticButton type="button" onClick={copy} tone="ink" className="text-lg md:text-xl" aria-live="polite">
            {copied ? "copied ✓" : profile.email}
          </MagneticButton>
          <SquiggleLink href={`mailto:${profile.email}`} className="font-hand text-2xl text-ink-soft" data-cursor="default">
            or open your mail app ↗
          </SquiggleLink>
          {profile.openToWork && (
            <span className="inline-flex items-center gap-3 rounded-full border-2 border-ink bg-sticker px-4 py-2 text-sm font-medium shadow-[3px_3px_0_var(--color-ink)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-matcha opacity-70" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-matcha" />
              </span>
              open to work
            </span>
          )}
        </div>

        <ul className="contact-links mt-16 flex flex-wrap gap-4 md:gap-6">
          {LINKS.map((l) => (
            <li key={l.label} className="contact-link" style={{ rotate: `${l.rotate}deg` }}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                onPointerEnter={() => play("tick")}
                className="block rounded-sm border-2 border-ink px-5 py-2.5 font-hand text-3xl leading-none shadow-[4px_4px_0_var(--color-ink)] transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[7px_7px_0_var(--color-ink)]"
                style={{ background: l.tint }}
                data-cursor="pointer"
              >
                {l.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="mx-auto mt-28 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-ink/30 pt-5 font-hand text-xl text-ink-soft md:mt-36">
        <span suppressHydrationWarning>© {new Date().getFullYear()} {profile.name} · made with too much coffee ☕</span>
        <a href="#top" data-cursor="pointer" className="text-tomato">
          back to top ↑
        </a>
      </footer>
    </section>
  );
}
