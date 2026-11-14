import { Link } from "react-router-dom";
import MingBust from "./MingBust";

const DOTS = "[background-image:radial-gradient(rgb(255_255_255/0.12)_1.3px,transparent_1.3px)] [background-size:16px_16px]";

/**
 * Sign-up, log-in and setup frame. Desktop: olive art panel beside the form.
 * Phone: the olive panel is the background and the form sits in a white card with Ming peeking over it.
 */
export default function AuthFrame({ title, subtitle, children, footer }) {
  return (
    <div className={`min-h-dvh bg-olive ${DOTS} lg:grid lg:grid-cols-2 lg:bg-none`}>
      <aside className={`relative hidden flex-col items-center justify-center overflow-hidden bg-olive px-10 text-center text-white lg:flex ${DOTS}`}>
        {/* The bust is wider than the circle so its cut edge sits on the circle's curve. */}
        <span className="flex size-[300px] items-end justify-center overflow-hidden rounded-full bg-white/12 ring-1 ring-white/20">
          <MingBust className="w-[340px] shrink-0 translate-y-[2px]" />
        </span>
        <img src="/brand/dormming-logo.png" alt="DormMing" className="mt-10 h-16 w-auto" />
        <p className="mt-3 max-w-xs text-lg text-white/85">Your dorm's money, in one place.</p>
      </aside>

      <main className="flex min-h-dvh flex-col items-center px-4 pt-28 pb-10 lg:justify-center lg:bg-card lg:px-10 lg:pt-10">
        <div className="relative w-full max-w-[440px] rounded-[28px] bg-card px-6 pt-14 pb-7 shadow-[0_20px_50px_-24px_rgb(36_7_2/0.6)] lg:max-w-[400px] lg:rounded-none lg:p-0 lg:shadow-none">
          <MingBust className="absolute -top-[86px] left-1/2 w-[120px] -translate-x-1/2 lg:hidden" />
          <Link to="/login" className="mb-12 hidden w-fit lg:block" aria-label="DormMing"><img src="/brand/dormming-logo.png" alt="DormMing" className="h-10 w-auto" /></Link>
          {title && (
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-[32px] leading-[1.1] font-black tracking-[-0.02em]">{title}</h1>
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
