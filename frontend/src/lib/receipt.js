/**
 * Preview of the server's ItemizedSplit (display only; saved numbers come from the API).
 * Each item is split equally among its sharers (leftover centavos to non-payers first),
 * then extras are shared in proportion to item subtotals, by largest remainder.
 */
function equal(total, ids, payer) {
  const out = Object.fromEntries(ids.map((id) => [id, Math.trunc(total / ids.length)]));
  let left = total % ids.length;
  const order = ids.includes(payer) ? ids.filter((id) => id !== payer) : ids;
  for (const id of order) {
    if (left === 0) break;
    out[id] += 1;
    left -= 1;
  }
  return out;
}

export function splitReceipt(items, extras, people, payer) {
  const subtotals = Object.fromEntries(people.map((id) => [id, 0]));
  for (const item of items) {
    const sharers = people.filter((id) => item.sharerIds.includes(id));
    if (!sharers.length || !item.priceCentavos) continue;
    for (const [id, part] of Object.entries(equal(item.priceCentavos, sharers, payer))) subtotals[id] += part;
  }
  const itemsSum = Object.values(subtotals).reduce((a, b) => a + b, 0);
  const shares = { ...subtotals };
  if (itemsSum > 0 && extras) {
    const fractions = {};
    let handed = 0;
    for (const id of people) {
      const numerator = extras * subtotals[id];
      const base = Math.trunc(numerator / itemsSum);
      fractions[id] = Math.abs(numerator % itemsSum);
      shares[id] += base;
      handed += base;
    }
    let remaining = extras - handed;
    const order = [...people].sort((x, y) => fractions[y] - fractions[x]);
    for (let i = 0; remaining !== 0; i++) {
      const step = Math.sign(remaining);
      shares[order[i % order.length]] += step;
      remaining -= step;
    }
  }
  return { subtotals, shares, itemsSum };
}
