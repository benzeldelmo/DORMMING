import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { ImageUp, X } from "lucide-react";
import { codeFromQr, readQrFromPhoto } from "@/lib/qr";

/**
 * Full-screen QR scanner with the live camera: a framed window with a sweeping green line.
 * Reads frames until it finds a dorm code. Without camera access (denied, or a browser that
 * blocks it), it falls back to picking a photo of the code.
 */
export default function QrScanner({ onCode, onClose }) {
  const video = useRef(null);
  const file = useRef(null);
  const [status, setStatus] = useState("starting"); // starting | scanning | nocamera
  const [hint, setHint] = useState("Point the camera at your dorm's QR code");
  // The latest callback, read inside the frame loop, so the camera starts once and never restarts on a re-render
  const found = useRef(onCode);
  found.current = onCode;

  useEffect(() => {
    let stream;
    let frame;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    function tick() {
      const v = video.current;
      if (stopped || !v) return;
      if (v.readyState >= 2) {
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        ctx.drawImage(v, 0, 0);
        const qr = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, { inversionAttempts: "dontInvert" });
        const code = qr && codeFromQr(qr.data);
        if (code) { stopped = true; navigator.vibrate?.(40); found.current(code); return; }
        if (qr) setHint("That's not a dorm code. Try your dorm's QR.");
      }
      frame = requestAnimationFrame(tick);
    }

    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((s) => {
        stream = s;
        if (stopped) return s.getTracks().forEach((t) => t.stop());
        video.current.srcObject = s;
        video.current.play();
        setStatus("scanning");
        frame = requestAnimationFrame(tick);
      })
      .catch(() => setStatus("nocamera"));
    if (!navigator.mediaDevices) setStatus("nocamera");

    return () => { stopped = true; cancelAnimationFrame(frame); stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  async function fromPhoto(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const code = codeFromQr(await readQrFromPhoto(f).catch(() => null));
    if (code) onCode(code);
    else setHint("No dorm QR in that photo. Try another.");
  }

  return (
    <div role="dialog" aria-label="Scan a dorm QR code" className="fixed inset-0 z-[80] flex flex-col bg-black text-white">
      <video ref={video} playsInline muted className="absolute inset-0 size-full object-cover" />
      <div className="relative flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <p className="font-heading text-[19px] font-extrabold">Scan QR</p>
        <button type="button" onClick={onClose} aria-label="Close scanner" className="grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur"><X className="size-6" /></button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-8">
        {/* The window: dark around it, four green corners, and the sweeping line inside */}
        <div className="relative aspect-square w-full max-w-[260px] rounded-3xl shadow-[0_0_0_100vmax_rgb(0_0_0/0.55)]" style={{ "--sweep": "236px" }}>
          {/* Four rounded corner marks, drawn as one stroke each */}
          <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible fill-none stroke-[#7ed27a]" strokeWidth="3" strokeLinecap="round">
            <path d="M2 18V12A10 10 0 0 1 12 2H18" /><path d="M82 2H88A10 10 0 0 1 98 12V18" />
            <path d="M98 82V88A10 10 0 0 1 88 98H82" /><path d="M18 98H12A10 10 0 0 1 2 88V82" />
          </svg>
          {status === "scanning" && <span aria-hidden className="scan-line absolute inset-x-3 top-3 h-0.5 rounded-full bg-[#7ed27a] shadow-[0_0_14px_3px_rgb(126_210_122/0.7)]" />}
          {status === "nocamera" && <p className="absolute inset-0 grid place-items-center p-6 text-center text-[15px] text-white/90">Camera isn't available here. Choose a photo of the QR instead.</p>}
        </div>
        <p role="status" className="max-w-[28ch] text-center text-[15px] font-semibold">{status === "starting" ? "Starting the camera…" : hint}</p>
      </div>

      <div className="relative px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <input ref={file} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={fromPhoto} />
        <button type="button" onClick={() => file.current?.click()} className="mx-auto flex h-12 items-center gap-2 rounded-full bg-white/15 px-5 font-bold backdrop-blur">
          <ImageUp aria-hidden className="size-5" />Choose a photo
        </button>
      </div>
    </div>
  );
}
