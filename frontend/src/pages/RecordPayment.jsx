import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import FormScreen from "@/components/FormScreen";
import Avatar from "@/components/Avatar";
import AmountInput from "@/components/AmountInput";
import { Field, FormError, PrimaryButton } from "@/components/forms";
import { Empty } from "@/components/Rows";
import { useGet, useSend } from "@/lib/queries";
import { centavosToInput, formatPesoShort } from "@/lib/money";
import { toCentavos } from "@/lib/calc";
import { cn } from "@/lib/utils";

export default function RecordPayment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { dorm } = useOutletContext(); // photos come with the dorm's member list
  const { data: balances } = useGet("/balances", { refetchInterval: false });
  const owe = balances?.debts.filter((d) => d.direction === "I_OWE") ?? [];
  const send = useSend();
  const [to, setTo] = useState(params.get("to"));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const pick = (debt) => {
    setTo(debt.user.id);
    setAmount(centavosToInput(debt.amountCentavos));
  };
  useEffect(() => {
    const debt = owe.find((d) => d.user.id === (to ?? owe[0]?.user.id));
    if (debt && !amount) pick(debt);
  }, [balances]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e) {
    e.preventDefault();
    try {
      await send.mutateAsync({ path: "/payments", body: { toUserId: to, amountCentavos: toCentavos(amount), note } });
      toast.success("Payment recorded");
      navigate("/balances", { replace: true });
    } catch {
      /* shown below */
    }
  }

  const who = owe.find((d) => d.user.id === to);
  return (
    <FormScreen title="Pay back" onSubmit={save}
      footer={owe.length ? <PrimaryButton type="submit" busy={send.isPending} disabled={!to || !toCentavos(amount)}>{who ? `Mark as paid to ${who.user.displayName}` : "Mark as paid"}</PrimaryButton> : null}>
      {balances && !owe.length ? (
        <Empty>You don't owe anyone right now. All square!</Empty>
      ) : (
        <>
          <AmountInput value={amount} onChange={setAmount} hint="" />
          <fieldset className="min-w-0 space-y-2">
            <legend className="mb-2 text-[13px] font-semibold text-muted-foreground">Who are you paying?</legend>
            {owe.map((d) => (
              <button key={d.user.id} type="button" aria-pressed={to === d.user.id} onClick={() => pick(d)}
                className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                  to === d.user.id ? "bg-foreground text-background" : "bg-card shadow-[var(--shadow-card)]")}>
                <Avatar user={dorm?.members.find((m) => m.user.id === d.user.id)?.user ?? d.user} className="size-10 text-[15px]" />
                <span className="flex-1 font-semibold">{d.user.displayName}</span>
                <span className="text-sm opacity-75">you owe <b className="tabular-nums">{formatPesoShort(d.amountCentavos)}</b></span>
              </button>
            ))}
          </fieldset>
          <Field label="How did you pay? (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. GCash, cash" maxLength={200} />
          <FormError>{send.error?.message}</FormError>
        </>
      )}
    </FormScreen>
  );
}
