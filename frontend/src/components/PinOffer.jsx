import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import PinSetup from "./PinSetup";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PrimaryButton } from "@/components/forms";
import { dropPinOffer, shouldOfferPin } from "@/lib/passcode";

/** Right after sign-up: "Lock DormMing with a PIN?" once. Set one up, or skip it; Settings → Security has it later. */
export default function PinOffer() {
  const [open, setOpen] = useState(shouldOfferPin);
  const [setting, setSetting] = useState(false);
  const close = () => { dropPinOffer(); setOpen(false); setSetting(false); };
  if (setting) return <PinSetup onCancel={close} onDone={() => { close(); toast.success("PIN set"); }} />;
  return (
    <Sheet open={open} onOpenChange={(o) => !o && close()}>
      <SheetContent side="bottom" className="rounded-t-3xl px-5 pt-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <SheetHeader className="items-center p-0 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-olive-soft text-olive-ink"><LockKeyhole aria-hidden className="size-7" /></span>
          <SheetTitle className="mt-2 font-heading text-[22px] font-extrabold">Lock DormMing with a PIN?</SheetTitle>
          <SheetDescription className="max-w-[34ch] text-[15px]">You stay logged in on this phone. A PIN keeps your dorm's numbers private if someone else picks it up.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          <PrimaryButton onClick={() => setSetting(true)}>Set up a PIN</PrimaryButton>
          <button type="button" onClick={close} className="h-12 w-full rounded-2xl text-[16px] font-bold text-muted-foreground">Not now</button>
        </div>
        <p className="mt-2 text-center text-[13px] text-muted-foreground">You can turn it on later in Settings → Security.</p>
      </SheetContent>
    </Sheet>
  );
}
