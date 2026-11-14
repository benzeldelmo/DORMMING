import { cn } from "@/lib/utils";

/**
 * What Ming says, drawn like a chat message.
 * tail="left": a pointer from the middle of the left side, toward Ming beside it (the Home greeting).
 * tail="corner": a tail curling out of the bottom-left corner (a messages app's incoming bubble).
 * The tail is one SVG in the bubble's own colour, so the join is seamless.
 */
export default function SpeechBubble({ tail = "corner", children, className }) {
  return (
    <div className={cn("relative rounded-2xl bg-card px-4 py-3 text-foreground shadow-[0_6px_18px_-8px_rgb(18_22_15/0.35)]", className)}>
      {tail === "left" ? (
        <svg aria-hidden viewBox="0 0 12 24" className="absolute top-1/2 -left-[11px] h-6 w-3 -translate-y-1/2 fill-card">
          <path d="M12 0C12 7 7 10.5 0 12C7 13.5 12 17 12 24Z" />
        </svg>
      ) : (
        <svg aria-hidden viewBox="0 0 18 16" className="absolute bottom-0 -left-[6px] h-[15px] w-[17px] fill-card">
          <path d="M18 0H6V8.5C6 12.6 4 15 0.5 16C3 16.7 5.8 16.5 8.2 15.3L18 15Z" />
        </svg>
      )}
      {children}
    </div>
  );
}
