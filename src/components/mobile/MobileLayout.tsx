import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './MobileHeader';
import { MainContent } from '../dashboard/MainContent';
import { IdeaGenerator } from '../dashboard/Features/IdeaGenerator';
import { YourProject } from '../dashboard/Features/YourProject';
import { Chatbot } from '../dashboard/Chatbot';
import { Settings } from '../dashboard/Settings';
import { Affiliate } from '../dashboard/Affiliate';
import { OnboardingSurvey } from '../OnboardingSurvey';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

export function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useFirebaseUser();
  const { onboarded, setOnboardedTrue, loading: onboardingLoading } = useOnboardingStatus();
  const [showSurvey, setShowSurvey] = useState(true);

  // Determine active section based on URL path
  const getActiveSectionFromPath = (pathname: string) => {
    if (pathname === '/dashboard' || pathname === '/') return 'dashboard';
    if (pathname === '/business-ideas') return 'idea-generator';
    if (pathname === '/your-projects') return 'your-project';
    if (pathname === '/chatbot') return 'chatbot';
    if (pathname === '/settings') return 'settings';
    if (pathname === '/affiliate') return 'affiliate';
    if (pathname === '/upgrade') return 'upgrade';
    return 'dashboard';
  };

  const [activeSection, setActiveSection] = useState(getActiveSectionFromPath(location.pathname));

  // Update active section when URL changes
  useEffect(() => {
    setActiveSection(getActiveSectionFromPath(location.pathname));
  }, [location.pathname]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    // Navigate to appropriate URL based on section
    switch (section) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'idea-generator':
        navigate('/business-ideas');
        break;
      case 'your-project':
        navigate('/your-projects');
        break;
      case 'chatbot':
        navigate('/chatbot');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'affiliate':
        navigate('/affiliate');
        break;
      case 'upgrade':
        navigate('/upgrade');
        break;
      default:
        setActiveSection(section);
    }
  };

  const handleSurveyComplete = (answers: any) => {
    setOnboardedTrue(answers);
    setShowSurvey(false);
  };
  
  const handleSurveySkip = () => {
    setOnboardedTrue({ skipped: true });
    setShowSurvey(false);
  };

  const renderMobileContent = () => {
    const pathname = location.pathname;
    
    switch (pathname) {
      case '/business-ideas':
        return <IdeaGenerator />;
      case '/your-projects':
        return <YourProject onSectionChange={handleSectionChange} />;
      case '/chatbot':
        return (
          <Chatbot
            selectedProjectId={null}
            onProjectSelect={() => {}}
            onFileUpload={() => {}}
          />
        );
      case '/settings':
        return <Settings onSectionChange={handleSectionChange} />;
      case '/affiliate':
        return <Affiliate />;
      case '/upgrade':
        return (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Upgrade to Pro</h2>
              <p className="text-muted-foreground">Upgrade page coming soon...</p>
            </div>
          </div>
        );
      case '/dashboard':
      case '/':
      default:
        return (
          <MainContent 
            activeSection={"dashboard"}
            onSectionChange={handleSectionChange}
            isMobile={true}
          />
        );
    }
  };

  // Show loading state
  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Welcome to VeltoAI</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your dashboard and start building your business with VeltoAI.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {onboarded === false && showSurvey && (
        <OnboardingSurvey onComplete={handleSurveyComplete} onSkip={handleSurveySkip} />
      )}
      
      {/* Mobile Header */}
      <MobileHeader 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      
      {/* Main Content Area with bottom padding for navigation */}
      <main className="flex-1 overflow-auto pb-20">
        {renderMobileContent()}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
    </div>
  );
}