import { expect, test } from "vitest";
import { codeFromQr, joinUrl } from "./qr";

test("reads the dorm code from a join link or a bare code", () => {
  expect(codeFromQr("http://192.168.18.6:5180/join/2W8PZW")).toBe("2W8PZW");
  expect(codeFromQr(" ab3c9d ")).toBe("AB3C9D");
});

test("rejects anything that is not a dorm code", () => {
  expect(codeFromQr("https://example.com/hello")).toBeNull();
  expect(codeFromQr("IO01XY")).toBeNull(); // I, O, 0 and 1 are never used in codes
});

test("builds the join link the QR shows", () => {
  expect(joinUrl("2W8PZW", "http://192.168.18.6:5180")).toBe("http://192.168.18.6:5180/join/2W8PZW");
});
