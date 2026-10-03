import { colors } from "@/lib/tokens";

/**
 * A latte being poured, top-down, the way a barista does it: the pitcher slides in over the cup,
 * milk lands on the crema, and as the pitcher wiggles side to side and backs off, the rosetta grows
 * layer by layer. Then the spout lifts and the stream is drawn straight through the pattern.
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
const PITCHER = 0.82; // pitcher scale
const REACH = 21 * PITCHER; // pitcher centre → spout tip

const POUR_START = 6;
const POUR_END = 24;
const CUT_END = 28;
const EXIT_START = 29;

// Rosetta layers (leaf crescents), stacked down the cup: [y, half-width]
const LAYERS: [number, number][] = [
  [46, 7.5],
  [49.4, 10.5],
  [52.8, 13],
  [56.2, 14],
  [59.6, 12.5],
  [63, 10],
  [66.4, 6.5],
];
const layerFrame = (i: number) => POUR_START + 1 + Math.round((i * (POUR_END - POUR_START - 3)) / (LAYERS.length - 1));

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const ease = (t: number) => 1 - (1 - t) * (1 - t);
const crescent = (y: number, w: number, s: number) => {
  const hw = w * s;
  return `M${CX - hw} ${y}Q${CX} ${y - hw * 0.85} ${CX + hw} ${y}Q${CX} ${y + 2.4 * s} ${CX - hw} ${y}Z`;
};

export function LatteArt({ frame }: { frame: number }) {
  const f = ((frame % LATTE_FRAMES) + LATTE_FRAMES) % LATTE_FRAMES;

  const pouring = f >= POUR_START && f <= POUR_END;
  const cutting = f > POUR_END && f <= CUT_END;
  const wig = pouring ? Math.sin((f - POUR_START) * 1.7) * 4 : 0; // the side-to-side wiggle

  // where the milk lands
  const poolY = 46 + 20 * clamp((f - POUR_START) / (POUR_END - POUR_START));
  const pull = cutting ? (f - POUR_END) / (CUT_END - POUR_END) : f > CUT_END ? 1 : 0;
  const landX = pouring ? CX + wig * 0.5 : CX;
  const landY = pouring ? poolY : 43 + 29 * pull;

  // spout tip hovers up-right of where it lands; the stream is short and fat while pouring, thin when cutting
  const lift = cutting ? 1 : 0;
  const tipX = landX + 10 + wig * 0.5 + lift * 2;
  const tipY = landY - 11 - lift * 3;
  const away = clamp(1 - ease(clamp(f / 4))) + ease(clamp((f - EXIT_START) / 4)); // 0 = over the cup, 1 = gone
  const angle = ANGLE + wig * 1.3 + (cutting ? -6 : 0);
  const rad = (angle * Math.PI) / 180;
  const px = tipX + REACH * Math.cos(rad) + 46 * away;
  const py = tipY + REACH * Math.sin(rad) * -1 - 34 * away;

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

      {/* the rosetta: each leaf grows in as the pour reaches it */}
      <g opacity={fade}>
        {LAYERS.map(([y, w], i) => {
          const t = f - layerFrame(i);
          if (t < 0) return null;
          return <path key={i} d={crescent(y, w, t === 0 ? 0.4 : t === 1 ? 0.75 : 1)} fill={colors.sticker} strokeWidth={1.1} />;
        })}
        {pull > 0 && (
          <path d="M46 43V72" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pull} strokeWidth={1.6} stroke={colors.espresso} />
        )}
        {f >= 28 && f <= 33 && (
          <g strokeWidth={1.8}>
            <path d="M16 30v6M13 33h6" />
            <path d="M80 66v5M77.5 68.5h5" />
            <path d="M22 84v4M20 86h4" strokeOpacity={0.7} />
          </g>
        )}
      </g>

      {/* the stream: fat and wobbling while pouring, a thin thread while drawing the line */}
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

      {/* the pitcher: round body, pointed spout, handle on the far side (not drawn once it has left) */}
      {away < 0.99 && (
        <g transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${PITCHER})`}>
          <path d="M11 -3.4c9.4-1 10.6 9 0 9.4" strokeWidth={2.2} />
          <path d="M-9.4 -9.4C-14 -8.4 -17 -4.6 -21 0c4 4.6 7 8.4 11.6 9.4A12.6 12.6 0 1 0 -9.4 -9.4z" fill={colors.paper} />
          <ellipse cx={-1} cy={0} rx={7.6} ry={7} strokeWidth={1.4} strokeOpacity={0.4} />
          <path d="M-5.4 -9.8c3.2 1.2 7 1.2 10 -.2" strokeWidth={1.4} strokeOpacity={0.5} />
        </g>
      )}
    </svg>
  );
}
