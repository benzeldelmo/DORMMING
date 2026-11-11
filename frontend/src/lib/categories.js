import { Bus, Droplets, Ellipsis, Gamepad2, GraduationCap, HeartPulse, House, ShoppingBasket, Sparkles, Wifi, Zap } from "lucide-react";

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

/** Bills get a more specific icon when the name says what it is. */
export function billIcon(name, category) {
  const n = name.toLowerCase();
  if (n.includes("water")) return Droplets;
  if (n.includes("electric") || n.includes("power")) return Zap;
  if (n.includes("internet") || n.includes("wifi")) return Wifi;
  return categoryById(category).icon;
}
