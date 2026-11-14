import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import AddRecordSheet from "./AddRecordSheet";
import { useGet } from "@/lib/queries";
import { isLoggedIn } from "@/lib/auth";
import { useIsDesktop } from "@/lib/useMedia";

/** Frame for logged-in screens: floating pill bar on phones, sidebar on laptops. Sends you to log in or pick a dorm first. */
export default function AppShell() {
  const [adding, setAdding] = useState(false);
  const isDesktop = useIsDesktop();
  const me = useGet("/me", { enabled: isLoggedIn(), refetchInterval: false });
  const dorm = useGet("/dorms/current", { enabled: Boolean(me.data?.dormId) });
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (me.isPending) return <div role="status" className="grid min-h-dvh place-items-center text-[15px] font-semibold text-muted-foreground">Loading…</div>;
  if (me.data && !me.data.dormId) return <Navigate to="/setup/dorm" replace />;
  const openAdd = () => setAdding(true);
  return (
    <div className="min-h-dvh bg-background pt-[env(safe-area-inset-top)]">
      <Sidebar dorm={dorm.data} onAdd={openAdd} />
      {/* bottom padding clears the floating bar plus the home indicator */}
      <main className="pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-12 lg:pl-[248px]">
        <div className="mx-auto max-w-[640px] lg:max-w-[1120px] lg:px-3">
          <Outlet context={{ me: me.data, dorm: dorm.data, isDesktop, openAdd }} />
        </div>
      </main>
      <BottomNav onAdd={openAdd} />
      <AddRecordSheet open={adding} onOpenChange={setAdding} side={isDesktop ? "right" : "bottom"} />
    </div>
  );
}
