import { describe, expect, it } from "vitest";
import { monthSummary } from "./spending";

describe("monthSummary", () => {
  it("adds up this month only and ranks categories", () => {
    const today = new Date(2026, 10, 15);
    const s = monthSummary([
      { date: "2026-11-02", category: "FOOD_GROCERIES", amountCentavos: 50000 },
      { date: "2026-11-09", category: "RENT_UTILITIES", amountCentavos: 90000 },
      { date: "2026-11-10", category: "FOOD_GROCERIES", amountCentavos: 60000 },
      { date: "2026-10-30", category: "LEISURE", amountCentavos: 99999 },
    ], today);
    expect(s.total).toBe(200000);
    expect(s.top.map((t) => t.id)).toEqual(["FOOD_GROCERIES", "RENT_UTILITIES"]);
    expect(s.top[0]).toMatchObject({ label: "Food & Groceries", centavos: 110000 });
  });
});
