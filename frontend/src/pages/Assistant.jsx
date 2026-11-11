import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, SendHorizontal, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import MingBust from "@/components/MingBust";
import { api } from "@/lib/api";
import { formatPeso } from "@/lib/money";
import { categoryById } from "@/lib/categories";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["I spent 150 on rice", "Who owes me?", "What's due this week?", "Paid Vince 200"];
const TITLES = { ADD_SHARED_EXPENSE: "Shared expense", CREATE_BILL: "New bill", RECORD_PAYMENT: "Payment" };

function ProposalCard({ proposal, state, onConfirm, onCancel }) {
  const f = proposal.fields;
  const rows = [
    f.amountCentavos != null && ["Amount", formatPeso(f.amountCentavos)],
    f.category && ["Category", categoryById(f.category).label],
    f.name && ["Bill", f.name],
    f.dueDate && ["Due", f.dueDate],
    f.recurrence && f.recurrence !== "NONE" && ["Repeats", f.recurrence.toLowerCase()],
    f.note && ["Note", f.note],
  ].filter(Boolean);
  return (
    <div className="mx-auto w-full max-w-[560px] ml-11 rounded-[20px] border-2 border-dashed border-olive/35 bg-olive-soft/50 p-4">
      <p className="text-xs font-semibold tracking-wide text-olive uppercase">{TITLES[proposal.kind]}</p>
      <p className="mt-1 font-heading font-bold leading-snug">{proposal.summary}</p>
      <dl className="mt-2 space-y-0.5 text-sm">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-foreground/65">{k}</dt><dd className="font-semibold tabular-nums">{v}</dd></div>)}
      </dl>
      {state === "open" ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={onCancel} className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white font-semibold"><X className="size-4" />Cancel</button>
          <button type="button" onClick={onConfirm} className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-olive font-semibold text-white"><Check className="size-4" />Confirm</button>
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold text-foreground/60">{state === "saved" ? "Saved" : state === "busy" ? "Saving…" : "Not saved"}</p>
      )}
    </div>
  );
}

export default function Assistant() {
  const { me } = useOutletContext();
  const client = useQueryClient();
  const mingName = me?.mingName ?? "Ming";
  const [messages, setMessages] = useState([{ from: "ming", text: `Hi! I'm ${mingName}. Tell me what you spent or paid, and I'll fill it in. Nothing saves until you confirm.` }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(false);
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const push = (m) => setMessages((all) => [...all, m]);
  const setProposalState = (index, state) => setMessages((all) => all.map((m, i) => (i === index ? { ...m, state } : m)));

  async function ask(text) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    push({ from: "me", text: message });
    setBusy(true);
    try {
      const res = await api("/assistant/chat", { method: "POST", body: { message } });
      setDemo(res.demoMode);
      push({ from: "ming", text: res.reply });
      if (res.proposal) push({ from: "proposal", proposal: res.proposal, state: "open" });
    } catch (e) {
      push({ from: "ming", text: e.message, error: true });
    } finally {
      setBusy(false);
    }
  }

  async function confirm(index) {
    const { proposal } = messages[index];
    setProposalState(index, "busy");
    try {
      const res = await api("/assistant/confirm", { method: "POST", body: proposal });
      setProposalState(index, "saved");
      push({ from: "ming", text: res.reply });
      client.invalidateQueries();
    } catch (e) {
      setProposalState(index, "open");
      push({ from: "ming", text: e.message, error: true });
    }
  }

  function cancel(index) {
    setProposalState(index, "cancelled");
    push({ from: "ming", text: "Okay, I won't save that." });
  }

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col">
      <PageHeader title={`Ask ${mingName}`} back topLevel>
        {demo && <span className="rounded-full bg-sun px-2.5 py-1 text-xs font-bold text-brown">Demo mode</span>}
      </PageHeader>
      <div className="flex-1 space-y-3 px-5 pb-4" aria-live="polite">
        {messages.map((m, i) => m.from === "proposal" ? (
          <ProposalCard key={i} proposal={m.proposal} state={m.state} onConfirm={() => confirm(i)} onCancel={() => cancel(i)} />
        ) : m.from === "me" ? (
          <p key={i} className="ml-auto w-fit max-w-[80%] rounded-[20px] rounded-br-md bg-olive px-4 py-2.5 text-[15px] text-white">{m.text}</p>
        ) : (
          <div key={i} className="flex items-end gap-2">
            <MingBust className="w-10 shrink-0" />
            <p className={cn("max-w-[80%] rounded-[20px] rounded-bl-md px-4 py-2.5 text-[15px]", m.error ? "bg-destructive/10 text-destructive" : "bg-secondary")}>{m.text}</p>
          </div>
        ))}
        {busy && (
          <div className="flex items-end gap-2">
            <MingBust mood="HAPPY" className="w-10 shrink-0" />
            <p className="rounded-[20px] rounded-bl-md bg-secondary px-4 py-2.5 text-[15px] text-foreground/60">{mingName} is thinking…</p>
          </div>
        )}
        <div ref={end} />
      </div>
      <div className="sticky bottom-24 space-y-2 bg-gradient-to-t from-background via-background to-background/0 px-5 pt-3 pb-2">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => ask(s)} className="h-9 shrink-0 rounded-full bg-cream px-3.5 text-sm font-medium text-[#8a4210]">{s}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex items-center gap-2 rounded-full bg-secondary p-1.5 pl-4 focus-within:ring-2 focus-within:ring-olive/50">
          <label className="flex-1">
            <span className="sr-only">Message {mingName}</span>
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder={`Message ${mingName}…`} className="w-full bg-transparent text-[15px] outline-none" />
          </label>
          <button type="submit" disabled={!input.trim() || busy} aria-label="Send" className="grid size-10 place-items-center rounded-full bg-olive text-white disabled:opacity-40">
            <SendHorizontal className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
