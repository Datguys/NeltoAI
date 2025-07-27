import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DesktopDashboard } from './dashboard/DesktopDashboard';
import { MobileLayout } from './mobile/MobileLayout';
import { useDataCollection } from '@/hooks/useDataCollection';
import { FeatureRequestDialog } from './ui/FeatureRequestDialog';

export function ResponsiveDashboard() {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { showFeatureRequest, submitFeatureRequest, dismissFeatureRequest } = useDataCollection();

  useEffect(() => {
    const checkIsMobile = () => {
      // Check if screen is mobile size OR if it's a touch device
      const isMobileSize = window.innerWidth < 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Use mobile layout for mobile screens or touch devices
      setIsMobile(isMobileSize || isTouchDevice);
    };

    // Check on mount
    checkIsMobile();

    // Listen for resize events
    window.addEventListener('resize', checkIsMobile);
    
    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(checkIsMobile, 100); // Small delay for orientation change
    });

    return () => {
      window.removeEventListener('resize', checkIsMobile);
      window.removeEventListener('orientationchange', checkIsMobile);
    };
  }, []);

  // Force mobile layout with URL parameter for testing
  const urlParams = new URLSearchParams(window.location.search);
  const forceMobile = urlParams.get('mobile') === 'true';
  const forceDesktop = urlParams.get('desktop') === 'true';

  const shouldUseMobileLayout = forceMobile || (isMobile && !forceDesktop);

  return (
    <div className="min-h-screen">
      {shouldUseMobileLayout ? <MobileLayout /> : <DesktopDashboard />}
      
      <FeatureRequestDialog
        open={showFeatureRequest}
        onSubmit={async (feature: string) => { await submitFeatureRequest(feature); }}
        onDismiss={dismissFeatureRequest}
      />
    </div>
  );
}