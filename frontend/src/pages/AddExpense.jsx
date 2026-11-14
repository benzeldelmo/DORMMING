import { useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { ReceiptText } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import AmountInput from "@/components/AmountInput";
import PersonPicker from "@/components/PersonPicker";
import { Field, FormError, PrimaryButton, Segmented } from "@/components/forms";
import { CATEGORIES } from "@/lib/categories";
import { useGet, useSend } from "@/lib/queries";
import { formatPeso, parsePesos } from "@/lib/money";
import { todayIso } from "@/lib/dates";

export default function AddExpense() {
  const navigate = useNavigate();
  const { me } = useOutletContext();
  const dorm = useGet("/dorms/current", { refetchInterval: false });
  const members = dorm.data?.members ?? [];
  const send = useSend();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("FOOD_GROCERIES");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayIso());
  const [payer, setPayer] = useState(me?.id);
  const [people, setPeople] = useState(null);
  const [split, setSplit] = useState("EQUAL");
  const [custom, setCustom] = useState({});

  const total = parsePesos(amount);
  const chosen = people ?? members.map((m) => m.user.id);
  const assigned = useMemo(() => chosen.reduce((sum, id) => sum + (parsePesos(custom[id] ?? "") ?? 0), 0), [chosen, custom]);
  const left = (total ?? 0) - assigned;

  async function save(e) {
    e.preventDefault();
    const body = {
      amountCentavos: total, category, note, date, payerId: payer, participantIds: chosen,
      split: split === "EQUAL" ? { type: "EQUAL" } : { type: "CUSTOM", amounts: Object.fromEntries(chosen.map((id) => [id, parsePesos(custom[id] ?? "") ?? 0])) },
    };
    try {
      await send.mutateAsync({ path: "/expenses/shared", body });
      toast.success("Expense saved");
      navigate("/expenses");
    } catch {
      /* shown below */
    }
  }

  const sharedReady = (chosen.length > 0 && (split === "EQUAL" || left === 0));
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <PageHeader title="Add expense" back center />
      <form onSubmit={save} className="space-y-4 px-5" noValidate>
        <AmountInput value={amount} onChange={setAmount} autoFocus />
        <Field label="Category" as="select" value={category} onChange={(e) => setCategory(e.target.value)} inputClassName="appearance-none">
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </Field>
        <Field label="Notes" as="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional..." maxLength={200} />
        <Field label="Date" type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} />

        <div className="space-y-4 rounded-[22px] bg-olive-soft/60 p-4">
          <Field label="Who paid?" as="select" value={payer} onChange={(e) => setPayer(e.target.value)} inputClassName="bg-card">
            {members.map(({ user }) => <option key={user.id} value={user.id}>{user.id === me?.id ? "Me" : user.displayName}</option>)}
          </Field>
          <PersonPicker members={members} selected={chosen} onChange={setPeople} meId={me?.id} />
          <Segmented label="How to split" value={split} onChange={setSplit}
            options={[{ value: "EQUAL", label: "Split equally" }, { value: "CUSTOM", label: "Custom amounts" }]} />
          {split === "EQUAL" && total && chosen.length > 0 && (
            <p className="text-sm text-foreground/75">About {formatPeso(Math.floor(total / chosen.length))} each. Extra centavos go to the others, not the payer.</p>
          )}
          {split === "CUSTOM" && (
            <div className="space-y-2">
              {members.filter((m) => chosen.includes(m.user.id)).map(({ user }) => (
                <AmountInput key={user.id} size="sm" label={user.id === me?.id ? "Me" : user.displayName}
                  value={custom[user.id] ?? ""} onChange={(v) => setCustom({ ...custom, [user.id]: v })} />
              ))}
              <p className={`text-sm font-semibold ${left === 0 ? "text-olive" : "text-orange"}`}>
                {left === 0 ? "All assigned" : left > 0 ? `${formatPeso(left)} left to assign` : `${formatPeso(-left)} too much`}
              </p>
            </div>
          )}
          <Link to="/split" className="flex items-center gap-2 text-sm font-semibold text-olive"><ReceiptText className="size-4" />Split a bill instead</Link>
        </div>

        <FormError>{send.error?.message}</FormError>
        <PrimaryButton type="submit" busy={send.isPending} disabled={!total || !sharedReady}>Save expense</PrimaryButton>
      </form>
    </div>
  );
}
