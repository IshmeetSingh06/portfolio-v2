# Preloader frames

The preloader plays a short hand-drawn loop of Ishmeet sipping coffee, centred on the page,
while handwritten notes pop in and out around him (the moneyincheck.org approach). The code is
done; it needs the drawn frames. Until they exist, a simple ink placeholder plays.

## Deliverable

- **12–16 PNG frames**, one loop, played at **12 fps** (about 1–1.3 s per loop).
- **800 × 1000 px**, transparent background, character centred, feet or waist at the same
  baseline in every frame (so nothing jitters except what should move).
- Files: `public/preloader/sip-00.png` … `sip-15.png`
- Then update `public/preloader/frames.json` (it ships with `"count": 0`, which means "use the placeholder"):

  ```json
  { "count": 16, "fps": 12, "pattern": "sip-{n}.png", "pad": 2 }
  ```

  The player picks this up automatically; nothing else to change.

## Style

- Black ink line art like a sketchbook doodle: confident, slightly wobbly lines, line weight
  varying a little. Flat fills only: black for the turban and beard, a light grey for shading,
  everything else left white. **No colour except the coffee** (a warm brown, optional).
- Same character in every frame (consistent proportions, outfit and line weight). Waist-up or
  full-body, slightly stylised, friendly.
- Ishmeet: black turban (dastar), full black beard, plain t-shirt or polo, holding a mug.

## The loop (16 frames)

| Frames | Action |
| --- | --- |
| 00–02 | Standing, mug held at chest height, steam rising, eyes open |
| 03–05 | Lifts the mug toward his mouth, head tilts back slightly |
| 06–08 | Sipping: eyes closed, mug tipped, shoulders relaxed (hold) |
| 09–11 | Lowers the mug, happy closed-eye smile, a small "ahh" |
| 12–14 | Back to chest height, eyes open, little contented bob |
| 15 | Matches frame 00 closely so the loop is seamless |

## Prompts (for an image generator, e.g. Arrow 2.0)

Generate the key poses first (frames 00, 04, 07, 10, 13) with the same seed and style, then the
in-betweens.

> Black ink sketchbook doodle of a young Sikh man with a black turban and full black beard,
> wearing a plain white t-shirt, holding a coffee mug at chest height with steam rising.
> Confident hand-drawn ink lines with slight wobble, flat black fills for turban and beard,
> light grey shading, no colour, transparent background, centred, waist-up, friendly expression.
> Animation frame [N] of a 16-frame loop: [action from the table].

Keep the same wording for every frame and only change the last sentence.
