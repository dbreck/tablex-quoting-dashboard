// Design comps — high-fidelity page mockups (from claude.ai/design) surfaced
// under Content → Comps. Each opens its standalone HTML full-screen in a new
// tab (files live in public/comps/). Adding a comp = drop the HTML in
// public/comps/ + add one entry here (+ optional thumb in public/comps/thumbs/).

export interface Comp {
  slug: string;
  label: string;
  description: string;
  /** Path under public/, opened in a new tab. */
  file: string;
  /** Optional poster image under public/ for the gallery card. */
  thumb?: string;
  /** ISO date the comp was added. */
  date: string;
  /** Origin tool. */
  tool: string;
  tags?: string[];
}

export const comps: Comp[] = [
  {
    slug: "home-full-build",
    label: "Home — Full Build",
    description:
      "Full homepage comp from Kayla's approved direction — iteration 01 applied (Brian's 5/27 feedback): wordmark hero, SELLING door, 'Your quote, right now.', Quick Ship carries the ships-from-Jasper story, Made in America fold removed, Finishes reframed to differentiators.",
    // Multi-file bundle (index.html + live JSX components) — replaced the old
    // single-file blob export 2026-06-05 so fixes can be made directly in src/.
    file: "/comps/home-full-build/index.html",
    thumb: "/comps/thumbs/comps-home-full-build-html.png",
    date: "2026-06-05",
    tool: "claude.ai/design",
    tags: ["Home", "Marketing"],
  },
];
