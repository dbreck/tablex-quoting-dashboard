import { test } from "node:test";
import assert from "node:assert/strict";
import parseDefault, { parseInvoiceLine } from "./parse-line";
import type { ParsedInvoiceLine, RawInvoiceLine } from "./types";

function line(description: string | null, extra: Partial<RawInvoiceLine> = {}): RawInvoiceLine {
  return {
    description,
    itemCode: null,
    accountCode: "200",
    qty: 1,
    unitAmount: 100,
    lineAmount: 100,
    invoiceReference: null,
    ...extra,
  };
}

function check(raw: RawInvoiceLine, expected: Partial<ParsedInvoiceLine>) {
  const got = parseInvoiceLine(raw);
  for (const [k, v] of Object.entries(expected)) {
    assert.deepEqual(got[k as keyof ParsedInvoiceLine], v, `${raw.description ?? "<null>"} → ${k}`);
  }
  return got;
}

test("default and named exports are the same function", () => {
  assert.equal(parseDefault, parseInvoiceLine);
});

// ── Special height (SH.xx) ──────────────────────────────────────────────────
test("special height lines", () => {
  check(line("SP-01TC1895T16-3P-SH.28"), {
    code: "SP-01TC1895T16-3P-SH.28", series_code: "01", shape: "TC", width_in: 18, depth_in: 95,
    base_code: "T16", post_config: 3, is_special: true, special_height: 28, part_kind: "table",
    parse_confidence: "high",
  });
  check(line("40TC2460FR2258-3P-SH.36"), {
    series_code: "40", shape: "TC", width_in: 24, depth_in: 60, base_code: "FR2258", post_config: 3,
    is_special: true, special_height: 36, part_kind: "table", parse_confidence: "high",
  });
  check(line("33RD42X32-3P-SH.40"), {
    series_code: "33", shape: "RD", width_in: 42, depth_in: null, base_code: "X32", is_special: true,
    special_height: 40, part_kind: "table",
  });
  check(line("71RD36Q2-3P-SH.18"), {
    series_code: "71", shape: "RD", width_in: 36, base_code: "Q2", special_height: 18, part_kind: "table",
  });
  check(line("01RD30X26FT-3P-MATCH-LC-SH.42"), {
    series_code: "01", shape: "RD", width_in: 30, base_code: "X26", post_config: 3, special_height: 42,
    is_special: true, part_kind: "table", parse_confidence: "high",
  });
  check(line("44QC2-COR-SH.40.31"), {
    series_code: "44", shape: null, base_code: "QC2", is_special: true, special_height: 40.31,
    part_kind: "base", parse_confidence: "medium",
  });
});

// ── Custom size (SP-) ───────────────────────────────────────────────────────
test("custom size lines", () => {
  check(line("SP-45TC3066D22-2P"), {
    series_code: "45", shape: "TC", width_in: 30, depth_in: 66, base_code: "D22", post_config: 2,
    is_special: true, part_kind: "table", parse_confidence: "high",
  });
  check(line("SP-99TC2466T22NE"), {
    series_code: "99", shape: "TC", width_in: 24, depth_in: 66, base_code: "T22", is_special: true,
    part_kind: "table", parse_confidence: "high",
  });
  check(line("SP-01TC2454T20-3P-OS-MATCH"), {
    series_code: "01", width_in: 24, depth_in: 54, base_code: "T20", post_config: 3, is_special: true,
    part_kind: "table", parse_confidence: "high",
  });
  check(line("SP-74TC2024H1524BL"), {
    series_code: "74", shape: "TC", width_in: 20, depth_in: 24, base_code: "H1524", is_special: true,
    part_kind: "table", parse_confidence: "high",
  });
  check(line("SP-99D3656D20"), {
    series_code: "99", shape: "D", width_in: 36, depth_in: 56, base_code: "D20", is_special: true,
    part_kind: "table", parse_confidence: "high",
  });
  check(line("TC18.842-3P", { itemCode: "SPECIAL TOP SIZE" }), {
    code: "TC18.842-3P", series_code: null, shape: "TC", width_in: 18.8, depth_in: 42, base_code: null,
    post_config: 3, is_special: true, part_kind: "top", parse_confidence: "medium",
  });
  check(line("SP-71RD72Q3-3P-TJ"), {
    series_code: "71", shape: "RD", width_in: 72, depth_in: null, base_code: "Q3", is_special: true,
    part_kind: "table", parse_confidence: "high",
  });
});

// ── Base only ───────────────────────────────────────────────────────────────
test("base-only lines", () => {
  check(line("45D26", { qty: 13, unitAmount: 283.6, lineAmount: 3686.8 }), {
    code: "45D26", series_code: "45", shape: null, width_in: null, base_code: "D26", part_kind: "base",
    is_special: false, parse_confidence: "medium",
  });
  check(line('40FR4058 Justice frame for a 42x60" top'), {
    code: "40FR4058", series_code: "40", shape: null, base_code: "FR4058", part_kind: "base",
  });
  check(line('99D32 Disc base for a 48" round top'), {
    series_code: "99", shape: null, base_code: "D32", part_kind: "base",
  });
  check(line("44C2-SH.36"), {
    series_code: "44", base_code: "C2", is_special: true, special_height: 36, part_kind: "base",
  });
  check(line("01T26GF-LC"), { series_code: "01", base_code: "T26", part_kind: "base" });
  check(line("99D20BL"), { series_code: "99", base_code: "D20", part_kind: "base" });
  check(line("08TT32NE"), { series_code: "08", base_code: "TT32", part_kind: "base" });
  check(line("17C-AH Replacement", { lineAmount: 0, unitAmount: 0 }), {
    series_code: "17", base_code: "C", part_kind: "base", is_replacement: true,
  });
  check(line("Replacement base for (17RD18D12)", { lineAmount: 0, unitAmount: 0 }), {
    code: "17RD18D12", series_code: "17", shape: null, width_in: null, base_code: "D12",
    part_kind: "base", is_replacement: true, parse_confidence: "medium",
  });
});

// ── Top only ────────────────────────────────────────────────────────────────
test("top-only lines", () => {
  check(line("TC3072-3P", { qty: 7, unitAmount: 244, lineAmount: 1708 }), {
    series_code: null, shape: "TC", width_in: 30, depth_in: 72, base_code: null, post_config: 3,
    part_kind: "top", parse_confidence: "medium",
  });
  check(line("TC2460-3P"), { shape: "TC", width_in: 24, depth_in: 60, part_kind: "top" });
  check(line("RD36-3P-PRE"), { shape: "RD", width_in: 36, depth_in: null, part_kind: "top" });
  check(line("TC2430-3P-RC Predrill for genu-tilt"), {
    shape: "TC", width_in: 24, depth_in: 30, part_kind: "top", parse_confidence: "medium",
  });
  check(line("RD60 Replacement Top for (01RD60TT34NE-3P)", { lineAmount: 0, unitAmount: 0 }), {
    code: "RD60", series_code: "01", shape: "RD", width_in: 60, base_code: null, part_kind: "top",
    is_replacement: true, parse_confidence: "medium",
  });
});

// ── Cutout / material ───────────────────────────────────────────────────────
test("cutout and material lines", () => {
  check(line("SP-40TC3096FR2894-3P-CC.CUSTOM See drawing"), {
    code: "SP-40TC3096FR2894-3P-CC.CUSTOM", series_code: "40", shape: "TC", width_in: 30, depth_in: 96,
    base_code: "FR2894", is_special: true, part_kind: "table", parse_confidence: "high",
  });
  check(line("SP-08SQ3636X32-3P-CORIAN"), {
    series_code: "08", shape: "SQ", width_in: 36, depth_in: 36, base_code: "X32", is_special: true,
    part_kind: "table", parse_confidence: "high",
  });
});

// ── Non-product ─────────────────────────────────────────────────────────────
test("non-product lines", () => {
  check(line("Freight", { itemCode: null }), { code: null, part_kind: "freight", parse_confidence: "low" });
  check(line("Discount", { lineAmount: -50, unitAmount: -50 }), {
    code: null, part_kind: "discount", parse_confidence: "low",
  });
  check(line("Custom table per drawing", { itemCode: "SPECIAL 01 SERIES" }), {
    code: null, series_code: "01", is_special: true, parse_confidence: "medium",
  });
  check(line(""), { code: null, part_kind: "other", parse_confidence: "none", is_special: false });
  check(line(null), { code: null, part_kind: "other", parse_confidence: "none" });
});

// ── Extra edge cases ────────────────────────────────────────────────────────
test("edge cases", () => {
  // Multi-line prose with the code first and a qty group.
  check(line("01TC1860T18-3P-LC(3)\nLaminate: Fusion Maple\nEdge: matching"), {
    code: "01TC1860T18-3P-LC", series_code: "01", width_in: 18, depth_in: 60, base_code: "T18",
    part_kind: "table", parse_confidence: "high",
  });
  // Keyword accessory with no code.
  check(line("G-Flip mechanism"), { code: null, part_kind: "accessory", parse_confidence: "low" });
  // -Repl invoice reference marks a replacement.
  check(line("01TC2460T22-3P", { invoiceReference: "PO 4411-Repl" }), {
    is_replacement: true, part_kind: "table",
  });
  // Dimension prose is never taken as a code.
  check(line('42x60" top by others'), { code: null, series_code: null });
  // Freight word inside a coded product line does not make it freight.
  check(line("01TC2460T22-3P ships LTL"), { part_kind: "table" });
  // Unknown suffix drops a full code to medium.
  check(line("01TC2460T22-3P-ZZZ"), { part_kind: "table", parse_confidence: "medium" });
});
