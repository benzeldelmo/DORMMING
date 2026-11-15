import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FormScreen from "@/components/FormScreen";
import AmountInput from "@/components/AmountInput";
import { Field, FormError, PrimaryButton, Switch } from "@/components/forms";
import { useSend } from "@/lib/queries";
import { toCentavos } from "@/lib/calc";
import { todayIso } from "@/lib/dates";
import { cn } from "@/lib/utils";

const QUICK = ["Internet", "Water", "Electricity", "Phone load", "Rent"];

/** Set a payment reminder: what, how much, when; monthly by default. */
export default function AddBill() {
  const navigate = useNavigate();
  const send = useSend();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(todayIso());
  const [monthly, setMonthly] = useState(true);
  const total = toCentavos(amount);

  async function save(e) {
    e.preventDefault();
    try {
      await send.mutateAsync({ path: "/bills", body: { name, amountCentavos: total, dueDate, monthly } });
      toast.success("Reminder set");
      navigate("/bills", { replace: true });
    } catch {
      /* shown below */
    }
  }

  return (
    <FormScreen title="Set a reminder" onSubmit={save}
      footer={<PrimaryButton type="submit" busy={send.isPending} disabled={!name.trim() || !total || !dueDate}>{!total ? "Enter an amount first" : !name.trim() ? "Name the bill" : "Set reminder"}</PrimaryButton>}>
      <AmountInput value={amount} onChange={setAmount} hint="Tap to enter how much the bill is" />
      <div>
        <Field label="What do you need to pay?" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. PLDT Internet" maxLength={40} autoComplete="off" />
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button key={q} type="button" onClick={() => setName(q)}
              className={cn("h-10 rounded-full px-4 text-[14px] font-semibold", name === q ? "bg-foreground text-background" : "bg-card text-foreground/85 shadow-[var(--shadow-card)]")}>{q}</button>
          ))}
        </div>
      </div>
      <Field label="When is it due?" type="date" value={dueDate} min={todayIso()} onChange={(e) => setDueDate(e.target.value)} />
      <div className="flex min-h-16 items-center justify-between gap-4 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
        <span><span className="block text-[15px] font-bold">Every month</span><span className="block text-[13px] text-muted-foreground">It comes back after you mark it paid.</span></span>
        <Switch label="Every month" on={monthly} onChange={setMonthly} />
      </div>
      <FormError>{send.error?.message}</FormError>
    </FormScreen>
  );
}
