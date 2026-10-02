/** Work history. `when` is left out where the source gave no dates; add it and it will show. */
export type Role = {
  company: string;
  title: string;
  when?: string;
  where?: string;
  /** Marks the open-source entry, which is styled as a side quest rather than a job. */
  oss?: boolean;
  /** The first `HIGHLIGHTS` bullets show; the rest sit behind "more". */
  bullets: string[];
  skills: string[];
};

export const HIGHLIGHTS = 3;

export const stats = [
  { value: "8s → 1.2s", label: "LCP on Just, after the TanStack move", tint: "butter", rotate: -2 },
  { value: "64 → 98", label: "Lighthouse performance score", tint: "sky", rotate: 2 },
  { value: "₹6.34 Cr", label: "sales from one Assure growth feature", tint: "sakura", rotate: -1.5 },
  { value: "~32%", label: "off CI build times on Pyng", tint: "lilac", rotate: 2.5 },
] as const;

/** Range beyond the role bullets (from the profile headline), grouped by platform. */
export const range = [
  { area: "iOS", items: ["Swift", "SwiftUI", "MVVM", "Performance tuning", "Modular architecture"] },
  { area: "Cross-platform", items: ["React Native", "Expo"] },
  { area: "Android", items: ["Kotlin", "Jetpack Compose"] },
  { area: "Web", items: ["React", "Next.js", "TanStack"] },
  { area: "Backend", items: ["NestJS", "Go", "Ruby on Rails", "Node.js"] },
  { area: "Open source", items: ["GitLab", "OpenStreetMap"] },
] as const;

export const roles: Role[] = [
  {
    company: "Swiggy",
    title: "SDE-2",
    when: "Apr 2025 – present",
    bullets: [
      "Promoted to lead frontend for Just, Swiggy's new value grocery app, owning technical strategy and architecture across iOS, Android and Web from 0→1.",
      "Improved page load (LCP) from 8s to 1.2s by migrating the Just web stack to TanStack, lifting the Lighthouse Performance score from 64 to 98.",
      "Architected the Just iOS and Android apps from scratch: native app shells, branded theming, App Store / Play Store setup and Bitrise CI/CD.",
      "Drove the hybrid architecture, balancing a native iOS feel with reuse of existing web surfaces to ship faster.",
      "Set up production monitoring and alerting with New Relic and Opsgenie, plus AppsFlyer and MoEngage tracking from day one.",
      "Mentored interns and junior engineers, ran daily frontend tech standups, and interviewed for frontend hiring.",
    ],
    skills: ["Swift", "React Native", "TanStack", "Kotlin", "Bitrise", "System design"],
  },
  {
    company: "Swiggy",
    title: "SDE-1",
    when: "Jun 2024 – Mar 2025",
    bullets: [
      "Co-led a growth feature on Swiggy Assure end-to-end: ₹6.34 Cr in sales, 4,000+ orders and a 6% lift in new-user conversion.",
      "Shipped a same-day fix for an iOS 26 keyboard bug that blocked every Assure iOS login, coordinating an expedited App Store review.",
      "Upgraded the Pyng apps to the latest React Native and Expo with a phased rollout and rollback plan, cutting CI build times by ~32%.",
      "Worked across Assure (B2B supply app for restaurants), Pyng (customers meet service experts) and Minis, on iOS, Android and Web.",
      "Launched the Pyng customer and expert apps, handling App Store submissions, Apple review rejections and production fixes.",
      "Built real-time lead alerts for Pyng experts with native Swift and Kotlin modules, full-screen notifications and deep links.",
      "Built a reusable identity verification (KYC) module with native iOS/Android bridges, shared across several Swiggy products.",
      "Improved the Assure iOS app by removing redundant WebView reloads and fixing deep-link and navigation flows.",
      "Used AI tools to cut component build effort by ~75%, while keeping 80%+ unit test coverage across PRs.",
    ],
    skills: ["Swift", "React Native", "Kotlin", "Expo", "Java", "Azure OpenAI"],
  },
  {
    company: "LocoNav",
    title: "Software Engineer I",
    when: "Jul 2023 – Jun 2024",
    where: "Gurugram",
    bullets: [
      "Cut critical API response times by 50%+ using Datadog APM insights, keeping core endpoints under 100ms.",
      "Built an in-house CRM from scratch with Ruby on Rails and PostgreSQL, used by 100+ employees.",
      "Reduced database load by 10% through query optimization and L1/L2 caching layers.",
      "Refactored core system entities, consolidating access patterns across 200+ reports and APIs.",
    ],
    skills: ["Ruby on Rails", "PostgreSQL", "Datadog", "System design"],
  },
  {
    company: "Cuvette",
    title: "Software Developer Intern",
    when: "Nov 2022 – Jul 2023",
    where: "Bengaluru (remote)",
    bullets: [
      "Built features for a job platform serving 2.5M+ active users and 10K+ daily applications with React.js, Next.js, Node.js and MongoDB.",
      "Shipped authentication, payments, real-time notifications and a referral system that lifted engagement by 50%.",
      "Developed optimized APIs and queries that held 99.9% uptime and sub-200ms responses under high traffic.",
    ],
    skills: ["React.js", "Next.js", "Node.js", "MongoDB"],
  },
  {
    company: "GitLab",
    title: "Open source contributor",
    when: "2024 – present",
    where: "remote",
    oss: true,
    bullets: [
      "5 merged changes to GitLab's open-source codebase (Ruby on Rails, Vue.js), through code review with GitLab maintainers.",
      "Redesigned the CI/CD variable settings: the “Mask variable” checkbox became a “Visibility” radio group that permanently hides sensitive values.",
      "Reworked the merge request review flow so unresolved threaded reviews block premature merges.",
      "100% test coverage for critical export files, plus hardened state machine transitions in the ProjectExportJob model.",
      "Refactored user follow into an independent service, cutting core module dependencies and tech debt.",
      "Fixed the “@” mention and “/” quick action dropdowns scrolling out of view in the plain text editor.",
    ],
    skills: ["Ruby on Rails", "Vue.js", "RSpec", "Open source"],
  },
];
