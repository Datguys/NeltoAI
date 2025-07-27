import { useState } from 'react';
import { Affiliate } from '@/components/dashboard/Affiliate';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

export default function AffiliatePage() {
  const [activeSection, setActiveSection] = useState('affiliate');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // This can be used for any special handling if needed
  };

  return (
    <div className="h-screen w-full flex bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col">
        <Header onSectionChange={handleSectionChange} />
        <div className="flex-1 overflow-auto">
          <Affiliate />
        </div>
      </div>
    </div>
  );
}