import { beforeEach, expect, test } from "vitest";
import { checkPasscode, clearPasscode, hasPasscode, setPasscode } from "./passcode";

const store = new Map();
beforeEach(() => {
  store.clear();
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
});

test("a set passcode unlocks, a wrong one does not, and it is never stored as typed", async () => {
  await setPasscode("2468");
  expect(hasPasscode()).toBe(true);
  expect(await checkPasscode("2468")).toBe(true);
  expect(await checkPasscode("1357")).toBe(false);
  expect([...store.values()].join()).not.toContain("2468");
});

test("only 4 digits are accepted, and clearing removes it", async () => {
  await expect(setPasscode("12a4")).rejects.toThrow("4 digits");
  await setPasscode("0000");
  clearPasscode();
  expect(hasPasscode()).toBe(false);
});

import { pinLockout } from "./passcode";

test("wrong PINs: free tries, then growing waits, then log out", () => {
  expect(pinLockout(4)).toEqual({ waitMs: 0, logOut: false });
  expect(pinLockout(5)).toEqual({ waitMs: 30000, logOut: false });
  expect(pinLockout(6)).toEqual({ waitMs: 60000, logOut: false });
  expect(pinLockout(9)).toEqual({ waitMs: 480000, logOut: false });
  expect(pinLockout(10)).toEqual({ waitMs: 0, logOut: true });
});
