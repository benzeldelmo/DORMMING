import { useEffect, useState } from "react";
import LockScreen from "./LockScreen";
import { hasPasscode, isUnlocked, pinApplies } from "@/lib/passcode";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import AddRecordSheet from "./AddRecordSheet";
import { useGet } from "@/lib/queries";
import { isLoggedIn } from "@/lib/auth";
import { useIsDesktop } from "@/lib/useMedia";
import { useOnline } from "@/lib/useOnline";
import ErrorScreen from "./ErrorScreen";
import PinOffer from "./PinOffer";

/** Frame for logged-in screens: floating pill bar on phones, sidebar on laptops. Sends you to log in or pick a dorm first. */
export default function AppShell() {
  const [adding, setAdding] = useState(false);
  const [locked, setLocked] = useState(() => pinApplies() && hasPasscode() && !isUnlocked());
  const { pathname } = useLocation();
  const isDesktop = useIsDesktop();
  // Laptop shortcut: N opens New record (not while typing in a field)
  useEffect(() => {
    if (!isDesktop) return;
    const onKey = (e) => {
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      setAdding(true);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [isDesktop]);
  const me = useGet("/me", { enabled: isLoggedIn(), refetchInterval: false });
  const dorm = useGet("/dorms/current", { enabled: Boolean(me.data?.dormId) });
  const online = useOnline();
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />;
  // Offline before anything loaded: nothing to show. Offline later: keep the page (and any half-typed form) and say so.
  if (!online && !me.data) return <ErrorScreen kind="offline" />;
  if (me.isError) return <ErrorScreen kind="server" onRetry={() => me.refetch()} />;
  if (me.isPending) return <div role="status" className="grid min-h-dvh place-items-center text-[15px] font-semibold text-muted-foreground">Loading…</div>;
  if (me.data && !me.data.dormId) return <Navigate to="/setup/dorm" replace />;
  const openAdd = () => setAdding(true);
  return (
    <div className="min-h-dvh bg-background pt-[env(safe-area-inset-top)]">
      {/* The server stopped answering mid-use: keep the last numbers on screen and say so */}
      {(!online || dorm.error?.unreachable) && (
        <p role="status" className="sticky top-0 z-40 bg-orange-soft px-5 py-2.5 text-center text-[14px] font-semibold text-orange-ink lg:pl-[248px]">
          {online ? "Can't reach DormMing." : "You're offline."} Showing your last numbers.
        </p>
      )}
      <Sidebar onAdd={openAdd} />
      {/* bottom padding clears the floating bar plus the home indicator */}
      <main className="pb-[calc(6.25rem+env(safe-area-inset-bottom))] lg:pb-12 lg:pl-[248px]">
        {/* Keyed by page, so each page's content eases in when you open or switch to it */}
        <div key={pathname} className="page-enter mx-auto max-w-[640px] lg:max-w-[1120px] lg:px-3">
          <Outlet context={{ me: me.data, dorm: dorm.data, isDesktop, openAdd }} />
        </div>
      </main>
      {/* Phones: the + menu pops out of the nav. Laptops: the same actions in a side panel. */}
      <BottomNav open={adding && !isDesktop} onOpenChange={setAdding} />
      <PinOffer />
      <AddRecordSheet open={adding && isDesktop} onOpenChange={setAdding} side={isDesktop ? "right" : "bottom"} />
    </div>
  );
}
