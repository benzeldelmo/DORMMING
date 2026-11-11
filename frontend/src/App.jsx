import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Landing from "@/pages/Landing";
import SignUp from "@/pages/SignUp";
import LogIn from "@/pages/LogIn";
import Forgot from "@/pages/Forgot";
import Reset from "@/pages/Reset";
import ProfileSetup from "@/pages/ProfileSetup";
import DormSetup from "@/pages/DormSetup";
import JoinLink from "@/pages/JoinLink";
import AddFriend from "@/pages/AddFriend";
import Home from "@/pages/Home";
import Expenses from "@/pages/Expenses";
import AddExpense from "@/pages/AddExpense";
import Receipt from "@/pages/Receipt";
import Bills from "@/pages/Bills";
import AddBill from "@/pages/AddBill";
import RecordPayment from "@/pages/RecordPayment";
import Balances from "@/pages/Balances";
import Settings from "@/pages/Settings";
import Card from "@/pages/Card";
import Assistant from "@/pages/Assistant";
import Activity from "@/pages/Activity";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/setup/profile" element={<ProfileSetup />} />
      <Route path="/setup/dorm" element={<DormSetup />} />
      <Route path="/join/:code" element={<JoinLink />} />
      <Route path="/add/:code" element={<AddFriend />} />
      <Route element={<AppShell />}>
        <Route path="/home" element={<Home />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expenses/new" element={<AddExpense />} />
        <Route path="/expenses/receipt" element={<Receipt />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/bills/new" element={<AddBill />} />
        <Route path="/payments/new" element={<RecordPayment />} />
        <Route path="/balances" element={<Balances />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/card" element={<Card />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/activity" element={<Activity />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
