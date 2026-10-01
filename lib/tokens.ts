export const colors = {
  paper: "#F4EFE6",
  paperDeep: "#EAE2D3",
  ink: "#1A1714",
  inkSoft: "#5B534B",
  sticker: "#FFFDF8",
  tomato: "#E8553D",
  matcha: "#7FA66B",
  espresso: "#6B4430",
  sky: "#8EC5E8",
  butter: "#F5D46B",
  sakura: "#F2A7B8",
  lilac: "#C3B1E1",
  desk: "#211F1D",
  deskSoft: "#2B2825",
  chalk: "#EFE6D6",
} as const;

/** GSAP eases. `ink` is the house ease: quick start, soft landing, like a pen stroke. */
export const ease = {
  ink: "power3.out",
  inkInOut: "power3.inOut",
  snap: "back.out(2.2)",
  wobble: "elastic.out(1, 0.45)",
} as const;

/** Motion (motion/react) springs. */
export const spring = {
  pop: { type: "spring", stiffness: 500, damping: 22, mass: 0.8 },
  soft: { type: "spring", stiffness: 180, damping: 20 },
  lazy: { type: "spring", stiffness: 90, damping: 16 },
} as const;

/** Seconds. */
export const dur = { xs: 0.12, s: 0.24, m: 0.48, l: 0.9 } as const;
