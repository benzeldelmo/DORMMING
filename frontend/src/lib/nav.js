import { HandCoins, House, Receipt, ShoppingBag, Wallet } from "lucide-react";

/** Main tabs, in menu order. The phone bar splits them around the + button (first two left, last two right). */
export const TABS = [
  { to: "/home", icon: House, label: "Home" },
  { to: "/expenses", icon: ShoppingBag, label: "Expenses" },
  { to: "/split", icon: Receipt, label: "Split Bill" },
  { to: "/balances", icon: Wallet, label: "Balances" },
];

/** What the + button can add. */
export const ADD_ACTIONS = [
  { to: "/expenses/new", icon: ShoppingBag, title: "Add expense", subtitle: "One person paid; split it equally or by amount." },
  { to: "/split", icon: Receipt, title: "Split a bill", subtitle: "Item by item, straight from the receipt." },
  { to: "/payments/new", icon: HandCoins, title: "Record payment", subtitle: "You paid a dormmate back." },
];
