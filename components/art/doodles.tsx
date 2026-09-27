import type { SVGProps } from "react";

/**
 * Placeholder doodle set, drawn by hand on a 64×64 grid. Every stroke is a separate
 * path so DrawSVG can "re-ink" them. Filled shapes carry `data-fill` so animations can
 * fade the fill in after the outline is drawn. Replace with Arrow 2.0 output later
 * (see ARROW_PROMPTS.md), keeping the same export names.
 */

export type DoodleProps = SVGProps<SVGSVGElement> & {
  /** Fill for the main body shape. Omit for a pure line doodle. */
  tint?: string;
  strokeW?: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- `tint` is pulled out so it never reaches the <svg>
function Frame({ children, strokeW = 2.6, tint, ...rest }: DoodleProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeW}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function CupDoodle(props: DoodleProps) {
  const { tint } = props;
  // Rim is drawn as a tall ellipse (cup tipped toward you) so there's room for latte art.
  return (
    <Frame {...props}>
      <path d="M44.6 30c8.8-1.4 10 11.8-1.6 12.6" />
      <path data-fill fill={tint ?? "none"} d="M15.2 24.4c.4 8 1.6 19.6 4.8 25 2.6 3.8 18 4 20.8.2 3.4-4.8 4.2-17 4.4-25.2" />
      <path data-fill fill={tint ? "#C98B55" : "none"} d="M14.8 24.2c5.8-6.2 25-6.4 30.6.2-5.4 5.8-24.8 6-30.6-.2z" />
      <path
        data-fill
        fill={tint ? "#FFFDF8" : "none"}
        strokeWidth={1.3}
        d="M30.1 28.2c-4.8-1.8-6.8-3.8-5-5.4 1.5-1.3 3.7-.5 5 1 1.3-1.5 3.5-2.3 5-1 1.8 1.6-.2 3.6-5 5.4z"
      />
      <path d="M30.1 21.2v7.8" strokeWidth={1.1} />
      <path d="M23.6 16c-3.4-3.6 2.8-6.2-.2-10.6" />
      <path d="M31 16.2c-3.2-4.2 3-6.6 0-12.6" />
      <path d="M38.2 16c-3.2-3.4 2.6-5.8-.4-9.6" />
      <path d="M9.6 54.4c9.8 4 33.2 4.2 43.2-.2" />
    </Frame>
  );
}

export function KeycapDoodle(props: DoodleProps) {
  const { tint } = props;
  // Seen from above-front: square skirt at the base, smaller dished top face set
  // toward the back, and the four slanted corner edges that make it read as a keycap.
  return (
    <Frame {...props}>
      <path data-fill fill={tint ?? "none"} d="M7.6 17.4c0-4 2-6 6-6h36.8c4 0 6 2 6 6v31.4c0 4-2 6-6 6H13.6c-4 0-6-2-6-6z" />
      <path data-fill fill={tint ? "#FFFDF8" : "none"} fillOpacity={0.6} d="M17.2 15.4c0-1.8 1-2.8 2.8-2.8h24c1.8 0 2.8 1 2.8 2.8l-.8 22.8c0 2-1.2 3-3 3H21c-1.8 0-3-1-3-3z" />
      <path d="M9.4 12.8l8.4 3M54.6 12.8l-8.4 3M9 53l9.8-12.8M55 53l-9.8-12.8" />
      <path d="M21 36.6c6.8 1.6 15.2 1.6 22 0" strokeWidth={1.6} strokeOpacity={0.45} />
      <path d="M27.8 19.6v12.2M35.8 19.8l-7 6.2 7.4 6" />
    </Frame>
  );
}

const PETAL = "M32 32c-6.8-7.2-7.6-16.8-2.6-20.2l2.6 3.4 2.6-3.4c5 3.4 4.2 13-2.6 20.2z";

export function SakuraDoodle(props: DoodleProps) {
  const { tint } = props;
  return (
    <Frame {...props}>
      {[0, 72, 144, 216, 288].map((r) => (
        <path key={r} data-fill fill={tint ?? "none"} d={PETAL} transform={`rotate(${r} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="2.6" />
    </Frame>
  );
}

export function SparkleDoodle(props: DoodleProps) {
  const { tint } = props;
  return (
    <Frame {...props}>
      <path data-fill fill={tint ?? "none"} d="M32 7.5c1.8 15.6 7.6 22 24 24.5-16.4 2.5-22.2 8.9-24 24.5-1.8-15.6-7.6-22-24-24.5 16.4-2.5 22.2-8.9 24-24.5z" />
      <path d="M52 8.5v7M48.5 12h7" />
    </Frame>
  );
}

export function ArrowDoodle(props: DoodleProps) {
  return (
    <Frame {...props}>
      <path d="M5.6 44c7.6-17.8 17.4 7.4 26.4-10.8 5.4-10.8 14.6-13.4 24-9.2" />
      <path d="M48.8 17.6l7.6 6.6-9.4 3.6" />
    </Frame>
  );
}

export function BookDoodle(props: DoodleProps) {
  const { tint } = props;
  return (
    <Frame {...props}>
      <path data-fill fill={tint ?? "none"} d="M9.6 18.4c9.6-4.2 17.8-3 22.4 1.8v30c-5-4.4-13.4-5.2-22.4-1.8z" />
      <path data-fill fill={tint ?? "none"} d="M54.4 18.4c-9.6-4.2-17.8-3-22.4 1.8v30c5-4.4 13.4-5.2 22.4-1.8z" />
      <path d="M15.4 25.6c3.8-1 7.4-.6 10.6.8M15.4 32c3.8-1 7.4-.6 10.6.8M38 26.4c3.2-1.4 6.8-1.8 10.6-.8" />
    </Frame>
  );
}

export function OnigiriDoodle(props: DoodleProps) {
  const { tint } = props;
  return (
    <Frame {...props}>
      <path data-fill fill={tint ?? "none"} d="M32 9.6c6.4 0 22.6 29.4 20.4 36.6-2 6-38.8 6-40.8 0C9.4 39 25.6 9.6 32 9.6z" />
      <path data-fill fill="currentColor" d="M24.2 37.4h15.6l.8 13.8H23.4z" />
      <path d="M26.4 29.6v.4M37.6 29.6v.4" strokeWidth={3.6} />
      <path d="M29.6 32.6c1.4 1.4 3.4 1.4 4.8 0" />
    </Frame>
  );
}

export function CloudDoodle(props: DoodleProps) {
  const { tint } = props;
  return (
    <Frame {...props}>
      <path data-fill fill={tint ?? "none"} d="M15 44.4c-8.6.4-9.8-12.6-.6-12.8-1.4-10.6 13.6-13.6 17.2-5.4 3.2-9.8 19.8-8 18 4.8 10.2-.6 10.4 13.6.8 13.4z" />
      <path d="M22 38.4c1.6 1.6 3.8 1.6 5.4 0M36 38.4c1.6 1.6 3.8 1.6 5.4 0" strokeWidth={2.2} />
    </Frame>
  );
}

export function SquiggleDoodle(props: DoodleProps) {
  return (
    <Frame {...props}>
      <path d="M4 34c4-8 8-8 12 0s8 8 12 0 8-8 12 0 8 8 12 0 6-6 8-2" />
    </Frame>
  );
}

export const DOODLES = {
  cup: CupDoodle,
  keycap: KeycapDoodle,
  sakura: SakuraDoodle,
  sparkle: SparkleDoodle,
  arrow: ArrowDoodle,
  book: BookDoodle,
  onigiri: OnigiriDoodle,
  cloud: CloudDoodle,
  squiggle: SquiggleDoodle,
} as const;

export type DoodleName = keyof typeof DOODLES;
