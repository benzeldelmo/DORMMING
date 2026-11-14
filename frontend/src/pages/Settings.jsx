import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import DormQr from "@/components/DormQr";
import { useGet, useSend } from "@/lib/queries";
import { logOut } from "@/lib/auth";

/** Your dorm (code and members), leave the dorm, log out. */
export default function Settings() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const me = useGet("/me", { refetchInterval: false });
  const dorm = useGet("/dorms/current");
  const send = useSend();

  const leave = async () => {
    try {
      await send.mutateAsync({ path: "/dorms/current/leave" });
      toast.success("You left the dorm");
      navigate("/setup/dorm", { replace: true });
    } catch (e) {
      toast.error(e.message);
    }
  };
  const signOut = () => {
    logOut();
    client.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <PageHeader title="Settings" back />
      <div className="mx-auto max-w-[640px] space-y-6 px-5 pb-10">
        {me.data && (
          <section className="card-surface flex items-center gap-3 p-5">
            <span className="grid size-12 place-items-center rounded-full bg-olive-soft text-lg font-bold text-olive">{me.data.initials}</span>
            <span className="min-w-0">
              <span className="block truncate font-heading text-lg font-extrabold">{me.data.displayName}</span>
              <span className="block truncate text-sm text-muted-foreground">{me.data.email}</span>
            </span>
          </section>
        )}

        {dorm.data && (
          <section aria-labelledby="dorm-title" className="card-surface p-5">
            <h2 id="dorm-title" className="truncate font-heading text-lg font-extrabold">{dorm.data.name}</h2>
            <div className="mt-4"><DormQr code={dorm.data.inviteCode} size={148} /></div>
            <ul className="mt-4 divide-y">
              {dorm.data.members.map((m) => (
                <li key={m.user.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-semibold">{m.user.initials}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{m.user.displayName}{m.user.id === me.data?.id && " (you)"}</span>
                  {m.role === "CREATOR" && <span className="rounded-full bg-olive-soft px-2 py-0.5 text-xs font-semibold text-olive">Creator</span>}
                </li>
              ))}
            </ul>
            <button type="button" onClick={leave} disabled={send.isPending}
              className="mt-3 h-12 w-full rounded-2xl bg-destructive/10 font-semibold text-destructive">Leave dorm</button>
            <p className="mt-2 text-center text-xs text-muted-foreground">You can leave once nobody owes you and you owe nobody.</p>
          </section>
        )}

        <button type="button" onClick={signOut}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-card font-semibold shadow-[var(--shadow-card)]">
          <LogOut className="size-4" />Log out
        </button>
      </div>
    </div>
  );
}
