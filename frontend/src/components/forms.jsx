import { useId } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Label above a soft gray field, like the Add expense mockup. */
export function Field({ label, hint, error, className, inputClassName, as = "input", children, ...props }) {
  const id = useId();
  const Tag = as;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-[13px] font-medium text-foreground/80">{label}</label>
      {children && as !== "select" ? children : (
        <Tag id={id} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={cn(
            "w-full rounded-2xl bg-secondary px-4 text-[17px] text-foreground outline-none transition-shadow placeholder:text-foreground/45 focus:ring-2 focus:ring-olive/50 aria-invalid:ring-2 aria-invalid:ring-destructive/60",
            Tag === "textarea" ? "min-h-28 py-3.5" : "h-[52px]",
            inputClassName,
          )}
          {...props}
        >{as === "select" ? children : undefined}</Tag>
      )}
      {(error || hint) && (
        <p id={`${id}-msg`} className={cn("text-[13px]", error ? "text-destructive" : "text-muted-foreground")}>{error || hint}</p>
      )}
    </div>
  );
}

export function PrimaryButton({ busy, children, className, tone = "olive", ...props }) {
  return (
    <button
      className={cn(
        "flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl font-heading text-[17px] font-bold text-white shadow-[0_6px_16px_-8px_rgb(0_0_0/0.35)] transition-[transform,opacity] active:scale-[0.98] disabled:opacity-50",
        tone === "orange" ? "bg-orange" : "bg-olive",
        className,
      )}
      disabled={busy || props.disabled}
      {...props}
    >
      {busy && <Loader2 className="size-5 animate-spin" />}
      {children}
    </button>
  );
}

/** Pill toggle: gray track, filled active pill (olive by default, orange for Bills). */
export function Segmented({ options, value, onChange, tone = "olive", label }) {
  return (
    <div role="tablist" aria-label={label} className="grid auto-cols-fr grid-flow-col rounded-full bg-secondary p-1">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={cn(
            "h-9 rounded-full text-sm font-semibold transition-colors",
            value === o.value ? (tone === "orange" ? "bg-[#f7a948] text-white" : "bg-olive/60 text-white") : "text-foreground/80 hover:text-foreground",
          )}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{children}</p>;
}
