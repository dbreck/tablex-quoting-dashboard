// User Personas — structured data from persona research docs

export interface PersonaGoal {
  text: string;
}

export interface PersonaPainPoint {
  title: string;
  detail: string;
}

export interface WebsiteBehavior {
  visitTriggers: string[];
  sessionFlow: string[];
  deviceSplit: { device: string; pct: number }[];
  infoPriorities: string[];
}

export interface WebsiteImplication {
  title: string;
  detail: string;
}

export interface Persona {
  id: string;
  role: string;
  subtitle: string;
  icon: string;
  accent: "blue" | "green" | "amber";
  trafficShare: string;
  summary: string;
  keyInsight: string;
  demographics: {
    ageRange: string;
    experience: string;
    location: string;
  };
  goals: PersonaGoal[];
  painPoints: PersonaPainPoint[];
  websiteBehavior: WebsiteBehavior;
  websiteImplications: WebsiteImplication[];
  quotes: string[];
  dealBreakers: string[];
}

export const personas: Persona[] = [
  {
    id: "dealer",
    role: "Commercial Dealer",
    subtitle: "Owner, Sales Director, or Project Manager at commercial furniture dealership",
    icon: "Building2",
    accent: "blue",
    trafficShare: "~60%",
    summary:
      "Time-constrained professionals managing multiple projects. They need frictionless access to pricing, specs, and downloadable assets. The website should reduce quote preparation time and give them confidence in product availability and lead times.",
    keyInsight:
      "Dealers are the primary revenue channel. They need a manufacturer partner who makes their job easier — fast pricing, clear specs, reliable delivery.",
    demographics: {
      ageRange: "35–60",
      experience: "5–20+ years in commercial furniture",
      location: "Urban/suburban markets across North America",
    },
    goals: [
      { text: "Win profitable projects and meet quarterly sales targets" },
      { text: "Build long-term client relationships for repeat business" },
      { text: "Provide complete turnkey solutions (design through installation)" },
      { text: "Manage multiple concurrent projects efficiently" },
    ],
    painPoints: [
      {
        title: "Complex quoting",
        detail: "Projects require detailed specs, pricing from multiple manufacturers, custom configurations",
      },
      {
        title: "Lead time pressure",
        detail: "Balancing client urgency against manufacturer production schedules",
      },
      {
        title: "Slow response times",
        detail: "Waiting on quotes or answers kills deals and damages credibility",
      },
      {
        title: "Unclear availability",
        detail: "Need transparency on stock levels, quick-ship status, and current delays",
      },
    ],
    websiteBehavior: {
      visitTriggers: [
        "Client project requiring tables",
        "Researching specs for specific application",
        "Downloading pricing, CAD files, brochures",
        "Checking finish options and lead times",
      ],
      sessionFlow: [
        "Direct navigation to specific product (bookmark or rep link)",
        "Download materials: price lists, spec sheets, CAD, brochures",
        "Check finish compatibility for project",
        "Submit quote form with project details",
        "Quick exit — get what they need and move on",
      ],
      deviceSplit: [
        { device: "Desktop", pct: 70 },
        { device: "Tablet", pct: 20 },
        { device: "Mobile", pct: 10 },
      ],
      infoPriorities: [
        "Pricing (standard and volume/project)",
        "Lead times (standard vs. quick-ship)",
        "Specifications (dimensions, weight, materials)",
        "CAD files (for space planning drawings)",
        "Product photography (for client presentations)",
        "Finish options (powdercoat, laminates, edges)",
      ],
    },
    websiteImplications: [
      {
        title: "Fast asset downloads",
        detail: "PDFs, CAD, images without registration barriers",
      },
      {
        title: "Clear, accurate pricing",
        detail: "Even if login/dealer credentials required",
      },
      {
        title: "Lead time transparency",
        detail: "Standard vs. quick-ship, current delays",
      },
      {
        title: "Easy quote submission",
        detail: "With ability to save/reference past quotes",
      },
    ],
    quotes: [
      "I need a manufacturer partner who makes my job easier — fast pricing, clear specs, reliable delivery, and a rep who understands my market.",
      "TableX's website should help me quote projects quickly and give my clients confidence we're spec'ing quality American-made tables.",
    ],
    dealBreakers: [
      "Slow response times on quotes or questions",
      "Unclear or inconsistent product information",
      "Difficult-to-navigate website (especially on mobile)",
      "Hidden costs or surprise lead time delays",
      "Poor manufacturer rep support in their territory",
    ],
  },
  {
    id: "rep",
    role: "Manufacturer's Rep",
    subtitle: "Independent contractor representing TableX in assigned territory",
    icon: "Briefcase",
    accent: "green",
    trafficShare: "~30%",
    summary:
      "Reps are TableX's sales force in the field, but they're juggling 5–10+ manufacturers. TableX wins rep mindshare by being easy to work with: responsive support, accurate information, competitive pricing, and strong sales tools.",
    keyInsight:
      "Reps push manufacturers that are easiest to sell. Poor TableX performance may lead rep to drop line for competitor.",
    demographics: {
      ageRange: "30–65",
      experience: "3–25+ years in commercial furniture sales",
      location: "Regional territories across North America (multi-state)",
    },
    goals: [
      { text: "Grow territory sales for all represented manufacturers" },
      { text: "Build strong dealer relationships (trust, loyalty, repeat business)" },
      { text: "Maximize commission income through volume and new accounts" },
      { text: "Efficiently manage territory — minimize travel waste, maximize face-time" },
    ],
    painPoints: [
      {
        title: "Multiple principals",
        detail: "Managing expectations and quotas from 5–10+ manufacturers simultaneously",
      },
      {
        title: "Dealer mindshare",
        detail: "Getting specifications at dealerships that rep 30–50+ manufacturers",
      },
      {
        title: "Product knowledge",
        detail: "Staying current on specs, pricing, lead times across entire portfolio",
      },
      {
        title: "Administrative burden",
        detail: "Tracking quotes, orders, commissions; manufacturer reporting requirements",
      },
    ],
    websiteBehavior: {
      visitTriggers: [
        "Pre-dealer visit prep — reviewing product updates",
        "Downloading images, brochures, CAD for dealer meetings",
        "Checking specs, pricing, lead times to help dealer with project",
        "Training refresh before lunch-and-learn at dealership",
      ],
      sessionFlow: [
        "Review product pages for updates and new imagery",
        "Download sales tools (brochures, spec sheets, CAD)",
        "Check quick-ship/lead times for time-sensitive projects",
        "Monitor finish options for latest offerings",
        "Access warranty info, case studies, installation guides",
      ],
      deviceSplit: [
        { device: "Laptop", pct: 50 },
        { device: "Tablet", pct: 30 },
        { device: "Mobile", pct: 20 },
      ],
      infoPriorities: [
        "Product knowledge (specs, features, differentiators)",
        "Pricing (standard, volume, dealer cost, margins)",
        "Lead times (standard, quick-ship, delays)",
        "Sales tools (brochures, images, CAD, spec sheets)",
        "Competitive positioning (why TableX vs. competitors)",
        "Case studies (proof points for selling stories)",
      ],
    },
    websiteImplications: [
      {
        title: "Rep portal",
        detail: "Dealer pricing, lead times, rep-specific resources",
      },
      {
        title: "Up-to-date product info",
        detail: "Specs, finishes, lead times must be current",
      },
      {
        title: "Mobile-friendly",
        detail: "Often pulling up products on tablet during dealer visits",
      },
      {
        title: "Case studies",
        detail: "Selling stories for dealers — proof points by application",
      },
    ],
    quotes: [
      "I represent TableX because they offer quality American-made tables at competitive prices. But I need them to make my job easier.",
      "The easier TableX is to work with, the more I'll push it to my dealers.",
    ],
    dealBreakers: [
      "Unresponsive manufacturer support (slow quotes kill deals)",
      "Inaccurate product information (website doesn't match reality)",
      "Poor dealer pricing (can't compete with other lines)",
      "Frequent lead time delays (damages credibility with dealers)",
      "Weak marketing presence (no trade show support, outdated materials)",
    ],
  },
  {
    id: "individual",
    role: "Individual Customer",
    subtitle: "Small business owner, home office professional, or nonprofit buyer",
    icon: "User",
    accent: "amber",
    trafficShare: "~10%",
    summary:
      "Individual buyers represent untapped revenue if TableX simplifies the purchase process and provides pricing transparency. They research deeply but abandon when hitting 'request quote' walls.",
    keyInsight:
      "This segment loses to consumer brands (IKEA, Wayfair) not on product quality — but on purchase friction and pricing opacity.",
    demographics: {
      ageRange: "28–65",
      experience: "No commercial furniture industry experience",
      location: "Urban/suburban, home office or small business",
    },
    goals: [
      { text: "Find professional-quality tables without going through a dealer" },
      { text: "Understand pricing without needing to request a quote" },
      { text: "Confirm product suitability for their specific use case" },
      { text: "Minimize complexity — straightforward buying process" },
    ],
    painPoints: [
      {
        title: "Dealer gatekeeping",
        detail: "Forced through dealer channel, adding friction for small orders",
      },
      {
        title: "Opaque pricing",
        detail: "'Request a quote' model frustrates buyers used to e-commerce",
      },
      {
        title: "Complex configurations",
        detail: "Don't understand base types, laminate grades, powdercoat codes",
      },
      {
        title: "Sticker shock",
        detail: "Need to understand why commercial costs 2–3x consumer alternatives",
      },
    ],
    websiteBehavior: {
      visitTriggers: [
        "Google search ('commercial training tables' or 'professional office tables')",
        "Outfitting new office, training room, or co-working space",
        "Researching professional alternatives to consumer furniture",
        "Follow-up after seeing TableX tables in the wild",
      ],
      sessionFlow: [
        "Discovery via search — land on product page",
        "Browse categories to understand offerings",
        "Compare with competitor sites (Enwork, KI, IKEA)",
        "Deep dive on 2–3 products that fit needs",
        "Hit 'request quote' wall — frustration",
        "Abandon or reluctantly search for local dealer",
      ],
      deviceSplit: [
        { device: "Mobile", pct: 50 },
        { device: "Desktop", pct: 40 },
        { device: "Tablet", pct: 10 },
      ],
      infoPriorities: [
        "Pricing (actual prices, not 'request quote' dead-ends)",
        "Product suitability (which tables work for my space?)",
        "Size and dimensions (will it fit?)",
        "Finish options (colors and materials available)",
        "Lead times (how soon can I get it?)",
        "Purchase process (can I buy direct? Do I need a dealer?)",
      ],
    },
    websiteImplications: [
      {
        title: "Pricing visibility",
        detail: "Even 'starting at $X' gives budget confidence",
      },
      {
        title: "Simplified product selection",
        detail: "Use case navigation: 'Home Office' / 'Training Room' / 'Meeting Space'",
      },
      {
        title: "Direct purchase option",
        detail: "Enable small orders without dealer for 1–10 tables",
      },
      {
        title: "Jargon-free content",
        detail: "Simple language, real-world photos, size visualization",
      },
    ],
    quotes: [
      "I just want to know how much it costs and how to buy it. Why do I need to talk to a dealer for 6 tables?",
      "I'm willing to pay more than IKEA prices, but I need to understand what I'm getting for the extra money.",
      "I Googled 'commercial training tables' and found TableX, but your website seems like it's only for big corporate buyers.",
    ],
    dealBreakers: [
      "No visible pricing whatsoever",
      "Mandatory quote forms with no alternative",
      "Unclear whether direct purchase is possible",
      "Complex configurations without guidance",
      "Website clearly designed for professional buyers only",
    ],
  },
];
