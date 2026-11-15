import { expect, test } from "vitest";
import { moodFor } from "./mood";

const b = (owedToMeCentavos, iOweCentavos) => ({ owedToMeCentavos, iOweCentavos });

test("worried whenever you owe, even if you are also owed", () => {
  expect(moodFor(b(100000, 90000), 2).mood).toBe("WORRIED");
});

test("happy while dormmates owe you and you owe nobody", () => {
  expect(moodFor(b(5000, 0), 2).mood).toBe("HAPPY");
});

test("celebrating when everyone is square after spending together", () => {
  expect(moodFor(b(0, 0), 3).mood).toBe("CELEBRATING");
});

test("sleepy before the dorm has any expenses", () => {
  expect(moodFor(b(0, 0), 0).mood).toBe("SLEEPY");
});

test("a bill due within 2 days worries Ming when you owe nobody", () => {
  const bill = { name: "Internet", dueDate: "2026-11-16" };
  const now = new Date(2026, 10, 15);
  expect(moodFor(b(5000, 0), 2, [bill], now)).toEqual({ mood: "WORRIED", line: "Internet is due tomorrow." });
  expect(moodFor(b(0, 0), 2, [{ name: "Water", dueDate: "2026-11-24" }], now).mood).toBe("CELEBRATING");
});

test("names who you owe most, and takes you straight to paying them", () => {
  const balances = { owedToMeCentavos: 0, iOweCentavos: 120000, debts: [
    { user: { id: "s", displayName: "Sydney Cruz" }, direction: "I_OWE", amountCentavos: 30000 },
    { user: { id: "v", displayName: "Vince Reyes" }, direction: "I_OWE", amountCentavos: 90000 },
  ] };
  expect(moodFor(balances, 2)).toEqual({ mood: "WORRIED", line: "You owe Vince ₱900. Tap to pay.", to: "/payments/new?to=v" });
});
