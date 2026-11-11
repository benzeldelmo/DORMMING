import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { isLoggedIn, setPending } from "@/lib/auth";

/** Opened from a card's QR. Connects both people straight away. */
export default function AddFriend() {
  const { code } = useParams();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!isLoggedIn()) {
      setPending(`/add/${code}`);
      navigate("/signup", { replace: true });
      return;
    }
    api("/friends", { method: "POST", body: { friendCode: code } })
      .then((friend) => toast.success(`You and ${friend.displayName} are now friends`))
      .catch((err) => toast.error(err.message))
      .finally(() => navigate("/card", { replace: true }));
  }, [code, navigate]);

  return <div className="grid min-h-dvh place-items-center"><img src="/brand/ming-mascot.png" alt="Adding friend…" className="pixelated size-20 animate-pulse" /></div>;
}
