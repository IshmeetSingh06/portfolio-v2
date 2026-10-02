import { About } from "@/components/about/About";
import { Work } from "@/components/work/Work";
import { Hero } from "@/components/hero/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Work />
      {/* Placeholder until the contact round lands. */}
      <section className="grid min-h-[60vh] place-items-center px-5">
        <p className="font-hand text-3xl text-ink-soft">next up: contact…</p>
      </section>
    </main>
  );
}
