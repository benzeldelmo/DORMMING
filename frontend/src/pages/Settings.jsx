import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, CreditCard, LogOut, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import { Field, PrimaryButton, Segmented } from "@/components/forms";
import { useGet, useSend } from "@/lib/queries";
import { logOut } from "@/lib/auth";

export default function Settings() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const me = useGet("/me", { refetchInterval: false });
  const dorm = useGet("/dorms/current");
  const send = useSend();
  const [profile, setProfile] = useState(null);

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
  const isCreator = dorm.data?.myRole === "CREATOR";

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <PageHeader title="Settings" back />
      <div className="space-y-7 px-5">
        <Link to="/card" className="flex items-center gap-3 rounded-2xl bg-olive-soft p-3">
          <span className="grid size-11 place-items-center rounded-xl bg-olive text-white"><CreditCard className="size-5" /></span>
          <span className="flex-1"><span className="block font-heading font-bold">My card & friends</span><span className="text-xs text-muted-foreground">Your QR, friend code and friends list</span></span>
          <ChevronRight className="size-5 text-foreground/50" />
        </Link>

        {profile && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run({ path: "/me", method: "PATCH", body: profile }, "Profile saved"); }}>
            <h2 className="font-heading text-lg font-bold">Profile</h2>
            <Field label="Your name" value={profile.displayName} maxLength={40} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} />
            <Field label="Ming's name" value={profile.mingName} maxLength={20} onChange={(e) => setProfile({ ...profile, mingName: e.target.value })} />
            <div className="space-y-1.5">
              <p className="text-[13px] font-medium text-foreground/80">Card color</p>
              <Segmented label="Card color" value={profile.cardColor} onChange={(cardColor) => setProfile({ ...profile, cardColor })}
                options={[{ value: "OLIVE", label: "Olive" }, { value: "ORANGE", label: "Orange" }, { value: "YELLOW", label: "Yellow" }]} />
            </div>
            <PrimaryButton type="submit" busy={send.isPending}>Save profile</PrimaryButton>
          </form>
        )}

        {dorm.data && (
          <section className="space-y-4">
            <h2 className="font-heading text-lg font-bold">{dorm.data.name}</h2>
            <div className="flex items-center gap-4 rounded-[22px] bg-secondary p-4">
              <span className="rounded-xl bg-white p-2"><QRCodeSVG value={dorm.data.joinUrl} size={84} fgColor="#240702" /></span>
              <span className="flex-1">
                <span className="block text-xs text-muted-foreground">Dorm code</span>
                <span className="block font-heading text-2xl font-extrabold tracking-[0.18em]">{dorm.data.inviteCode}</span>
                {isCreator && (
                  <button type="button" onClick={() => run({ path: "/dorms/current/code" }, "New code made. The old one stops working.")}
                    className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-olive"><RefreshCw className="size-3.5" />New code</button>
                )}
              </span>
            </div>
            <ul className="divide-y rounded-2xl bg-secondary px-4">
              {dorm.data.members.map((m) => (
                <li key={m.user.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid size-9 place-items-center rounded-full bg-white text-sm font-semibold">{m.user.initials}</span>
                  <span className="flex-1 font-medium">{m.user.displayName}{m.user.id === me.data?.id && " (you)"}</span>
                  {m.role === "CREATOR" && <span className="rounded-full bg-olive-soft px-2 py-0.5 text-xs font-semibold text-olive">Creator</span>}
                  {isCreator && m.user.id !== me.data?.id && (
                    <button type="button" onClick={() => run({ path: `/dorms/current/members/${m.user.id}`, method: "DELETE" }, `${m.user.displayName} removed`)}
                      className="text-sm font-semibold text-destructive">Remove</button>
                  )}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => run({ path: "/dorms/current/leave" }, "You left the dorm", () => navigate("/setup/dorm", { replace: true }))}
              className="h-12 w-full rounded-2xl bg-destructive/10 font-semibold text-destructive">Leave dorm</button>
          </section>
        )}

        <button type="button" onClick={() => { logOut(); client.clear(); navigate("/login", { replace: true }); }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary font-semibold"><LogOut className="size-4" />Log out</button>
      </div>
    </div>
  );
}
