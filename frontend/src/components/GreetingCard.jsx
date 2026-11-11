import { Link } from "react-router-dom";
import MingBust from "./MingBust";
import { formatPeso } from "@/lib/money";
import { greetingFor } from "@/lib/dates";

/** Olive card with Ming chest-up at the bottom-left and Ming's speech bubble. */
export default function GreetingCard({ me, dormName, mood, banner, moodLine }) {
  const first = me.displayName.split(" ")[0];
  return (
    <section aria-label="Greeting" className="relative overflow-hidden rounded-[28px] bg-olive text-white shadow-[0_14px_30px_-18px_rgb(36_7_2/0.7)]">
      <div aria-hidden className="absolute inset-0 opacity-[0.09] [background-image:radial-gradient(#fff_1.2px,transparent_1.2px)] [background-size:14px_14px]" />
      <Link to="/assistant" aria-label={`Chat with ${me.mingName}`} className="absolute bottom-0 left-2 w-[124px] sm:w-[150px] lg:left-5 lg:w-[176px]">
        <MingBust mood={mood} name={me.mingName} badge className="w-full" />
      </Link>
      <div className="relative min-h-[176px] py-5 pr-5 pl-[140px] sm:pl-[170px] lg:min-h-[200px] lg:py-7 lg:pl-[212px]">
        <p className="truncate text-[13px] text-white/75">{dormName}</p>
        <h1 className="truncate text-[24px] leading-tight font-extrabold lg:text-[30px]">{greetingFor()}, {first}!</h1>
        <Link to={banner ? "/bills" : "/balances"}
          className="relative mt-3 block max-w-[420px] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-foreground shadow-sm">
          <span aria-hidden className="absolute -left-1.5 bottom-0 size-3 rotate-45 bg-white" />
          <span className="text-[11px] font-bold tracking-wide text-olive uppercase">{me.mingName}</span>
          <span className="block text-[15px] leading-snug font-bold">{banner ? banner.text : moodLine}</span>
          {banner && <span className="mt-0.5 block text-[13px] text-muted-foreground">Your share: {formatPeso(banner.myShareCentavos)}</span>}
        </Link>
      </div>
    </section>
  );
}
