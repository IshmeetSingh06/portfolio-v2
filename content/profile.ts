export const profile = {
  name: "Ishmeet Singh",
  firstName: "Ishmeet",
  role: "Design engineer",
  location: "New Delhi, India",
  timezone: "Asia/Kolkata",
  email: "singhishmeet16@gmail.com",
  openToWork: true,
  resume: "https://drive.google.com/file/d/1OwbYFxctpqevCDdkGi83NIfWYYmqTwWd/view?usp=sharing",
  socials: {
    github: "https://github.com/IshmeetSingh06",
    linkedin: "https://www.linkedin.com/in/ishmeet-singh-1b2359206/",
    instagram: "https://www.instagram.com/ishmeetsingh06/",
  },
} as const;

/** About-section copy. Starter text drawn from the hero; rewrite it in your own voice. */
export const about = {
  heading: ["Part designer,", "part engineer,", "all in on the details."],
  paragraphs: [
    "I'm Ishmeet, a design engineer in New Delhi. I live in the gap between a mockup and the real thing: the easing, the spacing, the little states nobody asked for.",
    "I like building interfaces that feel alive, and I'm happiest when I get to design and code the same screen.",
  ],
  fade: "Off the clock the details follow me around anyway.",
  hobbies: [
    { id: "coffee", title: "coffee", note: "pour-overs, mostly. Bean is a bit of a regular." },
    { id: "books", title: "books", note: "usually mid-chapter in more than one." },
    { id: "keyboards", title: "keyboards", note: "if it doesn't go *thock*, I'm not interested." },
  ],
} as const;
