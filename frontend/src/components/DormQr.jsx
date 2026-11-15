import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { copyCode, joinUrl } from "@/lib/qr";

/** A dorm's QR code and its 6-character code. Any phone camera can scan the QR to open the join link. */
export default function DormQr({ code, size = 168 }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-olive-soft p-6 text-center">
      <span className="rounded-2xl bg-white p-3 shadow-sm">
        <QRCodeSVG value={joinUrl(code)} size={size} fgColor="#12160f" level="M" title={`QR code to join with ${code}`} />
      </span>
      <div>
        <p className="text-[13px] font-bold text-olive-ink">Scan to join, or type the code</p>
        <button type="button" onClick={() => copyCode(code, toast)}
          className="mt-1 flex min-h-11 items-center gap-2 rounded-xl px-2 font-heading text-3xl font-extrabold tracking-[0.18em] tabular-nums">
          {code}<Copy className="size-5 text-olive" aria-label="Copy code" />
        </button>
      </div>
    </div>
  );
}
