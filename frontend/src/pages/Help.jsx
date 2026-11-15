import { ChevronDown } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const FAQ = [
  ["How is an expense split?", "Equally, between everyone in the dorm. To leave someone out, tap Change when you add it. Shares are exact to the centavo."],
  ["What are bills?", "Your own payment reminders, like internet, water or rent. Only you see them. Monthly bills come back after you mark them paid."],
  ["When does Ming remind me?", "Ming tells you on Home when a bill is due soon: 2 days before, unless you change it in Settings → Bill reminders."],
  ["How do I pay a dormmate back?", "Pay them however you like, like cash or GCash. Then open Balances and tap Pay on their card. You can't pay back more than you owe."],
  ["How do new dormmates join?", "They scan your dorm's QR code, from Settings → Dormitory or + → Scan QR, or type its 6-character code."],
  ["Why can't I leave my dorm?", "You can leave once nobody owes you and you owe nobody. Record the payments first, then leave."],
  ["Is this real money?", "No. DormMing only keeps the records. No money moves through the app."],
];

/** Frequently asked questions, from Settings → Help & Support. */
export default function Help() {
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <PageHeader title="FAQs" back />
      <div className="divide-y divide-border rounded-3xl bg-card mx-5 px-4 shadow-[var(--shadow-card)]">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 text-[16px] font-semibold">
              {q}<ChevronDown aria-hidden className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-[15px] leading-relaxed text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
