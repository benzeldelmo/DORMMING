import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Delete } from "lucide-react";
import RollingNumber from "./RollingNumber";
import { evaluate, pressCalc, toCentavos } from "@/lib/calc";
import { formatPesoShort } from "@/lib/money";
import { cn } from "@/lib/utils";

// A phone-style number pad: 1-2-3 on top, + − × ÷ beside the digits, and delete, clear and Done in the
// far-right column, under the thumb.
const KEYS = ["1", "2", "3", "÷", "del", "4", "5", "6", "×", "AC", "7", "8", "9", "−", "done", "00", "0", ".", "+"];
const NAMES = { del: "Delete", AC: "Clear", done: "Done", ".": "Decimal point", "÷": "Divide", "×": "Times", "−": "Minus", "+": "Plus" };
const touch = () => typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
// Typed on a laptop keyboard: * / - become × ÷ − (a quick sum still works there)
const fromKeyboard = (text) => text.replaceAll("*", "×").replaceAll("/", "÷").replaceAll("-", "−").replace(/[^\d.+−×÷%]/g, "");
/** "12500.5" → "12,500.5": commas in the whole pesos, the centavos as typed. */
const withCommas = (text) => text.replace(/^\d+/, (whole) => Number(whole).toLocaleString("en-US"));

/**
 * The amount, big and centered. On a phone, tapping it opens DormMing's own number pad (no system
 * keyboard); with autoOpen it opens by itself, since the amount is the first thing to fill in.
 * On a laptop you type. The form reads the value with toCentavos(value).
 */
export default function AmountInput({ label = "Amount", value, onChange, hint = "Tap to enter it. You can add or divide, like 1200 ÷ 3.", autoOpen = false, note }) {
  const id = useId();
  const phone = touch();
  const [pad, setPad] = useState(() => phone && autoOpen && !value);
  const sum = /[+−×÷%]/.test(value) ? evaluate(value) : null;
  const big = "font-heading text-[44px] leading-tight font-black tracking-tight tabular-nums";

  return (
    <div className="text-center">
      <label htmlFor={id} className="block text-[13px] font-semibold text-muted-foreground">{label}</label>
      <div className="mt-1 flex items-baseline justify-center gap-1">
        <span className="font-heading text-[24px] font-extrabold text-foreground/40">₱</span>
        {phone ? (
          // Phone: the amount is a button that opens our pad. No focus or system keyboard involved,
          // so iOS can't close the pad by blurring a field when a key is tapped.
          <button id={id} type="button" data-amount onClick={() => setPad(true)} aria-expanded={pad}
            className={cn(big, "max-w-full min-w-[1ch] rounded-2xl px-2 break-all", !value && "text-foreground/35",
              pad && "bg-olive-soft/60 after:ml-0.5 after:inline-block after:h-[0.75em] after:w-[3px] after:animate-pulse after:rounded-full after:bg-olive")}>
            {value ? <RollingNumber>{withCommas(value)}</RollingNumber> : "0"}
          </button>
        ) : (
          <input id={id} autoComplete="off" placeholder="0" value={value} inputMode="decimal"
            onChange={(e) => onChange(fromKeyboard(e.target.value))}
            style={{ width: `${Math.max(1.2, value.length * 0.6 + 0.3)}em` }}
            className={cn(big, "max-w-full min-w-0 bg-transparent text-center caret-olive outline-none placeholder:text-foreground/35")} />
        )}
      </div>
      <p className="mt-1 h-5 text-[14px] font-medium text-muted-foreground tabular-nums">
        {sum !== null ? `= ${toCentavos(value) ? formatPesoShort(toCentavos(value)) : "₱0.00"}` : value ? note : hint}
      </p>
      {pad && createPortal(<NumberPad onKey={(k) => onChange(pressCalc(value, k))} onDone={() => { onChange(pressCalc(value, "=")); setPad(false); }} />, document.body)}
    </div>
  );
}

/** The number pad, docked above the form's button. Done works out any sum and closes it; so does a tap outside it. */
function NumberPad({ onKey, onDone }) {
  const box = useRef(null);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const outside = (e) => {
      if (box.current?.contains(e.target) || e.target.closest?.("[data-amount]")) return;
      done.current();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return (
    <div ref={box} role="group" aria-label="Number pad"
      className="keypad-in fixed inset-x-2 bottom-[calc(64px+max(0.75rem,env(safe-area-inset-bottom)))] z-[55] touch-manipulation rounded-3xl bg-card p-2.5 shadow-[0_-16px_40px_-16px_rgb(18_22_15/0.35)] ring-1 ring-border select-none">
      <div className="grid grid-cols-5 grid-rows-4 gap-1.5">
        {KEYS.map((k) => (
          <button key={k} type="button" onClick={() => (k === "done" ? onDone() : onKey(k))} aria-label={NAMES[k] ?? k}
            className={cn("grid h-[54px] place-items-center rounded-2xl font-heading text-[22px] font-bold transition-[filter,transform] duration-100 active:scale-[0.95] active:brightness-95",
              k === "done" ? "row-span-2 h-auto bg-olive text-[16px] text-white" : k === "del" || k === "AC" ? "bg-[#fdeceb] text-[#c2321f]" : "÷×−+".includes(k) ? "bg-olive-soft text-olive-ink" : "bg-background")}>
            {k === "del" ? <Delete aria-hidden className="size-6" /> : k === "done" ? "Done" : k}
          </button>
        ))}
      </div>
    </div>
  );
}
