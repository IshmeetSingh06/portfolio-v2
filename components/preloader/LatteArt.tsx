import { colors } from "@/lib/tokens";

/**
 * A latte being poured, top-down: a milk pitcher slides in, a thin stream lands on the crema, a
 * rosetta stacks up layer by layer, and a line is pulled through it. Drawn as a pure function of
 * `frame`, stepped at 12 fps by the preloader (24 frames = a 2 s loop). `LATTE_DONE` is the finished
 * pour with the pitcher gone, used as a still for the About card, the favicon and the share image.
 * Grid: 100 × 100, cup centred on (46, 56).
 */

export const LATTE_FRAMES = 24;
export const LATTE_DONE = 20;

const CX = 46;
const CY = 56;
const CREMA = "#D9B48C";
const LAYER_START = [4, 7, 10, 13];
// Rosetta layers, biggest first; each stacked a little higher on the cup.
const LAYERS = [
  { y: 62, s: 1.05 },
  { y: 57.5, s: 0.88 },
  { y: 53.2, s: 0.7 },
  { y: 49.2, s: 0.52 },
];

const heart = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy + 9 * s}C${cx - 14 * s} ${cy + 1 * s} ${cx - 10 * s} ${cy - 9 * s} ${cx} ${cy - 3 * s}C${cx + 10 * s} ${cy - 9 * s} ${cx + 14 * s} ${cy + 1 * s} ${cx} ${cy + 9 * s}Z`;

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const ease = (t: number) => 1 - (1 - t) * (1 - t);

export function LatteArt({ frame }: { frame: number }) {
  const f = ((frame % LATTE_FRAMES) + LATTE_FRAMES) % LATTE_FRAMES;

  const away = clamp(1 - ease(clamp(f / 3))) + ease(clamp((f - 17) / 3)); // 0 = at the cup, 1 = gone
  const pouring = f >= 4 && f <= 14;
  const rock = pouring ? Math.sin(f * 1.5) * 3 : 0;
  const pull = f < 15 ? 0 : f === 15 ? 0.5 : 1;
  const fade = f === 22 ? 0.5 : f === 23 ? 0 : 1; // art melts away so the loop can restart clean

  // Pitcher: centre, with the spout pointing at the cup. The stream runs spout tip → the pour point.
  const px = 76 + 46 * away;
  const py = 24 - 34 * away + (pouring ? Math.sin(f * 1.1) * 1.2 : 0);
  const angle = -43 + rock - (f >= 15 && f <= 17 ? 8 : 0); // lifts away after the last layer
  const tipX = px - 19 * Math.cos((angle * Math.PI) / 180);
  const tipY = py - 19 * Math.sin((angle * Math.PI) / 180);
  const wob = f % 2 ? 2 : -2;
  const pourY = 49 + (f - 4) * 1.4;

  return (
    <svg
      viewBox="0 0 100 100"
      className="ink-boil h-full w-full overflow-visible"
      fill="none"
      stroke={colors.ink}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="A latte being poured"
    >
      {/* saucer, cup, handle, coffee */}
      <circle cx={CX} cy={CY + 2} r={42} fill={colors.sticker} />
      <circle
        cx={CX}
        cy={CY + 2}
        r={34}
        strokeWidth={1.4}
        strokeOpacity={0.35}
      />
      <path
        d={`M${CX + 29} ${CY - 6}h9c4.4 0 6.4 2.6 6.4 6.4s-2 6.4-6.4 6.4h-9`}
        fill={colors.paper}
      />
      <circle cx={CX} cy={CY} r={31} fill={colors.paper} />
      <circle cx={CX} cy={CY} r={26.5} fill={colors.espresso} />
      <circle cx={CX} cy={CY} r={22} fill={CREMA} strokeWidth={1.4} />

      {/* the rosetta, layer by layer */}
      <g opacity={fade}>
        {LAYERS.map((l, i) => {
          const start = LAYER_START[i];
          const grow =
            f < start ? 0 : f === start ? 0.45 : f === start + 1 ? 0.8 : 1;
          if (!grow) return null;
          return (
            <path
              key={i}
              d={heart(CX, l.y, l.s * grow)}
              fill={colors.sticker}
              strokeWidth={1.5}
            />
          );
        })}
        {pull > 0 && (
          <path
            d="M46 40.5V70.5"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - pull}
            strokeWidth={1.6}
            stroke={colors.espresso}
          />
        )}
        {f >= 17 && f <= 21 && (
          <g strokeWidth={1.8}>
            <path d="M16 30v6M13 33h6" />
            <path d="M80 66v5M77.5 68.5h5" />
            <path d="M22 84v4M20 86h4" strokeOpacity={0.7} />
          </g>
        )}
      </g>

      {/* the stream, and the splash where it lands */}
      {pouring && (
        <g>
          <path
            d={`M${tipX} ${tipY}Q${(tipX + CX) / 2 + wob} ${(tipY + pourY) / 2 - 3} ${CX} ${pourY}`}
            strokeWidth={5.4}
          />
          <path
            d={`M${tipX} ${tipY}Q${(tipX + CX) / 2 + wob} ${(tipY + pourY) / 2 - 3} ${CX} ${pourY}`}
            strokeWidth={2.8}
            stroke={colors.sticker}
          />
          <ellipse
            cx={CX}
            cy={pourY}
            rx={3 + (f % 3)}
            ry={2 + (f % 2)}
            fill={colors.sticker}
            strokeWidth={1.4}
          />
        </g>
      )}

      {/* the pitcher (not drawn once it has left, so stills don't show it poking out) */}
      {away < 0.99 && (
        <g
          transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${angle.toFixed(1)})`}
        >
          <path d="M11 -3c9 0 9 8 0 8" strokeWidth={2.2} />
          <path d="M-11 -5.4L-20 0L-11 5.4z" fill={colors.paper} />
          <circle r={12} fill={colors.paper} />
          <circle r={7.6} strokeWidth={1.4} strokeOpacity={0.4} />
          <path
            d="M-3.4 -9.4c2.4 1 5.6 1 8 0"
            strokeWidth={1.4}
            strokeOpacity={0.5}
          />
        </g>
      )}
    </svg>
  );
}
