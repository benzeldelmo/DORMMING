/**
 * Text that only breaks between its sentences (or between "•"-separated parts), never mid-phrase:
 * each piece is an inline-block, so a line wraps at the gap between two pieces first.
 * A piece too long for one line still wraps inside itself.
 */
/** "Hi. You owe Vince." → ["Hi.", " ", "You owe Vince."]: pieces at even places, gaps at odd ones. */
// (no regex lookbehind: older iPhones, Safari before 16.4, can't parse it)
export const splitSentences = (text) => String(text ?? "").replace(/([.!?])\s+/g, "$1\u0000").split(/(\u0000|\s+•\s+)/).map((p) => (p === "\u0000" ? " " : p));

export default function Sentences({ children, className }) {
  const pieces = splitSentences(children);
  return (
    <span className={className}>
      {pieces.map((p, i) => {
        if (i % 2) return <span key={i}> </span>;
        // after a "•" gap, the bullet travels with the next piece, so a line never ends on a lone "•"
        const bullet = i > 0 && pieces[i - 1].includes("•");
        return <span key={i} className="inline-block">{bullet ? `• ${p}` : p}</span>;
      })}
    </span>
  );
}
