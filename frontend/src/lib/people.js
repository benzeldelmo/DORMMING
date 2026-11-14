/** "Vince paid • Shared with you and Sydney" for a shared expense. */
export function sharedLine(expense, meId) {
  const name = (u) => (u.id === meId ? "you" : u.displayName);
  const others = expense.shares.map((s) => s.user).filter((u) => u.id !== expense.payer.id).map(name);
  const list = others.length <= 1 ? others.join("") : `${others.slice(0, -1).join(", ")} and ${others.at(-1)}`;
  const payer = expense.payer.id === meId ? "You" : expense.payer.displayName;
  return `${payer} paid • Shared with ${list}`;
}
