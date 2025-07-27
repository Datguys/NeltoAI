import { useState, useEffect } from "react";
import { BusinessPlanMode } from "@/components/dashboard/Features/BusinessPlanMode";
import { BusinessPlanSectionBuilder } from "@/components/dashboard/Features/BusinessPlanSectionBuilder";
import { BusinessPlanSectionDetail } from "@/components/dashboard/Features/BusinessPlanSectionDetail";
import { LiveMarketIntelligence } from "@/components/dashboard/Features/LiveMarketIntelligence";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function BusinessPlan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<'dashboard' | 'section' | 'market-intelligence'>('dashboard');
  const [currentSection, setCurrentSection] = useState<number | null>(null);
  const [sectionContents, setSectionContents] = useState<Record<number, string>>({});

  // Check URL params for initial view
  useEffect(() => {
    const view = searchParams.get('view');
    const section = searchParams.get('section');
    
    if (view === 'market-intelligence') {
      setCurrentView('market-intelligence');
    } else if (view === 'section' && section) {
      setCurrentView('section');
      setCurrentSection(parseInt(section));
    } else {
      setCurrentView('dashboard');
    }
  }, [searchParams]);

  const handleSectionEdit = (sectionId: number) => {
    setCurrentSection(sectionId);
    setCurrentView('section');
    navigate(`/dashboard/business-plan?view=section&section=${sectionId}`);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentSection(null);
    navigate('/dashboard/business-plan');
  };

  const handleNextSection = (sectionId: number, content: string) => {
    setSectionContents(prev => ({
      ...prev,
      [sectionId]: content
    }));
    if (currentSection && currentSection < 8) {
      const nextSectionId = currentSection + 1;
      setCurrentSection(nextSectionId);
      navigate(`/dashboard/business-plan?view=section&section=${nextSectionId}`);
    } else {
      handleBackToDashboard();
    }
  };

  const handleMarketIntelligence = () => {
    setCurrentView('market-intelligence');
    navigate('/dashboard/business-plan?view=market-intelligence');
  };

  if (currentView === 'market-intelligence') {
    return <LiveMarketIntelligence />;
  }

  if (currentView === 'section' && currentSection) {
    const sectionTitles = {
      1: "Executive Summary",
      2: "Business Description", 
      3: "Market Analysis",
      4: "Competition Analysis",
      5: "Financial Projections",
      6: "Marketing Strategy",
      7: "Operations Plan",
      8: "Risk Assessment"
    };

    return (
      <BusinessPlanSectionDetail
        sectionId={currentSection}
        sectionTitle={sectionTitles[currentSection as keyof typeof sectionTitles]}
        onBack={handleBackToDashboard}
        aiContent={sectionContents[currentSection]}
      />
    );
  }

  return <BusinessPlanMode />;
}