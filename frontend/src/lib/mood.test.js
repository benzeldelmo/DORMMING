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
