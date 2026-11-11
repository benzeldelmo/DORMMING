import { CircleAlert, Heart, Moon, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

const BADGE = {
  HAPPY: { icon: Heart, className: "bg-[#f7a948]", label: "happy" },
  WORRIED: { icon: CircleAlert, className: "bg-orange", label: "worried" },
  CELEBRATING: { icon: PartyPopper, className: "bg-olive", label: "celebrating" },
  SLEEPY: { icon: Moon, className: "bg-[#8a8fa8]", label: "napping" },
};

/** Ming from the chest up (ming-bust.png is a crop of the mascot art). Width sets the size. */
export default function MingBust({ mood, className, name = "Ming", badge = false }) {
  const b = BADGE[mood] ?? BADGE.HAPPY;
  const Icon = b.icon;
  return (
    <span className={cn("relative inline-block aspect-[380/340]", className)} role="img" aria-label={mood ? `${name} is ${b.label}` : name}>
      <img src="/brand/ming-bust.png" alt="" className={cn("pixelated block size-full", mood && `ming-${mood}`)} />
      {badge && mood && (
        <span className={cn("absolute top-[2%] right-[6%] grid size-6 place-items-center rounded-full text-white ring-2 ring-white", b.className)}>
          <Icon className="size-3.5" strokeWidth={2.5} />
        </span>
      )}
    </span>
  );
}
