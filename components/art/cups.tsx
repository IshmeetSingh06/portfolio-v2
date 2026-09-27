import type { SVGProps } from "react";
import { CupDoodle, type DoodleProps } from "@/components/art/doodles";

/**
 * Coffee-cup doodle explorations. Pick one and it replaces CupDoodle.
 * Same conventions as doodles.tsx: 64×64, round ink strokes, `data-fill` on filled shapes.
 */

const CREMA = "#C98B55";
const MILK = "#FFFDF8";
const ESPRESSO = "#6B4430";

function Frame({ children, strokeW = 2.6, tint, ...rest }: DoodleProps & { children: React.ReactNode }) {
  void tint;
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {children}
    </svg>
  );
}

/** Milk-drawn art strokes: white on crema when tinted, ink when it's a line doodle. */
const art = (tint?: string): SVGProps<SVGPathElement> => ({
  stroke: tint ? MILK : "currentColor",
  strokeWidth: 1.8,
});

const heart = (cx: number, cy: number, s = 1) =>
  `M${cx} ${cy + 3.4 * s}c${-4.4 * s} ${-1.6 * s} ${-6.2 * s} ${-3.4 * s} ${-4.6 * s} ${-4.8 * s} ${1.4 * s} ${-1.2 * s} ${3.4 * s} ${-0.4 * s} ${4.6 * s} ${1 * s} ${1.2 * s} ${-1.4 * s} ${3.2 * s} ${-2.2 * s} ${4.6 * s} ${-1 * s} ${1.6 * s} ${1.4 * s} ${-0.2 * s} ${3.2 * s} ${-4.6 * s} ${4.8 * s}z`;

/** A — the current one: mug tipped toward you, heart pour. */
export const CupTipped = CupDoodle;

/** B — tall glass latte: espresso, milk and foam layers, tiny heart on the foam. */
export function CupGlass(props: DoodleProps) {
  const { tint } = props;
  return (
    <Frame {...props}>
      <path data-fill fill={tint ? ESPRESSO : "none"} stroke="none" d="M21.5 44l.7 9.6c.2 2.4 1.4 3.4 3.8 3.4h12c2.4 0 3.6-1 3.8-3.4l.7-9.6z" />
      <path data-fill fill={tint ?? "none"} stroke="none" d="M20.4 20l1.1 24h21l1.1-24z" />
      <path d="M42.6 44c-5 1.6-16.2 1.6-21.2 0" strokeWidth={1.4} />
      <path d="M43.8 20.6c-6.4 2.4-17.2 2.4-23.6 0" strokeWidth={1.4} />
      <path d="M19.6 14.6l2.6 39c.2 2.4 1.4 3.4 3.8 3.4h12c2.4 0 3.6-1 3.8-3.4l2.6-39" />
      <path data-fill fill={tint ? MILK : "none"} d="M19.6 14.6c4-4 20.8-4 24.8 0-4 4-20.8 4-24.8 0z" />
      <path data-fill fill={tint ? CREMA : "none"} strokeWidth={1.2} d={heart(32, 12.4, 0.62)} />
      <path d="M25.6 25l1 20" stroke={tint ? MILK : "currentColor"} strokeWidth={2} strokeOpacity={0.8} />
    </Frame>
  );
}

/** C — top-down: saucer, cup, and a full rosetta you can actually read. */
export function CupTopDown(props: DoodleProps) {
  const { tint } = props;
  const leaves: [number, number][] = [
    [42, 6.6],
    [38.8, 8.2],
    [35.6, 9],
    [32.4, 8.2],
    [29.4, 6.4],
  ];
  return (
    <Frame {...props}>
      <circle data-fill fill={tint ? MILK : "none"} cx="31" cy="33" r="26" />
      <circle cx="31" cy="33" r="20.6" strokeWidth={1.3} strokeOpacity={0.4} />
      <path data-fill fill={tint ?? "none"} d="M47.4 28.8h6.2c2.6 0 4 1.4 4 4s-1.4 4-4 4h-6.2" />
      <circle data-fill fill={tint ?? "none"} cx="32" cy="33" r="17" />
      <circle data-fill fill={tint ? CREMA : "none"} cx="32" cy="33" r="13.2" strokeWidth={1.8} />
      <path {...art(tint)} d="M32 44.6V23.4" strokeWidth={1.4} />
      {leaves.map(([y, w]) => (
        <path key={y} {...art(tint)} d={`M${32 - w} ${y}Q32 ${y - 4.6} ${32 + w} ${y}`} />
      ))}
      <path data-fill fill={tint ? MILK : "none"} {...art(tint)} strokeWidth={1.2} d={heart(32, 21.6, 0.55)} />
      <path d="M13.6 45.6c-1.8-1.6-1-4.2 1.2-4.6 2-.4 3.2 1.6 2.2 3.2-.8 1.4-2.2 1.8-3.4 1.4l-7.4 7.2" strokeWidth={2.2} />
    </Frame>
  );
}

/** D — happy cup: sleepy-smile face, blush, heart-shaped steam. */
export function CupHappy(props: DoodleProps) {
  const { tint } = props;
  return (
    <Frame {...props}>
      <path d="M50.6 29.6c8.4-1.2 9.6 11.8-1.4 12.6" />
      <path data-fill fill={tint ?? "none"} d="M13 24c0 12.4 1.8 22.2 6.2 26.6 3.6 3.6 22 3.6 25.6-.2 4.4-4.4 6.2-14 6.2-26.4" />
      <path data-fill fill={tint ? CREMA : "none"} d="M13 24c6-6.2 32-6.2 38 0-6 6.2-32 6.2-38 0z" />
      <path data-fill fill={tint ? MILK : "none"} strokeWidth={1.3} d={heart(32, 21.6, 0.8)} />
      <path d="M22.4 37.8c1-1.8 3.2-1.8 4.2 0M37.4 37.8c1-1.8 3.2-1.8 4.2 0" />
      <path d="M29.4 41.4c1.6 1.8 3.6 1.8 5.2 0" />
      <ellipse data-fill fill={tint ? "#F2A7B8" : "none"} stroke="none" cx="20.4" cy="42.2" rx="2.6" ry="1.5" />
      <ellipse data-fill fill={tint ? "#F2A7B8" : "none"} stroke="none" cx="43.6" cy="42.2" rx="2.6" ry="1.5" />
      <path data-fill fill={tint ? "#E8553D" : "none"} strokeWidth={1.8} d={heart(32, 9.6, 0.62)} />
      <path d="M23.4 15.6c-2.2-2.2 1.8-3.8 0-7M40.6 15.6c-2.2-2.2 1.8-3.8 0-7" strokeWidth={2.2} />
    </Frame>
  );
}

/** E — takeaway cup: domed lid, sip hole, sleeve with a heart stamp. */
export function CupTakeaway(props: DoodleProps) {
  const { tint } = props;
  return (
    <Frame {...props}>
      <path data-fill fill={tint ? MILK : "none"} d="M17.6 23l4 32.2c.2 1.4 1 2 2.4 2h16c1.4 0 2.2-.6 2.4-2l4-32.2z" />
      <path data-fill fill={tint ?? "none"} d="M19.1 32h25.8l-1.7 14H20.8z" />
      <path data-fill fill={tint ? MILK : "none"} strokeWidth={1.4} d={heart(32, 36.2, 0.72)} />
      <path data-fill fill={tint ? MILK : "none"} d="M18.6 18.4c1.6-4.4 5-6 13.4-6s11.8 1.6 13.4 6" />
      <path data-fill fill={tint ? MILK : "none"} d="M15.4 18.4h33.2c.8 0 1.2.4 1 1.2l-.8 2.6c-.2.6-.6.8-1.2.8H16.4c-.6 0-1-.2-1.2-.8l-.8-2.6c-.2-.8.2-1.2 1-1.2z" />
      <path d="M36.4 15h3.8" />
      <path d="M27 8.6c-2.2-2.2 1.6-3.8 0-6.8M35 8.2c-2.2-2.2 1.6-3.8 0-6.4" strokeWidth={2.2} />
    </Frame>
  );
}

/** F — wide cappuccino cup on a saucer, three-lobed tulip pour, spoon. */
export function CupCappuccino(props: DoodleProps) {
  const { tint } = props;
  return (
    <Frame {...props}>
      <path data-fill fill={tint ? MILK : "none"} d="M4.8 47.6c6.4 7.2 48 7.2 54.4 0-6.4-5-48-5-54.4 0z" />
      <path d="M54.2 30.4c6.6-.4 7 7.6.2 8.6" />
      <path data-fill fill={tint ?? "none"} d="M9.6 27c.8 9 4 16.8 11 19.6 6.4 2.4 16.4 2.4 22.8 0 7-2.8 10.2-10.6 11-19.6" />
      <path data-fill fill={tint ? CREMA : "none"} d="M9.6 27c5.6-8.4 39.2-8.4 44.8 0-5.6 8.4-39.2 8.4-44.8 0z" />
      <path {...art(tint)} strokeWidth={1.2} d="M32 22v11.6" />
      <path data-fill fill={tint ? MILK : "none"} {...art(tint)} strokeWidth={1.3} d={heart(32, 28.6, 0.95)} />
      <path data-fill fill={tint ? MILK : "none"} {...art(tint)} strokeWidth={1.3} d={heart(32, 24.8, 0.72)} />
      <path data-fill fill={tint ? MILK : "none"} {...art(tint)} strokeWidth={1.3} d={heart(32, 21.6, 0.5)} />
      <path d="M46.4 52.4l9.4-2.8M44.6 53c-1.4.6-3.2.2-3.4-1 0-1.2 1.6-2 3-1.6" strokeWidth={2} />
      <path d="M25.6 14.8c-2.4-2.6 2-4.4 0-8M37.4 14.2c-2.4-2.6 2-4.4 0-8" strokeWidth={2.2} />
    </Frame>
  );
}

/** G — chunky handmade ceramic mug: dripping glaze, speckles, heart pour. */
export function CupHandmade(props: DoodleProps) {
  const { tint } = props;
  return (
    <Frame {...props}>
      <path d="M48.8 26.2c10-1.8 12 15.8-.6 17M48.8 31.2c4.6-.4 5 7.6 0 8.4" />
      <path data-fill fill={tint ?? "none"} d="M14.6 20.4c-.4 11 0 23.4 1.6 31.2.6 2.8 2.6 4.2 5.4 4.2h19.6c2.8 0 4.8-1.4 5.4-4.2 1.6-7.8 2-20.2 1.6-31.2" />
      <path
        data-fill
        fill={tint ? MILK : "none"}
        strokeWidth={1.8}
        d="M14.7 20.8l.1 9.2c2.4 1.6 3.6 5.6 5.8 5.2 2-.4 1.4-4.6 3.8-4.8 2.6-.2 2.2 7.4 4.8 7.4 2.6 0 2-5.4 4.6-5.4 2.6 0 2.8 3 5 2.6 2.2-.4 2.2-4 3.4-4.4 1.2-.4 3 1.2 5.2-.6l.1-9.2"
      />
      <path data-fill fill={tint ? CREMA : "none"} d="M14.4 20.4c6-4.8 28.4-5 34.6 0-6 4.6-28.6 4.8-34.6 0z" />
      <path data-fill fill={tint ? MILK : "none"} strokeWidth={1.2} d={heart(31.7, 18.2, 0.66)} />
      <path d="M22 44.4v.1M28.6 49v.1M36.4 43.4v.1M41.4 49.4v.1M25 52.6v.1M33 53v.1" strokeWidth={2.6} />
    </Frame>
  );
}

export const CUP_OPTIONS = [
  { id: "A", name: "Tipped mug", note: "current one — heart pour, saucer line", Cup: CupTipped, tint: "#F5D46B" },
  { id: "B", name: "Glass latte", note: "visible layers, foam heart, very café", Cup: CupGlass, tint: "#E9D6BC" },
  { id: "C", name: "Top-down rosetta", note: "bird's-eye, the latte art is the star", Cup: CupTopDown, tint: "#C3B1E1" },
  { id: "D", name: "Happy cup", note: "has a face — could double as the mascot", Cup: CupHappy, tint: "#F5D46B" },
  { id: "E", name: "Takeaway", note: "lid + sleeve, on-the-go energy", Cup: CupTakeaway, tint: "#E8553D" },
  { id: "F", name: "Cappuccino + saucer", note: "wide cup, tulip pour, spoon", Cup: CupCappuccino, tint: "#8EC5E8" },
  { id: "G", name: "Handmade mug", note: "chunky ceramic, drippy glaze, speckles", Cup: CupHandmade, tint: "#7FA66B" },
] as const;
