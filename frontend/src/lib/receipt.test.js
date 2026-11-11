import { expect, test } from "vitest";
import { splitReceipt } from "./receipt";

const people = ["a", "b", "c"];

test("matches the Java itemized split", () => {
  const items = [{ priceCentavos: 30000, sharerIds: ["a", "b", "c"] }, { priceCentavos: 20000, sharerIds: ["b", "c"] }];
  expect(splitReceipt(items, 5000, people, "a").shares).toEqual({ a: 11000, b: 22000, c: 22000 });
});

test("rounds extras by largest remainder and keeps leftovers off the payer", () => {
  const items = [{ priceCentavos: 10000, sharerIds: ["a", "b", "c"] }];
  expect(splitReceipt(items, 100, people, "a").shares).toEqual({ a: 3366, b: 3368, c: 3366 });
});

test("handles a discount", () => {
  const items = [{ priceCentavos: 10000, sharerIds: ["a", "b"] }];
  expect(splitReceipt(items, -1000, ["a", "b"], "a").shares).toEqual({ a: 4500, b: 4500 });
});
