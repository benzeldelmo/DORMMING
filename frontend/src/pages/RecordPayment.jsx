import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import AmountInput from "@/components/AmountInput";
import { Field, FormError, PrimaryButton } from "@/components/forms";
import { Empty } from "@/components/Rows";
import { useGet, useSend } from "@/lib/queries";
import { centavosToInput, formatPeso, parsePesos } from "@/lib/money";
import { cn } from "@/lib/utils";

export default function RecordPayment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
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
      await send.mutateAsync({ path: "/payments", body: { toUserId: to, amountCentavos: parsePesos(amount), note } });
      toast.success("Payment recorded");
      navigate("/balances");
    } catch {
      /* shown below */
    }
  }

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <PageHeader title="Record payment" back />
      <form onSubmit={save} className="space-y-4 px-5" noValidate>
        {balances && !owe.length ? (
          <Empty>You don't owe anyone right now. All square!</Empty>
        ) : (
          <>
            <fieldset className="min-w-0 space-y-2">
              <legend className="mb-1.5 text-[13px] font-medium text-foreground/80">Who are you paying?</legend>
              {owe.map((d) => (
                <button key={d.user.id} type="button" aria-pressed={to === d.user.id} onClick={() => pick(d)}
                  className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                    to === d.user.id ? "bg-orange-soft ring-2 ring-orange/60" : "bg-secondary")}>
                  <span className="grid size-10 place-items-center rounded-full bg-card font-semibold">{d.user.initials}</span>
                  <span className="flex-1 font-semibold">{d.user.displayName}</span>
                  <span className="text-sm text-foreground/70">you owe <b className="tabular-nums text-foreground">{formatPeso(d.amountCentavos)}</b></span>
                </button>
              ))}
            </fieldset>
            <AmountInput value={amount} onChange={setAmount} />
            <Field label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="GCash, cash..." maxLength={200} />
            <p className="text-xs text-muted-foreground">DormMing only records it. No real money moves.</p>
            <FormError>{send.error?.message}</FormError>
            <PrimaryButton type="submit" busy={send.isPending} disabled={!to || !parsePesos(amount)}>Record payment</PrimaryButton>
          </>
        )}
      </form>
    </div>
  );
}
