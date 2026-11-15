/**
 * A number whose changed characters slide up into place, so a total that changes (₱400 → ₱450) reads
 * as moving, not as a jump. Only characters that differ from the last value animate.
 */
export default function RollingNumber({ children, className }) {
  const text = String(children ?? "");
  return (
    <span className={className} aria-label={text}>
      {[...text].map((ch, i) => (
        // keyed by place and character: a character that stays the same keeps its node and doesn't animate
        <span key={`${i}${ch}`} aria-hidden className="digit-in">{ch}</span>
      ))}
    </span>
  );
}
