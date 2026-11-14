import { Link } from "react-router-dom";
import Ming from "./Ming";

/**
 * Log-in, sign-up and dorm setup frame.
 * Laptop: an olive panel with Ming beside the form. Phone: the form sits in a card with Ming peeking over its top edge.
 */
export default function AuthFrame({ title, subtitle, mood = "HAPPY", children, footer }) {
  return (
    <div className="min-h-dvh bg-olive lg:grid lg:grid-cols-2">
      <aside className="hidden flex-col items-center justify-center gap-8 px-10 text-center text-white lg:flex">
        {/* The bust's bottom edge is a straight cut; the circle's curve hides it, so the image sits flush with the circle's bottom. */}
        <span className="flex size-[300px] items-end justify-center overflow-hidden rounded-full bg-white/12 ring-1 ring-white/20">
          <Ming mood={mood} bust className="w-[90%] translate-x-[3%]" />
        </span>
        <div className="flex flex-col items-center gap-3">
          <img src="/brand/dormming-logo.png" alt="DormMing" className="h-16 w-auto" />
          <p className="max-w-xs text-lg text-white/85">Your dorm's money, in one place.</p>
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col items-center justify-center px-4 pt-[calc(7rem+env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] lg:justify-center lg:bg-card lg:px-10 lg:pt-10">
        <div className="relative w-full max-w-[440px] rounded-3xl bg-card px-6 pt-8 pb-7 shadow-[0_20px_50px_-24px_rgb(36_7_2/0.6)] lg:max-w-[400px] lg:rounded-none lg:p-0 lg:shadow-none">
          {/* The bust's straight bottom edge sits exactly on the card's top edge, so Ming peeks over it. */}
          <Ming mood={mood} bust className="absolute bottom-full left-1/2 w-[132px] -translate-x-[46%] lg:hidden" />
          <Link to="/" className="mb-12 hidden w-fit lg:block" aria-label="DormMing home"><img src="/brand/dormming-logo.png" alt="DormMing" className="h-10 w-auto" /></Link>
          {title && (
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-[32px] leading-[1.1] font-black tracking-[-0.02em] text-balance">{title}</h1>
              {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          <div className="space-y-5">{children}</div>
          {footer && <div className="mt-5 text-center text-[15px] text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
