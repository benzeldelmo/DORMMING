import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import AddRecordSheet from "./AddRecordSheet";
import { useGet } from "@/lib/queries";
import { isLoggedIn } from "@/lib/auth";

/** Logged-in, in-a-dorm screens: a phone-width column with the bottom bar. */
export default function AppShell() {
  const [adding, setAdding] = useState(false);
  const me = useGet("/me", { enabled: isLoggedIn(), refetchInterval: false });
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (me.isPending) return <div className="grid min-h-dvh place-items-center"><img src="/brand/ming-mascot.png" alt="" className="pixelated size-20 animate-pulse" /></div>;
  if (me.data && !me.data.dormId) return <Navigate to="/setup/dorm" replace />;
  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-background pb-28 shadow-[0_0_60px_-30px_rgb(0_0_0/0.3)]">
      <Outlet context={{ me: me.data, openAdd: () => setAdding(true) }} />
      <BottomNav onAdd={() => setAdding(true)} />
      <AddRecordSheet open={adding} onOpenChange={setAdding} />
    </div>
  );
}

/** Pages outside the app shell (auth, setup) use the same column without the bar. */
export function Column({ children, className = "" }) {
  return <main className={`mx-auto flex min-h-dvh max-w-[480px] flex-col bg-background px-6 py-8 ${className}`}>{children}</main>;
}
