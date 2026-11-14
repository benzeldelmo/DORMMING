import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import { TABS } from "@/lib/nav";
import { cn } from "@/lib/utils";

function Tab({ to, icon: Icon, label }) {
  return (
    <NavLink to={to}
      className={({ isActive }) => cn("flex h-14 min-w-[62px] flex-col items-center justify-center gap-0.5 rounded-full px-2 text-[11px] font-bold transition-colors active:scale-95",
        isActive ? "bg-olive-soft text-olive-ink" : "text-muted-foreground hover:text-foreground")}>
      <Icon aria-hidden className="size-[22px]" strokeWidth={2.1} />
      <span className="leading-none">{label}</span>
    </NavLink>
  );
}

/** Phone navigation: a floating pill above the home indicator, labelled tabs, the + action in the middle. */
export default function BottomNav({ onAdd }) {
  return (
    <nav aria-label="Main" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="pointer-events-auto mx-auto flex max-w-[440px] items-center justify-between rounded-full bg-card/95 p-1.5 shadow-[0_12px_32px_-12px_rgb(18_22_15/0.4)] ring-1 ring-border backdrop-blur-md">
        {TABS.slice(0, 2).map((t) => <Tab key={t.to} {...t} />)}
        <button type="button" onClick={onAdd} aria-label="Add a record"
          className="grid size-14 shrink-0 place-items-center rounded-full bg-olive text-white shadow-[0_8px_18px_-8px_rgb(18_22_15/0.6)] transition-transform active:scale-95">
          <Plus className="size-7" strokeWidth={2.5} />
        </button>
        {TABS.slice(2).map((t) => <Tab key={t.to} {...t} />)}
      </div>
    </nav>
  );
}
