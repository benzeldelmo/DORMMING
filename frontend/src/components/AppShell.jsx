import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import AddRecordSheet from "./AddRecordSheet";
import MingBust from "./MingBust";
import { useGet } from "@/lib/queries";
import { isLoggedIn } from "@/lib/auth";
import { useIsDesktop } from "@/lib/useMedia";

/** Logged-in, in-a-dorm screens: bottom bar on phones, sidebar on desktop. */
export default function AppShell() {
  const [adding, setAdding] = useState(false);
  const isDesktop = useIsDesktop();
  const me = useGet("/me", { enabled: isLoggedIn(), refetchInterval: false });
  const dorm = useGet("/dorms/current", { enabled: Boolean(me.data?.dormId) });
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (me.isPending) return <div className="grid min-h-dvh place-items-center"><MingBust className="w-24 animate-pulse" /></div>;
  if (me.data && !me.data.dormId) return <Navigate to="/setup/dorm" replace />;
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar dorm={dorm.data} onAdd={() => setAdding(true)} />
      <main className="pb-28 lg:pb-12 lg:pl-[248px]">
        <div className="mx-auto max-w-[640px] lg:max-w-[1120px] lg:px-3">
          <Outlet context={{ me: me.data, isDesktop, openAdd: () => setAdding(true) }} />
        </div>
      </main>
      <BottomNav onAdd={() => setAdding(true)} />
      <AddRecordSheet open={adding} onOpenChange={setAdding} side={isDesktop ? "right" : "bottom"} />
    </div>
  );
}

/** Pages outside the app shell use the same column without the bar. */
export function Column({ children, className = "" }) {
  return <main className={`mx-auto flex min-h-dvh max-w-[480px] flex-col bg-background px-6 py-8 ${className}`}>{children}</main>;
}
