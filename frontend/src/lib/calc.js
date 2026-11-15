// The amount keypad is a small calculator: + − × ÷ and %, so "1200 ÷ 3" can be typed straight in.
// The amount is kept as the typed expression (like "1200÷3") and read with toCentavos().

const OPS = "+−×÷";
const MAX = 24;

const lastNumber = (expr) => expr.split(/[+−×÷]/).at(-1);

/** What the expression reads after one key: a digit, "00", ".", an operator, "%", "del", "AC" or "=". */
export function pressCalc(expr, key) {
  if (key === "AC") return "";
  if (key === "del") return expr.slice(0, -1);
  if (key === "=") {
    const value = evaluate(expr);
    return value === null || value <= 0 ? expr : format(value); // a sum at or below zero stays as typed
  }
  const last = expr.at(-1) ?? "";
  if (OPS.includes(key)) {
    if (!expr) return ""; // nothing to work on yet
    return OPS.includes(last) ? expr.slice(0, -1) + key : expr + key;
  }
  if (expr.length >= MAX) return expr;
  const num = lastNumber(expr);
  if (key === "%") return num && !num.endsWith("%") && !num.endsWith(".") ? expr + "%" : expr;
  if (num.endsWith("%")) return expr; // "50%" is finished
  if (key === ".") return num.includes(".") ? expr : expr + (num ? "." : "0.");
  if (num.includes(".") && num.split(".")[1].length >= 2) return expr; // centavos: two digits
  if (num === "0") return expr.slice(0, -1) + (key === "00" ? "0" : key); // no leading zeros
  if (!num && key === "00") return expr + "0";
  return expr + key;
}

// What a well-formed expression looks like: numbers (each may end in %) joined by + − × ÷
const SHAPE = /^\d+(\.\d*)?%?([+−×÷]\d+(\.\d*)?%?)*$/;

/**
 * The value of an expression in pesos: × and ÷ before + and −, a trailing operator ignored. A % after
 * + or − is a percent of the total so far, like a phone calculator (1000 + 10% = 1100); elsewhere it
 * divides by 100. Null when the text isn't a well-formed sum (typed junk never throws) or divides by 0.
 */
export function evaluate(expr) {
  const text = expr.replace(/[+−×÷]$/, "");
  if (!SHAPE.test(text)) return null;
  const tokens = text.match(/\d+(?:\.\d*)?%?|[+−×÷]/g);
  const plain = (t) => (t.endsWith("%") ? parseFloat(t) / 100 : parseFloat(t));
  let sum = 0;
  let sign = "+";
  let term = plain(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const t = tokens[i + 1];
    if (op === "×") term *= plain(t);
    else if (op === "÷") {
      if (plain(t) === 0) return null;
      term /= plain(t);
    } else {
      sum += sign === "+" ? term : -term;
      sign = op;
      term = t.endsWith("%") ? (sum * parseFloat(t)) / 100 : parseFloat(t);
    }
  }
  const total = sum + (sign === "+" ? term : -term);
  return Number.isFinite(total) ? total : null;
}

/** The expression as centavos, rounded to the nearest centavo; null unless it's more than ₱0. */
export function toCentavos(expr) {
  const value = evaluate(expr);
  const centavos = value === null ? 0 : Math.round(value * 100);
  return centavos > 0 && Number.isSafeInteger(centavos) ? centavos : null;
}

const format = (value) => String(Math.round(value * 100) / 100);
