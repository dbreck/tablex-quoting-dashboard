/**
 * Invoice-line classifier for the TableX Financials warehouse.
 *
 * Reads one Xero sales-invoice LineItem and decodes the TableX config code
 * (`SP-01TC1895T16-3P-SH.28`, `45D26`, `TC3072-3P`, …) into the parsed columns
 * of `fin_invoice_lines`. Pure and dependency-free apart from the shared SKU
 * dictionaries, so it runs in scripts, server code and tests alike.
 *
 * Grammar (after an optional `SP-` prefix), main part before the first `-`:
 *   [series 2 digits] ( shape size [base] | base ) [glued options]
 * then `-`-separated suffixes: post config (`3P`), special height (`SH.40.31`),
 * options (`MATCH`, `LC`, `CC.CUSTOM` …) and `Repl`.
 *
 * Rulings: a bare `D` is a shape only when followed by 3+ digits (`99D3656D20`);
 * otherwise it is the disc base (`45D26`). A base-only line drops any top size
 * it inherited from a parenthesised original model; a top-only line drops the
 * base. Series + shape + size with no base stays `other` (could be a series top).
 */
import { baseCodes, optionSuffixes, postConfigPattern, shapeCodes } from "../../data/sku-registry";
import { parseSku } from "../sku-parser";
import type { ParsedInvoiceLine, ParseConfidence, PartKind, RawInvoiceLine } from "./types";

/** Suffixes seen on invoices that the registry does not name. Consumed silently. */
export const INVOICE_OPTION_CODES: readonly string[] = [
  "TJ", "COR", "CORIAN", "LOGO", "MATCH", "LC", "OS", "PRE", "RC", "FT", "NE", "BL", "GF", "AH",
];

const SHAPE_KEYS = Object.keys(shapeCodes).sort((a, b) => b.length - a.length);
const BASE_KEYS = Object.keys(baseCodes).sort((a, b) => b.length - a.length);
const KNOWN_OPTIONS = new Set<string>([...Object.keys(optionSuffixes), ...INVOICE_OPTION_CODES]);
/** Option families written as PREFIX.value: CC.CUSTOM, DV.A, GR.A, ASB.4 */
const DOTTED_OPTION = /^(CC|DV|GR|ASB)\.[A-Z0-9.]+$/;
const SPECIAL_HEIGHT = /^SH\.(\d+(?:\.\d+)*)$/;
const REPL_SUFFIX = /^REPL$/;

/** A token that looks like a config code (series-led, or shape-led top). */
const CODE_TOKEN = /^(SP-)?(?:\d{2}[A-Z]{1,3}(?=\d|-|$)|[A-Z]{1,2}\d)[A-Z0-9.\-]*$/;
/** Dimension text such as 42X60 or 18.5X30 is prose, never a code. */
const DIMENSION_TEXT = /^\d+(?:\.\d+)?X\d/;
const PAREN_MODEL = /\(\s*((?:SP-)?\d{2}[A-Z]{1,3}[A-Z0-9.\-]*)\s*\)/i;
const SPECIAL_SERIES_ITEM = /^SPECIAL (\d{2}) SERIES$/;

const FREIGHT_RE = /freight|shipping|\bltl\b|skid/i;
const DISCOUNT_RE = /discount|credit/i;
const ACCESSORY_RE = /mechanism|caster|grommet|modesty|power|g-flip|predrill|edge band|wire|daisy|villa/i;
const TOP_KEYWORD_RE = /replacement top|top only|tops? (for|only)/i;
const BASE_KEYWORD_RE = /replacement base|base only|bases? (for|only)|frame for/i;

interface CodeParts {
  series: string | null;
  shape: string | null;
  width: number | null;
  depth: number | null;
  base: string | null;
  postConfig: number | null;
  specialHeight: number | null;
  hasSp: boolean;
  hasRepl: boolean;
  decimalSize: boolean;
  unknown: boolean;
  /** Anything recognised at all (shape, base or size). */
  recognised: boolean;
}

/** Normalise a raw token: upper-case, drop wrapping punctuation and `(n)` qty groups. */
function cleanToken(token: string): string {
  return token
    .toUpperCase()
    .replace(/\(\d+\)/g, "")
    .replace(/^[("'[]+/, "")
    .replace(/[,;:.!?"')\]]+$/, "")
    .trim();
}

function looksLikeCode(token: string): boolean {
  return token.length > 1 && CODE_TOKEN.test(token) && !DIMENSION_TEXT.test(token);
}

function longestPrefix(keys: readonly string[], text: string): string | null {
  for (const k of keys) if (text.startsWith(k)) return k;
  return null;
}

function isKnownOption(part: string): boolean {
  if (KNOWN_OPTIONS.has(part) || DOTTED_OPTION.test(part)) return true;
  // Glued pairs such as "NELC": accept when every 2-letter chunk is known.
  if (/^[A-Z]{4,}$/.test(part) && part.length % 2 === 0) {
    for (let i = 0; i < part.length; i += 2) if (!KNOWN_OPTIONS.has(part.slice(i, i + 2))) return false;
    return true;
  }
  return false;
}

/** Split a digit run into width/depth by the shape's convention. */
function decodeSize(
  digits: string,
  shape: string | null,
): { width: number | null; depth: number | null; decimal: boolean; odd: boolean } {
  if (digits.includes(".")) {
    const m = digits.match(/^(\d{2}(?:\.\d)?)(\d{2}(?:\.\d+)?)$/);
    if (m) return { width: Number(m[1]), depth: Number(m[2]), decimal: true, odd: false };
    return { width: parseFloat(digits), depth: null, decimal: true, odd: true };
  }
  const n = digits.length;
  if (n === 2) {
    const w = Number(digits);
    return { width: w, depth: shape === "SQ" ? w : null, decimal: false, odd: false };
  }
  if (n === 4) {
    const w = Number(digits.slice(0, 2));
    const d = Number(digits.slice(2));
    if (shape === "RD") return { width: w, depth: d === w ? null : d, decimal: false, odd: false };
    return { width: w, depth: d, decimal: false, odd: false };
  }
  // 3 or 5+ digits: best effort, flagged.
  const w = Number(digits.slice(0, 2));
  const rest = digits.slice(2);
  const d = rest.length > 3 ? Number(rest.slice(-3)) : Number(rest);
  return { width: w, depth: d || null, decimal: false, odd: true };
}

/**
 * Read a base run at the start of `text`: letters (longest registry match),
 * optional digits, optional glued option letters, optional secondary base.
 * Returns the base code and whatever the run left unconsumed.
 */
function readBase(text: string): { base: string | null; unknown: boolean } {
  if (!text) return { base: null, unknown: false };
  let unknown = false;
  const key = longestPrefix(BASE_KEYS, text);
  let letters: string;
  if (key) {
    letters = key;
  } else {
    const m = text.match(/^[A-Z]+/);
    if (!m) return { base: null, unknown: true };
    letters = m[0];
    unknown = true;
  }
  let rest = text.slice(letters.length);
  const digits = rest.match(/^\d+(?:\.\d+)?/)?.[0] ?? "";
  rest = rest.slice(digits.length);
  let base = letters + digits;

  // Secondary base (e.g. U40U18).
  const second = rest.match(/^([A-Z]+)(\d+)/);
  if (second && baseCodes[second[1]]) {
    base += second[0];
    rest = rest.slice(second[0].length);
  }
  // Glued option letters (X26FT, T22NE, H1524BL).
  if (rest) {
    if (/^[A-Z]+$/.test(rest) && isKnownOption(rest)) rest = "";
    else unknown = true;
  }
  return { base, unknown };
}

/** Decode a cleaned config-code token. */
export function decodeCode(token: string): CodeParts {
  const out: CodeParts = {
    series: null, shape: null, width: null, depth: null, base: null, postConfig: null,
    specialHeight: null, hasSp: false, hasRepl: false, decimalSize: false, unknown: false, recognised: false,
  };
  let working = token.toUpperCase();
  if (working.startsWith("SP-")) {
    out.hasSp = true;
    working = working.slice(3);
  }
  const [main, ...suffixes] = working.split("-");

  let rest = main;
  const seriesMatch = rest.match(/^(\d{2})(?=[A-Z])/);
  if (seriesMatch) {
    out.series = seriesMatch[1];
    rest = rest.slice(2);
  }

  // Shape: longest match, must be followed by a size; D needs 3+ digits.
  const shape = longestPrefix(SHAPE_KEYS, rest);
  const afterShape = shape ? rest.slice(shape.length) : "";
  const shapeOk = shape
    ? shape === "D"
      ? /^\d{3}/.test(afterShape)
      : /^\d/.test(afterShape)
    : false;

  if (shape && shapeOk) {
    out.shape = shape;
    const digits = afterShape.match(/^\d+(?:\.\d+)?/)![0];
    const size = decodeSize(digits, shape);
    out.width = size.width;
    out.depth = size.depth;
    out.decimalSize = size.decimal;
    if (size.odd) out.unknown = true;
    const b = readBase(afterShape.slice(digits.length));
    out.base = b.base;
    if (b.unknown) out.unknown = true;
    out.recognised = true;
  } else if (out.series && longestPrefix(BASE_KEYS, rest)) {
    // Bare base: 45D26, 44QC2, 01T26GF, 17C.
    const b = readBase(rest);
    out.base = b.base;
    if (b.unknown) out.unknown = true;
    out.recognised = true;
  } else if (out.series) {
    // Unknown letters after a series — let the legacy parser have a go.
    const legacy = parseSku(token);
    if (legacy.valid && legacy.shape && legacy.size) {
      out.shape = legacy.shape.code;
      const size = decodeSize(legacy.size.raw, legacy.shape.code);
      out.width = size.width;
      out.depth = size.depth;
      out.base = legacy.base ? legacy.base.code + (legacy.base.width?.replace('"', "") ?? "") : null;
      out.unknown = true;
      out.recognised = true;
    }
  }

  for (const raw of suffixes) {
    const part = raw.replace(/\(.*\)$/, "");
    if (!part) continue;
    const post = part.match(postConfigPattern);
    if (post) {
      out.postConfig = Number(post[1]);
      continue;
    }
    const sh = part.match(SPECIAL_HEIGHT);
    if (sh) {
      out.specialHeight = parseFloat(sh[1]);
      continue;
    }
    if (REPL_SUFFIX.test(part)) {
      out.hasRepl = true;
      continue;
    }
    if (isKnownOption(part)) continue;
    out.unknown = true;
  }
  return out;
}

/** Find the config-code token for a line, and the parenthesised original model if any. */
function findCode(description: string, itemCode: string | null): { code: string | null; paren: string | null } {
  const parenMatch = description.match(PAREN_MODEL);
  const paren = parenMatch ? cleanToken(parenMatch[1]) : null;

  const firstLine = description.split(/\r?\n/)[0]?.trim() ?? "";
  const tokens = firstLine.split(/\s+/).filter(Boolean).map(cleanToken);
  if (tokens[0] && looksLikeCode(tokens[0]) && decodeCode(tokens[0]).recognised) {
    return { code: tokens[0], paren };
  }
  if (paren && looksLikeCode(paren) && decodeCode(paren).recognised) return { code: paren, paren };
  if (itemCode) {
    const ic = cleanToken(itemCode);
    if (looksLikeCode(ic) && decodeCode(ic).recognised) return { code: ic, paren };
  }
  // Last resort: a strong series-led token later on the first line.
  for (const t of tokens.slice(1)) {
    if (/^(SP-)?\d{2}[A-Z]/.test(t) && looksLikeCode(t) && decodeCode(t).recognised) return { code: t, paren };
  }
  return { code: null, paren };
}

export function parseInvoiceLine(raw: RawInvoiceLine): ParsedInvoiceLine {
  const description = (raw.description ?? "").trim();
  const itemCodeRaw = (raw.itemCode ?? "").trim();
  const itemCode = itemCodeRaw.toUpperCase();
  const text = `${description}\n${itemCodeRaw}`;
  const amount = raw.lineAmount;

  const { code, paren } = findCode(description, itemCodeRaw || null);
  const parts = code ? decodeCode(code) : null;

  let series = parts?.series ?? null;
  let seriesFromSide = false; // series came from the item code or the parenthesised original
  if (!series && paren) {
    const p = paren.match(/^(?:SP-)?(\d{2})/);
    if (p) {
      series = p[1];
      seriesFromSide = true;
    }
  }
  const specialSeries = itemCode.match(SPECIAL_SERIES_ITEM);
  if (!series && specialSeries) {
    series = specialSeries[1];
    seriesFromSide = true;
  }

  let shape = parts?.shape ?? null;
  let width = parts?.width ?? null;
  let depth = parts?.depth ?? null;
  let base = parts?.base ?? null;

  const isSpecial = Boolean(
    parts?.hasSp ||
      specialSeries ||
      itemCode === "SPECIAL TOP SIZE" ||
      parts?.specialHeight != null ||
      /(^|[-\s])SH\.\d/i.test(description),
  );

  const isReplacement = Boolean(
    /-REPL\b/i.test(raw.invoiceReference ?? "") ||
      /replacement/i.test(description) ||
      parts?.hasRepl ||
      (amount === 0 && paren),
  );

  // ── part kind ────────────────────────────────────────────────────────────
  const hasSize = shape != null && width != null;
  let kind: PartKind;
  if ((amount != null && amount < 0) || (!code && DISCOUNT_RE.test(text))) {
    kind = "discount";
  } else if (!code && FREIGHT_RE.test(text)) {
    kind = "freight";
  } else if (!hasSize && !base && ACCESSORY_RE.test(text)) {
    kind = "accessory";
  } else if (TOP_KEYWORD_RE.test(description) || (hasSize && !parts?.series && !base)) {
    kind = "top";
  } else if (BASE_KEYWORD_RE.test(description) || (series && base && !hasSize)) {
    kind = "base";
  } else if (series && hasSize && base) {
    kind = "table";
  } else {
    kind = "other";
  }

  // A part line only describes the part it sells.
  if (kind === "base") {
    shape = null;
    width = null;
    depth = null;
  } else if (kind === "top") {
    base = null;
  }

  // ── confidence ───────────────────────────────────────────────────────────
  let confidence: ParseConfidence;
  if (kind === "table" && !seriesFromSide && !parts?.decimalSize && !parts?.unknown) {
    confidence = "high";
  } else if (parts?.recognised || series) {
    confidence = "medium";
  } else if (kind !== "other") {
    confidence = "low";
  } else {
    confidence = "none";
  }

  return {
    code,
    series_code: series,
    shape,
    width_in: width,
    depth_in: depth,
    base_code: base,
    post_config: parts?.postConfig ?? null,
    is_special: isSpecial,
    special_height: parts?.specialHeight ?? null,
    is_replacement: isReplacement,
    part_kind: kind,
    parse_confidence: confidence,
  };
}

export default parseInvoiceLine;
