import { useEffect, useState } from "react";
import PinPad from "./PinPad";
import { checkPasscode, clearPasscode, markUnlocked, pinWaitLeft, recordWrongPin, resetPinTries } from "@/lib/passcode";
import { logOut } from "@/lib/auth";

const leave = () => { logOut(); clearPasscode(); location.assign("/login"); };
const seconds = (ms) => {
  const s = Math.ceil(ms / 1000);
  return s >= 60 ? `${Math.ceil(s / 60)} min` : `${s} s`;
};

/**
 * Enter your PIN to open DormMing. After 4 wrong tries each miss makes you wait longer (30 s, 1 min, 2 min…),
 * and the 10th wrong PIN logs you out. Forgot it? Log out and log back in.
 */
export default function LockScreen({ onUnlock }) {
  const [wrong, setWrong] = useState(0);
  const [wait, setWait] = useState(pinWaitLeft);

  // Count the wait down once a second while the pad is locked
  useEffect(() => {
    if (!wait) return;
    const t = setInterval(() => setWait(pinWaitLeft()), 1000);
    return () => clearInterval(t);
  }, [wait > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  async function check(pin) {
    if (pinWaitLeft()) return;
    if (await checkPasscode(pin)) { resetPinTries(); markUnlocked(); onUnlock(); return; }
    const next = recordWrongPin();
    if (next.logOut) return leave();
    setWait(next.waitMs);
    setWrong((w) => w + 1);
  }

  const error = wait ? `Too many tries. Try again in ${seconds(wait)}.` : wrong ? "Wrong PIN. Try again." : "";
  return (
    <PinPad title="Enter your PIN" hint="To open DormMing" error={error} disabled={wait > 0} onComplete={check} key={wrong}>
      <button type="button" onClick={leave} className="h-11 px-4 text-[15px] font-semibold text-white/90 underline underline-offset-4">Forgot PIN? Log out</button>
    </PinPad>
  );
}
