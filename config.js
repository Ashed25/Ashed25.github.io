// Edit this file to personalize your portfolio.
const CONFIG = {
  name: "Aung Sett Hpone",
  tagline: "Developer building web apps, games and machine learning projects.",
  github: "Ashed25", // public repos load automatically
  email: "", // optional, shown as a contact link
  links: [
    // { label: "LinkedIn", url: "https://linkedin.com/in/you" },
  ],
  hideRepos: ["Ashed25.github.io"], // repo names to leave out

  // Category -> repo names. Repos not listed here go under "Other".
  // To give a project a "Try it live" button, set its Website field on GitHub
  // (repo page -> About -> gear icon), or: gh repo edit Ashed25/<repo> --homepage <url>
  categories: {
    "Web Apps": ["u-ahi-fabric-pos", "Study-Buddy"],
    "Games": ["Knightfall-unity", "slot-demo"],
    "AI & Research": ["EcoSort", "pcg-augmentation-research"],
  },

  // Projects not on GitHub yet: in progress, planned, or hosted elsewhere.
  upcoming: [
    // {
    //   name: "My Next Project",
    //   description: "A short sentence about what it will do.",
    //   status: "Planned", // e.g. "Planned", "In progress"
    //   tags: ["JavaScript"],
    //   url: "", // optional
    // },
  ],
};
