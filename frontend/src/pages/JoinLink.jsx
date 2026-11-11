import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { isLoggedIn, setPending } from "@/lib/auth";

/** Opened from a dorm QR. Logged out: sign up first, then come back here. */
export default function JoinLink() {
  const { code } = useParams();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!isLoggedIn()) {
      setPending(`/join/${code}`);
      navigate("/signup", { replace: true });
      return;
    }
    api("/dorms/join", { method: "POST", body: { code } })
      .then(() => navigate("/home", { replace: true }))
      .catch((err) => {
        toast.error(err.message);
        navigate("/setup/dorm", { replace: true });
      });
  }, [code, navigate]);

  return <div className="grid min-h-dvh place-items-center"><img src="/brand/ming-mascot.png" alt="Joining…" className="pixelated size-20 animate-pulse" /></div>;
}
