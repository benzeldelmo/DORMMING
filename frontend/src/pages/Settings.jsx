import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, CircleHelp, CreditCard, FileText, LogOut, MessageCircleHeart, Palette, RefreshCw, Shield, Trash2, UserRound, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import { Field, PrimaryButton, Segmented } from "@/components/forms";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGet, useSend } from "@/lib/queries";
import { logOut } from "@/lib/auth";
import { getReduceMotion, getTheme, setReduceMotion, setTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "account", label: "Account", icon: UserRound },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "dorm", label: "Dorm", icon: Users },
  { id: "help", label: "Help", icon: CircleHelp },
  { id: "legal", label: "Legal", icon: Shield },
];

const FAQ = [
  ["How are uneven splits handled?", "Amounts are kept to the centavo. When a total doesn't divide evenly, the extra centavos go to the people other than the payer."],
  ["How do bills work?", "Each member pays their own share straight to the provider, then taps \"I paid my share\". Bills never create debts between dormmates."],
  ["Why can't I leave my dorm?", "You can leave once nobody owes you and you owe nobody. Record the payments first, then leave."],
  ["Is this real money?", "No. DormMing is a simulated record of who paid what. No money moves through the app."],
];

function Section({ id, title, icon: Icon, children, tone }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6">
      <h2 id={`${id}-title`} className="mb-3 flex items-center gap-2 px-1 text-[15px] font-bold text-muted-foreground">
        <Icon className="size-4" />{title}
      </h2>
      <div className={cn("card-surface p-5", tone === "danger" && "ring-1 ring-destructive/25")}>{children}</div>
    </section>
  );
}

function Row({ icon: Icon, label, hint, to, onClick, danger }) {
  const Tag = to ? Link : "button";
  return (
    <Tag to={to} type={to ? undefined : "button"} onClick={onClick}
      className={cn("-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-secondary", danger && "text-destructive")}>
      <Icon className="size-5 shrink-0 opacity-80" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-[13px] text-muted-foreground">{hint}</span>}
      </span>
      {to && <ChevronRight className="size-4 text-muted-foreground" />}
    </Tag>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-olive" : "bg-secondary ring-1 ring-border")}>
      <span className={cn("absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-5")} />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const me = useGet("/me", { refetchInterval: false });
  const dorm = useGet("/dorms/current");
  const send = useSend();
  const [profile, setProfile] = useState(null);
  const [theme, setThemeState] = useState(getTheme);
  const [calm, setCalm] = useState(getReduceMotion);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (me.data && !profile) setProfile({ displayName: me.data.displayName, mingName: me.data.mingName, cardColor: me.data.cardColor });
  }, [me.data, profile]);

  const run = async (req, message, after) => {
    try {
      const result = await send.mutateAsync(req);
      if (message) toast.success(message);
      after?.(result);
    } catch (e) {
      toast.error(e.message);
    }
  };
  const leaveApp = () => { logOut(); client.clear(); };
  const isCreator = dorm.data?.myRole === "CREATOR";

  return (
    <div>
      <PageHeader title="Settings" back />
      <div className="px-5 lg:grid lg:grid-cols-[200px_1fr] lg:gap-10">
        <nav aria-label="Settings sections" className="hidden lg:block">
          <ul className="sticky top-8 space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <li key={id}><a href={`#${id}`} className="flex h-10 items-center gap-2.5 rounded-xl px-3 text-[15px] font-semibold text-foreground/70 hover:bg-card hover:text-foreground"><Icon className="size-4" />{label}</a></li>
            ))}
          </ul>
        </nav>

        <div className="mx-auto w-full max-w-[640px] space-y-8 pb-10">
          {profile && (
            <Section id="account" title="Account" icon={UserRound}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-olive-soft text-lg font-bold text-olive">{me.data.initials}</span>
                <span className="min-w-0">
                  <span className="block truncate font-heading text-lg font-extrabold">{me.data.displayName}</span>
                  <span className="block truncate text-sm text-muted-foreground">{me.data.email}</span>
                </span>
              </div>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run({ path: "/me", method: "PATCH", body: { displayName: profile.displayName, mingName: profile.mingName } }, "Account saved"); }}>
                <Field label="Your name" value={profile.displayName} maxLength={40} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} />
                <Field label="Ming's name" value={profile.mingName} maxLength={20} onChange={(e) => setProfile({ ...profile, mingName: e.target.value })} />
                <PrimaryButton type="submit" busy={send.isPending}>Save changes</PrimaryButton>
              </form>
              <div className="mt-4 border-t pt-2">
                <Row icon={CreditCard} label="My card and friends" hint="Your QR, friend code and friends list" to="/card" />
              </div>
            </Section>
          )}

          <Section id="appearance" title="Appearance" icon={Palette}>
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="font-semibold">Theme</p>
                <Segmented label="Theme" value={theme} onChange={(t) => { setTheme(t); setThemeState(t); }}
                  options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }]} />
              </div>
              {profile && (
                <div className="space-y-2">
                  <p className="font-semibold">Card color</p>
                  <Segmented label="Card color" value={profile.cardColor}
                    onChange={(cardColor) => { setProfile({ ...profile, cardColor }); run({ path: "/me", method: "PATCH", body: { cardColor } }); }}
                    options={[{ value: "OLIVE", label: "Olive" }, { value: "ORANGE", label: "Orange" }, { value: "YELLOW", label: "Yellow" }]} />
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <span><span className="block font-semibold">Reduce motion</span><span className="block text-[13px] text-muted-foreground">Ming stays still and screens don't animate.</span></span>
                <Switch label="Reduce motion" checked={calm} onChange={(on) => { setReduceMotion(on); setCalm(on); }} />
              </div>
            </div>
          </Section>

          {dorm.data && (
            <Section id="dorm" title="Dorm" icon={Users}>
              <p className="mb-4 truncate font-heading text-lg font-extrabold">{dorm.data.name}</p>
              <div className="flex items-center gap-4 rounded-2xl bg-secondary p-4">
                <span className="rounded-xl bg-white p-2"><QRCodeSVG value={dorm.data.joinUrl} size={84} fgColor="#240702" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-muted-foreground">Dorm code</span>
                  <span className="block font-heading text-2xl font-extrabold tracking-[0.18em]">{dorm.data.inviteCode}</span>
                  {isCreator && (
                    <button type="button" onClick={() => run({ path: "/dorms/current/code" }, "New code made. The old one stops working.")}
                      className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-olive"><RefreshCw className="size-3.5" />New code</button>
                  )}
                </span>
              </div>
              <ul className="mt-4 divide-y">
                {dorm.data.members.map((m) => (
                  <li key={m.user.id} className="flex items-center gap-3 py-2.5">
                    <span className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-semibold">{m.user.initials}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{m.user.displayName}{m.user.id === me.data?.id && " (you)"}</span>
                    {m.role === "CREATOR" && <span className="rounded-full bg-olive-soft px-2 py-0.5 text-xs font-semibold text-olive">Creator</span>}
                    {isCreator && m.user.id !== me.data?.id && (
                      <button type="button" onClick={() => run({ path: `/dorms/current/members/${m.user.id}`, method: "DELETE" }, `${m.user.displayName} removed`)}
                        className="text-sm font-semibold text-destructive">Remove</button>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-2 border-t pt-2">
                <Row icon={LogOut} label="Leave dorm" hint="Only when you're settled up" danger
                  onClick={() => run({ path: "/dorms/current/leave" }, "You left the dorm", () => navigate("/setup/dorm", { replace: true }))} />
              </div>
            </Section>
          )}

          <Section id="help" title="Help" icon={CircleHelp}>
            <div className="divide-y">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                    {q}<ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
            <div className="mt-2 border-t pt-2">
              <Row icon={MessageCircleHeart} label="Ask Ming" hint="Questions about your balances" to="/assistant" />
            </div>
          </Section>

          <Section id="legal" title="Legal" icon={Shield}>
            <Row icon={FileText} label="Terms of Service" to="/terms" />
            <Row icon={Shield} label="Privacy Policy" to="/privacy" />
          </Section>

          <div className="space-y-3">
            <button type="button" onClick={() => { leaveApp(); navigate("/login", { replace: true }); }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-card font-semibold shadow-[var(--shadow-card)]"><LogOut className="size-4" />Log out</button>
            <button type="button" onClick={() => { setConfirmText(""); setDeleting(true); }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-destructive hover:bg-destructive/10"><Trash2 className="size-4" />Delete account</button>
          </div>
        </div>
      </div>

      <Dialog open={deleting} onOpenChange={setDeleting}>
        <DialogContent className="max-w-[420px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-extrabold">Delete your account?</DialogTitle>
            <DialogDescription>
              This removes your login, your friends list and your place in the dorm. Records you added stay for your dormmates.
              You need to be settled up first. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <Field label='Type DELETE to confirm' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
          <button type="button" disabled={confirmText !== "DELETE" || send.isPending}
            onClick={() => run({ path: "/me", method: "DELETE" }, "Your account was deleted", () => { setDeleting(false); leaveApp(); navigate("/", { replace: true }); })}
            className="h-12 w-full rounded-2xl bg-destructive font-semibold text-white disabled:opacity-40">Delete account</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
