import { NavLink } from "react-router-dom";
import { CalendarDays, House, Plus, ReceiptText, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const item = ({ isActive }) =>
  cn(
    "grid size-11 place-items-center rounded-full text-foreground/70 transition-colors hover:text-foreground",
    isActive && "bg-olive-soft text-olive",
  );

export default function BottomNav({ onAdd }) {
  return (
    <nav aria-label="Main" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[640px] lg:hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center justify-between rounded-full bg-secondary/95 px-4 py-2 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur">
        <NavLink to="/home" className={item} aria-label="Home"><House className="size-5" /></NavLink>
        <NavLink to="/expenses" className={item} aria-label="Expenses"><ReceiptText className="size-5" /></NavLink>
        <button type="button" onClick={onAdd} aria-label="Add a record"
          className="grid size-12 place-items-center rounded-full bg-olive text-white shadow-md transition-transform hover:scale-105 active:scale-95">
          <Plus className="size-6" strokeWidth={2.5} />
        </button>
        <NavLink to="/bills" className={item} aria-label="Bills"><CalendarDays className="size-5" /></NavLink>
        <NavLink to="/balances" className={item} aria-label="Balances"><Wallet className="size-5" /></NavLink>
      </div>
    </nav>
  );
}
