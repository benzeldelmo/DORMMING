import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Segmented } from "@/components/forms";
import { BillRow, Empty, dueLabel } from "@/components/Rows";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGet, useSend } from "@/lib/queries";
import { formatPeso } from "@/lib/money";

const REPEAT = { NONE: "Doesn't repeat", WEEKLY: "Repeats weekly", MONTHLY: "Repeats monthly" };

export default function Bills() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("upcoming");
  const [open, setOpen] = useState(null);
  const { data: bills = [], isPending } = useGet(`/bills?status=${status}`, { placeholderData: (p) => p });
  const send = useSend();

  async function act(path, method, message) {
    try {
      await send.mutateAsync({ path, method });
      toast.success(message);
      setOpen(null);
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div>
      <PageHeader title="Bills" gear />
      <div className="space-y-3 px-5">
        <Segmented label="Bill status" tone="orange" value={status} onChange={setStatus}
          options={[{ value: "paid", label: "Paid" }, { value: "upcoming", label: "Upcoming" }]} />
        <div className="space-y-2 pt-1">
          {bills.map((b) => <BillRow key={b.id} bill={b} onClick={() => setOpen(b)} />)}
          {!isPending && !bills.length && (
            <Empty>{status === "upcoming" ? "No bills due. Enjoy it while it lasts!" : "No paid bills yet."}</Empty>
          )}
        </div>
        <button type="button" onClick={() => navigate("/bills/new")}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-orange/30 font-semibold text-orange hover:bg-cream">
          <Plus className="size-4" />Set bill reminder
        </button>
      </div>

      <Sheet open={Boolean(open)} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent side="bottom" className="mx-auto max-w-[480px] rounded-t-3xl border-0 px-5 pb-8">
          {open && (
            <>
              <SheetHeader className="px-0">
                <SheetTitle className="font-heading text-2xl font-bold">{open.name}</SheetTitle>
                <SheetDescription>{dueLabel(open.dueDate, open.overdue)} • {REPEAT[open.recurrence]}</SheetDescription>
              </SheetHeader>
              <p className="font-heading text-3xl font-extrabold tabular-nums">{formatPeso(open.amountCentavos)}</p>
              <p className="text-sm text-muted-foreground">Each person pays their share to the provider, then marks it paid.</p>
              <ul className="mt-3 divide-y rounded-2xl bg-secondary px-4">
                {open.shares.map((s) => (
                  <li key={s.user.id} className="flex items-center justify-between py-2.5 text-[15px]">
                    <span className="flex items-center gap-2">
                      {s.paid ? <Check className="size-4 text-olive" strokeWidth={3} /> : <span className="size-4 rounded-full border-2 border-orange/60" />}
                      {s.user.displayName}
                    </span>
                    <span className="font-semibold tabular-nums">{formatPeso(s.amountCentavos)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex gap-3">
                {open.myShareCentavos != null && !open.mySharePaid && (
                  <button type="button" disabled={send.isPending} onClick={() => act(`/bills/${open.id}/pay`, "POST", "Marked your share as paid")}
                    className="h-12 flex-1 rounded-2xl bg-orange font-heading font-bold text-white">I paid my share ({formatPeso(open.myShareCentavos)})</button>
                )}
                {open.canEdit && (
                  <button type="button" aria-label="Delete bill" disabled={send.isPending} onClick={() => act(`/bills/${open.id}`, "DELETE", "Bill deleted")}
                    className="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive"><Trash2 className="size-5" /></button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
