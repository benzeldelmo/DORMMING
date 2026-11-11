const PESOS = /^\d+(\.\d{1,2})?$/;

/** 100000 → "₱1,000.00"; -500 → "-₱5.00". */
export function formatPeso(centavos) {
  const abs = Math.abs(centavos);
  const pesos = Math.floor(abs / 100).toLocaleString("en-US");
  const cents = String(abs % 100).padStart(2, "0");
  return `${centavos < 0 ? "-" : ""}₱${pesos}.${cents}`;
}

/** "1,000.50" → 100050. Returns null unless it's a positive amount with at most 2 decimals. */
export function parsePesos(text) {
  const cleaned = String(text ?? "").replaceAll("₱", "").replaceAll(",", "").replaceAll(" ", "").trim();
  if (!PESOS.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const centavos = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  return centavos > 0 && Number.isSafeInteger(centavos) ? centavos : null;
}

/** 15000 → "150" and 1250 → "12.50", for prefilling inputs. */
export function centavosToInput(centavos) {
  return centavos % 100 === 0 ? String(centavos / 100) : (centavos / 100).toFixed(2);
}

/** 100000 → "₱1,000"; keeps centavos only when there are some. For big display numbers. */
export function formatPesoShort(centavos) {
  const full = formatPeso(centavos);
  return full.endsWith(".00") ? full.slice(0, -3) : full;
}
