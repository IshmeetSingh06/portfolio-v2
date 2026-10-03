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

## Deploy: GitHub Pages + a Cloudflare domain

1. **Push** this repo to GitHub.
2. **Pages source:** repo → Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. **Site URL:** production builds already default to `https://heyish.dev` (`content/profile.ts`), so nothing to set.
   To override it, for example for a preview, add an Actions variable `SITE_URL`.
4. **Custom domain:** `public/CNAME` already contains `heyish.dev`. After the first deploy, confirm it under
   Settings → Pages → Custom domain, then tick **Enforce HTTPS** once the certificate is issued (`.dev`
   domains are HTTPS-only, so this matters).
5. **Cloudflare DNS** (the domain's zone):
   - `heyish.dev` is an apex domain: four `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153` (and optionally the four `AAAA` records from GitHub's docs). Add a `www` `CNAME` →
     `<your-github-username>.github.io` if you want `www.heyish.dev` to work too.
   - Start with the proxy **DNS only** (grey cloud) until GitHub issues its certificate and
     "Enforce HTTPS" can be ticked. Then you may turn the proxy on, with SSL/TLS mode **Full (strict)**.
6. Every push to `main` runs `.github/workflows/deploy.yml` (lint, build, publish).

Cloudflare Pages is an equally good host for the same output: connect the repo, build command
`pnpm build`, output directory `out`.

## Notes

- Canonical and Open Graph URLs use `https://heyish.dev` in production builds and `http://localhost:3000` in dev.
- This Next.js version has breaking changes from older docs; see `AGENTS.md` and `node_modules/next/dist/docs/`.
