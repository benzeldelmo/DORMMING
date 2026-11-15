import { Bus, Ellipsis, Gamepad2, GraduationCap, HeartPulse, House, ShoppingBasket, Sparkles, Wifi } from "lucide-react";

/** Each category has its own soft colour (tone), so a list of expenses reads at a glance. */
export const CATEGORIES = [
  { id: "FOOD_GROCERIES", tone: "bg-[#e2f0dc] text-[#2f6b2b]", label: "Food & Groceries", icon: ShoppingBasket },
  { id: "RENT_UTILITIES", tone: "bg-[#ffe6cf] text-[#a24a10]", label: "Rent & Utilities", icon: House },
  { id: "INTERNET_LOAD", tone: "bg-[#dcebfb] text-[#1d5a96]", label: "Internet & Load", icon: Wifi },
  { id: "TRANSPORTATION", tone: "bg-[#d9f2ef] text-[#17675e]", label: "Transportation", icon: Bus },
  { id: "SCHOOL", tone: "bg-[#fdf0c8] text-[#82600c]", label: "School", icon: GraduationCap },
  { id: "PERSONAL_CARE", tone: "bg-[#fde2ec] text-[#a1305b]", label: "Personal Care", icon: Sparkles },
  { id: "HEALTH", tone: "bg-[#fde0dc] text-[#a9321f]", label: "Health", icon: HeartPulse },
  { id: "LEISURE", tone: "bg-[#ffe9d6] text-[#9a4d12]", label: "Leisure", icon: Gamepad2 },
  { id: "OTHERS", tone: "bg-[#ebede8] text-[#4b5146]", label: "Others", icon: Ellipsis },
];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES.at(-1);
