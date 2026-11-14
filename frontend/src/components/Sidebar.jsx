import { Link, NavLink } from "react-router-dom";
import MingBust from "./MingBust";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Laptop navigation (lg and up): a fixed sidebar with the dorm at the bottom. */
export default function Sidebar({ dorm }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border/70 bg-card px-4 py-5 lg:flex">
      <Link to="/balances" className="px-2"><img src="/brand/dormming-logo.png" alt="DormMing" className="h-9 w-auto" /></Link>
      <nav aria-label="Main" className="mt-8 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => cn("flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground",
              isActive && "bg-olive-soft text-olive hover:bg-olive-soft hover:text-olive")}>
            <Icon className="size-5" />{label}
          </NavLink>
        ))}
      </nav>
      {dorm && (
        <div className="mt-auto flex items-end gap-2 overflow-hidden rounded-2xl bg-olive-soft px-3 pt-3">
          <MingBust className="w-16 shrink-0" />
          <div className="min-w-0 pb-3">
            <p className="truncate text-sm font-bold">{dorm.name}</p>
            <p className="text-xs text-muted-foreground">{dorm.members.length} {dorm.members.length === 1 ? "member" : "members"}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
