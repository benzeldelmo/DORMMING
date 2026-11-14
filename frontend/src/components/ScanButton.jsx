import { useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { codeFromQr, readQrFromPhoto } from "@/lib/qr";

/**
 * "Scan QR code": opens the phone camera (or the photo picker on a laptop), reads the dorm's QR
 * and hands back its code. A photo, not a live camera view, so it works over plain http on the
 * dorm Wi-Fi, where browsers block live camera access.
 */
export default function ScanButton({ onCode }) {
  const input = useRef(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function read(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // the same photo can be picked again
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const code = codeFromQr(await readQrFromPhoto(file));
      if (code) onCode(code);
      else setError("That photo has no dorm QR code. Try again closer, or type the code.");
    } catch {
      setError("Couldn't read that photo. Try again, or type the code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input ref={input} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={read} />
      <button type="button" onClick={() => input.current?.click()} disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-card font-bold ring-1 ring-input transition-colors hover:bg-secondary disabled:opacity-60">
        <ScanLine aria-hidden className="size-5 text-olive" />{busy ? "Reading…" : "Scan QR code"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
