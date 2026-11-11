import { expect, test } from "vitest";
import { greetingFor } from "./dates";

test("greets by time of day", () => {
  expect(greetingFor(new Date(2026, 10, 12, 8))).toBe("Good morning");
  expect(greetingFor(new Date(2026, 10, 12, 14))).toBe("Good afternoon");
  expect(greetingFor(new Date(2026, 10, 12, 20))).toBe("Good evening");
});
