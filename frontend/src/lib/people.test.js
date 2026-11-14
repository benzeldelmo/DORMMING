import { expect, test } from "vitest";
import { sharedLine } from "./people";

const u = (id, displayName) => ({ id, displayName });
const expense = (payer, ...others) => ({ payer, shares: [payer, ...others].map((user) => ({ user })) });

test("says you when you are the payer or in the split", () => {
  expect(sharedLine(expense(u("b", "Benzel"), u("s", "Sydney")), "b")).toBe("You paid • Shared with Sydney");
  expect(sharedLine(expense(u("v", "Vince"), u("b", "Benzel"), u("s", "Sydney")), "b")).toBe("Vince paid • Shared with you and Sydney");
});
