import { cn } from "@/lib/utils";

/** Ming the cat, chest up. Width sets the size. */
export default function MingBust({ className }) {
  return <img src="/brand/ming/bust-happy.png" alt="Ming the cat" className={cn("block aspect-[1500/1160]", className)} />;
}
