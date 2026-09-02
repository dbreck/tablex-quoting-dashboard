/**
 * Findings from the 2026-09-02 "TableX + Sales Reps | Web / Configurator
 * Demo" — the fixes, ruled requirements, post-launch items, and open
 * decisions pulled from the Fireflies transcript. Static content; the team's
 * working state (done / notes) lives in Supabase (migration 028) keyed by
 * `${MEETING_KEY}:${item.id}`.
 *
 * Attribution: the room shared one mic, so Fireflies labelled most in-room
 * speech as Kayla. Quotes are attributed by context (Jim opened the meeting,
 * Brian owns pricing / laminate tiers / the hub, Danny drove the demo).
 */

export const REP_DEMO_MEETING_KEY = "rep-demo-2026-09-02";
export const REP_DEMO_FIREFLIES_ID = "01M1CJ0TNDT36EAZ2WNXCKQ17Q";

export function firefliesLink(seconds?: number): string {
  const base = `https://app.fireflies.ai/view/${REP_DEMO_FIREFLIES_ID}`;
  return seconds === undefined ? base : `${base}?t=${seconds}`;
}

export type FindingTag = "fix" | "req" | "shipped" | "decision" | "phase2";

export interface FindingItem {
  /** Short reference id (F-1, R-1, P-1, D-1) — stable; the check/notes key. */
  id: string;
  title: string;
  tags: { kind: FindingTag; label: string }[];
  /** What was said, verbatim-ish. */
  said?: string;
  /** Who said it (attributed by context where the room shared a mic). */
  who?: string;
  /** Seconds into the recording — deep-links to the moment. */
  t?: number;
  /** Timestamp label to print (mm:ss). */
  at?: string;
  /** What it means for the build. */
  build: string;
  /** Extra caution / status line. */
  note?: string;
  /** Outside the original SOW (Website · Portal · CRM · CPQ · read-only Xero
   * sync) — likely a change order. Rendered as a subtle mark, no tooltip. */
  changeOrder?: boolean;
}

export interface FindingGroup {
  id: "fix" | "launch" | "post" | "decision";
  title: string;
  intro: string;
  items: FindingItem[];
}

export const REP_DEMO_FINDINGS: FindingGroup[] = [
  {
    id: "fix",
    title: "Fix before launch",
    intro:
      "Things the reps or the room saw break, or that Brian promised would be gone before the site goes public.",
    items: [
      {
        id: "F-1",
        title: "The “revising” state hides the edit button, and there is no line editing at all",
        tags: [
          { kind: "fix", label: "Fix" },
          { kind: "req", label: "Blocks R-2" },
        ],
        said: "I sent it back for revision, so that puts it in edit mode, but my edit button is being hidden.",
        who: "Danny",
        t: 1674,
        at: "28:01",
        build:
          "The dealer and rep “revising” rails still say line items can’t be edited here. Danny promised Adam the edit button “right after this call”. Add remove and change-quantity on lines in draft and revising, and reopen a config in SpeX Studio from a line.",
      },
      {
        id: "F-2",
        title: "Foundation in SpeX Studio forces a size change when the base changes",
        tags: [{ kind: "fix", label: "Fix" }],
        said: "This one might have a different base. I would need to change the size based on that. I knew I was going to pick the worst one to show here.",
        who: "Danny",
        t: 1352,
        at: "22:32",
        build:
          "Foundation prices nowhere in the January book (code 30 is absent), so the base-times-size enforcement collapses its offer. Decide whether Foundation shows the full CAD matrix as quote-only, or waits for Brian’s updated PL master with a real Foundation price grid.",
      },
      {
        id: "F-3",
        title: "AI test video and any scene showing tables TableX does not make come out before launch",
        tags: [{ kind: "fix", label: "Fix" }],
        said: "You’re going to see some tables, especially in videos, that we don’t have. Those will be gone. Those were some test videos developed with AI.",
        who: "Brian",
        t: 502,
        at: "08:22",
        build:
          "Replace or pull the home hero video and sweep every generated scene for tables that are not in the catalog. Brian’s own words are the ruling; nothing showing a non-TableX table ships.",
      },
      {
        id: "F-4",
        title: "Dark ground may be the better default on the finish libraries",
        tags: [{ kind: "decision", label: "Decision" }],
        said: "I’m going to look at these on the dark background. This might need to be the default because everything looks so good on here.",
        who: "Danny",
        t: 1137,
        at: "18:57",
        build:
          "One-line change on both library pages once Danny and Brian pick. The inspector already follows the switch either way.",
      },
      {
        id: "F-5",
        title: "Mark the outdoor-rated powder coats, since Element is being sold as indoor-outdoor",
        tags: [{ kind: "fix", label: "Fix" }],
        said: "We will have that on our sample chips, as far as powder coats that are rated for the outdoor. So those will all be there.",
        who: "Brian",
        t: 1190,
        at: "19:50",
        build:
          "Needs Brian’s list of which of the 40 colors are outdoor-rated. Then an Outdoor facet on the powder library and a note on the Element series page.",
      },
    ],
  },
  {
    id: "launch",
    title: "Ruled for launch",
    intro:
      "Brian put these to the reps as questions and got a yes, or the reps asked and the room agreed. Two of them are already live from 9/02.",
    items: [
      {
        id: "R-1",
        title: "Remove the TableX approval step. Quotes price instantly and go straight to the dealer.",
        tags: [
          { kind: "req", label: "Requirement" },
          { kind: "fix", label: "Largest change" },
        ],
        said: "Danny has this set up where you would be submitting it to TableX for approval before we send it back. I would like to skip this step totally. If we’ve got all the rules built in, you can go in and quote it and send directly to the dealer. — Adam and Joe: “Yes.”",
        who: "Brian",
        t: 1462,
        at: "24:22",
        build:
          "Every line already resolves a book list price and the dealer’s tier net. Make that the quote: submit generates the priced PDF and emails the dealer with no desk stop. The desk keeps its editing and override tools but stops being a gate. Lines that don’t match the book (custom sizes, non-configurator series) still route to the desk, and the quote says so.",
        note:
          "Lift gate and oversized-skid freight rules need to be real line items before this goes live, or every auto-priced quote is silently short. The tier on the quote is the dealer’s tier at send time.",
      },
      {
        id: "R-2",
        changeOrder: true,
        title: "Edit after sending creates a revision, with history",
        tags: [{ kind: "req", label: "Requirement" }],
        said: "Once I’ve created the quote, I’ll be able to go back in and click an edit button, edit it, and it creates me a revision? — Brian: “Revision, that’s correct.”",
        who: "Adam",
        t: 1657,
        at: "27:37",
        build:
          "Depends on F-1. Add a revision number to the quote, snapshot lines and pricing on each send, show the history on all three surfaces, and re-issue the PDF as rev 2, 3, and so on.",
      },
      {
        id: "R-3",
        title: "Accept from either portal, and it updates everywhere",
        tags: [{ kind: "shipped", label: "Shipped 9/02" }],
        said: "You can go into your portal and hit accept, or they can go into their portal and hit accept, and it will update on everybody’s portal.",
        who: "Brian",
        t: 1716,
        at: "28:36",
        build:
          "Live in tablex-site 8402c83. The rep accepts their own quotes; a dealer accepts any quote in their org, including rep-submitted ones. Pairs with R-4.",
      },
      {
        id: "R-4",
        changeOrder: true,
        title: "Accepting requires a PO number and an uploaded PO file",
        tags: [{ kind: "req", label: "Requirement" }],
        said: "We still want that purchase order from the dealer, not accept it here. — Brian: “I would rather them upload it in their system so it’s there. I’m trying to eliminate anything that could be missed in email.” — Danny: “Whatever notification they got would have a link to bring them right in here where they attach it.”",
        who: "Adam",
        t: 1766,
        at: "29:26",
        build:
          "Accept becomes a two-field step: PO number plus a PDF or image upload into the quote-files bucket. Ops sees the PO on the desk and the work order starts from it. The “your quote is ready” email links straight to that step.",
      },
      {
        id: "R-5",
        title: "Every quote and spec sheet carries its date and “Prices valid for 30 days”",
        tags: [{ kind: "req", label: "Requirement" }],
        said: "Put the date, and put language in there that this price is valid for 30 days. That way I don’t do a spec and come back a year later and there’s a price increase. — Joe: “A simple note, valid for 30 days.”",
        who: "Adam",
        t: 3063,
        at: "51:03",
        build:
          "The PDF already prints the date. Add an expiry date on the quote, print “Valid through” on the PDF and the SpeX spec sheet, and let it drive P-4.",
      },
      {
        id: "R-6",
        changeOrder: true,
        title: "A product image beside each line on the quote, with an on/off toggle",
        tags: [{ kind: "req", label: "Requirement" }],
        said: "How difficult would it be to add the image next to each item, where they can see which item is close? Or you could toggle that on or off.",
        who: "Joe",
        t: 1992,
        at: "33:12",
        build:
          "The Trans Shadow render per series already exists. Thumbnail on portal lines, and an “Include images” checkbox when generating the PDF.",
      },
      {
        id: "R-7",
        title: "Dealers see their own pricing tier, and any special pricing, in their portal",
        tags: [{ kind: "req", label: "Requirement" }],
        said: "We get that all the time. What’s my pricing? So that would be in there, and you guys can decide if they’re a 50/10, a 50/20, or we’ve got special pricing in there.",
        who: "Brian",
        t: 2043,
        at: "34:03",
        build:
          "The dealer pricing page exists. Make sure it states the org’s tier plainly and shows any dealer-specific override once D-1 settles how pricing is expressed.",
      },
      {
        id: "R-8",
        changeOrder: true,
        title: "Quote a laminate tier without a specific laminate, but block the work order until one is chosen",
        tags: [
          { kind: "req", label: "Requirement" },
          { kind: "decision", label: "Rule owed" },
        ],
        said: "You could go in and select just Luxe as the laminate. Put it in there to give them that quote. You cannot submit for that to turn into a work order without actually putting in an official laminate.",
        who: "Brian",
        t: 1594,
        at: "26:34",
        build:
          "Add “Core”, “Select”, “Luxe” as placeholder finish choices in SpeX that price at the tier ceiling. Accept, or the PO step, refuses until every placeholder is resolved. Brian still owes the rule for when the final pick is a cheaper tier (D-2).",
      },
      {
        id: "R-9",
        title: "Reps choose which dealer a quote is for, and never see each other’s quotes",
        tags: [{ kind: "shipped", label: "Shipped 9/02" }],
        said: "You’ll see here you can pick your dealer that it’s going to go to, and all of these will be saved just for you. Adam won’t be able to see Mike’s.",
        who: "Brian",
        t: 1409,
        at: "23:29",
        build:
          "Live in 8402c83. Each rep’s coverage comes from CRM assignments; quotes for unassigned dealers are refused server-side. Real rep and dealer rosters still need loading before the 15th.",
      },
    ],
  },
  {
    id: "post",
    title: "Post-launch",
    intro:
      "Asked for and agreed to, but Brian or Danny placed them after the 15th, or they need requirements work first.",
    items: [
      {
        id: "P-1",
        changeOrder: true,
        title: "Freight: rules-based delivered pricing now, live carrier quotes later",
        tags: [{ kind: "req", label: "Requirement" }],
        said: "Will this calculate freight, or will we have a spot to show that? — Brian: “We have levels of freight of what they would pay. Those rules we can put in. If they’re needing an actual freight quote, that’ll be a little different. We just don’t want them under the minimum.”",
        who: "Joe",
        t: 1886,
        at: "31:26",
        build:
          "Needs Brian’s freight-level table and the order minimum. Then a freight line derived from quantity and tier, an under-minimum warning on the quote, and the existing lift-gate and oversized-skid charges folded in. Carrier integration is a separate project.",
      },
      {
        id: "P-2",
        changeOrder: true,
        title: "Export a quote as a SIF file for the dealer’s own quoting system",
        tags: [{ kind: "req", label: "Requirement" }],
        said: "What about the dealer being able to download the quote as a SIF file to upload into their quote system?",
        who: "Adam",
        t: 1955,
        at: "32:35",
        build:
          "SIF is the Standard Interchange Format that 20-20 CAP, Worksheet, and most dealer order-entry tools import: plain text with catalog code, part number, description, quantity, list price, and option lines. Needs one sample SIF from a dealer, then a download button next to the PDF.",
      },
      {
        id: "P-3",
        changeOrder: true,
        title: "Spec and price a table without logging in, for designers and after-hours dealer salespeople",
        tags: [
          { kind: "req", label: "Requirement" },
          { kind: "decision", label: "Requirements first" },
        ],
        said: "I’m a designer doing a table spec and I’m going to put that in my spec book. I’m a dealer salesperson working after hours. I can come on here and do a quote and not have to log into a portal. — Jim: “Do you really want a designer to create a quote and not know that they created one?” — Adam: “The designers are just building specs for their bid package. That’s why you stick with your list price.”",
        who: "Adam",
        t: 2495,
        at: "41:35",
        build:
          "Danny committed to writing the requirements, then architecting. The shape that emerged: an anonymous spec sheet with list price, date, and 30-day validity, as PDF and later SIF, carrying a spec number that a dealer can later pull into their portal to turn into a quote. Brian and Danny floated a pool of unclaimed specs retrievable by number (49:11). This reframes the bag: the anonymous cart becomes a first-class artifact, not a waiting room for login.",
      },
      {
        id: "P-4",
        changeOrder: true,
        title: "30-day expiry reminder to rep and dealer, with a way to kill a quote and see the kill rate",
        tags: [{ kind: "req", label: "Requirement" }],
        said: "If you have a reminder on this at 30 days, it’s a great reminder to you or the dealer that there’s a quote out there, and if it’s no good they can kill it. What’s our percentage of kill? Nobody really ever knew.",
        who: "Jim",
        t: 3105,
        at: "51:45",
        build:
          "Driven by the expiry date from R-5. A daily job emails the rep and dealer at expiry, a “Close quote” action with a reason (lost, expired, superseded), and a desk report of closed versus accepted.",
      },
      {
        id: "P-5",
        changeOrder: true,
        title: "The portal becomes the hub: messaging per quote or invoice, ship dates, invoices",
        tags: [{ kind: "phase2", label: "Phase 2" }],
        said: "I would like to add messaging to that hub so they could message about that specific invoice, and it’s transparent for all of us. We’ll put ship dates in there, the estimated ship date and when it shipped, and invoices would show up in that hub as well.",
        who: "Brian",
        t: 2324,
        at: "38:44",
        build:
          "Three separable pieces: a comment thread on each quote visible to dealer, rep, and ops; order records with estimated and actual ship dates; and invoices surfaced from Xero. The Xero sync is read-only today, so invoices are the nearest of the three.",
      },
      {
        id: "P-6",
        changeOrder: true,
        title: "Bill of materials generated with the work order",
        tags: [{ kind: "phase2", label: "Phase 2" }],
        said: "Something we will be working on in phase two is making certain we can get a bill of material with that as well.",
        who: "Brian",
        t: 1732,
        at: "28:52",
        build:
          "Needs the component breakdown per configuration (bases, anti-sag bars, edgeband, hardware). The configurator already knows base count and anti-sag rules; the rest lives in Mark’s head and the PL master workbook.",
      },
      {
        id: "P-7",
        changeOrder: true,
        title: "Orders flowing into accounting was promised to the reps",
        tags: [{ kind: "decision", label: "Expectation to scope" }],
        said: "They can place the order from this system, and it goes right to us, and actually into our software programs that goes into our accounting. It works with everything.",
        who: "Jim",
        t: 2238,
        at: "37:18",
        build:
          "Today the Xero link is read-only by design. Making Jim’s statement true means writing an invoice or sales order into Xero on acceptance, which is a new integration with its own review. Worth setting expectations with Brian before the 15th.",
      },
      {
        id: "P-8",
        title: "Add non-configurator series to a quote by hand",
        tags: [{ kind: "phase2", label: "Phase 2" }],
        said: "I have plans on coming out with some series with limited finishes that just won’t go in the configurator. You can still add that into a quote and say, we need this table at this size and these colors.",
        who: "Brian",
        t: 2412,
        at: "40:12",
        build:
          "A free-text line type on quotes that the desk prices manually. Also the honest home for Fundamental and other book-only models under R-1.",
      },
      {
        id: "P-9",
        changeOrder: true,
        title: "Deactivate a dealer’s user when they leave, and let dealers manage their own people",
        tags: [{ kind: "req", label: "Requirement" }],
        said: "What happens if that designer leaves? They’ve got their own password to get into the portal. We need to make sure we manage that, because they leave with that password and zip right over to brand A, B, and C.",
        who: "Jim",
        t: 2561,
        at: "42:41",
        build:
          "Ops can remove a user today. Add a dealer-admin role that can invite and deactivate people in their own org, and a rep view of who holds logins at each of their dealers.",
      },
      {
        id: "P-10",
        title: "Launch marketing: press, Delve newsletter, social, customer installs as brand ambassadors",
        tags: [{ kind: "req", label: "Kayla and Arabella" }],
        said: "We’re looking at a September 15 launch. Press releases, things in Delve, the newsletter, social media posts. Our brand ambassadors are the end customers you guys are putting in.",
        who: "Brian",
        t: 3237,
        at: "53:57",
        build:
          "The news section is built but has no content. Reps were asked to feed install photos; Notre Dame is off limits for trademark reasons, Ohio State needs the sign-off already flagged on the custom-graphics shots.",
      },
    ],
  },
  {
    id: "decision",
    title: "Decisions owed",
    intro: "Open questions the build depends on. Brian owns the first two.",
    items: [
      {
        id: "D-1",
        title: "How pricing is expressed: list stays, but the discount could become one number",
        tags: [{ kind: "decision", label: "Brian" }],
        said: "Jim asked about going to flat net pricing. — Adam: “You still need list pricing. End users, designers, we need to give them that list and not see what that dealer is buying the table for.” — Joe: “If you’re on any state contracts you’ll have to have a list price.” — Chris: “TIPS.” — Adam: “You don’t have to do the 50/25 setup. Just call it 60 off, 62.5.”",
        who: "Adam, Joe, Chris",
        t: 2076,
        at: "34:36",
        build:
          "List price stays public, which the site already does. If Brian moves to a single percentage per dealer, the tier enum, tier selector, PDF discount line, and dealer pricing page all change together. Cheap if decided before R-1 ships; expensive after.",
      },
      {
        id: "D-2",
        title: "When a Luxe placeholder resolves to a cheaper laminate, honor the quote or lower it?",
        tags: [{ kind: "decision", label: "Brian" }],
        said: "If you picked Luxe and you’re like, I’m going to keep that profit in there, or if you sit there and go, no, I’m going to lower the quote, we can do that too. Maybe we can figure something out there.",
        who: "Brian",
        t: 1637,
        at: "27:17",
        build:
          "Determines whether resolving a placeholder in R-8 reprices the line automatically or leaves it and flags the delta for the rep.",
      },
      {
        id: "D-3",
        title: "Default ground on the finish libraries: light or dark",
        tags: [{ kind: "decision", label: "Danny and Brian" }],
        t: 1137,
        at: "18:57",
        build: "See F-4. One line each on laminates and powder coats.",
      },
      {
        id: "D-4",
        title: "What “accepted” means without a PO",
        tags: [{ kind: "shipped", label: "Resolved in the room" }],
        t: 1766,
        at: "29:26",
        build:
          "Adam questioned whether accept should exist at all versus a PO by email. The room landed on accept plus PO upload in the portal (R-4). Until R-4 ships, an acceptance without a PO does not start a work order.",
      },
    ],
  },
];

export const REP_DEMO_ITEM_COUNT = REP_DEMO_FINDINGS.reduce(
  (n, g) => n + g.items.length,
  0,
);

export function findingKey(itemId: string): string {
  return `${REP_DEMO_MEETING_KEY}:${itemId}`;
}
