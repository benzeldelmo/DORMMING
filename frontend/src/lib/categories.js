import { Bus, Ellipsis, Gamepad2, GraduationCap, HeartPulse, House, ShoppingBasket, Sparkles, Wifi } from "lucide-react";

export const CATEGORIES = [
  { id: "FOOD_GROCERIES", label: "Food & Groceries", icon: ShoppingBasket },
  { id: "RENT_UTILITIES", label: "Rent & Utilities", icon: House },
  { id: "INTERNET_LOAD", label: "Internet & Load", icon: Wifi },
  { id: "TRANSPORTATION", label: "Transportation", icon: Bus },
  { id: "SCHOOL", label: "School", icon: GraduationCap },
  { id: "PERSONAL_CARE", label: "Personal Care", icon: Sparkles },
  { id: "HEALTH", label: "Health", icon: HeartPulse },
  { id: "LEISURE", label: "Leisure", icon: Gamepad2 },
  { id: "OTHERS", label: "Others", icon: Ellipsis },
];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES.at(-1);
