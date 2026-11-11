import { cn } from "@/lib/utils";

const ART = { HAPPY: "happy", WORRIED: "worried", CELEBRATING: "celebrating", SLEEPY: "sleepy" };
const SAYS = { HAPPY: "happy", WORRIED: "worried", CELEBRATING: "celebrating", SLEEPY: "napping" };

/** Ming from the chest up, drawn for each mood. Width sets the size. */
export default function MingBust({ mood = "HAPPY", className, name = "Ming", animate = true }) {
  const key = ART[mood] ? mood : "HAPPY";
  return (
    <span className={cn("relative inline-block aspect-[1500/1160]", className)} role="img" aria-label={`${name} is ${SAYS[key]}`}>
      <img src={`/brand/ming/bust-${ART[key]}.png`} alt="" className={cn("block size-full", animate && `ming-${key}`)} />
    </span>
  );
}
