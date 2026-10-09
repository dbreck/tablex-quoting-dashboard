/**
 * AI-assisted version of the Order Workflow estimate: the same nine lines,
 * re-estimated for design + dev done by teams of Claude Fable agents with
 * Danny orchestrating, reviewing and shipping. Plus the pricing scenarios and
 * the reasoning for the "what do we charge when AI does the work" question.
 * Unlinked page: /admin/estimate/ai.
 */

import { DESIGN_RATE, DEV_RATE, LINE_ITEMS, lineCost, TOTAL_COST, GATED_COST, CORE_COST } from "./order-workflow-estimate";

export interface AiLine {
  number: number;
  /** Human hours: orchestrating, reviewing, deciding, smoking, shipping. */
  humanHours: number;
  /** Estimated model spend in dollars (Fable teams + verification agents). */
  aiSpend: number;
  /** Calendar days with the agent teams running. */
  days: number;
  note: string;
}

export const AI_LINES: AiLine[] = [
  { number: 1, humanHours: 14, aiSpend: 600, days: 3, note: "Schema, migration, create flows and the status machine come from one brief. The human hours are the change-order rules and reviewing what the agents did to the accept path." },
  { number: 2, humanHours: 9, aiSpend: 400, days: 2, note: "The renderer flag is an hour. The cover sheet form is a partitioned three-agent build; Danny reviews the PDF against Mark's sheet." },
  { number: 3, humanHours: 6, aiSpend: 250, days: 1, note: "Recipients, typed slots and the template are routine agent work. Human time is the copy and a live send test." },
  { number: 4, humanHours: 7, aiSpend: 300, days: 2, note: "Phone capture needs a human on a real phone at the dock. Everything else is a brief." },
  { number: 5, humanHours: 10, aiSpend: 500, days: 3, note: "The board is one agent run; the second pass for Brian's column ideas is human-led." },
  { number: 6, humanHours: 8, aiSpend: 350, days: 2, note: "Three small screens, one brief each, parallel. Human time is checking the math with Patty's sheet." },
  { number: 7, humanHours: 7, aiSpend: 300, days: 2, note: "Webhook + worker is well-trodden. Human time is the Xero handshake and a live event test." },
  { number: 8, humanHours: 12, aiSpend: 150, days: 1, note: "Already delivered, and already done this way: the meeting page and the homework tabs were agent-built in one morning." },
  { number: 9, humanHours: 12, aiSpend: 100, days: 4, note: "Training and support are human by nature. Agents write the walkthroughs; Danny gives them." },
];

export const AI_HUMAN_HOURS = AI_LINES.reduce((s, l) => s + l.humanHours, 0);
export const AI_SPEND = AI_LINES.reduce((s, l) => s + l.aiSpend, 0);
export const AI_DAYS = AI_LINES.reduce((s, l) => s + l.days, 0);
export const TRAD_HOURS = LINE_ITEMS.reduce((s, l) => s + l.hours, 0);

/** Human-hour cost at the Phase 2 rate card (dev lines at $185, lines 8–9 at $150). */
export const AI_HUMAN_COST = AI_LINES.reduce((s, l) => {
  const li = LINE_ITEMS.find((x) => x.number === l.number)!;
  return s + l.humanHours * li.rate;
}, 0);

export interface Scenario {
  key: string;
  title: string;
  tag: string;
  price: number;
  weeks: string;
  basis: string;
  realizedRate: number;
  pros: string[];
  cons: string[];
  verdict: "no" | "maybe" | "recommended";
}

const AI_ASSISTED_RATE = 325;

export const SCENARIOS: Scenario[] = [
  {
    key: "trad",
    title: "A · Traditional hours",
    tag: "The estimate as drafted",
    price: TOTAL_COST,
    weeks: "8 weeks",
    basis: `${TRAD_HOURS} hrs at $185 / $150, presented as hours`,
    realizedRate: Math.round(TOTAL_COST / AI_HUMAN_HOURS),
    pros: ["Matches the Phase 2 estimate, so nothing new to defend", "Highest price"],
    cons: [
      "Lists hours we will not work. If a client reads an hours column as time-and-materials, that is a misrepresentation the moment we finish in three weeks.",
      "Locks us into an 8-week story we would have to pace artificially.",
    ],
    verdict: "no",
  },
  {
    key: "honest-hourly",
    title: "B · Bill the real hours",
    tag: "Human hours + model spend",
    price: AI_HUMAN_COST + AI_SPEND,
    weeks: "~3 weeks",
    basis: `${AI_HUMAN_HOURS} human hrs at the rate card + $${AI_SPEND.toLocaleString()} model spend passed through`,
    realizedRate: Math.round((AI_HUMAN_COST + AI_SPEND) / AI_HUMAN_HOURS),
    pros: ["Nothing to explain. Every dollar maps to a thing that happened."],
    cons: [
      "Prices the work at what it costs us, not what it is worth. The client gets the same system as Scenario A for half the money.",
      "Rewards the client for our investment in tooling and know-how, and sets the floor for every future quote.",
      "Hourly at $185 was already a proxy for value; keeping the proxy while the hours collapse is the worst of both.",
    ],
    verdict: "no",
  },
  {
    key: "ai-rate",
    title: "C · AI-assisted rate card",
    tag: "Fewer hours, higher rate",
    price: AI_HUMAN_HOURS * AI_ASSISTED_RATE + AI_SPEND,
    weeks: "~3 weeks",
    basis: `${AI_HUMAN_HOURS} orchestration hrs at $${AI_ASSISTED_RATE} + model spend`,
    realizedRate: Math.round((AI_HUMAN_HOURS * AI_ASSISTED_RATE + AI_SPEND) / AI_HUMAN_HOURS),
    pros: ["Honest about the hours and the method", "A rate card we can reuse"],
    cons: [
      "Still an hours conversation. Clients will anchor on the $325 and ask why it is not $185.",
      "Every efficiency gain we make lowers our revenue again.",
    ],
    verdict: "maybe",
  },
  {
    key: "value",
    title: "D · Fixed price per phase",
    tag: "Outcome, not hours",
    price: CORE_COST - 1800 - 2000,
    weeks: "3 weeks · done by 10/26",
    basis: "Core phases priced as deliverables, no hours shown; discovery waved; Xero line gated separately",
    realizedRate: Math.round((CORE_COST - 1800 - 2000) / AI_HUMAN_HOURS),
    pros: [
      "The client buys a working sales-order system by 10/26 for about 10% less than the hours estimate. That is a visibly better deal than Scenario A.",
      "Hours never appear, so there is nothing to misrepresent. Speed becomes the thing we sell.",
      "Our realized rate on human time is 2x the rate card. That is the margin that pays for Fable.",
      "Fixed price moves the risk to us, which is the honest trade for the premium.",
    ],
    cons: ["Needs tight scope language (one review round per phase) because overruns are ours.", "Richie has to be comfortable dropping the hours column from the estimate."],
    verdict: "recommended",
  },
];

export const RECOMMENDED = SCENARIOS.find((s) => s.verdict === "recommended")!;

export const THINKING: { title: string; paras: string[]; bullets?: string[] }[] = [
  {
    title: "Is it ethical to charge the first estimate's hours?",
    paras: [
      "It depends entirely on what the hours column claims to be. If the estimate says 208 hours and the invoice says 208 hours, and we worked 85, that is billing for time we did not spend. Not a grey area.",
      "If the estimate is a fixed price for a defined outcome, and the hours were our internal basis for arriving at it, then finishing faster is our reward for being good at this. Every fixed-price business works this way. A plumber who quotes $400 for a job and finishes in forty minutes has not cheated anyone.",
      "The problem is the format. A Harvest estimate with an hours column reads as time-and-materials. The fix is not to fudge the hours, it is to stop showing them. Price the phases, keep a rate card for out-of-scope work, and say plainly that the price is for the deliverable.",
    ],
  },
  {
    title: "Does it make business sense to bill only the AI hours?",
    paras: [
      "No. Scenario B prices the work at our cost, not at its value. The client gets the same system either way. The difference between $37,500 and $18,000 is not the client's saving; it is our investment in Fable, in the briefs, in the staging environment, in knowing how to split a build across agents, and in the judgment that decides what is worth building. Billing only the hours gives that away.",
      "It also compounds. Every improvement we make to the pipeline would lower our revenue on the next job. That is a treadmill where getting better makes us poorer.",
      "There is a real limit on the other side too. The market will learn. In a year, clients will know a sales-order module does not take eight weeks, and they will have quotes from shops that price like Scenario B. We should price for value now while being honest about speed, so that when the market compresses we already own the relationship and the speed story.",
    ],
  },
  {
    title: "What the price should actually cover",
    paras: ["Think of the price as four parts, none of which is hours."],
    bullets: [
      "The outcome: what the system is worth to TableX. Sam types every quote twice today; Mark runs production from a spreadsheet; Patty retypes freight into Sage. A working order flow is worth far more than $34k to them.",
      "The judgment: the 10/08 rulings, the data model, the split for 10/19, knowing that INKY will quarantine the production emails. Agents do not produce that.",
      "The risk: fixed price means overruns are ours. That is worth a premium and it is the honest trade.",
      "The tooling: Fable teams are not free. Roughly $3,000 of model spend on this job, plus the pipeline that makes it work.",
    ],
  },
  {
    title: "How to put it to Richie",
    paras: [
      "Keep the number close to the traditional estimate, drop the hours column, cut the timeline to three weeks, and sell the speed. $33,800 becomes a $30,000 fixed price for the core, live by 10/26, with the discovery waved and the Xero mirror quoted separately when it is real.",
      "Internally, track the real hours and the model spend on every job. That is how we learn what our true cost is and where the floor sits when the market moves.",
      "For Brian, the pitch writes itself: the desk goes live on the new sales-order flow Monday 10/19, the production board that week, packaging the week after, the whole thing done before Halloween, for less than the Phase 2 pace would have cost.",
    ],
  },
  {
    title: "A rule of thumb for the next job",
    paras: ["Price the outcome at 80 to 90% of what the traditional estimate would have said. Deliver in a third of the time. Never show hours on a fixed-price estimate. Keep a published rate card for hourly work, and raise it: the rate card is what out-of-scope and support cost, and those hours are mostly human."],
  },
];

export { DEV_RATE, DESIGN_RATE, LINE_ITEMS, lineCost, TOTAL_COST, GATED_COST, CORE_COST };


/* ------------------------------------------------------------------ */
/* Note for Richie: what Brian asked for by 10/19, and whether we can  */
/* ------------------------------------------------------------------ */

export const RICHIE_NOTE: { title: string; sections: { heading: string; paras: string[]; bullets?: string[] }[] } = {
  title: "What Brian wants by 10/19, and whether we can get there",
  sections: [
    {
      heading: "What he answered",
      paras: [
        "The question on his tab was specifically \"When do you need the first phase live?\" He picked Mon 10/19 and wrote \"Hoping the updates could be made and tested next week.\" So on paper he committed only the first phase. But \"the updates\" reads like he means the whole ask, and he ranked P1–P5 without implying any waits between them. I would assume he pictures the desk working the new way on Monday the 19th, and would not be surprised by the production board arriving a few days later.",
      ],
    },
    {
      heading: "Could we do all of it by 10/19?",
      paras: [
        "The calendar is the problem, not the work. From tomorrow to Monday 10/19 is seven working days, and \"tested next week\" means it has to be on staging with Mark and Sam looking at it during the week of the 12th. The agent-team plan sums to about 20 working days of lines if they ran one after another, but they do not have to.",
        "What I think is realistic if we power through, starting tomorrow:",
      ],
      bullets: [
        "Live by Mon 10/19, confident: lines 1 to 4. Orders table and the SO series, the three documents and cover sheet, production@ email, recipients and acknowledgments, shipping and photos. Lines 1 and 2 run as parallel teams over the weekend of the 10th, lines 3 and 4 the following Tuesday to Thursday, staging smoke Friday the 16th, fast-forward to main over the weekend. That is the whole order-to-ship flow, which is what Sam and Mark touch daily.",
        "Live by Fri 10/23, likely: line 5, the production board. It is one agent run plus Mark's review, and his review is the long pole.",
        "Live by Mon 10/26: line 6, packaging and P/L. Small, but Tony and Patty need to look at it and they are the slowest reviewers.",
        "Gated regardless: line 7, Xero.",
      ],
    },
    {
      heading: "Three things decide whether even that holds",
      paras: [],
      bullets: [
        "production@ and the INKY allow rule. Client side, IT vendor involved, and the 9/21 reset emails took days to get released. Ask Brian to kick this off tomorrow, or the auto-emails land in quarantine on launch day.",
        "Same-day reviews from Mark and Sam. The plan assumes they look at staging within a day. If they batch feedback to Friday, every phase slips a week.",
        "Danny's own week. The human hours are about 50 for lines 1 to 4, concentrated in reviewing the change-order path, the cover sheet PDF against Mark's sheet, and a real phone at the dock for photos. That is most of a working week with nothing else in it.",
      ],
    },
    {
      heading: "Suggestion for the pitch",
      paras: [
        "Tell Brian the desk goes live on the new sales order flow Monday 10/19, the production board follows that week, packaging the week after, and the whole thing is done before Halloween instead of Thanksgiving. That is better than he asked for, it keeps the fixed-price number intact, and it gives you one honest dependency to hand him: production@ and the INKY rule by Wednesday.",
      ],
    },
  ],
};

/** Plain-language explainer for the gated line 7, rendered under the line table (Danny 10/09). */
export const XERO_MIRROR: { title: string; sections: { heading: string; text: string }[] } = {
  title: "What the Xero mirror is",
  sections: [
    {
      heading: "What it is",
      text:
        "Once a Sales Order exists in the site app, the invoice for it is still created in accounting, not in the app. The mirror reads that invoice back from Xero and shows it on the Sales Order: invoice number, status and paid date. The desk never types or toggles those by hand.",
    },
    {
      heading: "How it works",
      text:
        "Xero webhooks for Contacts and Invoices hit an endpoint with a signature check, and an idempotent worker feeds the existing read-only Xero sync. The app never writes to Xero. Creating the invoice from the app is out of scope, which keeps the standing read-only Xero rule.",
    },
    {
      heading: "Why it is gated",
      text:
        "Sam and Patty confirmed on 10/08 that invoices are still created in Sage, and nobody has a date for the move to Xero. Mirroring Xero today would mirror nothing. The line starts only when Patty invoices from Xero and is billed when it starts. Until then the desk types the invoice number onto the Sales Order by hand.",
    },
  ],
};
