import { useMemo, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import AmountInput from "@/components/AmountInput";
import ThermalReceipt from "@/components/ThermalReceipt";
import { Field, FormError, PrimaryButton } from "@/components/forms";
import { useGet, useSend } from "@/lib/queries";
import { centavosToInput, formatPeso, parsePesos } from "@/lib/money";
import { splitReceipt } from "@/lib/receipt";
import { todayIso } from "@/lib/dates";
import { cn } from "@/lib/utils";

const blank = () => ({ name: "", price: "", sharerIds: [] });

/** "-50" means a ₱50 discount. Empty means no extras. */
function parseExtras(text) {
  const t = text.trim();
  if (!t) return 0;
  const negative = t.startsWith("-");
  const value = parsePesos(negative ? t.slice(1) : t);
  return value == null ? null : negative ? -value : value;
}

export default function Receipt() {
  const navigate = useNavigate();
  const { me } = useOutletContext();
  const editing = useLocation().state?.expense ?? null;
  const dorm = useGet("/dorms/current", { refetchInterval: false });
  const members = dorm.data?.members ?? [];
  const send = useSend();

  const [title, setTitle] = useState(editing?.note ?? "");
  const [payer, setPayer] = useState(editing?.payer?.id ?? me?.id);
  const [items, setItems] = useState(editing?.items?.length
    ? editing.items.map((i) => ({ name: i.name, price: centavosToInput(i.priceCentavos), sharerIds: i.sharers.map((s) => s.id) }))
    : [blank()]);
  const [extras, setExtras] = useState(editing?.extrasCentavos ? String(editing.extrasCentavos / 100) : "");
  const [total, setTotal] = useState(editing ? centavosToInput(editing.amountCentavos) : "");

  const ids = members.map((m) => m.user.id);
  const nameOf = (id) => (id === me?.id ? "Me" : members.find((m) => m.user.id === id)?.user.displayName ?? "?");
  const parsedItems = items.map((i) => ({ name: i.name.trim(), priceCentavos: parsePesos(i.price) ?? 0, sharerIds: i.sharerIds }));
  const extrasCentavos = parseExtras(extras);
  const totalCentavos = parsePesos(total);
  const preview = useMemo(() => splitReceipt(parsedItems, extrasCentavos ?? 0, ids, payer), [JSON.stringify(parsedItems), extrasCentavos, ids.join(), payer]);
  const expected = preview.itemsSum + (extrasCentavos ?? 0);
  const matches = totalCentavos === expected;
  const itemsOk = parsedItems.every((i) => i.name && i.priceCentavos > 0 && i.sharerIds.length);

  const update = (index, patch) => setItems(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  const toggle = (index, id) => {
    const s = items[index].sharerIds;
    update(index, { sharerIds: s.includes(id) ? s.filter((x) => x !== id) : [...s, id] });
  };

  async function save(e) {
    e.preventDefault();
    const participantIds = ids.filter((id) => parsedItems.some((i) => i.sharerIds.includes(id)));
    const body = {
      amountCentavos: totalCentavos, category: "FOOD_GROCERIES", note: title, date: todayIso(), payerId: payer, participantIds,
      split: { type: "ITEMIZED", items: parsedItems.map(({ name, priceCentavos, sharerIds }) => ({ name, priceCentavos, sharerIds })), extrasCentavos },
    };
    try {
      await send.mutateAsync(editing ? { path: `/expenses/shared/${editing.id}`, method: "PUT", body } : { path: "/expenses/shared", body });
      toast.success("Receipt split saved");
      navigate("/expenses");
    } catch {
      /* shown below */
    }
  }

  return (
    <div>
      <PageHeader title="Split a receipt" back />
      <div className="px-5 lg:flex lg:items-start lg:gap-8">
      <form onSubmit={save} className="min-w-0 flex-1 space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Field label="What's it for?" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Samgyup night" maxLength={60} />
          <Field label="Who paid?" as="select" value={payer} onChange={(e) => setPayer(e.target.value)}>
            {members.map(({ user }) => <option key={user.id} value={user.id}>{nameOf(user.id)}</option>)}
          </Field>
        </div>

        <fieldset className="min-w-0 space-y-3">
          <legend className="mb-2 font-heading text-[17px] font-bold">Items</legend>
          {items.map((item, index) => (
            <div key={index} className="space-y-2.5 rounded-[20px] bg-secondary p-3">
              <div className="flex gap-2">
                <input aria-label={`Item ${index + 1} name`} value={item.name} onChange={(e) => update(index, { name: e.target.value })} placeholder="Item name"
                  className="h-11 min-w-0 flex-1 rounded-xl bg-card px-3 text-[15px] outline-none focus:ring-2 focus:ring-olive/50" />
                <label className="flex h-11 w-28 items-center rounded-xl bg-card px-3 focus-within:ring-2 focus-within:ring-olive/50">
                  <span className="font-semibold text-foreground/60">₱</span>
                  <span className="sr-only">Item {index + 1} price</span>
                  <input inputMode="decimal" value={item.price} onChange={(e) => update(index, { price: e.target.value })} placeholder="0.00"
                    className={cn("w-full bg-transparent pl-1 text-right font-semibold tabular-nums outline-none", item.price && parsePesos(item.price) == null && "text-destructive")} />
                </label>
                {items.length > 1 && (
                  <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} aria-label={`Remove item ${index + 1}`}
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-foreground/50 hover:bg-card hover:text-destructive"><Trash2 className="size-4" /></button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={`Who had item ${index + 1}`}>
                {members.map(({ user }) => {
                  const on = item.sharerIds.includes(user.id);
                  return (
                    <button key={user.id} type="button" aria-pressed={on} onClick={() => toggle(index, user.id)}
                      className={cn("h-8 rounded-full px-3 text-xs font-semibold transition-colors", on ? "bg-olive text-white" : "bg-card text-foreground/70")}>
                      {nameOf(user.id)}
                    </button>
                  );
                })}
                <button type="button" onClick={() => update(index, { sharerIds: item.sharerIds.length === ids.length ? [] : ids })}
                  className="ml-auto text-xs font-semibold text-olive">{item.sharerIds.length === ids.length ? "Clear" : "Everyone"}</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setItems([...items, blank()])}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-olive/30 font-semibold text-olive hover:bg-olive-soft/50">
            <Plus className="size-4" />Add item
          </button>
        </fieldset>

        <Field label="Extras (tax, service, tip; minus for discount)" value={extras} onChange={(e) => setExtras(e.target.value)} inputMode="decimal"
          placeholder="0.00" error={extrasCentavos == null ? "Enter an amount like 50 or -20" : ""} />
        <AmountInput label="Receipt total" value={total} onChange={setTotal} size="sm" />
        {totalCentavos != null && extrasCentavos != null && !matches && (
          <p role="status" className="flex items-center justify-between gap-3 rounded-xl bg-orange-soft px-4 py-3 text-sm text-[#8a4210] dark:text-[#f0b483]">
            Items + extras must equal the total ({formatPeso(expected)}).
            <button type="button" onClick={() => setTotal(centavosToInput(expected))} className="shrink-0 font-semibold underline underline-offset-2">Use {formatPeso(expected)}</button>
          </p>
        )}


        <div className="lg:hidden"><ThermalReceipt title={title} dormName={dorm.data?.name ?? ""} items={parsedItems} extras={extrasCentavos ?? 0}
          total={totalCentavos ?? expected} shares={preview.shares} nameOf={nameOf} payerName={nameOf(payer)} /></div>

        <FormError>{send.error?.message}</FormError>
        <PrimaryButton type="submit" busy={send.isPending} disabled={!matches || !itemsOk || extrasCentavos == null}>Save split</PrimaryButton>
      </form>
      <aside className="hidden lg:sticky lg:top-8 lg:block lg:w-[380px] lg:shrink-0">
        <ThermalReceipt title={title} dormName={dorm.data?.name ?? ""} items={parsedItems} extras={extrasCentavos ?? 0}
          total={totalCentavos ?? expected} shares={preview.shares} nameOf={nameOf} payerName={nameOf(payer)} />
      </aside>
      </div>
    </div>
  );
}
