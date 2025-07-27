import React from "react";
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Upgrade from "./pages/Upgrade";
import Chatbot from './pages/Chatbot';
import YourProjects from './pages/YourProjects';
import BusinessIdeas from './pages/BusinessIdeas';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import AffiliatePage from './pages/AffiliatePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';

const AppMain = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/upgrade" element={<Upgrade />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/your-projects" element={<YourProjects />} />
      <Route path="/business-ideas" element={<BusinessIdeas />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/affiliate" element={<AffiliatePage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/*" element={<Landing />} />
    </Routes>
  );
};

export default AppMain;