import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Splash from "@/components/Splash";
import ErrorBoundary from "@/components/ErrorBoundary";
import ErrorScreen from "@/components/ErrorScreen";

// The landing page (with its animated phone demo) loads on its own, so the app itself starts faster
const Landing = lazy(() => import("@/pages/Landing"));
import LogIn from "@/pages/LogIn";
import SignUp from "@/pages/SignUp";
import DormSetup from "@/pages/DormSetup";
import JoinLink from "@/pages/JoinLink";
import Legal from "@/pages/Legal";
import Bills from "@/pages/Bills";
import AddBill from "@/pages/AddBill";
import Scan from "@/pages/Scan";
import Help from "@/pages/Help";
import Home from "@/pages/Home";
import Balances from "@/pages/Balances";
import Expenses from "@/pages/Expenses";
import AddExpense from "@/pages/AddExpense";
import RecordPayment from "@/pages/RecordPayment";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <ErrorBoundary>
    <Splash />
    <Routes>
      <Route path="/" element={<Suspense fallback={null}><Landing /></Suspense>} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/setup/dorm" element={<DormSetup />} />
      <Route path="/join/:code" element={<JoinLink />} />
      <Route path="/terms" element={<Legal doc="terms" />} />
      <Route path="/privacy" element={<Legal doc="privacy" />} />
      <Route element={<AppShell />}>
        <Route path="/home" element={<Home />} />
        <Route path="/balances" element={<Balances />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expenses/new" element={<AddExpense />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/bills/new" element={<AddBill />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/payments/new" element={<RecordPayment />} />
        <Route path="/settings" element={<Settings />} />
        {/* Settings is one page now; old section links land on it */}
        <Route path="/settings/:section" element={<Navigate to="/settings" replace />} />
        <Route path="/help" element={<Help />} />
      </Route>
      <Route path="*" element={<ErrorScreen kind="notfound" />} />
    </Routes>
    </ErrorBoundary>
  );
}
