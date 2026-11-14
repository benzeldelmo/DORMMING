import { Link } from "react-router-dom";
import Ming from "./Ming";
import SpeechBubble from "./SpeechBubble";

/**
 * Ming's message on Home: a green band with Ming standing on its bottom edge (his head rises above it)
 * and his speech bubble beside him. On phones the band runs edge to edge and fades out at both sides,
 * so it never stops on a hard cut; on laptops it is a rounded card.
 */
export default function GreetingCard({ mood, line }) {
  return (
    <section aria-label="Message from Ming" className="relative -mx-5 lg:mx-0">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[100px] bg-olive lg:h-[112px] [mask-image:linear-gradient(to_right,transparent,#000_28px,#000_calc(100%-28px),transparent)] lg:rounded-3xl lg:[mask-image:none]" />
      <div className="relative flex items-end">
        <Ming mood={mood} bust className="relative ml-4 w-[164px] shrink-0 lg:ml-8 lg:w-[184px]" />
        <Link to="/balances" className="mb-3.5 ml-3 mr-5 min-w-0 flex-1 rounded-2xl lg:mb-5 lg:mr-6 lg:max-w-[460px]">
          <SpeechBubble tail="left">
            <span className="block text-[13px] font-bold text-olive-ink">Ming</span>
            <span className="mt-0.5 block text-[15px] leading-snug font-semibold">{line}</span>
          </SpeechBubble>
        </Link>
      </div>
    </section>
  );
}
