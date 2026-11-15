import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import DormQr from "@/components/DormQr";
import ScanButton from "@/components/ScanButton";

/** Scan QR: show your dorm's code for a new dormmate, or read one. (You join a dorm from Dorm setup, when you aren't in one.) */
export default function Scan() {
  const { dorm } = useOutletContext();
  const code = dorm?.inviteCode;

  const scanned = (found) => {
    if (found === code) toast.success("That's your dorm's code. Your dormmate can scan it to join.");
    else toast.error(`You're already in ${dorm?.name ?? "a dorm"}. Leave it in Settings first to join another.`);
  };

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <PageHeader title="Scan QR" back />
      <div className="space-y-5 px-5">
        <p className="text-[15px] text-muted-foreground">New dormmate? Let them scan this with their phone camera. It opens DormMing and joins them to <b className="text-foreground">{dorm?.name}</b>.</p>
        {code && <DormQr code={code} size={196} />}
        <ScanButton onCode={scanned} />
      </div>
    </div>
  );
}
