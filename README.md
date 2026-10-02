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
| Head doodle (turban + beard), shared by nav, about card, preloader | `components/art/me.ts`, `MeParts.tsx` |
| Preloader (SVG sip loop; can use a video or PNG frames) | `components/preloader`, `PRELOADER_VIDEO.md`, `PRELOADER_FRAMES.md` |
| Share image, icons | `app/opengraph-image.png`, `app/icon.svg`, `app/apple-icon.png` |
| Scratch pages (`noindex`) | `app/lab/*` |

## Deploy: GitHub Pages + a Cloudflare domain

1. **Push** this repo to GitHub.
2. **Pages source:** repo → Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. **Site URL:** repo → Settings → Secrets and variables → Actions → **Variables** → add
   `SITE_URL` = `https://your-domain.com`. It feeds the canonical URL, Open Graph tags, sitemap and robots.
4. **Custom domain:** Settings → Pages → Custom domain → enter your domain. (GitHub also writes a `CNAME`
   file for it; for a root domain you can instead commit `public/CNAME` containing the bare domain.)
5. **Cloudflare DNS** (the domain's zone):
   - Subdomain (`www`, `me`, …): `CNAME` → `<your-github-username>.github.io`.
   - Apex domain: four `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153` (and optionally the four `AAAA` records from GitHub's docs).
   - Start with the proxy **DNS only** (grey cloud) until GitHub issues its certificate and
     "Enforce HTTPS" can be ticked. Then you may turn the proxy on, with SSL/TLS mode **Full (strict)**.
6. Every push to `main` runs `.github/workflows/deploy.yml` (lint, build, publish).

Cloudflare Pages is an equally good host for the same output: connect the repo, build command
`pnpm build`, output directory `out`, and set `NEXT_PUBLIC_SITE_URL`.

## Notes

- Without `NEXT_PUBLIC_SITE_URL` the canonical and Open Graph URLs fall back to `http://localhost:3000`.
- This Next.js version has breaking changes from older docs; see `AGENTS.md` and `node_modules/next/dist/docs/`.
