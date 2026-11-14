import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "@/components/AuthFrame";
import { Field, FormError, PrimaryButton } from "@/components/forms";
import { signUp } from "@/lib/auth";

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
      navigate("/setup/dorm", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame mood="CELEBRATING" title="Hi! I'm Ming." subtitle="Make an account and I'll keep your dorm's money in order."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-olive underline-offset-4 hover:underline">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Your name" autoComplete="name" value={form.displayName} onChange={set("displayName")} required maxLength={40} placeholder="Benzel" />
        <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} required placeholder="you@school.edu.ph" />
        <Field label="Password" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} required hint="At least 8 characters." />
        <FormError>{error}</FormError>
        <PrimaryButton type="submit" busy={busy}>Create account</PrimaryButton>
      </form>
    </AuthFrame>
  );
}
