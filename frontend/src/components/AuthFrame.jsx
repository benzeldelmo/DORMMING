import { Link } from "react-router-dom";
import { Column } from "./AppShell";

/** Logo, waving Ming and a heading above an auth form. */
export default function AuthFrame({ title, subtitle, children, footer }) {
  return (
    <Column className="gap-7">
      <Link to="/" aria-label="DormMing home" className="self-center">
        <img src="/brand/dormming-logo.png" alt="DormMing" className="h-12 w-auto" />
      </Link>
      <div className="flex items-end gap-3">
        <img src="/brand/ming-mascot.png" alt="" className="pixelated -mb-1 size-24 shrink-0" />
        <div className="pb-2">
          <h1 className="font-heading text-[28px] font-extrabold leading-[1.05]">{title}</h1>
          {subtitle && <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
      {footer && <div className="mt-auto pt-4 text-center text-[15px] text-muted-foreground">{footer}</div>}
    </Column>
  );
}
