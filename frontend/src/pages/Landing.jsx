import { useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { BellRing, Check, ChevronDown, ShieldCheck, ShoppingBag } from "lucide-react";
import Ming from "@/components/Ming";
import Sentences from "@/components/Sentences";
import MingPayDemo from "@/landing/MingPayDemo";
import { isLoggedIn } from "@/lib/auth";
import { cn } from "@/lib/utils";

/** One primary action style everywhere: olive on light ground, white on the olive band. */
const PRIMARY = "m-btn inline-flex h-[52px] items-center justify-center rounded-2xl bg-olive px-7 font-heading text-[17px] font-bold text-white shadow-[0_8px_20px_-10px_rgb(36_7_2/0.5)]";
const SECONDARY = "m-btn m-btn--quiet inline-flex h-[52px] items-center justify-center rounded-2xl bg-card px-6 font-heading text-[17px] font-bold shadow-[0_8px_20px_-12px_rgb(36_7_2/0.35)] ring-1 ring-border/70";
const H2 = "font-heading text-[32px] leading-tight font-extrabold tracking-tight text-balance sm:text-[40px]";

/** A feature card: a small piece of the real app on top, then what it does. */
function Feature({ title, text, children, i }) {
  return (
    <li data-float style={{ "--i": i % 3 }} className="flex flex-col rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div aria-hidden className="flex min-h-[176px] items-center justify-center rounded-2xl bg-background px-4 py-6 [&>*]:shadow-none">{children}</div>
      <h3 className="mt-6 font-heading text-[22px] font-extrabold tracking-tight">{title}</h3>
      <p className="mt-2 text-[16px] leading-relaxed text-pretty text-foreground/75">{text}</p>
    </li>
  );
}

const Dot = ({ name, tone }) => (
  <span className={cn("grid size-8 place-items-center rounded-full text-[13px] font-bold text-white ring-2 ring-card", tone)}>{name}</span>
);
const Row = ({ children, className }) => <div className={cn("flex w-full max-w-[260px] items-center gap-3 rounded-2xl bg-card p-3", className)}>{children}</div>;
const Amount = ({ children }) => <span className="font-heading font-extrabold tabular-nums">{children}</span>;

/** The six features, each with a small piece of the real app as its picture. */
const FEATURES = [
  {
    title: "Track Shared Expenses",
    text: "Keep every household purchase and expense recorded in one place.",
    art: (
      <Row>
        <span className="grid size-10 place-items-center rounded-xl bg-olive-soft text-olive"><ShoppingBag className="size-5" /></span>
        <span className="min-w-0 flex-1"><span className="block font-semibold">Groceries</span><span className="block text-[13px] text-muted-foreground">You paid</span></span>
        <Amount>₱2,700</Amount>
      </Row>
    ),
  },
  {
    title: "Split Bills Fairly",
    text: "Divide expenses among roommates and know everyone's share.",
    art: (
      <Row>
        <span className="flex -space-x-1.5"><Dot name="B" tone="bg-olive" /><Dot name="V" tone="bg-[#8a6d3b]" /><Dot name="S" tone="bg-[#5b7a8c]" /></span>
        <span className="min-w-0 flex-1 text-[14px] font-semibold whitespace-nowrap text-muted-foreground">3 ways</span>
        <Amount>₱900 each</Amount>
      </Row>
    ),
  },
  {
    title: "Know Who Owes What",
    text: "Keep track of balances, contributions, and outstanding payments.",
    art: (
      <div className="grid w-full max-w-[260px] grid-cols-2 gap-2">
        <span className="rounded-2xl bg-olive-soft p-3"><span className="block text-[12px] font-semibold">Owed to you</span><span className="mt-3 block font-heading text-xl font-extrabold text-olive-ink tabular-nums">₱1,000</span></span>
        <span className="rounded-2xl bg-orange-soft p-3"><span className="block text-[12px] font-semibold">You owe</span><span className="mt-3 block font-heading text-xl font-extrabold text-orange-ink tabular-nums">₱900</span></span>
      </div>
    ),
  },
  {
    title: "Manage Household Bills",
    text: "Stay organized with recurring expenses and upcoming due dates.",
    art: (
      <Row className="bg-orange-soft">
        <span className="grid size-10 place-items-center rounded-xl bg-orange text-white"><BellRing className="size-5" /></span>
        <span className="min-w-0 flex-1"><span className="block font-semibold">Internet</span><span className="block text-[13px] font-semibold text-orange-ink">Due tomorrow</span></span>
        <Amount>₱1,500</Amount>
      </Row>
    ),
  },
  {
    title: "Monitor Your Spending",
    text: "See where your shared money goes through clear expense summaries.",
    art: (
      <div className="w-full max-w-[260px] space-y-2.5 rounded-2xl bg-card p-3 text-[13px] font-semibold">
        {[["Food & Groceries", "₱3,240", "70%"], ["Rent & Utilities", "₱1,900", "42%"], ["Internet & Load", "₱600", "14%"]].map(([label, amount, w]) => (
          <span key={label} className="block">
            <span className="flex justify-between"><span>{label}</span><span className="tabular-nums">{amount}</span></span>
            <span className="mt-1 block h-1.5 rounded-full bg-secondary"><span className="block h-full rounded-full bg-olive" style={{ width: w }} /></span>
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Stay in Sync",
    text: "Keep everyone updated with shared expense records and payment activity.",
    art: (
      <Row>
        <span className="grid size-10 place-items-center rounded-full bg-olive text-white"><Check className="size-5" strokeWidth={3} /></span>
        <span className="min-w-0 flex-1 text-[14px] leading-snug"><b>Vince</b> paid <b>Benzel</b><span className="block text-[13px] text-muted-foreground">Just now</span></span>
        <Amount>₱500</Amount>
      </Row>
    ),
  },
];

const STEPS = [
  { title: "Create Your Space", text: "Set up your shared household and bring your roommates together in one place." },
  { title: "Add Your Expenses", text: "Record groceries, utilities, rent, and other shared purchases." },
  { title: "Split and Settle", text: "See everyone's share, track contributions, and keep payments organized." },
];

const FAQ = [
  ["What is DormMing?", "DormMing is a shared expense management web app designed to help roommates organize, track, and split their household expenses."],
  ["Who can use DormMing?", "DormMing is for roommates, students, friends, and anyone who shares expenses with other people."],
  ["How do I start using DormMing?", "Create your account, set up your shared household, and invite your roommates to join."],
  ["Can I track who paid for an expense?", "Yes. You can record expenses and monitor contributions and payment statuses."],
  ["Can we split expenses among multiple roommates?", "Yes. DormMing helps organize shared costs so everyone can see their respective share."],
  ["Do I need to install anything?", "No. DormMing is a web app that you can access through your browser."],
  ["Can I access DormMing on my phone?", "Yes. DormMing is designed to work across desktop and mobile screens."],
];

const LINKS = [["#top", "Home"], ["#features", "Features"], ["#how", "How It Works"], ["#faq", "FAQs"]];

/**
 * Cards marked data-float rise into place each time they scroll into view, and reset when they leave,
 * so they float in again on the next pass. Without script or with reduced motion they simply stand.
 */
function useFloatIn() {
  useEffect(() => {
    const cards = document.querySelectorAll("[data-float]");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle("is-in", e.isIntersecting);
    }, { threshold: 0.15 });
    cards.forEach((c) => io.observe(c));
    document.documentElement.classList.add("float-ready");
    return () => io.disconnect();
  }, []);
}

/** The hero's green glow follows a mouse pointer (written to CSS variables once a frame). */
function useGlow() {
  const ref = useRef(null);
  const frame = useRef(0);
  const onPointerMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  };
  return { ref, onPointerMove };
}

export default function Landing() {
  const glow = useGlow();
  useFloatIn();
  if (isLoggedIn()) return <Navigate to="/home" replace />;
  return (
    <div id="top" className="min-h-dvh bg-background text-foreground">
      {/* The first screen: the nav and the hero fill the whole view, on a faint grid with green glows */}
      <div ref={glow.ref} onPointerMove={glow.onPointerMove} className="hero-ground relative flex min-h-svh flex-col overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sm:px-8">
        <Link to="/" aria-label="DormMing home" className="flex h-11 items-center rounded-lg"><img src="/brand/dormming-logo.png" alt="DormMing" width={1446} height={538} className="h-10 w-auto sm:h-11" /></Link>
        <nav className="flex items-center gap-1">
          {LINKS.slice(1).map(([href, label]) => (
            <a key={href} href={href} className="m-link hidden h-11 items-center px-3.5 text-[15px] font-semibold text-foreground/75 hover:text-foreground lg:flex">{label}</a>
          ))}
          <Link to="/login" className="m-link flex h-11 items-center px-4 text-[15px] font-semibold">Log In</Link>
          <Link to="/signup" className="m-btn flex h-11 items-center rounded-full bg-olive px-5 text-[15px] font-semibold text-white">Sign Up</Link>
        </nav>
      </header>

      {/* Hero: the promise on the left, the app working on the right */}
      <section className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-5 pt-8 sm:px-8 lg:grid-cols-[1fr_460px] lg:gap-12 lg:pt-4">
        <div className="text-center lg:text-left">
          {/* The hero's entrance, once on load: each line rises out of its mask, then the rest fades up */}
          <h1 className="font-heading text-[clamp(38px,9.5vw,64px)] leading-[1.04] font-black tracking-[-0.03em] text-balance">
            <span className="enter-line" style={{ "--i": 0 }}><span>Who's paying for what?</span></span>
            <span className="enter-line text-olive" style={{ "--i": 1 }}><span>We've got you.</span></span>
          </h1>
          <p style={{ "--i": 0 }} className="enter-fade mx-auto mt-5 max-w-[42ch] text-lg leading-relaxed text-pretty text-foreground/75 sm:text-xl lg:mx-0">
            From groceries to utility bills, make shared expenses easier to track, split, and settle.
          </p>
          <div style={{ "--i": 1 }} className="enter-fade mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/signup" className={cn(PRIMARY, "w-full sm:w-auto")}>Create Free Account</Link>
            <a href="#features" className={cn(SECONDARY, "w-full sm:w-auto")}>See Features</a>
          </div>
          <p style={{ "--i": 2 }} className="enter-fade mt-5 flex items-center justify-center gap-2 text-sm text-foreground/70 lg:justify-start"><ShieldCheck className="size-4" />Free. Just records: no real money moves.</p>
        </div>
        {/* A picture of the app, not the app: hidden from screen readers and from keyboard focus */}
        <div aria-hidden inert className="enter-media mx-auto w-full max-w-[460px] self-center">
          <MingPayDemo />
        </div>
      </section>
      </div>

      <section id="features" aria-labelledby="features-title" className="scroll-mt-6 bg-card">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-[46ch] text-center">
            <h2 id="features-title" className={H2}><Sentences>Everything shared. Everything organized.</Sentences></h2>
            <p className="mt-4 text-lg leading-relaxed text-pretty text-foreground/75">All your shared expenses, organized in one place. Less confusion, fewer calculations, and better money management with your roommates.</p>
          </div>
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {FEATURES.map((f, i) => <Feature key={f.title} i={i} title={f.title} text={f.text}>{f.art}</Feature>)}
          </ul>
        </div>
      </section>

      <section id="how" aria-labelledby="how-title" className="scroll-mt-6 border-y border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <h2 id="how-title" className={cn(H2, "text-center")}><Sentences>Three steps. Less expense stress.</Sentences></h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-14">
          {STEPS.map((s, i) => (
            <li key={s.title} data-float style={{ "--i": i }} className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] sm:p-7">
              <span className="font-heading text-[40px] leading-none font-black text-olive tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-heading text-[22px] font-extrabold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-pretty text-foreground/75">{s.text}</p>
            </li>
          ))}
        </ol>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-6 bg-card">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <h2 id="faq-title" className={cn(H2, "text-center")}><Sentences>Got questions? We've got answers.</Sentences></h2>
        <div className="mt-10 divide-y divide-border rounded-3xl bg-background px-6 ring-1 ring-border sm:px-8">
          {FAQ.map(([q, a]) => (
            <details key={q} className="faq group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-heading text-[18px] font-bold [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown aria-hidden className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="max-w-[60ch] pb-5 text-[16px] leading-relaxed text-foreground/75">{a}</p>
            </details>
          ))}
        </div>
        </div>
      </section>

      <section id="cta" aria-labelledby="cta-title" className="relative z-10">
        <div className="cutting-mat mat-drift text-white">
          {/* Ming's column is wide enough that he weighs about the same as the words beside him */}
          <div className="mx-auto grid max-w-6xl items-center gap-6 px-5 pt-14 sm:px-8 md:grid-cols-[1fr_minmax(0,440px)] md:gap-10 md:pt-16">
            <div className="text-center md:pb-16 md:text-left">
              <h2 id="cta-title" className="font-heading text-[28px] leading-tight font-extrabold tracking-tight sm:text-[36px]"><Sentences>Less money confusion. More room for good memories.</Sentences></h2>
              <Link to="/signup" className="m-btn m-btn--quiet mt-8 inline-flex h-[52px] items-center justify-center rounded-2xl bg-white px-7 font-heading text-[17px] font-bold text-olive-ink focus-visible:outline-white">Create Free Account</Link>
            </div>
            {/* Ming stands on the band's bottom edge, so his feet meet the footer line */}
            <Ming mood="HAPPY" className="mx-auto w-[340px] max-w-full self-end md:hidden" />
            {/* Laptop: the band keeps its height (set by this 440px slot); Ming is drawn 560px wide on its
                bottom edge, so his head rises above the band's top, like the greeting card in the app */}
            <div className="relative hidden aspect-[648/431] self-end md:block">
              <Ming mood="HAPPY" className="absolute right-0 bottom-0 w-[127%]" />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-foreground text-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-12 pb-8 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-heading text-[24px] font-black">DormMing.</p>
            <p className="mt-1 text-[15px] text-background/80">Shared Expenses, Simplified.</p>
            <p className="mt-6 text-[15px] text-background/80">Stay organized. Live better. Share smarter.</p>
          </div>
          <nav aria-label="Quick links">
            <p className="text-[13px] font-bold tracking-[0.08em] text-background/70 uppercase">Quick Links</p>
            <ul className="mt-2">{LINKS.map(([href, label]) => <li key={href}><a href={href} className="m-link flex h-10 w-fit items-center text-[15px]">{label}</a></li>)}</ul>
          </nav>
          <nav aria-label="Legal">
            <p className="text-[13px] font-bold tracking-[0.08em] text-background/70 uppercase">Legal</p>
            <ul className="mt-2">
              <li><Link to="/privacy" className="m-link flex h-10 w-fit items-center text-[15px]">Privacy Policy</Link></li>
              <li><Link to="/terms" className="m-link flex h-10 w-fit items-center text-[15px]">Terms of Service</Link></li>
            </ul>
          </nav>
        </div>
        <p className="mx-auto max-w-6xl border-t border-background/15 px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[14px] text-background/75 sm:px-8">© 2026 DormMing. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
