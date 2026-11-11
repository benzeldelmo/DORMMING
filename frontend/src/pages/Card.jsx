import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import DigitalCard from "@/components/DigitalCard";
import { Empty } from "@/components/Rows";
import { useGet, useSend } from "@/lib/queries";

export default function Card() {
  const card = useGet("/card");
  const friends = useGet("/friends");
  const dorm = useGet("/dorms/current", { refetchInterval: false });
  const dormmates = new Set(dorm.data?.members.map((m) => m.user.id) ?? []);
  const send = useSend();
  const [code, setCode] = useState("");

  async function add(e) {
    e.preventDefault();
    try {
      const friend = await send.mutateAsync({ path: "/friends", body: { friendCode: code } });
      toast.success(`You and ${friend?.displayName ?? "your friend"} are now friends`);
      setCode("");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function invite(friend) {
    try {
      await send.mutateAsync({ path: "/dorms/current/invites", body: { friendId: friend.id } });
      toast.success(`Invite sent to ${friend.displayName}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="My card" back />
      <div className="space-y-6 px-5">
        {card.data && <DigitalCard card={card.data} />}
        <p className="-mt-3 text-center text-xs text-muted-foreground">Tap the card to show your friend QR.</p>

        <section>
          <h2 className="mb-2 px-1 font-heading text-[17px] font-bold">Friends</h2>
          <ul className="space-y-2">
            {friends.data?.map((f) => (
              <li key={f.id} className="flex items-center gap-3 rounded-2xl bg-secondary px-3 py-2.5">
                <span className="grid size-10 place-items-center rounded-full bg-white font-semibold">{f.initials}</span>
                <span className="flex-1 font-semibold">{f.displayName}</span>
                {dormmates.has(f.id)
                  ? <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground">Dormmate</span>
                  : <button type="button" onClick={() => invite(f)} className="rounded-full bg-olive-soft px-3 py-1.5 text-sm font-semibold text-olive">Invite to dorm</button>}
              </li>
            ))}
            {friends.data && !friends.data.length && <Empty>No friends yet. Scan a dormmate's card, or add their code below.</Empty>}
          </ul>
        </section>

        <form onSubmit={add} className="flex gap-2">
          <label className="flex-1">
            <span className="sr-only">Friend code</span>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} maxLength={8} placeholder="Friend code"
              className="h-12 w-full rounded-2xl bg-secondary px-4 font-heading font-bold tracking-[0.15em] outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:ring-2 focus:ring-olive/50" />
          </label>
          <button type="submit" disabled={code.length !== 8 || send.isPending} className="flex h-12 items-center gap-2 rounded-2xl bg-olive px-4 font-semibold text-white disabled:opacity-50">
            <UserPlus className="size-4" />Add
          </button>
        </form>
      </div>
    </div>
  );
}
