import { Link, NavLink } from "react-router-dom";
import { CalendarDays, CreditCard, House, MessageCircleHeart, Plus, ReceiptText, Settings, Wallet } from "lucide-react";
import MingBust from "./MingBust";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/home", icon: House, label: "Home" },
  { to: "/expenses", icon: ReceiptText, label: "Expenses" },
  { to: "/bills", icon: CalendarDays, label: "Bills" },
  { to: "/balances", icon: Wallet, label: "Balances" },
  { to: "/assistant", icon: MessageCircleHeart, label: "Ask Ming" },
  { to: "/card", icon: CreditCard, label: "My card" },
];

/** Desktop navigation (lg and up). */
export default function Sidebar({ dorm, onAdd }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border/70 bg-card px-4 py-5 lg:flex">
      <Link to="/home" className="px-2"><img src="/brand/dormming-logo.png" alt="DormMing" className="h-9 w-auto" /></Link>
      <button type="button" onClick={onAdd}
        className="mt-6 flex h-11 items-center justify-center gap-2 rounded-2xl bg-olive font-semibold text-white shadow-[0_6px_16px_-8px_rgb(0_0_0/0.35)] transition-transform active:scale-[0.98]">
        <Plus className="size-5" strokeWidth={2.5} />New record
      </button>
      <nav aria-label="Main" className="mt-5 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => cn("flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground",
              isActive && "bg-olive-soft text-olive hover:bg-olive-soft hover:text-olive")}>
            <Icon className="size-5" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-3">
        {dorm && (
          <div className="flex items-end gap-2 overflow-hidden rounded-2xl bg-olive-soft px-3 pt-3">
            <MingBust className="w-16 shrink-0" />
            <div className="min-w-0 pb-3">
              <p className="truncate text-sm font-bold">{dorm.name}</p>
              <div className="mt-1 flex -space-x-1.5">
                {dorm.members.slice(0, 5).map((m) => (
                  <span key={m.user.id} title={m.user.displayName}
                    className="grid size-6 place-items-center rounded-full bg-card text-[10px] font-bold ring-2 ring-olive-soft">{m.user.initials}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        <NavLink to="/settings" className={({ isActive }) => cn("flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-foreground/70 hover:bg-secondary", isActive && "bg-olive-soft text-olive")}>
          <Settings className="size-5" />Settings
        </NavLink>
      </div>
    </aside>
  );
}
