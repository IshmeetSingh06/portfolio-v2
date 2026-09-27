import type { DoodleProps } from "@/components/art/doodles";

/**
 * Ingredient stickers you can feed to Bean. Same 64×64 ink conventions as doodles.tsx;
 * these are always drawn in colour since they only ever appear as stickers.
 */

function Frame({ children, strokeW = 2.6, tint, ...rest }: DoodleProps & { children: React.ReactNode }) {
  void tint;
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {children}
    </svg>
  );
}

export function SugarCube(props: DoodleProps) {
  return (
    <Frame {...props}>
      <path fill="#FFFDF8" d="M32 12.4 50 21 32 29.8 14 21z" />
      <path fill="#EDE5D8" d="M14 21v20.4L32 50V29.8z" />
      <path fill="#F7F2EA" d="M50 21v20.4L32 50V29.8z" />
      <path d="M26 20.6v.1M36 18.6v.1M31.4 23.6v.1M20 33v.1M25 39.4v.1M40 36v.1M44 30.4v.1" strokeWidth={2.4} strokeOpacity={0.5} />
    </Frame>
  );
}

export function MilkCarton(props: DoodleProps) {
  return (
    <Frame {...props}>
      <path fill="#E4EEF6" d="M40 25.6 47.6 13v33.8L40 57z" />
      <path fill="#FFFDF8" d="M17.6 25.6h22.4V57H17.6z" />
      <path fill="#FFFDF8" d="M17.6 25.6 25.4 13h22.2L40 25.6z" />
      <path fill="#F5D46B" d="M25.4 13l1.8-5.4h18.6l1.8 5.4" />
      <path fill="#8EC5E8" d="M17.6 35.4h22.4v11H17.6z" />
      <path d="M26 39.4c1 2.6 4.6 2.6 5.6 0" strokeWidth={2} />
      <circle cx="24.4" cy="30" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="33.4" cy="51" r="1.4" fill="currentColor" stroke="none" />
    </Frame>
  );
}

export function IceCube(props: DoodleProps) {
  return (
    <Frame {...props}>
      <path fill="#EAF6FD" d="M13.6 22.4 34 13.6 52 20.6 31.6 29.6z" />
      <path fill="#C9E5F6" d="M13.6 22.4v20.4l18 9.4V29.6z" />
      <path fill="#B2D9F0" d="M52 20.6v20.6L31.6 52.2V29.6z" />
      <path d="M19 27.4v9M23 30.6v3" stroke="#FFFDF8" strokeWidth={3} />
      <path d="M31 18.6l6-2.4" stroke="#FFFDF8" strokeWidth={2.4} />
    </Frame>
  );
}

export function EspressoBeans(props: DoodleProps) {
  return (
    <Frame {...props}>
      <ellipse cx="25" cy="33" rx="11" ry="15" transform="rotate(-24 25 33)" fill="#6B4430" />
      <path d="M21 20.4c6.6 6 3.4 17.2 7.8 25.6" stroke="#E8C9A3" strokeWidth={2.4} />
      <ellipse cx="42" cy="36" rx="9.6" ry="13.2" transform="rotate(22 42 36)" fill="#835538" />
      <path d="M46.6 24.6c-6.4 5-3.6 15.4-8.8 22.4" stroke="#E8C9A3" strokeWidth={2.2} />
    </Frame>
  );
}

export function MatchaBowl(props: DoodleProps) {
  return (
    <Frame {...props}>
      <path fill="#E8DCC8" d="M10.6 30c0 14 9.4 24 21.4 24s21.4-10 21.4-24" />
      <path fill="#7FA66B" d="M10.6 30c0-6 42.8-6 42.8 0s-42.8 6-42.8 0z" />
      <path d="M20 30.2c2-1.8 4.2-1.8 6 0M33 28.8c2-1.6 4-1.6 5.8 0" stroke="#D6E8C4" strokeWidth={2} />
      <path d="M24 54.6h16" />
      <path d="M44 22.6 52.6 8.4M47 24l8.2-13.4M50.4 25.4 57.4 13" strokeWidth={2} />
    </Frame>
  );
}

export const INGREDIENTS = {
  milk: { Art: MilkCarton, label: "milk carton" },
  sugar: { Art: SugarCube, label: "sugar cube" },
  ice: { Art: IceCube, label: "ice cube" },
  espresso: { Art: EspressoBeans, label: "espresso beans" },
  matcha: { Art: MatchaBowl, label: "matcha" },
} as const;
