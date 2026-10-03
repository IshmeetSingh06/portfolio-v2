# ishfolio v2

Ishmeet Singh's portfolio: a hand-inked sketchbook page built with Next.js (App Router), Tailwind v4,
GSAP, Motion and Lenis. It is a fully static site (`output: "export"`), so it deploys as plain files.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint
pnpm build        # static site in ./out
```

## Where things live

| What | Where |
| --- | --- |
| Name, links, about copy, hobbies, `siteUrl` | `content/profile.ts` |
| Work history, stats, skills range | `content/work.ts` |
| Page sections | `components/{hero,about,work,contact}` |
| Preloader: a latte being poured (also the About card still and the icons) | `components/preloader/LatteArt.tsx` |
| Share image, icons | `app/opengraph-image.png`, `app/icon.svg`, `app/apple-icon.png` |
| Scratch pages (`noindex`) | `app/lab/*` |

## Easter eggs

Five hidden things, one per stage of a coffee (bean, grind, brew, pour, sip), tracked in
`lib/eggs.ts` and fired from `components/eggs/EasterEggs.tsx`. Progress is saved in `localStorage`
and shown in the contact footer. Spoilers are in those two files.

## Deploy: Cloudflare (Workers static assets)

The site is a static export, built by Cloudflare from this repo and served from its CDN at
`https://heyish.dev`. Every push to `main` rebuilds and redeploys it; other branches get preview URLs.

- **Build command:** `pnpm run build`  ·  **Deploy command:** `npx wrangler deploy`
- **Serves:** `./out` (see `wrangler.jsonc`: `assets.directory`, with `404.html` for unknown paths)
- **Build variable:** `NODE_VERSION=22` (add `PNPM_VERSION=11.9.0` if the pnpm version ever mismatches)
- **Domain:** Workers & Pages → `portfolio-v2` → Settings → Domains & Routes → Custom domain.
  Cloudflare creates the DNS record and certificate itself.
- Canonical and Open Graph URLs default to `https://heyish.dev` in production builds; set
  `NEXT_PUBLIC_SITE_URL` to override (for example on a preview).

## Notes

- In dev, canonical and Open Graph URLs fall back to `http://localhost:3000`.
- This Next.js version has breaking changes from older docs; see `AGENTS.md` and `node_modules/next/dist/docs/`.
