import React, { useEffect, useState } from 'react';
import { Settings } from '@/components/dashboard/Settings';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { MobileLayout } from '@/components/mobile/MobileLayout';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('settings');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const isMobileSize = window.innerWidth < 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileSize || isTouchDevice);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkIsMobile, 100);
    });

    return () => {
      window.removeEventListener('resize', checkIsMobile);
      window.removeEventListener('orientationchange', checkIsMobile);
    };
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Force mobile layout with URL parameter for testing
  const urlParams = new URLSearchParams(window.location.search);
  const forceMobile = urlParams.get('mobile') === 'true';
  const forceDesktop = urlParams.get('desktop') === 'true';
  const shouldUseMobileLayout = forceMobile || (isMobile && !forceDesktop);

  if (shouldUseMobileLayout) {
    return <MobileLayout />;
  }

  return (
    <div className="h-screen w-full flex bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col">
        <Header onSectionChange={handleSectionChange} />
        <div className="flex-1 overflow-auto">
          <Settings onSectionChange={handleSectionChange} />
        </div>
      </div>
    </div>
  );
}