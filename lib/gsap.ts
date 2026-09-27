"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    SplitText,
    DrawSVGPlugin,
    MorphSVGPlugin,
    Draggable,
    InertiaPlugin,
    Flip,
  );
}

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  DrawSVGPlugin,
  MorphSVGPlugin,
  Draggable,
  InertiaPlugin,
  Flip,
};
