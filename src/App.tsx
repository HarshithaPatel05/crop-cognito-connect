import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "@/context/RoleContext";
import { TransportBookingProvider } from "@/context/TransportBookingContext";
import { StorageBookingProvider } from "@/context/StorageBookingContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FarmerDashboard from "./pages/FarmerDashboard";
import Marketplace from "./pages/Marketplace";
import TransportDashboard from "./pages/TransportDashboard";
import StorageDashboard from "./pages/StorageDashboard";
import WasteManagement from "./pages/WasteManagement";
import Finance from "./pages/Finance";
import Analytics from "./pages/Analytics";
import FPOPortal from "./pages/FPOPortal";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <TransportBookingProvider>
        <StorageBookingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/farmer" element={<FarmerDashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/transport" element={<TransportDashboard />} />
                <Route path="/storage" element={<StorageDashboard />} />
                <Route path="/waste" element={<WasteManagement />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/fpo" element={<FPOPortal />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </StorageBookingProvider>
      </TransportBookingProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;
