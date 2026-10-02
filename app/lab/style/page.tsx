import type { Metadata } from "next";
import { StyleTile } from "@/components/styletile/StyleTile";

export const metadata: Metadata = { title: "lab", robots: { index: false, follow: false } };

export default function StyleTilePage() {
  return (
    <main>
      <StyleTile />
    </main>
  );
}
