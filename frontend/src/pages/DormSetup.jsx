import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import AuthFrame from "@/components/AuthFrame";
import { Field, FormError, PrimaryButton, Segmented } from "@/components/forms";
import { useGet, useSend } from "@/lib/queries";
import { isLoggedIn } from "@/lib/auth";

export default function DormSetup() {
  const navigate = useNavigate();
  const me = useGet("/me", { enabled: isLoggedIn(), refetchInterval: false });
  const send = useSend();
  const [tab, setTab] = useState("join");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [created, setCreated] = useState(null);

  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (me.data?.dormId && !created) return <Navigate to="/balances" replace />;

  const create = async (e) => {
    e.preventDefault();
    setCreated(await send.mutateAsync({ path: "/dorms", body: { name } }));
  };
  const join = async (e) => {
    e.preventDefault();
    await send.mutateAsync({ path: "/dorms/join", body: { code } });
    navigate("/balances", { replace: true });
  };

  if (created) {
    return (
      <AuthFrame>
        <div className="text-center">
          <h1 className="font-heading text-[28px] font-extrabold leading-tight">{created.name} is ready!</h1>
          <p className="mt-1 text-muted-foreground">Share this code so your dormmates can join.</p>
        </div>
        <div className="w-full rounded-[28px] bg-olive-soft p-6">
          <p className="text-sm text-foreground/70">Dorm code</p>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(created.inviteCode); toast.success("Code copied"); }}
            className="mx-auto mt-1 flex items-center gap-2 font-heading text-4xl font-extrabold tracking-[0.18em] tabular-nums">
            {created.inviteCode}<Copy className="size-5 text-olive" aria-label="Copy code" />
          </button>
        </div>
        <PrimaryButton onClick={() => navigate("/balances", { replace: true })}>Go to my dorm</PrimaryButton>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <div>
        <h1 className="font-heading text-[28px] font-extrabold leading-tight">Find your dorm</h1>
        <p className="mt-1 text-muted-foreground">Join your dormmates with their code, or start a new dorm.</p>
      </div>
      <Segmented label="Join or create" value={tab} onChange={setTab}
        options={[{ value: "join", label: "Join" }, { value: "create", label: "Create" }]} />

      {tab === "join" ? (
        <form onSubmit={join} className="space-y-4" noValidate>
          <Field label="Dorm code" value={code} maxLength={6} autoCapitalize="characters" autoComplete="off" spellCheck={false}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            inputClassName="text-center font-heading text-2xl font-bold tracking-[0.3em] uppercase" placeholder="AB3C9D"
            hint="6 letters and numbers. Ask whoever made the dorm." />
          <FormError>{send.error?.message}</FormError>
          <PrimaryButton type="submit" busy={send.isPending} disabled={code.length !== 6}>Join dorm</PrimaryButton>
        </form>
      ) : (
        <form onSubmit={create} className="space-y-4" noValidate>
          <Field label="Dorm name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Mabini Hall 3B" />
          <FormError>{send.error?.message}</FormError>
          <PrimaryButton type="submit" busy={send.isPending} disabled={!name.trim()}>Create dorm</PrimaryButton>
        </form>
      )}
    </AuthFrame>
  );
}
