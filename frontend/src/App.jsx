import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Landing from "@/pages/Landing";
import LogIn from "@/pages/LogIn";
import SignUp from "@/pages/SignUp";
import DormSetup from "@/pages/DormSetup";
import JoinLink from "@/pages/JoinLink";
import Home from "@/pages/Home";
import Balances from "@/pages/Balances";
import Expenses from "@/pages/Expenses";
import AddExpense from "@/pages/AddExpense";
import SplitBill from "@/pages/SplitBill";
import RecordPayment from "@/pages/RecordPayment";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/setup/dorm" element={<DormSetup />} />
      <Route path="/join/:code" element={<JoinLink />} />
      <Route element={<AppShell />}>
        <Route path="/home" element={<Home />} />
        <Route path="/balances" element={<Balances />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expenses/new" element={<AddExpense />} />
        <Route path="/split" element={<SplitBill />} />
        <Route path="/payments/new" element={<RecordPayment />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
