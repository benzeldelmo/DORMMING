import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatPeso } from "@/lib/money";
import { cn } from "@/lib/utils";

const THEMES = {
  OLIVE: { face: "bg-olive text-white", soft: "text-white/75", qr: "#240702" },
  ORANGE: { face: "bg-orange text-white", soft: "text-white/80", qr: "#240702" },
  YELLOW: { face: "bg-sun text-brown", soft: "text-brown/70", qr: "#240702" },
};

function Chip() {
  return (
    <svg viewBox="0 0 44 32" className="h-8 w-11" aria-hidden>
      <rect x="0.5" y="0.5" width="43" height="31" rx="6" fill="#e9c46a" stroke="#b8902e" />
      <path d="M0 11h14M0 21h14M30 11h14M30 21h14M14 0v32M30 0v32M14 16h16" stroke="#b8902e" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

/** A simulated bank-style card. Tap or press Enter to flip and show the friend QR. */
export default function DigitalCard({ card }) {
  const [flipped, setFlipped] = useState(false);
  const t = THEMES[card.cardColor] ?? THEMES.OLIVE;
  const net = card.netCentavos;
  return (
    <div className="card-3d">
      <button type="button" onClick={() => setFlipped(!flipped)} aria-pressed={flipped}
        aria-label={flipped ? "Card back with your friend QR. Press to flip back." : "Your DormMing card. Press to show your friend QR."}
        className="card-inner relative block aspect-[85.6/54] w-full rounded-[22px] text-left outline-offset-4" data-flipped={flipped}>
        <span className={cn("card-face card-front absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[22px] p-5 shadow-[0_18px_40px_-18px_rgb(36_7_2/0.55)]", t.face)}>
          <img src="/brand/ming-mascot.png" alt="" aria-hidden className="pixelated pointer-events-none absolute -right-4 -bottom-14 size-40 opacity-15" />
          <span className="flex items-start justify-between">
            <img src="/brand/dormming-logo.png" alt="DormMing" className="h-7 w-auto" />
            <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider", card.cardColor === "YELLOW" ? "border-brown/30" : "border-white/40")}>SIMULATED</span>
          </span>
          <Chip />
          <span className="font-heading text-lg font-semibold tracking-[0.12em] tabular-nums">{card.maskedNumber}</span>
          <span className="flex items-end justify-between">
            <span>
              <span className="block font-heading text-[15px] font-bold leading-tight">{card.displayName}</span>
              <span className={cn("block text-[11px]", t.soft)}>{card.dormName}</span>
            </span>
            <span className="text-right">
              <span className={cn("block text-[10px] font-semibold tracking-wider", t.soft)}>BALANCE</span>
              <span className="block font-heading text-lg font-extrabold tabular-nums">{net > 0 ? "+" : ""}{formatPeso(net)}</span>
            </span>
          </span>
        </span>
        <span className={cn("card-face card-back absolute inset-0 flex items-center gap-4 rounded-[22px] p-5 shadow-[0_18px_40px_-18px_rgb(36_7_2/0.55)]", t.face)}>
          <span className="rounded-xl bg-white p-2.5"><QRCodeSVG value={card.qrPayload} size={112} fgColor={t.qr} /></span>
          <span>
            <span className="block font-heading text-lg font-bold leading-tight">Scan to be friends</span>
            <span className={cn("mt-1 block text-xs", t.soft)}>Or type my code</span>
            <span className="mt-1 block font-heading text-xl font-extrabold tracking-[0.15em]">{card.friendCode}</span>
            <span className={cn("mt-2 block text-[10px]", t.soft)}>Not a real card. No real money moves.</span>
          </span>
        </span>
      </button>
    </div>
  );
}
