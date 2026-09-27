import { Hero } from "@/components/hero/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      {/* Placeholder so the hero's scroll-away can be felt; replaced by the Manifesto round. */}
      <section className="grid min-h-[80vh] place-items-center px-5">
        <p className="font-hand text-3xl text-ink-soft">next up: nav → preloader → about…</p>
      </section>
    </main>
  );
}
