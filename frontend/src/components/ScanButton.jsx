import { lazy, Suspense, useState } from "react";
import { ScanLine } from "lucide-react";
// The camera scanner (and its QR reader) loads the first time someone taps Scan
const QrScanner = lazy(() => import("./QrScanner"));

/** "Scan QR code": opens DormMing's own camera scanner and hands back the dorm code it reads. */
export default function ScanButton({ onCode, label = "Scan QR code" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-card font-bold ring-1 ring-input transition-colors hover:bg-secondary">
        <ScanLine aria-hidden className="size-5 text-olive" />{label}
      </button>
      {open && <Suspense fallback={null}><QrScanner onClose={() => setOpen(false)} onCode={(code) => { setOpen(false); onCode(code); }} /></Suspense>}
    </>
  );
}
