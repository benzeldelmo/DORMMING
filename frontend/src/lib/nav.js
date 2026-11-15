import { BellRing, HandCoins, House, ReceiptText, ScanLine, ShoppingBag, Wallet } from "lucide-react";

/** Main tabs, in menu order: the phone's frosted pill and the laptop sidebar. */
export const TABS = [
  { to: "/home", icon: House, label: "Home" },
  { to: "/expenses", icon: ShoppingBag, label: "Expenses" },
  { to: "/bills", icon: ReceiptText, label: "Bills" },
  { to: "/balances", icon: Wallet, label: "Balances" },
];

/** What the round + button can do. */
export const ADD_ACTIONS = [
  { to: "/expenses/new", icon: ShoppingBag, title: "Add expense", subtitle: "Split equally with your dorm, automatically." },
  { to: "/balances", icon: HandCoins, title: "Pay back", subtitle: "See who you owe and tap Pay." },
  { to: "/bills/new", icon: BellRing, title: "Set a reminder", subtitle: "A bill you need to pay, and when." },
  { to: "/scan", icon: ScanLine, title: "Scan QR", subtitle: "Join a dorm, or show yours to dormmates." },
];
