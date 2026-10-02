"use client";

import { EGGS, useFoundEggs } from "@/lib/eggs";

/** Five dots along a coffee's journey, inked in as each hidden thing is found. */
export function Journey({ className }: { className?: string }) {
  const found = useFoundEggs();
  return (
    <div className={className} role="img" aria-label={`Coffee journey: ${found.length} of ${EGGS.length} secrets found`}>
      <ol className="flex items-start gap-1">
        {EGGS.map((e, i) => {
          const got = found.includes(e.id);
          return (
            <li key={e.id} className="flex items-start">
              <span className="flex w-12 flex-col items-center gap-0.5">
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border-2 border-ink text-[11px] leading-none ${got ? "bg-ink text-paper" : "border-dashed bg-transparent text-ink/30"}`}
                >
                  {got ? "✓" : "?"}
                </span>
                <span className={`font-hand text-base leading-none ${got ? "text-ink" : "text-ink/30"}`}>{got ? e.stage : "···"}</span>
              </span>
              {i < EGGS.length - 1 && <span aria-hidden className="mt-2.5 h-0 w-2 border-t-2 border-dashed border-ink/30" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
