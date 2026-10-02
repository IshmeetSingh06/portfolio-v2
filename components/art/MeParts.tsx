import { colors } from "@/lib/tokens";
import { ME } from "@/components/art/me";

/** The dastar, to draw over the top of the face (64×64 head grid). */
export function MeTurban() {
  return (
    <g>
      <path d={ME.turban} fill={colors.ink} />
      <path d={ME.turbanFolds} stroke={colors.paper} strokeWidth={1.3} fill="none" opacity={0.85} />
    </g>
  );
}

/** The beard, to draw over the face but under the eyes and mouth. */
export function MeBeard() {
  const p = ME.mouthPatch;
  return (
    <g>
      <path d={ME.beard} fill={colors.ink} />
      <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={colors.paper} stroke="none" />
    </g>
  );
}
