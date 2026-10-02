import type { Metadata } from "next";
import { CupLab } from "@/components/lab/CupLab";

export const metadata: Metadata = { title: "lab", robots: { index: false, follow: false } };

export default function CupLabPage() {
  return (
    <main>
      <CupLab />
    </main>
  );
}
