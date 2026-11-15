import { Link } from "react-router-dom";
import { RotateCw } from "lucide-react";
import Ming from "./Ming";

/** What each kind of problem says. Ming is worried, the copy says what happened and what to do. */
const COPY = {
  offline: { title: "You're offline", body: "DormMing needs the internet to keep your dorm's numbers in sync. Connect to Wi-Fi or mobile data and it comes back on its own." },
  server: { title: "Can't reach DormMing", body: "The server didn't answer. It may be restarting. Try again in a moment." },
  crash: { title: "Something went wrong", body: "This screen hit a problem. Your records are safe. Go back home and try again." },
  notfound: { title: "Page not found", body: "This link doesn't go anywhere. It may be old or typed wrong." },
};

/** A full screen for when the app can't show what you asked for: offline, server down, a crash, or a bad link. */
export default function ErrorScreen({ kind = "server", onRetry }) {
  const { title, body } = COPY[kind];
  return (
    <main role="alert" className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 pt-[env(safe-area-inset-top)] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center">
      <Ming mood="WORRIED" className="w-[200px]" />
      <h1 className="mt-4 font-heading text-[26px] leading-tight font-extrabold">{title}</h1>
      <p className="mt-2 max-w-[340px] text-[16px] leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-7 flex w-full max-w-[320px] flex-col gap-2.5">
        {onRetry && (
          <button type="button" onClick={onRetry} className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-olive font-heading text-[17px] font-bold text-white active:scale-[0.98]">
            <RotateCw aria-hidden className="size-5" />Try again
          </button>
        )}
        {kind !== "offline" && (
          <Link to="/home" reloadDocument={kind === "crash"} className="flex h-[52px] items-center justify-center rounded-2xl font-heading text-[17px] font-bold text-olive-ink ring-1 ring-border">Go to Home</Link>
        )}
      </div>
    </main>
  );
}
