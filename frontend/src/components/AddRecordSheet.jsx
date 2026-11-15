import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ADD_ACTIONS } from "@/lib/nav";

/** What the + button opens: a bottom sheet on phones, a side panel on laptops. */
export default function AddRecordSheet({ open, onOpenChange, side = "bottom" }) {
  const navigate = useNavigate();
  const go = (to) => { onOpenChange(false); navigate(to); };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side}
        className={side === "bottom" ? "mx-auto max-w-[640px] rounded-t-[28px] border-0 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]" : "w-[420px] border-0 px-5 pt-6 sm:max-w-[420px]"}>
        <SheetHeader className="px-0">
          <SheetTitle className="font-heading text-2xl font-extrabold">What do you want to do?</SheetTitle>
          <SheetDescription className="sr-only">Add an expense, record a payment, set a bill reminder or scan a dorm QR</SheetDescription>
        </SheetHeader>
        <ul className="space-y-2.5">
          {ADD_ACTIONS.map(({ to, icon: Icon, title, subtitle }) => (
            <li key={to}>
              <button type="button" onClick={() => go(to)}
                className="flex w-full items-center gap-3.5 rounded-2xl bg-olive-soft/70 p-3 text-left transition-colors hover:bg-olive-soft">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-olive text-white"><Icon className="size-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-[17px] font-bold leading-tight">{title}</span>
                  <span className="block text-[13px] text-muted-foreground">{subtitle}</span>
                </span>
                <ChevronRight className="size-5 text-foreground/40" />
              </button>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
