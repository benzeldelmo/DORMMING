import { useState } from "react";
import PinPad from "./PinPad";
import { markUnlocked, setPasscode } from "@/lib/passcode";

/** Set a new PIN: type it, then type it again. Mismatch starts over. */
export default function PinSetup({ onDone, onCancel }) {
  const [first, setFirst] = useState(null);
  const [error, setError] = useState("");
  async function enter(pin) {
    if (first === null) { setFirst(pin); setError(""); return; }
    if (pin !== first) { setFirst(null); setError("The PINs didn't match. Start again."); return; }
    await setPasscode(pin);
    markUnlocked();
    onDone();
  }
  return (
    <PinPad key={first === null ? `new${error}` : "again"} title={first === null ? "Create a PIN" : "Enter it again"}
      hint={first === null ? "4 digits to open DormMing on this phone" : "To make sure"} error={error} onComplete={enter}>
      <button type="button" onClick={onCancel} className="h-11 px-4 text-[15px] font-semibold text-white/90 underline underline-offset-4">Cancel</button>
    </PinPad>
  );
}
