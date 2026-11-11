import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import MingBust from "@/components/MingBust";
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

  return <div className="grid min-h-dvh place-items-center"><MingBust name="Joining…" className="w-24 animate-pulse" /></div>;
}
