// TableX DNA — brand voice workshop report + manifesto
//
// Report content is ported verbatim from the Clear pH × TableX Design
// Thinking Workshop output (April 2026). Source of truth:
// ~/Documents/Clear ph/Clients/TableX/Design Thinking Workshop/clearph-brand-workshop/src/lib/brandPacks/tablex.ts
//
// Section-insight strings contain <em>/<strong> markup and are rendered via
// dangerouslySetInnerHTML — matches the pattern used in the source app.

export interface ArchetypeCloudBrand {
  name: string;
  domain: string;
  color: string;
  initial: string;
}

const EVERYMAN_BRANDS: ArchetypeCloudBrand[] = [
  { name: "IKEA", domain: "ikea.com", color: "#0058A3", initial: "IK" },
  { name: "Target", domain: "target.com", color: "#CC0000", initial: "T" },
  { name: "Ford", domain: "ford.com", color: "#003478", initial: "F" },
  { name: "Levi's", domain: "levi.com", color: "#C41230", initial: "L" },
  { name: "Costco", domain: "costco.com", color: "#E31837", initial: "C" },
  { name: "Home Depot", domain: "homedepot.com", color: "#F96302", initial: "HD" },
  { name: "Carhartt", domain: "carhartt.com", color: "#A17A44", initial: "Ch" },
  { name: "Subaru", domain: "subaru.com", color: "#013C74", initial: "S" },
  { name: "Gap", domain: "gap.com", color: "#000E62", initial: "G" },
  { name: "Budweiser", domain: "budweiser.com", color: "#C8102E", initial: "B" },
];

const OUTLAW_BRANDS: ArchetypeCloudBrand[] = [
  { name: "Harley-Davidson", domain: "harley-davidson.com", color: "#F36B21", initial: "HD" },
  { name: "Virgin", domain: "virgin.com", color: "#ED1C24", initial: "V" },
  { name: "Diesel", domain: "diesel.com", color: "#CC0033", initial: "D" },
  { name: "Red Bull", domain: "redbull.com", color: "#DB0A40", initial: "RB" },
  { name: "Supreme", domain: "supremenewyork.com", color: "#E80000", initial: "S" },
  { name: "Jack Daniel's", domain: "jackdaniels.com", color: "#000000", initial: "JD" },
  { name: "Vans", domain: "vans.com", color: "#C1272D", initial: "V" },
  { name: "Dr. Martens", domain: "drmartens.com", color: "#FFD700", initial: "DM" },
  { name: "Mini Cooper", domain: "mini.com", color: "#000000", initial: "M" },
  { name: "MTV", domain: "mtv.com", color: "#FFD100", initial: "M" },
];

export const brandReport = {
  documentTitle: "TableX Brand Voice",
  documentSubtitle: "TableX × Clear pH",
  pdfDownloadPath: "/TableX-Brand-Identity-Report.pdf",
  methodology:
    "Output of the April 2026 Design Thinking Workshop with Brian Craig, Mark Fleck, and the Clear pH team. Structured activities across archetype selection, competitive positioning, attribute sorting, voice-spectrum calibration, and tone-in-context exercises.",

  archetypes: {
    primary: {
      name: "Everyman",
      role: "Primary archetype",
      accent: "#10b981",
      workshopInsight:
        "The team chose Everyman for its honest, practical brand traits — providing a solid foundation for customer connection. TableX is the friend, the neighbor, the honest worker. This archetype rejects pretense and wins by being dependable and relatable, not exclusive. The team explicitly rejected \u201cunderdog\u201d positioning in favor of being a \u201cdesired brand\u201d that customers choose for quality and service.",
      logoCloud: EVERYMAN_BRANDS,
    },
    secondary: {
      name: "Outlaw",
      role: "Secondary archetype",
      accent: "#ef4444",
      workshopInsight:
        "The Outlaw archetype was embraced as aspirational — emphasizing differentiation by focusing exclusively on tables and innovative configurators. Brian Craig (CEO) selected Outlaw as his primary pick, signaling a desire to disrupt norms in the contract furniture space. His idea of playful, low-cost engagement tactics at trade shows like NeoCon reflects a willingness to challenge category conventions. This Everyman + Outlaw blend positions TableX as accessible yet bold — the approachable neighbor who doesn\u2019t play by the big manufacturers\u2019 rules.",
      logoCloud: OUTLAW_BRANDS,
    },
  },

  sectionInsights: [
    {
      id: "competitivePositioning",
      title: "Competitive Positioning",
      html: "The majority of participants positioned TableX in the upper-right quadrant \u2014 modern and crafted \u2014 signaling high-quality craftsmanship delivered with contemporary sensibilities. Competitors clustered toward mass-produced and traditional, reinforcing TableX\u2019s unique market stance. JSI emerged as the closest brand-voice rival in the crafted space, while Enwork and Special-T are direct product-level competitors. The clear white space TableX occupies supports a narrative focused on quality, authenticity, and modern design ethos \u2014 without the overhead of the bigger players.",
    },
    {
      id: "brandDNA",
      title: "Brand DNA",
      html: "High consensus on being <em>honest</em> (100%) and <em>resourceful</em> (100%) reinforced core values the team already lives. Aspirational traits like <em>future-ready</em> and <em>design-forward</em> (both 100%) introduced a growth mindset without overcommitting to innovation-heavy positioning. The team consciously differentiated <em>playful</em> from <em>whimsical</em> \u2014 playfulness was embraced as \u201cwitty and approachable,\u201d while whimsical was unanimously rejected as incongruous with the brand. The contested word was <em>traditional</em>: split 50/50 between \u201cIS\u201d and \u201cIS NOT,\u201d reflecting an ongoing internal tension between heritage pride and forward momentum.",
    },
    {
      id: "voiceSpectrum",
      title: "Voice Spectrum",
      html: "The data showed a majority preference for casual over formal (64), with an emphasis on being <em>bold</em> rather than understated (28 \u2014 the strongest conviction on any axis). The team leaned conversational (75) and peer-to-peer (75) \u2014 they want to talk <em>with</em> customers, not <em>at</em> them. The one interesting outlier: <em>Serious vs. Playful</em> landed near center (54), reflecting the group\u2019s ongoing negotiation between credibility and personality. As one participant put it, the challenge is to be \u201cwitty and approachable without undermining the expert and trustworthy image.\u201d",
    },
    {
      id: "voiceInPractice",
      title: "Voice in Practice",
      html: "A clear pattern emerged: the team preferred <em>cheeky and bold</em> for outward-facing moments (homepage hero, social) but pulled back toward <em>warm and earnest</em> for higher-stakes communications (sales emails, error messages). This \u201ctone flexes by context\u201d finding is exactly what distinguishes a living brand voice from a static one. Digital channels can be more playful and personality-forward; critical touchpoints like customer service and sales need warmth without risking credibility. The team was explicit: \u201cCaution was noted to avoid clownish or excessive whimsy that would undermine seriousness.\u201d",
    },
    {
      id: "inTheirOwnWords",
      title: "In Their Own Words",
      html: "The raw language is as important as the structured data. Recurring themes in the \u201cWe Are\u201d column: <em>quality without overhead, partner not vendor, dependable and present.</em> Brian Craig\u2019s \u201cAnd gosh darn it, people like us\u201d captures the Everyman energy perfectly. The \u201cWe Are Not\u201d column reveals what the team actively pushes against: mass-produced, imported, administratively bulky, corporate. Notably, both \u201cwe are not a design leader\u201d and \u201cwe are not the biggest fish in the pond\u201d show a team that\u2019s honest about where they are \u2014 and confident that it\u2019s a strength, not a weakness.",
    },
    {
      id: "brandPrinciples",
      title: "Brand Principles",
      html: "These four principles were selected as the North Star for voice and design decisions. <em>Approachable</em> emphasizes neighborly, warm interactions over vendor formality \u2014 \u201cwe pick up the phone like neighbors, not vendors.\u201d <em>Grounded</em> conveys deep roots in practical craftsmanship, differentiating TableX from overly polished competitors. <em>Crafted</em> focuses on quality that reveals itself over time \u2014 \u201cdetails you\u2019ll only notice five years in.\u201d <em>Confident</em> is about transparency without hedging \u2014 the team was clear that messaging should focus on desirability and quiet authority, not hype. Together they form a coherent system: a brand that\u2019s real, skilled, approachable, and sure of itself.",
    },
  ],

  brandPrinciples: [
    { name: "Approachable", line: "We pick up the phone like neighbors, not vendors." },
    { name: "Grounded", line: "Deep roots in practical craftsmanship." },
    { name: "Crafted", line: "Details you’ll only notice five years in." },
    { name: "Confident", line: "Transparency without hedging — desirability, not hype." },
  ],
};

export const manifesto = {
  competitorEmotions: [
    { name: "OFS", emotions: ["Family", "Imagination", "Craftsmanship"] },
    { name: "Kimball", emotions: ["Craftsmanship", "Creation", "Dare to Be a Maker"] },
    { name: "JSI", emotions: ["Craftsmanship", "Love", "Transformation"] },
    {
      name: "Special T",
      emotions: ["Making work easier", "Changing lives"],
      note: "Employs a majority of recovering addicts.",
    },
  ] as Array<{ name: string; emotions: string[]; note?: string }>,

  intro: [
    "As we look at our competition (at all levels) the truly successful companies don’t sell furniture. They sell emotion.",
    "So, what is the emotion of TableX? How do we move from a company that sells tables, to a company that is passionate about tables and makes the customer feel our passion each and every interaction?",
    "My feeling… Tables are where life happens. Tables are the stage for so many of life’s biggest moments. We build tables because life needs our tables. We build the stage for life’s many jumping off points.",
    "Therefore, I wrote up a TableX manifesto (if you will). Something we all can use as we build together and think about our roles within TableX.",
  ],

  attribution: "Brian Craig, CEO — April 17, 2026",

  thesis:
    "Tables are where life happens. Tables are the stage for so many of life’s biggest moments.",

  poem: [
    "Every space tells a story.",
    "Not through walls or finishes,",
    "but through how it’s used.",
    "Where people gather.",
    "Where they pause.",
    "Where ideas take shape.",
    "Where decisions are made.",
    "More often than not,",
    "it all comes back to one place.",
    "The table.",
    "A surface, yes —",
    "but also a stage.",
    "A stage for collaboration.",
    "A stage for focus.",
    "A stage for conversation.",
    "A stage for progress.",
    "It’s where first impressions are formed,",
    "where plans are built,",
    "and where work moves forward.",
    "At TableX, we design with that in mind.",
    "Not just how a table looks,",
    "but how it lives within a space.",
    "How it supports movement.",
    "Adapts to change.",
    "Scales with the people around it.",
    "Simple. Flexible. Ready for what’s next.",
    "To us it’s more than a table.",
    "It’s where life’s big moments happen.",
  ],
};
