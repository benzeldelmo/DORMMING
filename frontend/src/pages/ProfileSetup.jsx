import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Column } from "@/components/AppShell";
import { Field, FormError, PrimaryButton } from "@/components/forms";
import { useGet, useSend } from "@/lib/queries";
import { isLoggedIn } from "@/lib/auth";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const me = useGet("/me", { enabled: isLoggedIn(), refetchInterval: false });
  const send = useSend();
  const [name, setName] = useState("");
  const [ming, setMing] = useState("Ming");

  useEffect(() => {
    if (me.data) {
      setName(me.data.displayName);
      setMing(me.data.mingName);
    }
  }, [me.data]);

  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  async function submit(e) {
    e.preventDefault();
    await send.mutateAsync({ path: "/me", method: "PATCH", body: { displayName: name, mingName: ming } });
    navigate(params.get("next") ?? "/setup/dorm", { replace: true });
  }

  return (
    <Column className="gap-6">
      <p className="text-sm font-medium text-muted-foreground">Step 1 of 2</p>
      <h1 className="font-heading text-[28px] font-extrabold leading-tight">Meet your Ming</h1>
      <div className="relative mx-auto grid place-items-center rounded-[28px] bg-olive-soft px-10 pt-6 pb-4">
        <img src="/brand/ming-mascot.png" alt="Ming, a pixel-art orange cat in a green hoodie" className="pixelated size-44" />
        <span className="-mt-2 rounded-full bg-white px-4 py-1.5 font-heading text-lg font-bold text-olive shadow-sm">
          {ming.trim() || "Ming"}
        </span>
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" />
        <Field label="Name your Ming" value={ming} onChange={(e) => setMing(e.target.value)} maxLength={20}
          hint="Ming keeps you company on Home. You can rename them later." />
        <FormError>{send.error?.message}</FormError>
        <PrimaryButton type="submit" busy={send.isPending}>Continue</PrimaryButton>
      </form>
    </Column>
  );
}
