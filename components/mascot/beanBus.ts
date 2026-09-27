/** Tiny event bus between ingredient stickers and Bean the mascot. */

export type Ingredient = "milk" | "sugar" | "ice" | "espresso" | "matcha";

/** How close a carried ingredient is to Bean. */
export type Interest = "none" | "close" | "over";

export type BeanEvent =
  | { type: "interest"; ingredient: Ingredient; level: Interest }
  | { type: "feed"; ingredient: Ingredient }
  /** It came close, then got carried off without being fed. */
  | { type: "denied"; ingredient: Ingredient };

/** Drop target ingredients hit-test against. */
export const BEAN_TARGET = ".cup-buddy .bb-hit";

const EVENT = "bean";

export function emitBean(detail: BeanEvent) {
  window.dispatchEvent(new CustomEvent<BeanEvent>(EVENT, { detail }));
}

export function onBean(handler: (e: BeanEvent) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<BeanEvent>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
