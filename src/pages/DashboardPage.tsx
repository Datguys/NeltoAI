import { useState } from 'react';
import { MainContent } from '@/components/dashboard/MainContent';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // This can be used for any special handling if needed
  };

  return (
    <div className="min-h-screen h-screen w-full flex bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col">
        <Header onSectionChange={handleSectionChange} />
        <div className="flex-1 overflow-auto">
          <MainContent 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange} 
          />
        </div>
      </div>
    </div>
  );
}