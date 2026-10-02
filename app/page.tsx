import { About } from "@/components/about/About";
import { Hero } from "@/components/hero/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      {/* Placeholder until the work round lands. */}
      <section className="grid min-h-[60vh] place-items-center px-5">
        <p className="font-hand text-3xl text-ink-soft">next up: work → contact…</p>
      </section>
    </main>
  );
}
