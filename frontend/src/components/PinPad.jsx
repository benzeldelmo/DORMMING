import { useState } from "react";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

/**
 * A 4-digit PIN keypad on the green cutting mat: a title, four dots and the keys.
 * Calls onComplete(pin) once four digits are in, then clears itself.
 */
export default function PinPad({ title, hint, error, onComplete, disabled = false, children }) {
  const [pin, setPin] = useState("");

  function press(k) {
    if (k === "del") return setPin((p) => p.slice(0, -1));
    const next = (pin + k).slice(0, 4);
    if (next.length < 4) return setPin(next);
    setPin("");
    onComplete(next);
  }

  return (
    <div className="pin-ground cutting-mat fixed inset-0 z-[90] flex flex-col items-center justify-center gap-8 px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-white">
      <img src="/brand/app-icon.png" alt="" className="size-20 rounded-[22px] shadow-lg" />
      <div className="text-center">
        <p className="font-heading text-[22px] font-extrabold">{title}</p>
        <p role="alert" className="mt-1 h-5 text-[14px] text-white/85">{error || hint}</p>
      </div>
      <div className={cn("flex gap-4", error && "pin-shake")} aria-label={`${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => <span key={i} className={cn("size-4 rounded-full ring-2 ring-white transition-colors", i < pin.length && "bg-white")} />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {KEYS.map((k, i) => k === "" ? <span key={i} /> : (
          <button key={i} type="button" disabled={disabled} onClick={() => press(k)} aria-label={k === "del" ? "Delete" : k}
            className="grid size-[72px] place-items-center rounded-full bg-white/15 font-heading text-[28px] font-bold backdrop-blur transition-[background-color,opacity] active:bg-white/30 disabled:opacity-40">
            {k === "del" ? <Delete className="size-6" /> : k}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
