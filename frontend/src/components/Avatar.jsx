import { cn } from "@/lib/utils";

/** A person's profile photo, or their initials on soft green when they haven't set one. Size it with className. */
export default function Avatar({ user, className }) {
  if (user?.photo) return <img src={user.photo} alt="" className={cn("shrink-0 rounded-full object-cover", className)} />;
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full bg-olive-soft font-bold text-olive-ink", className)}>
      {user?.initials}
    </span>
  );
}
