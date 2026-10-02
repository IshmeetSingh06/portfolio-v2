import { colors } from "@/lib/tokens";
import { ME } from "@/components/art/me";
import { MeBeard, MeTurban } from "@/components/art/MeParts";

/**
 * The preloader doodle: Ishmeet sipping coffee, drawn in SVG and stepped like a 16-frame hand-drawn
 * loop (the parent ticks `frame` at 12 fps; the .ink-boil class adds the line wobble).
 * Grid: 100 × 130. Mouth sits near (50, 79). The right hand grips the mug by its handle and the arm
 * is a hanging upper arm plus a stretchy forearm.
 */

type Pose = { mug: [x: number, y: number, r: number]; tilt: number; eyes: "open" | "shut" | "happy"; bob: number; ahh?: boolean };

// Mug centre + rotation. At -30° the rim's centre lands on the mouth (50, 79).
const REST: [number, number, number] = [60, 106, 0];
const POSES: Pose[] = [
  { mug: REST, tilt: 0, eyes: "open", bob: 0 }, // 00–02 hold, steam rising
  { mug: [60, 105.4, 0], tilt: 0, eyes: "open", bob: -0.8 },
  { mug: REST, tilt: 0, eyes: "open", bob: 0 },
  { mug: [58.5, 99, -9], tilt: 1, eyes: "open", bob: 0 }, // 03–05 lift, head tips back
  { mug: [56.5, 92, -20], tilt: 2, eyes: "open", bob: 0 },
  { mug: [55, 88.5, -29], tilt: 3, eyes: "shut", bob: 0 },
  { mug: [55, 88, -31], tilt: 3.5, eyes: "shut", bob: 0 }, // 06–08 sip, hold
  { mug: [55, 87.2, -35], tilt: 4, eyes: "shut", bob: 0 },
  { mug: [55, 88, -31], tilt: 3.5, eyes: "shut", bob: 0 },
  { mug: [56.5, 93, -20], tilt: 2, eyes: "happy", bob: 0, ahh: true }, // 09–11 lower, "ahh"
  { mug: [58.5, 99, -9], tilt: 1, eyes: "happy", bob: -1, ahh: true },
  { mug: [60, 104, -2], tilt: 0, eyes: "happy", bob: 0, ahh: true },
  { mug: REST, tilt: 0, eyes: "open", bob: -1 }, // 12–14 contented bob
  { mug: REST, tilt: 0, eyes: "open", bob: 0 },
  { mug: REST, tilt: 0, eyes: "open", bob: -1 },
  { mug: REST, tilt: 0, eyes: "open", bob: 0 }, // 15 ≈ 00, seamless
];

const SHOULDER = [71, 105] as const;
const HANDLE = 14; // handle's x offset from the mug centre

const rot = (x: number, y: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)] as const;
};

/** The upper arm hangs from the shoulder and the elbow lifts a little as the hand rises. */
function elbow(hand: readonly [number, number]) {
  const lift = Math.max(0, Math.min(1, (106 - hand[1]) / 26));
  return [84 + 3 * lift, 123 - 9 * lift] as const;
}

export function SipDoodle({ frame }: { frame: number }) {
  const p = POSES[frame % POSES.length];
  const [mx, my, mr] = p.mug;

  const [hx, hy] = rot(HANDLE, 0, mr);
  const hand = [mx + hx, my + hy] as const;
  const e = elbow(hand);
  const arm = `M${SHOULDER[0]} ${SHOULDER[1]}L${e[0].toFixed(1)} ${e[1].toFixed(1)}L${hand[0].toFixed(1)} ${hand[1].toFixed(1)}`;

  const steamA = frame % 2 === 0;
  const showSteam = mr > -5; // once the mug tips toward his face the steam would sit on it

  return (
    <svg
      viewBox="0 0 100 130"
      className="ink-boil h-full w-full overflow-visible"
      fill="none"
      stroke={colors.ink}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <g transform={`translate(0 ${p.bob})`}>
        {/* left arm hangs, then the tee over it */}
        <path d="M28 108L22 124" strokeWidth={10} />
        <path d="M28 108L22 124" strokeWidth={6.6} stroke={colors.paper} />
        <path d="M14 130c2-22 15-32 36-32s34 10 36 32" fill={colors.paper} />
        <path d="M41 98.4c2 6 16 6 18 0" strokeWidth={1.8} />

        {/* neck + head; the head tips back a touch while he sips */}
        <path d="M44 85v12M56 85v12" strokeWidth={1.8} />
        <g transform={`rotate(${p.tilt} 50 92) translate(0 ${p.tilt ? -p.tilt * 0.4 : 0})`}>
          <g transform="translate(18 34)">
            <path d={ME.ears} />
            <path d={ME.face} fill={colors.paper} />
            <MeBeard />
            <MeTurban />
            {p.eyes === "open" &&
              ME.eyes.map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r={2} fill={colors.ink} stroke="none" />)}
            {p.eyes === "shut" && <path d={ME.eyesClosed} strokeWidth={2} />}
            {p.eyes === "happy" && (
              <path d="M25 37c1.4-2.4 3.4-2.4 4.8 0M34.2 37c1.4-2.4 3.4-2.4 4.8 0" strokeWidth={2} />
            )}
            {p.eyes === "happy" ? <path d="M26.6 42c2.6 4.4 8.2 4.4 10.8 0" /> : <path d={ME.smile} />}
            {p.eyes === "happy" && <path d="M20.5 41h3M40.5 41h3" strokeWidth={1.4} stroke={colors.tomato} />}
          </g>
        </g>

        {/* right arm: shoulder → elbow → hand, outline then paper fill makes a sleeve */}
        <path d={arm} strokeWidth={10} />
        <path d={arm} strokeWidth={6.6} stroke={colors.paper} />

        {/* mug: rim at the top, coffee line, handle on the right */}
        <g transform={`translate(${mx} ${my}) rotate(${mr})`}>
          <path d="M-9-10v16c0 2.4 1.8 4.2 4.2 4.2h9.6c2.4 0 4.2-1.8 4.2-4.2V-10z" fill={colors.paper} />
          <path d="M-8.2-6.6h16.4" stroke={colors.espresso} strokeWidth={2.4} />
          <path d="M-5 0.5c3 1.6 7 1.6 10 0" strokeWidth={1.2} />
          <path d="M9-6c8 0 8 11 0 11" strokeWidth={2} />
          {showSteam && (
            <path
              d={steamA ? "M-3-13c-3-2.4 2-4.4 0-7.4M3-13c-3-2.4 2-4.4 0-7.4" : "M-3-13c3-2.4-2-4.4 0-7.4M3-13c3-2.4-2-4.4 0-7.4"}
              strokeWidth={1.4}
            />
          )}
        </g>
        {/* fist through the handle */}
        <circle cx={hand[0]} cy={hand[1]} r={4.6} fill={colors.paper} strokeWidth={2} />
      </g>

      {p.ahh && (
        <text
          x={68}
          y={42}
          fill={colors.ink}
          stroke="none"
          fontSize={15}
          style={{ fontFamily: "var(--font-hand)" }}
          transform="rotate(8 68 42)"
        >
          ahh
        </text>
      )}
    </svg>
  );
}
