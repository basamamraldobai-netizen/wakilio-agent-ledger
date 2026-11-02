import { describe, it, expect } from "vitest";
import { parseAmount, detectHeaderRow, detectTitleAgent, buildRecords, guessRole, suggestMerges, summarize } from "./engine";

describe("engine", () => {
  it("treats لاشي as zero", () => {
    expect(parseAmount("لاشي")).toBe(0);
    expect(parseAmount("لا شيء")).toBe(0);
    expect(parseAmount("3,800")).toBe(3800);
    expect(parseAmount("٢٥٠٠")).toBe(2500);
  });

  it("applies merged title agent to all rows", () => {
    const grid = [
      ["خالـــــد عباس"],
      ["اسم الجواز", "الجهه", "تاريخ الاستلام", "الواصل", "المتبقي", "ملاحظات"],
      ["علاء عبدالله", "عدن", "07/22/2025", 0, 3100, "تم"],
      ["اشرف محسن", "صنعاء", "07/31/2025", 2000, 1100, ""],
    ];
    const h = detectHeaderRow(grid);
    expect(h).toBe(1);
    expect(detectTitleAgent(grid, h)).toBe("خالد عباس");
    const roles = grid[h]!.map((c) => guessRole(String(c)));
    const recs = buildRecords({ grid, headerRow: h, roles, fixedAgent: "خالد عباس", file: "f", sheet: "s" });
    expect(recs.every((r) => r.agentRaw === "خالد عباس")).toBe(true);
    const s = summarize(recs, {})[0]!;
    expect(s.passports).toBe(2);
    expect(s.paid).toBe(2000);
    expect(s.remaining).toBe(4200);
  });

  it("suggests similar agent names", () => {
    const s = suggestMerges(["ابو همام العجيري", "ابو  همام العجيري", "علي منيع"]);
    expect(s).toHaveLength(1);
  });
});
