import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/profile";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // The lab pages are my own scratchpads: reachable, but not for search engines.
  return { rules: [{ userAgent: "*", allow: "/", disallow: "/lab/" }], sitemap: `${siteUrl}/sitemap.xml` };
}
