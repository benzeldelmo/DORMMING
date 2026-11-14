import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";
import App from "./App.jsx";

// iPhone Safari ignores user-scalable=no and touch-action for pinch, so block its pinch gestures here.
for (const type of ["gesturestart", "gesturechange", "gestureend"]) {
  document.addEventListener(type, (e) => e.preventDefault(), { passive: false });
}

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 2000 } } });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
