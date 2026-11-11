import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const DOCS = {
  terms: {
    title: "Terms of Service",
    body: [
      ["What DormMing is", "DormMing is a student project by MING Dynasty (IT 2107, OOP 101) for keeping track of shared dorm expenses, bills and payments between dormmates."],
      ["Simulated banking only", "DormMing does not hold, send or receive money. Payments you record are notes between dormmates; the digital card is not a real card."],
      ["Your responsibilities", "Keep your login to yourself and record amounts honestly. Your dormmates see the expenses, bills and payments in your dorm."],
      ["Availability", "This is a demo. Data may be reset when the server restarts, and features can change without notice."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      ["What we keep", "Your name, email, password (stored as a one-way hash), Ming's name, your dorm and the records you add."],
      ["Who sees it", "Members of your dorm see your name and the records in that dorm. Friends see your name and card. Nobody else."],
      ["What we don't do", "We don't sell or share your data, show ads, or connect to any bank."],
      ["Deleting your data", "Settings → Delete account removes your login, friends list and dorm membership. Records you added stay so your dormmates' balances still add up."],
    ],
  },
};

export default function Legal({ doc }) {
  const { title, body } = DOCS[doc];
  return (
    <main className="mx-auto min-h-dvh max-w-[680px] px-5 py-10">
      <button type="button" onClick={() => history.back()} className="-ml-2 mb-6 flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-muted-foreground hover:bg-card">
        <ChevronLeft className="size-4" />Back
      </button>
      <h1 className="text-[36px] leading-tight font-black">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated 12 November 2026</p>
      <div className="mt-10 space-y-8">
        {body.map(([h, p]) => (
          <section key={h}>
            <h2 className="text-xl font-extrabold">{h}</h2>
            <p className="mt-2 leading-relaxed text-foreground/80">{p}</p>
          </section>
        ))}
      </div>
      <p className="mt-12 text-sm text-muted-foreground"><Link to="/" className="font-semibold text-olive">DormMing</Link> · © 2026 MING Dynasty</p>
    </main>
  );
}
