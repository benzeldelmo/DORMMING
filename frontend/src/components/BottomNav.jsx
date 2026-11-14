import { NavLink } from "react-router-dom";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Phone navigation: a bar at the bottom of the screen. */
export default function BottomNav() {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-[640px] justify-around px-2">
        {NAV.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink to={to}
              className={({ isActive }) => cn("flex min-w-16 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-foreground/60",
                isActive && "text-olive")}>
              <Icon className="size-5" />{label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
