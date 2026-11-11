import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import AuthFrame from "@/components/AuthFrame";
import { Field, FormError, PrimaryButton } from "@/components/forms";
import { reset } from "@/lib/auth";

export default function Reset() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true);
    try {
      await reset(params.get("token") ?? "", password);
      toast.success("Password changed. Log in with your new one.");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame title="New password" subtitle="Pick one you'll remember."
      footer={<Link to="/forgot" className="font-semibold text-olive underline-offset-4 hover:underline">Get a new link</Link>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 8 characters." />
        <FormError>{error}</FormError>
        <PrimaryButton type="submit" busy={busy}>Save password</PrimaryButton>
      </form>
    </AuthFrame>
  );
}
