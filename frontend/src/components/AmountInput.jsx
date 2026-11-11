import { useId } from "react";
import { parsePesos } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Peso amount field. value is the typed text; the parent reads parsePesos(value). */
export default function AmountInput({ label = "Amount", value, onChange, autoFocus, size = "lg" }) {
  const id = useId();
  const invalid = value !== "" && parsePesos(value) === null;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-foreground/80">{label}</label>
      <div className={cn("flex items-center rounded-2xl bg-[#e4e3de] px-5 focus-within:ring-2 focus-within:ring-olive/50", invalid && "ring-2 ring-destructive/60", size === "lg" ? "h-[56px]" : "h-[48px]")}>
        <span className={cn("font-heading font-extrabold text-foreground/70", size === "lg" ? "text-2xl" : "text-lg")}>₱</span>
        <input id={id} inputMode="decimal" autoComplete="off" autoFocus={autoFocus} placeholder="0.00" value={value}
          onChange={(e) => onChange(e.target.value)} aria-invalid={invalid} aria-describedby={invalid ? `${id}-err` : undefined}
          className={cn("w-full bg-transparent pl-1 font-heading font-extrabold tabular-nums outline-none placeholder:text-foreground/30", size === "lg" ? "text-2xl" : "text-lg")} />
      </div>
      {invalid && <p id={`${id}-err`} className="text-[13px] text-destructive">Enter an amount like 150 or 1,000.50</p>}
    </div>
  );
}
