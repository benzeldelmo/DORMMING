import { useState } from "react";
import { Link } from "react-router-dom";
import AuthFrame from "@/components/AuthFrame";
import { Field, FormError, PrimaryButton } from "@/components/forms";
import { forgot } from "@/lib/auth";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setToken(await forgot(email));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame title="Forgot it? No worries." subtitle="We'll get you a reset link."
      footer={<Link to="/login" className="font-semibold text-olive underline-offset-4 hover:underline">Back to log in</Link>}>
      {token ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-cream p-4 text-[15px]">
            <p className="font-semibold">Demo mode</p>
            <p className="mt-1 text-foreground/75">In the real app this link arrives by email. For the demo, use it here:</p>
          </div>
          <Link to={`/reset?token=${encodeURIComponent(token)}`}
            className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-olive font-heading text-[17px] font-bold text-white">
            Set a new password
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormError>{error}</FormError>
          <PrimaryButton type="submit" busy={busy}>Send reset link</PrimaryButton>
        </form>
      )}
    </AuthFrame>
  );
}
