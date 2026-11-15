import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ExpenseRow, Empty } from "@/components/Rows";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGet, useSend } from "@/lib/queries";
import { formatPesoShort } from "@/lib/money";
import { sharedLine } from "@/lib/people";
import { monthSummary } from "@/lib/spending";

export default function Expenses() {
  const { me, isDesktop } = useOutletContext();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [params, setParams] = useSearchParams();
  // Opened from Home with ?open=<id>: show that expense straight away
  const wanted = params.get("open");
  const send = useSend();
  const { data: expenses = [], isPending } = useGet(`/expenses?q=${encodeURIComponent(q)}`, { placeholderData: (prev) => prev });

  useEffect(() => {
    const found = wanted && expenses.find((e) => e.id === wanted);
    if (found) { setOpen(found); setParams({}, { replace: true }); }
  }, [wanted, expenses]); // eslint-disable-line react-hooks/exhaustive-deps

  async function remove() {
    try {
      await send.mutateAsync({ path: `/expenses/${open.id}`, method: "DELETE" });
      toast.success("Expense deleted");
      setOpen(null);
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="lg:max-w-[760px]">
      <PageHeader title="Expenses" gear />
      <div className="space-y-3 px-5">
        {!q && <MonthSummary expenses={expenses} />}
        <label className="flex h-11 items-center gap-2 rounded-xl bg-secondary px-3">
          <Search className="size-5 text-foreground/50" />
          <span className="sr-only">Search expenses</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search expenses…" className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" />
        </label>
        <div className="space-y-2 pt-1">
          {expenses.map((e) => (
            <ExpenseRow key={e.id} onClick={() => setOpen(e)} title={e.note || e.categoryLabel} category={e.category}
              subtitle={sharedLine(e, me?.id)} amountCentavos={e.amountCentavos} />
          ))}
          {!isPending && !expenses.length && <Empty>{q ? `No expenses match "${q}".` : "No expenses yet. Tap + to add one."}</Empty>}
        </div>
      </div>

      <Sheet open={Boolean(open)} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent side={isDesktop ? "right" : "bottom"} className={isDesktop ? "w-[420px] border-0 px-5 pt-6 sm:max-w-[420px]" : "mx-auto max-w-[640px] rounded-t-3xl border-0 px-5 pb-8"}>
          {open && (
            <>
              <SheetHeader className="px-0">
                <SheetTitle className="font-heading text-2xl font-bold">{open.note || open.categoryLabel}</SheetTitle>
                <SheetDescription>{open.categoryLabel} • {open.date}</SheetDescription>
              </SheetHeader>
              <p className="font-heading text-3xl font-extrabold tabular-nums">{formatPesoShort(open.amountCentavos)}</p>
              {open.shares.length > 0 && (
                <ul className="mt-3 divide-y rounded-2xl bg-secondary px-4">
                  {open.shares.map((s) => (
                    <li key={s.user.id} className="flex justify-between py-2.5 text-[15px]">
                      <span>{s.user.id === me?.id ? "Me" : s.user.displayName}{s.user.id === open.payer.id && <span className="ml-2 text-xs text-olive">paid</span>}</span>
                      <span className="font-semibold tabular-nums">{formatPesoShort(s.amountCentavos)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {open.canEdit ? (
                <button type="button" onClick={remove} disabled={send.isPending}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 font-semibold text-destructive"><Trash2 className="size-4" />Delete</button>
              ) : <p className="mt-4 text-sm text-muted-foreground">Only the person who added this or the dorm creator can delete it.</p>}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Where the dorm's money went this month: the total, then the top categories as bars. */
function MonthSummary({ expenses }) {
  const { total, top } = monthSummary(expenses);
  if (!total) return null;
  return (
    <section aria-label="This month" className="rounded-3xl bg-card p-4 shadow-[var(--shadow-card)]">
      <p className="text-[13px] font-bold tracking-[0.06em] text-muted-foreground uppercase">Spent together this month</p>
      <p className="mt-1 font-heading text-[28px] leading-none font-black tabular-nums">{formatPesoShort(total)}</p>
      <ul className="mt-3 space-y-2">
        {top.map((c) => (
          <li key={c.id} className="text-[14px]">
            <span className="flex justify-between gap-3 font-semibold"><span>{c.label}</span><span className="tabular-nums">{formatPesoShort(c.centavos)}</span></span>
            {top.length > 1 && <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-full bg-olive" style={{ width: `${(c.centavos / total) * 100}%` }} /></span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
