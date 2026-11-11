import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Chips for dorm members; selected ones are olive. */
export default function PersonPicker({ members, selected, onChange, meId, label = "Who shares it?" }) {
  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  return (
    <fieldset className="min-w-0 space-y-1.5">
      <legend className="mb-1.5 text-[13px] font-medium text-foreground/80">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {members.map(({ user }) => {
          const on = selected.includes(user.id);
          return (
            <button key={user.id} type="button" aria-pressed={on} onClick={() => toggle(user.id)}
              className={cn("flex h-10 items-center gap-2 rounded-full pr-4 pl-1.5 text-sm font-semibold transition-colors",
                on ? "bg-olive text-white" : "bg-secondary text-foreground/80 hover:bg-secondary/70")}>
              <span className={cn("grid size-7 place-items-center rounded-full text-xs", on ? "bg-white/25" : "bg-white")}>
                {on ? <Check className="size-4" strokeWidth={3} /> : user.initials}
              </span>
              {user.id === meId ? "Me" : user.displayName}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
