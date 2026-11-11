import { cn } from "@/lib/utils";

const ART = { HAPPY: "happy", WORRIED: "worried", CELEBRATING: "celebrating", SLEEPY: "sleepy" };

/** Full-body Ming, drawn for each mood. */
export default function Ming({ mood = "HAPPY", className, name = "Ming" }) {
  const key = ART[mood] ? mood : "HAPPY";
  return (
    <span className={cn("relative inline-block aspect-square", className)} role="img" aria-label={name}>
      <img src={`/brand/ming/${ART[key]}.png`} alt="" className={cn("block size-full", `ming-${key}`)} />
    </span>
  );
}
