# Preloader video

The preloader plays the video named in `public/preloader/frames.json` (`"video": "loading.mp4"`; it is `null` today) (else PNG frames, else the ink
placeholder). Same idea as moneyincheck.org: one tiny silent looping clip, centred.

## Deliverable
- `public/preloader/loading.mp4`: ~2 s seamless loop, silent, **white background**, character centred,
  static camera, 600x750 or similar (4:5), H.264, target under 300 KB.
- The page multiplies it onto the paper, so pure white (#fff) must be truly white.

## Step 1: reference image (any image model)
> Black ink sketchbook doodle of a young Sikh man with a black turban and full black beard, plain white
> t-shirt, holding a coffee mug at chest height with steam rising. Confident hand-drawn ink lines with
> slight wobble, flat black fills for turban and beard, light grey shading, no colour, pure white
> background, centred, waist-up, friendly expression.

## Step 2: image-to-video (Kling / Veo / Runway / Luma), using that image as the first AND last frame
> Static camera, pure white background, hand-drawn ink doodle style stays exactly the same. The man lifts
> the mug to his mouth, takes a slow sip with eyes closed, lowers it with a small contented smile, and
> returns to the starting pose. Gentle steam. Seamless loop, no camera movement, no zoom, no text.

Tips: set the end frame equal to the start frame for a clean loop; generate 3-4 takes and pick the one
whose line weight stays steadiest; keep it to 2-4 s.

## Step 3: encode (needs ffmpeg: `brew install ffmpeg`)
    ffmpeg -i raw.mp4 -an -vf "scale=600:-2,fps=24" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart public/preloader/loading.mp4
