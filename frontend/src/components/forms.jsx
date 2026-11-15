import { useId, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
            "w-full rounded-2xl bg-card px-4 ring-1 ring-border text-[17px] text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20 aria-invalid:ring-2 aria-invalid:ring-destructive/60",
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
        "flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl font-heading text-[17px] font-bold text-white shadow-[0_6px_16px_-8px_rgb(0_0_0/0.35)] transition-[transform,opacity,background-color] active:scale-[0.98] disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none",
        tone === "orange" ? "bg-orange enabled:hover:bg-orange-ink" : "bg-olive enabled:hover:bg-olive-ink",
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

/** Pill toggle: gray track, filled active pill (olive by default, or orange). */
export function Segmented({ options, value, onChange, tone = "olive", label }) {
  return (
    <div role="tablist" aria-label={label} className="grid auto-cols-fr grid-flow-col rounded-full bg-secondary p-1">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={cn(
            "h-9 rounded-full text-sm font-semibold transition-colors",
            value === o.value ? (tone === "orange" ? "bg-[#f7a948] text-brown shadow-sm" : "bg-olive text-white shadow-sm") : "text-foreground/80 hover:text-foreground",
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

/** An on/off switch, olive when on (Settings, Repeats every month). */
export function Switch({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={cn("relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors", on ? "bg-olive" : "bg-secondary ring-1 ring-border")}>
      <span className={cn("absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow transition-transform", on && "translate-x-5")} />
    </button>
  );
}

/** A password field with an eye button to show or hide what you typed. Hidden dots are drawn smaller than letters. */
export function PasswordField({ label = "Password", hint, ...props }) {
  const id = useId();
  const [shown, setShown] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-foreground/80">{label}</label>
      <div className="relative">
        <input id={id} type={shown ? "text" : "password"} aria-describedby={hint ? `${id}-msg` : undefined}
          className={cn("h-[52px] w-full rounded-2xl bg-card pr-14 pl-4 text-foreground ring-1 ring-border outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20",
            shown || !props.value ? "text-[17px]" : "text-[13px] tracking-[0.25em]")}
          {...props} />
        <button type="button" onClick={() => setShown(!shown)} aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown}
          className="absolute top-1/2 right-1.5 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground hover:text-foreground">
          {shown ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
        </button>
      </div>
      {hint && <p id={`${id}-msg`} className="text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
