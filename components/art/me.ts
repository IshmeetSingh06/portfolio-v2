/** Ishmeet's head doodle (after Jackie's), on a 64×64 grid. Shared by the nav, about card and preloader. */
export const ME = {
  /** Old spiky hair, kept for reference; the doodle now wears a dastar (see MeParts). */
  hair: "M18 29 18.6 19 23 23 25.6 14.6 29.6 20 33 12.4 36 19.4 40 13.6 42.4 20 46.6 17 46 29",
  face: "M18 28.6c-1.2 13.2 5.8 23.6 14 23.6s15.2-10.4 14-23.6",
  ears: "M18.2 34c-4.6-1.4-5.8 6-.2 7.4M45.8 34c4.6-1.4 5.8 6 .2 7.4",
  eyes: [
    [27.4, 36],
    [36.6, 36],
  ] as const,
  eyesClosed: "M25 36.4c1.4 1.4 3.4 1.4 4.8 0M34.2 36.4c1.4 1.4 3.4 1.4 4.8 0",
  smile: "M27.4 42.4C29.8 45.4 34.2 45.4 36.6 42.4",

  /** Dastar: a filled dome with paper-coloured wrap folds. */
  turban: "M15.4 29.4C12.2 17 19 5 32 5S51.8 17 48.6 29.4C42.5 24.8 21.5 24.8 15.4 29.4Z",
  turbanFolds: "M15.2 26.6C24 22.6 36 15 44.6 7.6M14.6 20.6C22 17.4 33 11.6 39.4 5.8M21 27.4C31 24.4 42 18.4 49.4 12M26.6 25C35 23.6 43 19.6 48.6 18",
  /** Full beard: a ring round the jaw with the mouth left open above the chin. */
  beard: "M16.8 35.4C15.4 50 23 60.4 32 60.4S48.6 50 47.2 35.4L45.6 36C44.8 40 40.5 40.2 37 40.8Q32 39.2 27 40.8C23.5 40.2 19.2 40 18.4 36Z",
  /** Paper patch behind the mouth so the lips read against the beard. */
  mouthPatch: { cx: 32, cy: 44, rx: 6.4, ry: 3.6 },
};
