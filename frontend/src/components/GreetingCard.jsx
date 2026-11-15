import { Link } from "react-router-dom";
import Ming from "./Ming";
import SpeechBubble from "./SpeechBubble";
import Sentences from "./Sentences";

/**
 * Ming's message on Home: a green cutting-mat card with Ming standing on its bottom edge (his head, about a
 * quarter of him,
 * rises above it) and his speech bubble beside him, its top overlapping the card's edge.
 */
// The bubble hangs from the band's top edge: 70% of it inside the band, 30% above, whatever its height.
export default function GreetingCard({ mood, line, to = "/balances" }) {
  return (
    <section aria-label="Message from Ming" className="relative">
      <div aria-hidden className="cutting-mat absolute inset-x-0 bottom-0 h-[76px] rounded-3xl lg:h-[88px]" />
      <div className="relative flex items-end">
        <Ming mood={mood} className="relative ml-1 w-[150px] shrink-0 lg:ml-4 lg:w-[192px]" />
        <Link to={to} className="absolute right-3 bottom-[76px] left-[154px] translate-y-[70%] rounded-2xl lg:right-6 lg:bottom-[88px] lg:left-[212px] lg:max-w-[420px]">
          <SpeechBubble tail="left">
            <span className="block text-[13px] font-bold text-olive-ink">Ming</span>
            <Sentences className="mt-0.5 block text-[15px] leading-snug font-semibold">{line}</Sentences>
          </SpeechBubble>
        </Link>
      </div>
    </section>
  );
}
