import React, { useState, useEffect } from 'react';
import { Chatbot as ChatbotComponent } from '@/components/dashboard/Chatbot';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useActiveProject } from '@/hooks/useActiveProject';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { useCredits } from '@/hooks/useCredits';

export default function ChatbotPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('chatbot');
  const [isMobile, setIsMobile] = useState(false);
  const { activeProject } = useActiveProject();
  const { tier } = useCredits();

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

  // Auto-select the active project when available
  useEffect(() => {
    if (activeProject && !selectedProjectId) {
      setSelectedProjectId(activeProject.id);
    }
  }, [activeProject, selectedProjectId]);
  
  const handleFileUpload = (file: File) => {
    // TODO: Implement file upload logic
    console.log('File uploaded:', file.name);
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
    <div className="min-h-screen h-screen w-full flex bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col">
        <Header onSectionChange={setActiveSection} />
        <div className="flex-1 overflow-hidden">
          <ChatbotComponent
            selectedProjectId={selectedProjectId}
            onProjectSelect={setSelectedProjectId}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
}