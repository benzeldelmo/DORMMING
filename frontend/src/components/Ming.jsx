import { CircleAlert, Heart, Moon, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

const BADGE = {
  HAPPY: { icon: Heart, className: "bg-[#f7a948]", label: "happy" },
  WORRIED: { icon: CircleAlert, className: "bg-orange", label: "worried" },
  CELEBRATING: { icon: PartyPopper, className: "bg-olive", label: "celebrating" },
  SLEEPY: { icon: Moon, className: "bg-[#8a8fa8]", label: "napping" },
};
const CONFETTI = ["#FFDE59", "#DD7B2F", "#6B7255", "#f4a6b8", "#FFDE59", "#DD7B2F", "#6B7255", "#f4a6b8"];

/** The mascot, moving and badged by mood. */
export default function Ming({ mood = "HAPPY", className, badge = true, name = "Ming" }) {
  const b = BADGE[mood] ?? BADGE.HAPPY;
  const Icon = b.icon;
  return (
    <span className={cn("relative inline-block", className)} role="img" aria-label={`${name} is ${b.label}`}>
      <img src="/brand/ming-mascot.png" alt="" className={cn("pixelated size-full", `ming-${mood}`)} />
      {badge && (
        <span className={cn("absolute top-[6%] right-[4%] grid size-7 place-items-center rounded-full text-white ring-2 ring-white", b.className)}>
          <Icon className="size-4" strokeWidth={2.5} />
        </span>
      )}
      {mood === "CELEBRATING" && CONFETTI.map((c, i) => {
        const angle = (i / CONFETTI.length) * Math.PI * 2;
        return (
          <span key={i} aria-hidden className="confetti-bit absolute top-1/3 left-1/2 size-2 rounded-[2px]"
            style={{ background: c, "--dx": `${Math.cos(angle) * 60}px`, "--dy": `${Math.sin(angle) * 50 - 20}px`, animationDelay: `${i * 30}ms` }} />
        );
      })}
    </span>
  );
}
