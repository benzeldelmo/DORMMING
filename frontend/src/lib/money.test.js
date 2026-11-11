import { describe, expect, test } from "vitest";
import { formatPeso, formatPesoShort, parsePesos } from "./money";

describe("money", () => {
  test("formats centavos as pesos", () => {
    expect(formatPeso(100000)).toBe("₱1,000.00");
    expect(formatPeso(-500)).toBe("-₱5.00");
    expect(formatPeso(0)).toBe("₱0.00");
  });

  test("short format drops zero centavos", () => {
    expect(formatPesoShort(100000)).toBe("₱1,000");
    expect(formatPesoShort(90050)).toBe("₱900.50");
  });

  test("parses what people type", () => {
    expect(parsePesos("1,000.50")).toBe(100050);
    expect(parsePesos("₱1000")).toBe(100000);
    expect(parsePesos(" 12.5 ")).toBe(1250);
  });

  test("rejects bad amounts", () => {
    for (const bad of ["", "abc", "1.234", "-5", "0", "0.00", "1e3"]) expect(parsePesos(bad)).toBeNull();
  });
});
