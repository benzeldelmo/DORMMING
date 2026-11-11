/** "Vince Paid • Shared with Me, and Sydney" (mockup wording) for a shared expense. */
export function sharedLine(expense, meId) {
  const name = (u) => (u.id === meId ? "Me" : u.displayName);
  const others = expense.shares.map((s) => s.user).filter((u) => u.id !== expense.payer.id).map(name);
  const list = others.length <= 1 ? others.join("") : `${others.slice(0, -1).join(", ")}, and ${others.at(-1)}`;
  return `${name(expense.payer)} Paid • Shared with ${list}`;
}
