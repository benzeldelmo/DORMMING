/**
 * Ming's mood from your balance, plus what Ming says about it.
 * Worried beats everything: owing money is the thing to act on first.
 */
export function moodFor({ owedToMeCentavos, iOweCentavos }, expenseCount) {
  if (iOweCentavos > 0) return { mood: "WORRIED", line: "You owe someone. Let's settle up." };
  if (owedToMeCentavos > 0) return { mood: "HAPPY", line: "Your dormmates owe you. I'm keeping count." };
  if (expenseCount > 0) return { mood: "CELEBRATING", line: "Everyone's square. Nice work, dorm!" };
  return { mood: "SLEEPY", line: "Nothing to count yet. Add your first expense." };
}
