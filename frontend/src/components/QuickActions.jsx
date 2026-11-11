import { Link } from "react-router-dom";
import { BellRing, CreditCard, MessageCircleHeart, ReceiptText, WalletCards } from "lucide-react";

const ACTIONS = [
  { to: "/expenses/new", icon: CreditCard, label: "Add expense" },
  { to: "/payments/new", icon: WalletCards, label: "Record payment" },
  { to: "/bills/new", icon: BellRing, label: "Bill reminder" },
  { to: "/expenses/receipt", icon: ReceiptText, label: "Split receipt" },
  { to: "/assistant", icon: MessageCircleHeart, label: "Ask Ming" },
];

export default function QuickActions() {
  return (
    <section aria-label="Quick actions" className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-2.5 lg:grid lg:grid-cols-5">
        {ACTIONS.map(({ to, icon: Icon, label }) => (
          <li key={to} className="shrink-0">
            <Link to={to} className="card-surface flex h-[100px] w-[92px] flex-col items-center gap-2 px-2 py-3.5 text-center lg:h-auto transition-transform active:scale-[0.97] lg:w-full lg:flex-row lg:gap-3 lg:px-4 lg:text-left">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-olive-soft text-olive"><Icon className="size-5" /></span>
              <span className="text-[12px] leading-tight font-semibold lg:text-sm">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
