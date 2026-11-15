import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const DOCS = {
  terms: {
    title: "Terms of Service",
    body: [
      ["What DormMing is", "DormMing is a student project by MING Dynasty for keeping track of shared dorm expenses, payments between dormmates, and your own bill reminders."],
      ["Records only", "DormMing does not hold, send or receive money. Payments you record are notes between dormmates."],
      ["Your part", "Keep your login to yourself and record amounts honestly. Everyone in your dorm sees its shared expenses and payments."],
      ["Availability", "This is a demo. Data may be reset when the server restarts, and features can change without notice."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      ["What we keep", "Your name, email, password (stored only as a one-way hash), your dorm, the expenses and payments you add, and your bill reminders."],
      ["Who sees it", "Members of your dorm see your name and the dorm's expenses and payments. Your bill reminders are only visible to you. Nobody else sees any of it."],
      ["What we don't do", "We don't sell or share your data, show ads, or connect to any bank."],
      ["Leaving", "You can leave your dorm once you're settled up. Records you added stay, so your dormmates' balances still add up."],
    ],
  },
};

/** Terms of Service and Privacy Policy, readable without logging in. */
export default function Legal({ doc }) {
  const navigate = useNavigate();
  const { title, body } = DOCS[doc];
  return (
    <main className="mx-auto min-h-dvh max-w-[680px] px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-12">
      <button type="button" onClick={() => navigate(-1)} className="-ml-2 mb-6 flex h-11 items-center gap-1 rounded-full px-2 text-[15px] font-semibold text-muted-foreground hover:bg-card">
        <ChevronLeft className="size-5" />Back
      </button>
      <h1 className="font-heading text-[34px] leading-tight font-black">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated 15 November 2026</p>
      <div className="mt-8 space-y-7">
        {body.map(([h, p]) => (
          <section key={h}>
            <h2 className="font-heading text-xl font-extrabold">{h}</h2>
            <p className="mt-2 max-w-[62ch] leading-relaxed text-foreground/80">{p}</p>
          </section>
        ))}
      </div>
      <p className="mt-12 text-sm text-muted-foreground"><Link to="/" className="font-semibold text-olive-ink">DormMing</Link> · © 2026 MING Dynasty</p>
    </main>
  );
}
