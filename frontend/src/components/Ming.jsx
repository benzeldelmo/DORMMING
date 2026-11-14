import { cn } from "@/lib/utils";

const ART = { HAPPY: "happy", WORRIED: "worried", CELEBRATING: "celebrating", SLEEPY: "sleepy" };
const SAYS = { HAPPY: "happy", WORRIED: "worried", CELEBRATING: "celebrating", SLEEPY: "napping" };

/** Ming the cat. `bust` crops to chest-up; width sets the size. The art is drawn centered on its canvas. */
export default function Ming({ mood = "HAPPY", bust = false, className }) {
  const key = ART[mood] ? mood : "HAPPY";
  return (
    <img src={`/brand/ming/${bust ? "bust-" : ""}${ART[key]}.png`} alt={`Ming is ${SAYS[key]}`} width={bust ? 480 : 640} height={bust ? 371 : 640}
      className={cn("block h-auto select-none", bust ? "aspect-[480/371]" : "aspect-square", className)} draggable={false} />
  );
}
