import { HandCoins, ReceiptText, Settings, Split, Wallet } from "lucide-react";

/** The app's screens, in menu order. Used by the bottom bar (phones) and the sidebar (laptops). */
export const NAV = [
  { to: "/balances", icon: Wallet, label: "Balances" },
  { to: "/expenses", icon: ReceiptText, label: "Expenses" },
  { to: "/split", icon: Split, label: "Split Bill" },
  { to: "/payments/new", icon: HandCoins, label: "Pay" },
  { to: "/settings", icon: Settings, label: "Settings" },
];
