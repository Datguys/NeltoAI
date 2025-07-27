import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MainContent } from "./MainContent";
import { OnboardingSurvey } from '../OnboardingSurvey';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';

export function DesktopDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const { onboarded, setOnboardedTrue, loading } = useOnboardingStatus();
  const [showSurvey, setShowSurvey] = useState(true);

  const handleSurveyComplete = (answers: any) => {
    setOnboardedTrue(answers);
    setShowSurvey(false);
  };
  
  const handleSurveySkip = () => {
    setOnboardedTrue({ skipped: true });
    setShowSurvey(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {onboarded === false && showSurvey && (
        <OnboardingSurvey onComplete={handleSurveyComplete} onSkip={handleSurveySkip} />
      )}
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <div className="flex-1 flex flex-col">
        <Header onSectionChange={handleSectionChange} />
        <MainContent 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </div>
    </div>
  );
}