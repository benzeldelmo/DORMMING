import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Settings } from "lucide-react";

/** Big title like the mockups, optional back button and gear. */
export default function PageHeader({ title, back = false, gear = false, center = false, topLevel = false, children }) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-2 px-5 pt-6 pb-4 lg:pt-8">
      {back && (
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className={`-ml-2 grid size-10 place-items-center rounded-full hover:bg-secondary ${topLevel ? "lg:hidden" : ""}`}>
          <ChevronLeft className="size-6" />
        </button>
      )}
      <h1 className={`flex-1 font-heading text-[28px] font-extrabold leading-none ${center ? "text-center" : ""}`}>{title}</h1>
      {children}
      {gear && (
        <Link to="/settings" aria-label="Settings" className="grid size-10 place-items-center rounded-full hover:bg-secondary lg:hidden">
          <Settings className="size-6" />
        </Link>
      )}
      {center && back && <span className="size-10" />}
    </header>
  );
}
