import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import YourProjectsPage from "./pages/YourProjects";
import FounderDashboard from "./pages/FounderDashboard";
import StoreSync from "./pages/StoreSync";
import ShopifyCallback from "./pages/ShopifyCallback";
import InstallShopify from "./pages/InstallShopify";
import BusinessPlan from "./pages/BusinessPlan";
import NotFound from "./pages/NotFound";

const App = () => (
  <div className="database-theme">
    <div className="dashboard-container">
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/your-projects" element={<YourProjectsPage />} />
        <Route path="/your-projects/:projectId" element={<YourProjectsPage />} />
        <Route path="/business-plan" element={<BusinessPlan />} />
        <Route path="/business-plan/:projectId" element={<BusinessPlan />} />
        <Route path="/founder-dashboard" element={<FounderDashboard />} />
        <Route path="/store-sync" element={<StoreSync />} />
        <Route path="/shopify/callback" element={<ShopifyCallback />} />
        <Route path="/install-shopify" element={<InstallShopify />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  </div>
);

export default App;
