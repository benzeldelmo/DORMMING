import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import AmountInput from "@/components/AmountInput";
import { Field, FormError, PrimaryButton, Segmented } from "@/components/forms";
import { CATEGORIES } from "@/lib/categories";
import { useGet, useSend } from "@/lib/queries";
import { formatPeso, parsePesos } from "@/lib/money";
import { todayIso } from "@/lib/dates";

export default function AddBill() {
  const navigate = useNavigate();
  const { me } = useOutletContext();
  const dorm = useGet("/dorms/current", { refetchInterval: false });
  const members = dorm.data?.members ?? [];
  const send = useSend();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("RENT_UTILITIES");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(todayIso());
  const [recurrence, setRecurrence] = useState("MONTHLY");
  const [remind, setRemind] = useState("1");
  const [split, setSplit] = useState("EQUAL");
  const [custom, setCustom] = useState({});

  const total = parsePesos(amount);
  const assigned = members.reduce((s, m) => s + (parsePesos(custom[m.user.id] ?? "") ?? 0), 0);
  const left = (total ?? 0) - assigned;

  async function save(e) {
    e.preventDefault();
    try {
      await send.mutateAsync({
        path: "/bills",
        body: {
          name, category, amountCentavos: total, dueDate, recurrence, remindDaysBefore: Number(remind),
          split: split === "EQUAL" ? { type: "EQUAL" } : { type: "CUSTOM", amounts: Object.fromEntries(members.map((m) => [m.user.id, parsePesos(custom[m.user.id] ?? "") ?? 0])) },
        },
      });
      toast.success("Bill reminder set");
      navigate("/bills");
    } catch {
      /* shown below */
    }
  }

  return (
    <div>
      <PageHeader title="Set bill reminder" back />
      <form onSubmit={save} className="space-y-4 px-5" noValidate>
        <Field label="Bill name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Internet" maxLength={40} />
        <AmountInput value={amount} onChange={setAmount} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" as="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Field>
          <Field label="Due date" type="date" value={dueDate} min={todayIso()} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-foreground/80">Repeat</p>
          <Segmented label="Repeat" tone="orange" value={recurrence} onChange={setRecurrence}
            options={[{ value: "NONE", label: "Once" }, { value: "WEEKLY", label: "Weekly" }, { value: "MONTHLY", label: "Monthly" }]} />
        </div>
        <Field label="Remind me" as="select" value={remind} onChange={(e) => setRemind(e.target.value)}>
          {[0, 1, 2, 3, 5, 7].map((d) => <option key={d} value={d}>{d === 0 ? "On the due date" : `${d} day${d > 1 ? "s" : ""} before`}</option>)}
        </Field>
        <div className="space-y-3 rounded-[22px] bg-cream p-4">
          <Segmented label="How to split" tone="orange" value={split} onChange={setSplit}
            options={[{ value: "EQUAL", label: "Split equally" }, { value: "CUSTOM", label: "Custom" }]} />
          {split === "EQUAL" ? (
            <p className="text-sm text-foreground/75">
              Split among all {members.length} members{total ? `, about ${formatPeso(Math.floor(total / Math.max(members.length, 1)))} each` : ""}.
            </p>
          ) : (
            <>
              {members.map(({ user }) => (
                <AmountInput key={user.id} size="sm" label={user.id === me?.id ? "Me" : user.displayName}
                  value={custom[user.id] ?? ""} onChange={(v) => setCustom({ ...custom, [user.id]: v })} />
              ))}
              <p className={`text-sm font-semibold ${left === 0 ? "text-olive" : "text-orange"}`}>
                {left === 0 ? "All assigned" : left > 0 ? `${formatPeso(left)} left to assign` : `${formatPeso(-left)} too much`}
              </p>
            </>
          )}
        </div>
        <FormError>{send.error?.message}</FormError>
        <PrimaryButton type="submit" tone="orange" busy={send.isPending} disabled={!name.trim() || !total || (split === "CUSTOM" && left !== 0)}>Save bill</PrimaryButton>
      </form>
    </div>
  );
}
