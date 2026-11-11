import { useNavigate } from "react-router-dom";
import { BellRing, ChevronRight, CreditCard, MessageCircleHeart, ReceiptText, WalletCards } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const ACTIONS = [
  { to: "/expenses/new", icon: CreditCard, title: "Add expense", subtitle: "Record and split your expenses." },
  { to: "/payments/new", icon: WalletCards, title: "Record payment", subtitle: "Update who owes whom." },
  { to: "/bills/new", icon: BellRing, title: "Set bill reminder", subtitle: "Track your due dates." },
  { to: "/expenses/receipt", icon: ReceiptText, title: "Split a receipt", subtitle: "Itemize who had what." },
  { to: "/assistant", icon: MessageCircleHeart, title: "Ask Ming", subtitle: "Type it, Ming fills it in." },
];

export default function AddRecordSheet({ open, onOpenChange }) {
  const navigate = useNavigate();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-[480px] rounded-t-3xl border-0 px-5 pb-8">
        <SheetHeader className="px-0">
          <SheetTitle className="font-heading text-2xl font-bold">Add a record</SheetTitle>
          <SheetDescription className="sr-only">Choose what to add</SheetDescription>
        </SheetHeader>
        <ul className="space-y-2.5">
          {ACTIONS.map(({ to, icon: Icon, title, subtitle }) => (
            <li key={to}>
              <button type="button" onClick={() => { onOpenChange(false); navigate(to); }}
                className="flex w-full items-center gap-3.5 rounded-2xl bg-olive-soft p-3 text-left transition-colors hover:bg-olive-soft/70">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-olive text-white"><Icon className="size-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-[17px] font-bold leading-tight">{title}</span>
                  <span className="block text-xs text-muted-foreground">{subtitle}</span>
                </span>
                <ChevronRight className="size-5 text-foreground/50" />
              </button>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
