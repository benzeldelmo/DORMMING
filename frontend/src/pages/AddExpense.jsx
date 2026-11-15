import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { NotebookPen } from "lucide-react";
import { toast } from "sonner";
import FormScreen from "@/components/FormScreen";
import AmountInput from "@/components/AmountInput";
import PersonPicker from "@/components/PersonPicker";
import Avatar from "@/components/Avatar";
import RollingNumber from "@/components/RollingNumber";
import { FormError, PrimaryButton } from "@/components/forms";
import { CATEGORIES } from "@/lib/categories";
import { useGet, useSend } from "@/lib/queries";
import { toCentavos } from "@/lib/calc";
import { formatPesoShort } from "@/lib/money";
import { cn } from "@/lib/utils";

const Label = ({ children }) => <p className="mb-2 text-[13px] font-semibold text-muted-foreground">{children}</p>;

/**
 * Add a shared expense: how much, what for, the category, who paid. It's split equally with everyone
 * in the dorm unless you change who's in it. The whole form fits on one screen.
 */
export default function AddExpense() {
  const navigate = useNavigate();
  const { me } = useOutletContext();
  const dorm = useGet("/dorms/current", { refetchInterval: false });
  const members = dorm.data?.members ?? [];
  const send = useSend();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("FOOD_GROCERIES");
  const [payer, setPayer] = useState(me?.id);
  const [people, setPeople] = useState(null); // null: everyone in the dorm
  const [picking, setPicking] = useState(false);

  const total = toCentavos(amount);
  const chosen = people ?? members.map((m) => m.user.id);
  const sharing = members.filter((m) => chosen.includes(m.user.id));
  const everyone = members.length > 0 && chosen.length === members.length;
  const each = total && chosen.length ? Math.floor(total / chosen.length) : 0;

  async function save(e) {
    e.preventDefault();
    if (!total || !chosen.length) return;
    try {
      await send.mutateAsync({ path: "/expenses/shared", body: { amountCentavos: total, category, note, payerId: payer, participantIds: chosen, split: { type: "EQUAL" } } });
      toast.success("Expense added and split");
      navigate("/expenses", { replace: true });
    } catch {
      /* shown below */
    }
  }

  return (
    <FormScreen title="Add expense" onSubmit={save}
      footer={<PrimaryButton type="submit" busy={send.isPending} disabled={!total || chosen.length === 0}>{!total ? "Enter an amount first" : !chosen.length ? "Pick who's in it" : `Add ${formatPesoShort(total)}`}</PrimaryButton>}>
      <AmountInput value={amount} onChange={setAmount} autoOpen note={each ? `${formatPesoShort(each)} each, split ${chosen.length} ways` : null} />

      <label className="flex h-14 items-center gap-3 rounded-2xl bg-card px-4 shadow-[var(--shadow-card)]">
        <NotebookPen aria-hidden className="size-5 shrink-0 text-muted-foreground" />
        <span className="sr-only">What was it for?</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was it for? e.g. Groceries at SM" maxLength={200} autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted-foreground" />
      </label>

      <fieldset className="min-w-0">
        <legend className="contents"><Label>Category</Label></legend>
        {/* The only part that scrolls: sideways, through the categories */}
        <div className="-mx-5 flex gap-2 overflow-x-auto overscroll-x-contain px-5 pb-1 [mask-image:linear-gradient(to_right,#000_82%,transparent)] [scrollbar-width:none]">
          {CATEGORIES.map(({ id, label, icon: Icon, tone }) => (
            <button key={id} type="button" aria-pressed={category === id} onClick={() => setCategory(id)}
              className={cn("flex h-12 shrink-0 items-center gap-2 rounded-2xl pr-4 pl-1.5 text-[15px] font-semibold transition-[background-color,color,transform] active:scale-[0.97]",
                category === id ? "bg-foreground text-background" : "bg-card text-foreground/85 shadow-[var(--shadow-card)]")}>
              <span className={cn("grid size-9 place-items-center rounded-xl", tone)}><Icon aria-hidden className="size-[18px]" /></span>
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="contents"><Label>Who paid?</Label></legend>
        <div className="flex flex-wrap gap-2">
          {members.map(({ user }) => (
            <button key={user.id} type="button" aria-pressed={payer === user.id} onClick={() => setPayer(user.id)}
              className={cn("flex h-11 items-center gap-2 rounded-full pr-4 pl-1.5 text-[15px] font-semibold transition-[background-color,color,transform] active:scale-[0.97]",
                payer === user.id ? "bg-foreground text-background" : "bg-card text-foreground/85 shadow-[var(--shadow-card)]")}>
              <Avatar user={user} className="size-8 text-[12px]" />
              {user.id === me?.id ? "Me" : user.displayName}
            </button>
          ))}
        </div>
      </fieldset>

      {/* The split: who's in it, and what each person's share comes to */}
      <section aria-label="Split" className="rounded-3xl bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <span className="flex shrink-0 -space-x-2.5">
            {sharing.slice(0, 4).map(({ user }) => <Avatar key={user.id} user={user} className="size-9 text-[12px] ring-2 ring-card" />)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-muted-foreground">
              {everyone ? `Split with all ${chosen.length}` : `Split ${chosen.length} ways`}
            </span>
            <span className="block font-heading text-[22px] leading-tight font-black tabular-nums"><RollingNumber>{formatPesoShort(each)}</RollingNumber> <span className="text-[15px] font-bold text-muted-foreground">each</span></span>
          </span>
          <button type="button" onClick={() => setPicking(!picking)} className="h-11 shrink-0 rounded-full bg-secondary px-4 text-[14px] font-bold">
            {picking ? "Done" : "Change"}
          </button>
        </div>
        {picking && <div className="mt-4"><PersonPicker members={members} selected={chosen} onChange={setPeople} meId={me?.id} label="Who's in it?" /></div>}
      </section>

      <FormError>{send.error?.message}</FormError>
    </FormScreen>
  );
}
