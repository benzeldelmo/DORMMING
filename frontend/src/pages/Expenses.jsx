import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ExpenseRow, Empty } from "@/components/Rows";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGet, useSend } from "@/lib/queries";
import { formatPeso } from "@/lib/money";
import { sharedLine } from "@/lib/people";

export default function Expenses() {
  const { me, isDesktop } = useOutletContext();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const send = useSend();
  const { data: expenses = [], isPending } = useGet(`/expenses?q=${encodeURIComponent(q)}`, { placeholderData: (prev) => prev });

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
    <div>
      <PageHeader title="Expenses" gear />
      <div className="space-y-3 px-5">
        <label className="flex h-11 items-center gap-2 rounded-xl bg-secondary px-3">
          <Search className="size-5 text-foreground/50" />
          <span className="sr-only">Search expenses</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search expenses…" className="w-full bg-transparent text-[15px] outline-none placeholder:text-foreground/45" />
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
              <p className="font-heading text-3xl font-extrabold tabular-nums">{formatPeso(open.amountCentavos)}</p>
              {open.shares.length > 0 && (
                <ul className="mt-3 divide-y rounded-2xl bg-secondary px-4">
                  {open.shares.map((s) => (
                    <li key={s.user.id} className="flex justify-between py-2.5 text-[15px]">
                      <span>{s.user.id === me?.id ? "Me" : s.user.displayName}{s.user.id === open.payer.id && <span className="ml-2 text-xs text-olive">paid</span>}</span>
                      <span className="font-semibold tabular-nums">{formatPeso(s.amountCentavos)}</span>
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
