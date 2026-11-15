import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, Check, Repeat } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import Sentences from "@/components/Sentences";
import { Empty } from "@/components/Rows";
import { useGet, useSend } from "@/lib/queries";
import { api } from "@/lib/api";
import { formatPesoShort } from "@/lib/money";
import { daysUntil, dueLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { getRemindDays } from "@/lib/prefs";

/** Your payment reminders, soonest first. Only you see them. */
export default function Bills() {
  const { data: bills = [], isPending } = useGet("/bills");
  const send = useSend();
  // Mark paid waits 5 seconds before it's saved, so Undo can take it back. Leaving the page saves it now.
  const [pending, setPending] = useState([]);
  const timers = useRef(new Map());

  const save = async (bill) => {
    timers.current.delete(bill.id);
    try {
      await send.mutateAsync({ path: `/bills/${bill.id}/paid` });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPending((ids) => ids.filter((id) => id !== bill.id));
    }
  };

  function paid(bill) {
    setPending((ids) => [...ids, bill.id]);
    timers.current.set(bill.id, { bill, timer: setTimeout(() => save(bill), 5000) });
    toast.success(<Sentences>{bill.monthly ? `${bill.name} paid. See you next month.` : `${bill.name} paid.`}</Sentences>, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          clearTimeout(timers.current.get(bill.id)?.timer);
          timers.current.delete(bill.id);
          setPending((ids) => ids.filter((id) => id !== bill.id));
        },
      },
    });
  }

  useEffect(() => () => timers.current.forEach(({ bill, timer }) => { clearTimeout(timer); save(bill); }), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Closing the app or switching away within the 5 seconds: save what's waiting now, so a paid bill is never lost
  useEffect(() => {
    const flush = (e) => {
      if (e.type === "visibilitychange" && document.visibilityState !== "hidden") return;
      if (!timers.current.size) return;
      timers.current.forEach(({ bill, timer }) => {
        clearTimeout(timer);
        api(`/bills/${bill.id}/paid`, { method: "POST", keepalive: true }).catch(() => {});
      });
      timers.current.clear();
      setPending([]); // the next refresh shows each bill's new due date (or that it's gone)
    };
    document.addEventListener("visibilitychange", flush);
    addEventListener("pagehide", flush);
    return () => { document.removeEventListener("visibilitychange", flush); removeEventListener("pagehide", flush); };
  }, []);

  return (
    <div className="lg:max-w-[760px]">
      <PageHeader title="Bills" gear />
      <div className="space-y-2.5 px-5">
        {bills.filter((b) => !pending.includes(b.id)).map((b) => {
          const days = daysUntil(b.dueDate);
          const urgent = days <= getRemindDays();
          return (
            <div key={b.id} className={cn("flex items-center gap-3 rounded-2xl p-3 pl-4", urgent ? "bg-orange-soft" : "bg-card shadow-[var(--shadow-card)]")}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", urgent ? "bg-orange text-white" : "bg-olive-soft text-olive-ink")}><BellRing aria-hidden className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[16px] font-bold text-pretty">{b.name}{b.monthly && <Repeat aria-label="Repeats monthly" className="size-3.5 shrink-0 text-muted-foreground" />}</p>
                <p className={cn("text-[13px] font-semibold", urgent ? "text-orange-ink" : "text-muted-foreground")}>{dueLabel(b.dueDate)} · {formatPesoShort(b.amountCentavos)}</p>
              </div>
              <button type="button" onClick={() => paid(b)} disabled={send.isPending}
                className={cn("flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-bold disabled:opacity-60", urgent ? "bg-olive text-white" : "bg-secondary text-foreground")}>
                <Check aria-hidden className="size-4" strokeWidth={3} /><span>Mark paid</span>
              </button>
            </div>
          );
        })}
        {!isPending && !bills.length && (
          <Empty>No reminders yet. <Link to="/bills/new" className="font-bold text-olive-ink underline underline-offset-4">Set your first one</Link></Empty>
        )}
        {bills.length > 0 && <p className="px-1 pt-1 text-[13px] text-muted-foreground">Only you see your bills. Monthly ones come back after you mark them paid.</p>}
      </div>
    </div>
  );
}
