import { cn } from "@/lib/utils";

// The art is used exactly as drawn: each mood stands on the bottom edge of its canvas, centred.
// The canvases differ in width, so each is scaled by its width against the 648px base: every cat
// comes out the same size, and the box keeps the base 648×431 shape (taller art rises above it).
const ART = {
  HAPPY: { file: "happy", width: 648, says: "happy" },
  CELEBRATING: { file: "celebrating", width: 648, says: "celebrating" },
  SLEEPY: { file: "sleepy", width: 701, says: "napping" },
  WORRIED: { file: "worried", width: 752, says: "worried" },
};
const BASE = 648;

/** Ming the cat, chest up, in one of four moods. Width sets the size. */
export default function Ming({ mood = "HAPPY", className }) {
  const art = ART[mood] ?? ART.HAPPY;
  return (
    <span className={cn("relative block aspect-[648/431] select-none", className)}>
      <img src={`/brand/ming/${art.file}.png`} alt={`Ming is ${art.says}`} draggable={false}
        className="absolute bottom-0 left-1/2 h-auto max-w-none -translate-x-1/2"
        style={{ width: `${(art.width / BASE) * 100}%` }} />
    </span>
  );
}
