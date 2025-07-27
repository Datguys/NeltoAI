import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { Settings as SettingsComponent } from '@/components/dashboard/Settings';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('settings');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="h-screen w-full flex bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col">
        <Header onSectionChange={handleSectionChange} />
        <SettingsComponent onSectionChange={handleSectionChange} />
      </div>
    </div>
  );
}