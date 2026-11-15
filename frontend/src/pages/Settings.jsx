import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, Camera, ChevronRight, CircleHelp, Copy, DoorOpen, FileText, Info, KeyRound, LockKeyhole, LogOut, Moon, QrCode, Shield, Sparkles, Trash2, Users, UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import Avatar from "@/components/Avatar";
import DormQr from "@/components/DormQr";
import PinSetup from "@/components/PinSetup";
import { Segmented, Switch } from "@/components/forms";
import { api } from "@/lib/api";
import { useGet, useSend } from "@/lib/queries";
import { logOut } from "@/lib/auth";
import { getReduceMotion, setReduceMotion } from "@/lib/motion";
import { getTheme, setTheme } from "@/lib/theme";
import { getRemindDays, setRemindDays } from "@/lib/prefs";
import { clearPasscode, hasPasscode, pinApplies } from "@/lib/passcode";
import { cn } from "@/lib/utils";
import { useIsDesktop } from "@/lib/useMedia";
import { squarePhoto } from "@/lib/photo";
import { copyCode } from "@/lib/qr";

/*
 * Settings on one page, like a phone's settings app: small gray section titles over white groups of rows.
 * Everything is changed right here (theme, reminders, PIN, dorm name); only links leave the page.
 */

/** A section: its small gray title, then one white rounded group of rows, then an optional note. */
function Section({ title, note, children }) {
  return (
    <section aria-label={title}>
      {title && <h2 className="mb-2 px-4 text-[13px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">{title}</h2>}
      <div className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)]">{children}</div>
      {note && <p className="px-4 pt-2 text-[13px] text-muted-foreground">{note}</p>}
    </section>
  );
}

/** One row, at least 52px tall: a gray icon, the label, then a value, a control or a chevron. */
function Row({ icon: Icon, label, value, to, onClick, danger, children }) {
  const Tag = to ? Link : onClick ? "button" : "div";
  return (
    <Tag to={to} type={onClick ? "button" : undefined} onClick={onClick}
      className={cn("flex min-h-[52px] w-full items-center gap-3 px-4 text-left text-[16px] font-medium", (to || onClick) && "active:bg-secondary")}>
      {Icon && <Icon aria-hidden className={cn("size-5 shrink-0", danger ? "text-destructive" : "text-muted-foreground")} />}
      <span className={cn("min-w-0 flex-1 py-2 break-words", danger && "text-destructive")}>{label}</span>
      {value && <span className="min-w-0 text-right text-[15px] break-words text-muted-foreground">{value}</span>}
      {children}
      {to && <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-foreground" />}
    </Tag>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const me = useGet("/me", { refetchInterval: false });
  const desktop = useIsDesktop(); // Settings is in the sidebar there, so no back arrow
  const dorm = useGet("/dorms/current");
  const send = useSend();

  const [theme, setThemeState] = useState(getTheme);
  const [calm, setCalm] = useState(getReduceMotion);
  const [days, setDays] = useState(getRemindDays);
  const [pinOn, setPinOn] = useState(hasPasscode);
  const [settingPin, setSettingPin] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [name, setName] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const forget = () => { logOut(); clearPasscode(); client.clear(); };
  const run = async (req, ok, after) => {
    try { await send.mutateAsync(req); toast.success(ok); after?.(); } catch (e) { toast.error(e.message); }
  };

  const savePhoto = (photo, ok) => run({ path: "/me/photo", method: "PUT", body: { photo } }, ok);
  async function pickPhoto(file) {
    if (!file) return;
    try { await savePhoto(await squarePhoto(file), "Photo updated"); } catch (e) { toast.error(e.message); }
  }

  async function deleteAccount() {
    if (!confirm("Delete your account? Your login, your bills and your place in the dorm go away. This can't be undone.")) return;
    setDeleting(true);
    try {
      // Called directly: after the account is gone, refetching anything would only fail
      await api("/me", { method: "DELETE" });
      forget();
      toast.success("Your account was deleted");
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(e.message);
      setDeleting(false);
    }
  }

  if (settingPin) {
    return <PinSetup onCancel={() => setSettingPin(false)} onDone={() => { setSettingPin(false); setPinOn(true); toast.success("PIN set"); }} />;
  }
  if (!me.data) return null;
  const d = dorm.data;
  const creator = d?.myRole === "CREATOR";
  const renamed = name !== null && name.trim() && name.trim() !== d?.name;

  const pickInput = <input type="file" accept="image/*" className="sr-only" onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />;
  const setThemeTo = (t) => { setTheme(t); setThemeState(t); };

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <PageHeader title="Settings" back={!desktop} />
      <div className="space-y-6 px-5 pb-10">
        {/* You: tap your photo to change it */}
        <div className="flex items-center gap-4 px-1">
          <label className="relative shrink-0 cursor-pointer rounded-full" aria-label={me.data.photo ? "Change your photo" : "Add a photo"}>
            <Avatar user={me.data} className="size-16 text-2xl" />
            <span className="absolute -right-0.5 -bottom-0.5 grid size-7 place-items-center rounded-full bg-olive text-white ring-2 ring-background"><Camera aria-hidden className="size-3.5" /></span>
            {pickInput}
          </label>
          <span className="min-w-0">
            <span className="block font-heading text-[22px] leading-tight font-extrabold break-words">{me.data.displayName}</span>
            <span className="block text-[15px] break-all text-muted-foreground">{me.data.email}</span>
            {me.data.photo && <button type="button" onClick={() => savePhoto(null, "Photo removed")} className="mt-0.5 text-[14px] font-semibold text-muted-foreground underline underline-offset-2">Remove photo</button>}
          </span>
        </div>

        <Section title="Preferences">
          <Row icon={Moon} label="Theme">
            <span className="w-[196px]"><Segmented label="Theme" value={theme} onChange={setThemeTo}
              options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "Auto" }]} /></span>
          </Row>
          <div className="space-y-2.5 px-4 py-3">
            <span className="flex items-center gap-3 text-[16px] font-medium"><Bell aria-hidden className="size-5 text-muted-foreground" />Remind me about bills</span>
            <Segmented label="Remind me about bills" value={String(days)} onChange={(v) => { setRemindDays(Number(v)); setDays(Number(v)); }}
              options={[{ value: "1", label: "1 day before" }, { value: "2", label: "2 days before" }, { value: "3", label: "3 days before" }]} />
          </div>
          {pinApplies() && <Row icon={LockKeyhole} label="Lock with a PIN">
            <Switch label="Lock with a PIN" on={pinOn} onChange={(v) => {
              if (v) return setSettingPin(true);
              clearPasscode(); setPinOn(false); toast.success("PIN turned off");
            }} />
          </Row>}
          {pinApplies() && pinOn && <Row icon={KeyRound} label="Change PIN" onClick={() => setSettingPin(true)} />}
          <Row icon={Sparkles} label="Less animation">
            <Switch label="Less animation" on={calm} onChange={(v) => { setReduceMotion(v); setCalm(v); }} />
          </Row>
        </Section>

        {d && (
          <Section title="Your dorm">
            {creator ? (
              <form className="flex min-h-[52px] items-center gap-3 px-4" noValidate
                onSubmit={(e) => { e.preventDefault(); if (renamed) run({ path: "/dorms/current", method: "PATCH", body: { name } }, "Dorm renamed", () => setName(null)); }}>
                <Users aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                <label className="sr-only" htmlFor="dorm-name">Dorm name (tap to rename)</label>
                <input id="dorm-name" value={name ?? d.name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent py-3 text-[16px] font-medium outline-none" />
                {renamed ? <button type="submit" disabled={send.isPending} className="h-9 rounded-full bg-olive px-4 text-[14px] font-bold text-white">Save</button>
                  : <span className="text-[14px] text-muted-foreground">Tap to rename</span>}
              </form>
            ) : (
              <Row icon={Users} label={d.name} />
            )}
            <Row icon={UsersRound} label="Members">
              <span className="flex -space-x-2">{d.members.slice(0, 5).map((m) => <Avatar key={m.user.id} user={m.user} className="size-8 text-[12px] ring-2 ring-card" />)}</span>
              <span className="text-[15px] text-muted-foreground">{d.members.length}</span>
            </Row>
            <Row icon={Copy} label="Invite code" onClick={() => copyCode(d.inviteCode, toast)}>
              <span className="font-heading text-[16px] font-extrabold tracking-[0.14em] tabular-nums">{d.inviteCode}</span>
            </Row>
            <Row icon={QrCode} label={showQr ? "Hide QR code" : "Show QR code"} onClick={() => setShowQr(!showQr)} />
            {showQr && <div className="p-3"><DormQr code={d.inviteCode} size={150} /></div>}
          </Section>
        )}

        <Section title="Help & info">
          <Row icon={CircleHelp} label="Questions & answers" to="/help" />
          <Row icon={Shield} label="Privacy Policy" to="/privacy" />
          <Row icon={FileText} label="Terms of Service" to="/terms" />
          <Row icon={Info} label="DormMing 1.0" value="by MING Dynasty" />
        </Section>

        <Section>
          <Row icon={LogOut} label="Log out" danger onClick={() => { forget(); navigate("/login", { replace: true }); }} />
          {d && <Row icon={DoorOpen} label="Leave dorm" danger onClick={() => run({ path: "/dorms/current/leave" }, "You left the dorm", () => navigate("/setup/dorm", { replace: true }))} />}
          <Row icon={Trash2} label={deleting ? "Deleting…" : "Delete account"} danger onClick={deleting ? undefined : deleteAccount} />
        </Section>
      </div>
    </div>
  );
}
