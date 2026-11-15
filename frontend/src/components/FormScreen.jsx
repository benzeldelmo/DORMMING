import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useIsDesktop } from "@/lib/useMedia";

/**
 * A form as its own full screen on a phone, like a native "add" sheet: an X and the title on top, the
 * fields in the middle (fixed to the screen: nothing slides around), and the main button pinned at the
 * bottom. On a laptop it's an ordinary page beside the sidebar.
 */
export default function FormScreen({ title, onSubmit, footer, children }) {
  const navigate = useNavigate();
  const desktop = useIsDesktop();
  const screen = (
    <form onSubmit={onSubmit} noValidate
      className={desktop ? "mx-auto w-full max-w-[560px] px-5 pt-8 pb-12" : "form-screen fixed inset-0 z-50 flex flex-col overflow-hidden bg-background pt-[env(safe-area-inset-top)]"}>
      <header className="grid shrink-0 grid-cols-[44px_1fr_44px] items-center px-4 pt-3 pb-2 lg:px-0">
        <button type="button" onClick={() => navigate(-1)} aria-label="Close" className="grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-card)]">
          <X aria-hidden className="size-5" />
        </button>
        <h1 className="text-center font-heading text-[17px] font-extrabold">{title}</h1>
      </header>
      <div className={desktop ? "space-y-5 pt-4" : "min-h-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto overscroll-contain px-5 pt-3 pb-4"}>{children}</div>
      <div className={desktop ? "pt-6" : "shrink-0 border-t border-border bg-background px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"}>{footer}</div>
    </form>
  );
  return desktop ? screen : createPortal(screen, document.body);
}
