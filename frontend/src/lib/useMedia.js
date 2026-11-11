import { useEffect, useState } from "react";

const QUERY = "(min-width: 1024px)";

/** True at the desktop layout width (Tailwind `lg`). */
export function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => matchMedia(QUERY).matches);
  useEffect(() => {
    const mq = matchMedia(QUERY);
    const on = () => setDesktop(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
}
