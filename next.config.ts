import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A fully static site: `next build` writes plain files to /out, which GitHub Pages (or Cloudflare
  // Pages) can serve as-is. No server features are used.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
