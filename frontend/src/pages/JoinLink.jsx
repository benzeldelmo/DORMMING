import { useEffect, useRef } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { codeFromQr } from "@/lib/qr";

export const PENDING_JOIN = "dormming.joinCode";

/** Where a scanned dorm QR lands (/join/AB3C9D): joins straight away, or keeps the code for after sign-up. */
export default function JoinLink() {
  const { code: raw } = useParams();
  const navigate = useNavigate();
  const code = codeFromQr(raw);
  const started = useRef(false);

  useEffect(() => {
    if (!code || !isLoggedIn() || started.current) return;
    started.current = true;
    api("/dorms/join", { method: "POST", body: { code } })
      .then(() => { toast.success("You joined the dorm"); navigate("/home", { replace: true }); })
      .catch((e) => { toast.error(e.message); navigate("/setup/dorm", { replace: true }); });
  }, [code, navigate]);

  if (!code) return <Navigate to="/" replace />;
  if (!isLoggedIn()) {
    try { sessionStorage.setItem(PENDING_JOIN, code); } catch { /* private mode: the code is typed in later */ }
    return <Navigate to="/signup" replace />;
  }
  return <div role="status" className="grid min-h-dvh place-items-center text-[15px] font-semibold text-muted-foreground">Joining {code}…</div>;
}
