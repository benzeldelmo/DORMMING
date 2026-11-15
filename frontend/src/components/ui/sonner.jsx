import { Toaster as Sonner } from "sonner";
import { CircleAlert, CircleCheck, Info, Loader2, TriangleAlert } from "lucide-react";

/**
 * DormMing's notifications: a white card with the app's rounded corners and font, a coloured icon chip
 * (olive for done, orange for a warning, red for a problem), and a soft shadow. Same look on every page.
 */
const chip = (cls, Icon, spin) => (
  <span className={`grid size-7 place-items-center rounded-full ${cls}`}><Icon aria-hidden className={`size-4 ${spin ? "animate-spin" : ""}`} strokeWidth={2.5} /></span>
);

export function Toaster(props) {
  return (
    <Sonner
      theme="light"
      icons={{
        success: chip("bg-olive text-white", CircleCheck),
        info: chip("bg-olive-soft text-olive-ink", Info),
        warning: chip("bg-orange text-white", TriangleAlert),
        error: chip("bg-destructive text-white", CircleAlert),
        loading: chip("bg-secondary text-foreground", Loader2, true),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3 font-heading text-[15px] font-bold text-foreground shadow-[0_14px_36px_-14px_rgb(18_22_15/0.45)] ring-1 ring-border",
          description: "font-sans text-[13px] font-medium text-muted-foreground",
          title: "text-balance",
          icon: "shrink-0",
          actionButton: "ml-auto h-9 shrink-0 rounded-full bg-olive px-4 font-heading text-[14px] font-bold text-white",
        },
      }}
      {...props}
    />
  );
}
