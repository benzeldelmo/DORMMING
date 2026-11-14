import { Navigate, Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import MingBust from "./MingBust";
import { useGet } from "@/lib/queries";
import { isLoggedIn } from "@/lib/auth";
import { useIsDesktop } from "@/lib/useMedia";

/** Frame for logged-in screens: bottom bar on phones, sidebar on laptops. Sends you to log in or pick a dorm first. */
export default function AppShell() {
  const isDesktop = useIsDesktop();
  const me = useGet("/me", { enabled: isLoggedIn(), refetchInterval: false });
  const dorm = useGet("/dorms/current", { enabled: Boolean(me.data?.dormId) });
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (me.isPending) return <div className="grid min-h-dvh place-items-center"><MingBust className="w-24 animate-pulse" /></div>;
  if (me.data && !me.data.dormId) return <Navigate to="/setup/dorm" replace />;
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar dorm={dorm.data} />
      <main className="pb-24 lg:pb-12 lg:pl-[248px]">
        <div className="mx-auto max-w-[640px] lg:max-w-[1120px] lg:px-3">
          <Outlet context={{ me: me.data, isDesktop }} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
