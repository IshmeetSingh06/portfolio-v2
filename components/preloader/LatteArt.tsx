import { colors } from "@/lib/tokens";

/**
 * A latte heart being poured, top-down, the way a barista does it: the pitcher slides in over the cup,
 * milk lands on the crema and swells into a heart with rings inside it. Then the spout lifts and the
 * stream is drawn straight through the heart, pulling its tip.
 * A pure function of `frame`, stepped at 12 fps by the preloader (36 frames = a 3 s loop).
 * `LATTE_DONE` is the finished pour with the pitcher gone, used as a still (About card, icons).
 * Grid: 100 × 100, cup centred on (46, 56).
 */

export const LATTE_FRAMES = 36;
export const LATTE_DONE = 33;

const CX = 46;
const CY = 56;
const CREMA = "#D9B48C";
const ANGLE = -43; // the pitcher's spout points down and to the left, at the cup
const PITCHER = 0.95; // pitcher scale
const REACH = 26 * PITCHER; // pitcher centre → spout tip

const POUR_START = 6;
const POUR_END = 24;
const CUT_END = 28;
const EXIT_START = 29;

const HEART_Y = 55; // heart centre
const HEART_S = 2.1; // full-size scale of the heart path
const INNER = "#B8855B"; // the thin rings drawn inside the milk

/**
 * A heart centred on (cx, cy): two lobes on top, a point at the bottom. `p` (0–1) is the pull-through:
 * the spout drags the milk, which stretches the point and dips the notch, with no visible line.
 */
const heart = (cx: number, cy: number, k: number, p = 0) => {
  const tip = cy + (9 + 3.2 * p) * k;
  const notch = cy + (-3 + 2 * p) * k;
  return `M${cx} ${tip}C${cx - 14 * k} ${cy + 1 * k} ${cx - 10 * k} ${cy - 9 * k} ${cx} ${notch}C${cx + 10 * k} ${cy - 9 * k} ${cx + 14 * k} ${cy + 1 * k} ${cx} ${tip}Z`;
};

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const ease = (t: number) => 1 - (1 - t) * (1 - t);
export function LatteArt({ frame }: { frame: number }) {
  const f = ((frame % LATTE_FRAMES) + LATTE_FRAMES) % LATTE_FRAMES;

  const pouring = f >= POUR_START && f <= POUR_END;
  const cutting = f > POUR_END && f <= CUT_END;
  const wig = pouring ? Math.sin((f - POUR_START) * 1.7) * 4 : 0; // the side-to-side wiggle

  // the heart swells while the milk lands in its middle
  const grow = ease(clamp((f - POUR_START) / (POUR_END - POUR_START)));
  const size = HEART_S * (0.18 + 0.82 * grow);
  const pull = cutting ? (f - POUR_END) / (CUT_END - POUR_END) : f > CUT_END ? 1 : 0;
  const landX = pouring ? CX + wig * 0.3 : CX;
  const landY = pouring ? HEART_Y - 1 + Math.sin(f * 1.3) * 1.2 : 40 + 32 * pull; // then the spout drags down the middle

  // spout tip hovers up-right of where it lands; the stream is short and fat while pouring, thin when cutting
  const lift = cutting ? 1 : 0;
  const tipX = landX + 10 + wig * 0.5 + lift * 2;
  const tipY = landY - 11 - lift * 3;
  const away = clamp(1 - ease(clamp(f / 4))) + ease(clamp((f - EXIT_START) / 4)); // 0 = over the cup, 1 = gone
  const angle = ANGLE + wig * 1.3 + (cutting ? -6 : 0);
  const rad = (angle * Math.PI) / 180;
  const px = tipX + REACH * Math.cos(rad) + 46 * away;
  const py = tipY + REACH * Math.sin(rad) - 34 * away; // sin(angle) < 0: the jug sits above-right of its spout

  const fade = f === 34 ? 0.5 : f === 35 ? 0 : 1; // the art melts so the loop restarts on a clean cup
  const stream = (w: number, c?: string) => (
    <path
      d={`M${tipX} ${tipY}Q${tipX - 2} ${(tipY + landY) / 2 + 1} ${landX} ${landY}`}
      strokeWidth={w}
      stroke={c}
    />
  );

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
      <circle cx={CX} cy={CY + 2} r={34} strokeWidth={1.4} strokeOpacity={0.35} />
      <path d={`M${CX + 29} ${CY - 6}h9c4.4 0 6.4 2.6 6.4 6.4s-2 6.4-6.4 6.4h-9`} fill={colors.paper} />
      <circle cx={CX} cy={CY} r={31} fill={colors.paper} />
      <circle cx={CX} cy={CY} r={26.5} fill={colors.espresso} />
      <circle cx={CX} cy={CY} r={22} fill={CREMA} strokeWidth={1.4} />

      {/* the heart: milk, with thin rings inside as it fills; the pull-through stretches its point */}
      <g opacity={fade}>
        {f >= POUR_START && (
          <>
            <path d={heart(CX, HEART_Y, size, pull)} fill={colors.sticker} strokeWidth={1.4} />
            {grow > 0.5 && <path d={heart(CX, HEART_Y + 0.5, size * 0.66)} stroke={INNER} strokeWidth={1.3} />}
            {grow > 0.8 && <path d={heart(CX, HEART_Y + 1, size * 0.34)} stroke={INNER} strokeWidth={1.3} />}
          </>
        )}
        {f >= 28 && f <= 33 && (
          <g strokeWidth={1.8}>
            <path d="M16 30v6M13 33h6" />
            <path d="M80 66v5M77.5 68.5h5" />
            <path d="M22 84v4M20 86h4" strokeOpacity={0.7} />
          </g>
        )}
      </g>

      {/* the stream: fat while pouring, a thin thread while drawing the line */}
      {pouring && f > POUR_START && (
        <g>
          {stream(5.8)}
          {stream(3.2, colors.sticker)}
          <ellipse cx={landX} cy={landY} rx={3.4 + (f % 3)} ry={2.2 + (f % 2)} fill={colors.sticker} strokeWidth={1.4} />
        </g>
      )}
      {cutting && (
        <g>
          {stream(3.4)}
          {stream(1.4, colors.sticker)}
        </g>
      )}

      {/* the pitcher: a tilted milk jug seen from above, spout leading, handle on the far side */}
      {away < 0.99 && (
        <g transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${PITCHER})`}>
          <path d="M20 -4c11-1.6 13 12 0 10.4" strokeWidth={2.4} />
          <path d="M-26 0C-18 -5 -12 -12.6 0 -13.2C12 -14 20 -7 20 0C20 7 12 14 0 13.2C-12 12.6 -18 5 -26 0z" fill={colors.paper} />
          <path d="M-19 0C-12 -6.6 3 -8.6 13 -4C17 0 13 5 3 6.6C-8 7.8 -14 5 -19 0z" fill={colors.sticker} strokeWidth={1.4} />
          <path d="M-9 -10.4C-4 -12 4 -12.4 10 -10" strokeWidth={1.4} strokeOpacity={0.45} />
        </g>
      )}
    </svg>
  );
}
