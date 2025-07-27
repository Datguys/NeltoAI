import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ActiveProjectProvider } from "@/components/ActiveProjectProvider";
import AppMain from './AppMain'
import AppDashboard from './AppDashboard'
import './index.css';
import './Database.css'

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ActiveProjectProvider>
          <Routes>
            <Route path="/dashboard/*" element={<AppDashboard />} />
            <Route path="/*" element={<AppMain />} />
          </Routes>
        </ActiveProjectProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
)