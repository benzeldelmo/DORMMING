import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "@/components/AuthFrame";
import { Field, FormError, PrimaryButton } from "@/components/forms";
import { logIn } from "@/lib/auth";

export default function LogIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await logIn(form);
      navigate("/balances", { replace: true }); // AppShell sends people without a dorm to /setup/dorm
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame title="Welcome back!" subtitle="Ming missed you. Let's check the dorm."
      footer={<>New here? <Link to="/signup" className="font-semibold text-olive underline-offset-4 hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} required />
        <Field label="Password" type="password" autoComplete="current-password" value={form.password} onChange={set("password")} required />
        <FormError>{error}</FormError>
        <PrimaryButton type="submit" busy={busy}>Log in</PrimaryButton>
      </form>
    </AuthFrame>
  );
}
