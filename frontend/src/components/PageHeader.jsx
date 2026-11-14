import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/** Page title with an optional back button. Extra buttons go in children. */
export default function PageHeader({ title, back = false, center = false, children }) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-2 px-5 pt-6 pb-4 lg:pt-8">
      {back && (
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-secondary">
          <ChevronLeft className="size-6" />
        </button>
      )}
      <h1 className={`flex-1 font-heading text-[28px] font-extrabold leading-none ${center ? "text-center" : ""}`}>{title}</h1>
      {children}
      {center && back && <span className="size-10" />}
    </header>
  );
}
