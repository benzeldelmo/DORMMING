import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/components/AppShell";
import LogIn from "@/pages/LogIn";
import SignUp from "@/pages/SignUp";
import DormSetup from "@/pages/DormSetup";
import Balances from "@/pages/Balances";
import Expenses from "@/pages/Expenses";
import AddExpense from "@/pages/AddExpense";
import SplitBill from "@/pages/SplitBill";
import RecordPayment from "@/pages/RecordPayment";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/setup/dorm" element={<DormSetup />} />
      <Route element={<AppShell />}>
        <Route path="/balances" element={<Balances />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expenses/new" element={<AddExpense />} />
        <Route path="/split" element={<SplitBill />} />
        <Route path="/payments/new" element={<RecordPayment />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      {/* AppShell sends logged-out visitors to /login. */}
      <Route path="*" element={<Navigate to="/balances" replace />} />
    </Routes>
  );
}
