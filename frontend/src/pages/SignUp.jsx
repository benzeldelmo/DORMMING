import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "@/components/AuthFrame";
import { Field, FormError, PasswordField, PrimaryButton } from "@/components/forms";
import { signUp } from "@/lib/auth";
import { offerPinSoon } from "@/lib/passcode";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true);
    try {
      await signUp(form);
      offerPinSoon();
      navigate("/setup/dorm", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame mood="CELEBRATING" title="Hi! I'm Ming." subtitle="Make an account. I'll keep track of who owes who."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-olive underline-offset-4 hover:underline">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Your name" autoComplete="name" value={form.displayName} onChange={set("displayName")} required maxLength={40} placeholder="e.g. Juan dela Cruz" />
        <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} required placeholder="juan@gmail.com" />
        <PasswordField autoComplete="new-password" value={form.password} onChange={set("password")} required hint="At least 8 characters. Mix in some numbers." />
        <FormError>{error}</FormError>
        <PrimaryButton type="submit" busy={busy}>Create account</PrimaryButton>
      </form>
    </AuthFrame>
  );
}
