import { formatPeso } from "@/lib/money";

const STAMP = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Line({ left, right, strong }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? "font-bold" : ""}`}>
      <span className="min-w-0 break-words">{left}</span>
      <span className="shrink-0 tabular-nums">{right}</span>
    </div>
  );
}

const Rule = () => <div aria-hidden className="my-2.5 border-t-2 border-dashed border-brown/25" />;

/** The receipt preview: items, extras, total, then each person's share. */
export default function ThermalReceipt({ title, dormName, items, extras, total, shares, nameOf, payerName }) {
  return (
    <figure aria-label="Receipt preview" className="receipt-paper px-6 py-8 font-mono text-[13px] leading-relaxed text-brown drop-shadow-[0_8px_14px_rgb(36_7_2/0.12)]">
      <div className="text-center">
        <p className="font-heading text-lg font-extrabold tracking-[0.25em]">DORMMING</p>
        <p className="uppercase">{dormName}</p>
        <p className="text-brown/70">{STAMP.format(new Date())}</p>
        {title && <p className="mt-1 font-bold uppercase">{title}</p>}
      </div>
      <Rule />
      {items.length ? items.map((item, i) => (
        <div key={i} className="mb-1">
          <Line left={item.name || "Item"} right={formatPeso(item.priceCentavos || 0)} />
          <p className="text-[11px] text-brown/60">{item.sharerIds.length ? item.sharerIds.map(nameOf).join(", ") : "nobody yet"}</p>
        </div>
      )) : <p className="text-center text-brown/60">No items yet</p>}
      <Rule />
      <Line left="SUBTOTAL" right={formatPeso(items.reduce((s, i) => s + (i.priceCentavos || 0), 0))} />
      <Line left="EXTRAS" right={formatPeso(extras)} />
      <Line left="TOTAL" right={formatPeso(total)} strong />
      <Rule />
      <p className="mb-1 font-bold">SHARES</p>
      {Object.entries(shares).filter(([, v]) => v !== 0).map(([id, v]) => <Line key={id} left={nameOf(id)} right={formatPeso(v)} />)}
      <Rule />
      <p className="text-center">PAID BY {payerName.toUpperCase()}</p>
      <p className="mt-2 text-center text-brown/70">Thank you, dormmates! — Ming</p>
    </figure>
  );
}
