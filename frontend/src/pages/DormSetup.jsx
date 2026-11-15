import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthFrame from "@/components/AuthFrame";
import DormQr from "@/components/DormQr";
import ScanButton from "@/components/ScanButton";
import { PENDING_JOIN } from "@/pages/JoinLink";
import { Field, FormError, PrimaryButton, Segmented } from "@/components/forms";
import { useGet, useSend } from "@/lib/queries";
import { isLoggedIn } from "@/lib/auth";

export default function DormSetup() {
  const navigate = useNavigate();
  const me = useGet("/me", { enabled: isLoggedIn(), refetchInterval: false });
  const send = useSend();
  const [tab, setTab] = useState("join");
  const [name, setName] = useState("");
  // A code saved by a scanned QR before sign-up fills itself in
  const [code, setCode] = useState(() => {
    try { const saved = sessionStorage.getItem(PENDING_JOIN) ?? ""; sessionStorage.removeItem(PENDING_JOIN); return saved; } catch { return ""; }
  });
  const [created, setCreated] = useState(null);

  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (me.data?.dormId && !created) return <Navigate to="/home" replace />;

  const create = async (e) => {
    e.preventDefault();
    setCreated(await send.mutateAsync({ path: "/dorms", body: { name } }));
  };
  const join = async (e) => {
    e.preventDefault();
    await send.mutateAsync({ path: "/dorms/join", body: { code } });
    navigate("/home", { replace: true });
  };

  if (created) {
    return (
      <AuthFrame mood="CELEBRATING">
        <div className="text-center">
          <h1 className="font-heading text-[28px] font-extrabold leading-tight">{created.name} is ready!</h1>
          <p className="mt-1 text-muted-foreground">Let your dormmates scan this, or share the code.</p>
        </div>
        <DormQr code={created.inviteCode} />
        <PrimaryButton onClick={() => navigate("/home", { replace: true })}>Go to my dorm</PrimaryButton>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame mood="SLEEPY">
      <div>
        <h1 className="font-heading text-[28px] font-extrabold leading-tight">Find your dorm</h1>
        <p className="mt-1 text-muted-foreground">Join your dormmates with their code, or start a new dorm.</p>
      </div>
      <Segmented label="Join or create" value={tab} onChange={setTab}
        options={[{ value: "join", label: "Join" }, { value: "create", label: "Create" }]} />

      {tab === "join" ? (
        <form onSubmit={join} className="space-y-4" noValidate>
          <ScanButton onCode={setCode} />
          <p className="flex items-center gap-3 text-[13px] font-semibold text-muted-foreground"><span className="h-px flex-1 bg-border" />or type the code<span className="h-px flex-1 bg-border" /></p>
          <Field label="Dorm code" value={code} maxLength={6} autoCapitalize="characters" autoComplete="off" spellCheck={false}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            inputClassName="text-center font-heading text-2xl font-bold tracking-[0.3em] uppercase" placeholder="AB3C9D"
            hint="6 letters and numbers, from whoever made the dorm." />
          <FormError>{send.error?.message}</FormError>
          <PrimaryButton type="submit" busy={send.isPending} disabled={code.length !== 6}>Join dorm</PrimaryButton>
        </form>
      ) : (
        <form onSubmit={create} className="space-y-4" noValidate>
          <Field label="Dorm name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Mabini Hall 3B" />
          <FormError>{send.error?.message}</FormError>
          <PrimaryButton type="submit" busy={send.isPending} disabled={!name.trim()}>Create dorm</PrimaryButton>
        </form>
      )}
    </AuthFrame>
  );
}
