"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    DrawSVGPlugin,
    MorphSVGPlugin,
    Draggable,
    InertiaPlugin,
  );
}

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  DrawSVGPlugin,
  MorphSVGPlugin,
  Draggable,
  InertiaPlugin,
};
