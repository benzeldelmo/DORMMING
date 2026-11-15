import { expect, test } from "vitest";
import { dueLabel } from "./dates";

const today = new Date(2026, 10, 15); // Sunday, November 15

test("says how soon a bill is due, in words", () => {
  expect(dueLabel("2026-11-14", today)).toBe("Overdue");
  expect(dueLabel("2026-11-15", today)).toBe("Due today");
  expect(dueLabel("2026-11-16", today)).toBe("Due tomorrow");
  expect(dueLabel("2026-11-20", today)).toBe("Due in 5 days");
  expect(dueLabel("2026-12-03", today)).toBe("Due Dec 3");
});
