/**
 * Global SVG filters. `ink-0..2` are three displacement seeds; `.ink-boil` cycles
 * through them at ~8fps (see globals.css) for the hand-drawn "line boil" look.
 */
export function InkFilters() {
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        {[3, 11, 29].map((seed, i) => (
          <filter
            key={seed}
            id={`ink-${i}`}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="2"
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        ))}
      </defs>
    </svg>
  );
}
