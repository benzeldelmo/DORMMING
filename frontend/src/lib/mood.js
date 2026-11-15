import { daysUntil, dueLabel } from "./dates";
import { formatPesoShort } from "./money";

/**
 * Ming's mood from your balance and your bills, plus what Ming says about it.
 * Owing a dormmate comes first (naming who you owe most, with `to` going straight to paying them), then a bill
 * due within your reminder window (2 days by default), then the good news.
 */
export function moodFor({ owedToMeCentavos, iOweCentavos, debts = [] }, expenseCount, bills = [], today = new Date(), remindDays = 2) {
  if (iOweCentavos > 0) {
    const top = debts.filter((d) => d.direction === "I_OWE").sort((a, b) => b.amountCentavos - a.amountCentavos)[0];
    if (!top) return { mood: "WORRIED", line: "You owe someone. Let's settle up." };
    return { mood: "WORRIED", line: `You owe ${top.user.displayName.split(" ")[0]} ${formatPesoShort(top.amountCentavos)}. Tap to pay.`, to: `/payments/new?to=${top.user.id}` };
  }
  const soon = bills.find((b) => daysUntil(b.dueDate, today) <= remindDays);
  if (soon) return { mood: "WORRIED", line: `${soon.name} is ${dueLabel(soon.dueDate, today).replace(/^Due /, "due ").replace("Overdue", "overdue")}.` };
  if (owedToMeCentavos > 0) return { mood: "HAPPY", line: "Your dormmates owe you. I'm keeping count." };
  if (expenseCount > 0) return { mood: "CELEBRATING", line: "Everyone's square. Nice work, dorm!" };
  return { mood: "SLEEPY", line: "Nothing to count yet. Add your first expense." };
}
