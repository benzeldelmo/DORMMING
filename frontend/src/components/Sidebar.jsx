import { Link, NavLink } from "react-router-dom";
import { Plus, Settings } from "lucide-react";
import { TABS } from "@/lib/nav";
import { cn } from "@/lib/utils";

const link = ({ isActive }) => cn("flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground",
  isActive && "bg-olive-soft text-olive-ink hover:bg-olive-soft hover:text-olive-ink");

/** Laptop navigation (lg and up): logo, New record, tabs, then the dorm and Settings at the bottom. */
export default function Sidebar({ dorm, onAdd }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border/70 bg-card px-4 py-5 lg:flex">
      <Link to="/home" className="px-2"><img src="/brand/dormming-logo.png" alt="DormMing" className="h-9 w-auto" /></Link>
      <button type="button" onClick={onAdd}
        className="mt-6 flex h-11 items-center justify-center gap-2 rounded-2xl bg-olive font-semibold text-white shadow-[0_6px_16px_-8px_rgb(0_0_0/0.35)] transition-transform active:scale-[0.98]">
        <Plus className="size-5" strokeWidth={2.5} />New record
      </button>
      <nav aria-label="Main" className="mt-5 space-y-1">
        {TABS.map(({ to, icon: Icon, label }) => <NavLink key={to} to={to} className={link}><Icon className="size-5" />{label}</NavLink>)}
      </nav>
      <div className="mt-auto space-y-3">
        {dorm && (
          <div className="rounded-2xl bg-olive-soft px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{dorm.name}</p>
              <p className="text-xs text-muted-foreground">{dorm.members.length} {dorm.members.length === 1 ? "member" : "members"}</p>
            </div>
          </div>
        )}
        <NavLink to="/settings" className={link}><Settings className="size-5" />Settings</NavLink>
      </div>
    </aside>
  );
}
