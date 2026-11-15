import { describe, expect, it } from "vitest";
import { evaluate, pressCalc, toCentavos } from "./calc";

const type = (keys) => keys.reduce(pressCalc, "");

describe("calculator keypad", () => {
  it("types numbers, 00 and one decimal point per number", () => {
    expect(type(["1", "2", "00"])).toBe("1200");
    expect(type(["1", ".", "5", ".", "0"])).toBe("1.50");
    expect(type(["9", ".", "9", "9", "9"])).toBe("9.99");
  });
  it("swaps a trailing operator and never starts with one", () => {
    expect(type(["+"])).toBe("");
    expect(type(["5", "+", "×"])).toBe("5×");
  });
  it("evaluates with × and ÷ before + and −", () => {
    expect(evaluate("100+50×2")).toBe(200);
    expect(evaluate("1000÷3")).toBeCloseTo(333.333, 2);
    expect(evaluate("200−50%")).toBe(100); // like a phone calculator: 50% of 200
    expect(evaluate("1000+10%")).toBe(1100);
    expect(evaluate("50%")).toBe(0.5);
  });
  it("= shows the result, AC clears and ⌫ deletes", () => {
    expect(type(["1", "2", "0", "0", "÷", "3", "="])).toBe("400");
    expect(type(["4", "5", "÷", "2", "="])).toBe("22.5");
    expect(pressCalc("12+3", "AC")).toBe("");
    expect(pressCalc("12+3", "del")).toBe("12+");
  });
  it("gives centavos for a whole expression, or null when it isn't a positive amount", () => {
    expect(toCentavos("1250")).toBe(125000);
    expect(toCentavos("1000÷3")).toBe(33333);
    expect(toCentavos("5+")).toBe(500);
    expect(toCentavos("5−5")).toBeNull();
    expect(toCentavos("")).toBeNull();
    expect(toCentavos("4÷0")).toBeNull();
  });

  it("never crashes on typed junk, and a sum below zero is not an amount", () => {
    expect(evaluate("1.2.3")).toBeNull();
    expect(evaluate("5%5")).toBeNull();
    expect(toCentavos("1..5")).toBeNull();
    expect(pressCalc("5−10", "=")).toBe("5−10"); // = keeps it, so it can't turn into 5
    expect(toCentavos("5−10")).toBeNull();
  });
});
