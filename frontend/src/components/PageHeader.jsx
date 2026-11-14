import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Settings } from "lucide-react";

/** Page title with an optional back button. On phones, a gear opens Settings (laptops have it in the sidebar). */
export default function PageHeader({ title, back = false, gear = false, children }) {
  const navigate = useNavigate();
  return (
    <header className="flex min-h-14 items-center gap-2 px-5 pt-4 pb-3 lg:pt-8">
      {back && (
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-secondary">
          <ChevronLeft className="size-6" />
        </button>
      )}
      <h1 className="flex-1 truncate font-heading text-[28px] leading-none font-extrabold">{title}</h1>
      {children}
      {gear && (
        <Link to="/settings" aria-label="Settings" className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-secondary lg:hidden">
          <Settings className="size-6" />
        </Link>
      )}
    </header>
  );
}
