import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { ADD_ACTIONS, TABS } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Phone navigation: a long frosted-glass pill of tabs, and the round + beside it.
 * The + opens its actions right there: they pop up above it one after another, the + turns into an X,
 * and the X (or a tap outside, or Escape) puts them away again.
 */
export default function BottomNav({ open, onOpenChange }) {
  const navigate = useNavigate();
  const close = () => onOpenChange(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  return (
    <>
      {/* Dims the page while the actions are out; tapping it closes them */}
      <div aria-hidden onClick={close}
        className={cn("fixed inset-0 z-30 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} />

      <nav aria-label="Main" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end gap-2.5 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="frosted pointer-events-auto flex h-[60px] min-w-0 flex-1 items-center justify-between rounded-full px-1.5">
          {TABS.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={close}
              className={({ isActive }) => cn("flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-bold transition-colors",
                isActive ? "bg-olive-soft text-olive-ink" : "text-muted-foreground active:bg-black/5")}>
              <Icon aria-hidden className="size-5" strokeWidth={2.1} />
              <span className="leading-none">{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="relative shrink-0">
          {/* The actions, stacked above the +; the one nearest the thumb pops first */}
          <ul id="add-actions" aria-label="Add or record" inert={!open} aria-hidden={!open} className={cn("absolute right-0 bottom-[72px] flex flex-col items-end gap-2.5", !open && "pointer-events-none")}>
            {ADD_ACTIONS.map(({ to, icon: Icon, title }, i) => (
              <li key={to} className="dial-item" data-open={open || undefined} style={{ "--i": ADD_ACTIONS.length - 1 - i }}>
                <button type="button" tabIndex={open ? 0 : -1} onClick={() => { close(); navigate(to); }}
                  className="pointer-events-auto flex h-12 items-center gap-3 rounded-full bg-card py-1.5 pr-1.5 pl-5 text-[16px] font-bold whitespace-nowrap shadow-[0_10px_24px_-12px_rgb(18_22_15/0.55)] active:scale-[0.97]">
                  {title}
                  <span className="grid size-9 place-items-center rounded-full bg-olive-soft text-olive-ink"><Icon aria-hidden className="size-[18px]" /></span>
                </button>
              </li>
            ))}
          </ul>

          <button type="button" onClick={() => onOpenChange(!open)} aria-expanded={open} aria-controls="add-actions"
            aria-label={open ? "Close" : "Add or record something"}
            className={cn("pointer-events-auto grid size-[60px] place-items-center rounded-full text-white shadow-[0_10px_24px_-10px_rgb(18_22_15/0.7)] transition-[transform,background-color] duration-200 active:scale-95",
              open ? "bg-foreground" : "bg-olive")}>
            {/* + turns 135° into an X, and back */}
            <Plus className={cn("size-7 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]", open && "rotate-[135deg]")} strokeWidth={2.5} />
          </button>
        </div>
      </nav>
    </>
  );
}
