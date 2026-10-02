import { About } from "@/components/about/About";
import { Contact } from "@/components/contact/Contact";
import { Work } from "@/components/work/Work";
import { Hero } from "@/components/hero/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Work />
      <Contact />
    </main>
  );
}
