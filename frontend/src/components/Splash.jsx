import { useEffect, useState } from "react";

const SEEN = "dormming.splashed";

/** The DormMing wordmark on the green cutting mat, once each time the app is opened. */
export default function Splash() {
  const [show, setShow] = useState(() => { try { return !sessionStorage.getItem(SEEN); } catch { return false; } });
  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem(SEEN, "1"); } catch { /* shows once per render */ }
    const t = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(t);
  }, [show]);
  if (!show) return null;
  return (
    <div aria-hidden className="splash cutting-mat fixed inset-0 z-[100] grid place-items-center">
      <img src="/brand/dormming-logo.png" alt="" width={1446} height={538} className="w-[64vw] max-w-[320px]" />
    </div>
  );
}
