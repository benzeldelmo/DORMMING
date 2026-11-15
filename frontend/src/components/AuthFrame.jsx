import { Link } from "react-router-dom";
import Ming from "./Ming";
import Sentences from "./Sentences";

/**
 * Log-in, sign-up and dorm setup frame.
 * Laptop: an olive panel with Ming beside the form. Phone: the form sits in a card with Ming peeking over its top edge.
 */
export default function AuthFrame({ title, subtitle, mood = "HAPPY", children, footer }) {
  return (
    <div className="auth-ground cutting-mat mat-drift min-h-dvh lg:grid lg:grid-cols-2">
      <aside className="hidden flex-col items-center justify-center gap-8 px-10 text-center text-white lg:flex">
        {/* Laptop: the app icon, cleaner than a loose mascot beside a form */}
        <img src="/brand/app-icon.png" alt="" className="size-40 rounded-[40px] shadow-[0_24px_48px_-20px_rgb(0_0_0/0.55)]" />
        <div className="flex flex-col items-center gap-3">
          <img src="/brand/dormming-logo.png" alt="DormMing" className="h-16 w-auto" />
          <p className="max-w-xs text-lg font-semibold text-white/90">Your Digital Dormmate Companion</p>
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col items-center justify-center px-4 pt-[calc(7rem+env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] lg:justify-center lg:bg-card lg:px-10 lg:pt-10">
        <div className="relative w-full max-w-[440px] rounded-3xl bg-card px-6 pt-8 pb-7 shadow-[0_20px_50px_-24px_rgb(36_7_2/0.6)] lg:max-w-[400px] lg:rounded-none lg:p-0 lg:shadow-none">
          {/* Ming's art ends in a straight line at the bottom; it sits exactly on the card's top edge, so he peeks over it. */}
          <Ming mood={mood} className="absolute bottom-full left-1/2 w-[168px] -translate-x-1/2 lg:hidden" />
          <Link to="/" className="mb-12 hidden w-fit lg:block" aria-label="DormMing home"><img src="/brand/dormming-logo.png" alt="DormMing" className="h-10 w-auto" /></Link>
          {title && (
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-[32px] leading-[1.1] font-black tracking-[-0.02em]"><Sentences>{title}</Sentences></h1>
              {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground"><Sentences>{subtitle}</Sentences></p>}
            </div>
          )}
          <div className="space-y-5">{children}</div>
          {footer && <div className="mt-5 text-center text-[15px] text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
