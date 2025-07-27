import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MainContent } from "./MainContent";
import { OnboardingSurvey } from '../OnboardingSurvey';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';
import { ThemedSidebar } from './ThemedSidebar';

export function ThemedDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { theme, themeConfig } = useTheme();

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

  // Professional Theme Layout - Clean white business look
  if (theme === 'professional') {
    return (
      <div 
        className="min-h-screen flex transition-all duration-300"
        style={{ 
          backgroundColor: themeConfig.colors.background,
          color: themeConfig.colors.foreground 
        }}
      >
        {onboarded === false && showSurvey && (
          <OnboardingSurvey onComplete={handleSurveyComplete} onSkip={handleSurveySkip} />
        )}
        
        {/* Professional Sidebar - Compact and Clean */}
        <div 
          className="w-64 border-r transition-all duration-300"
          style={{ 
            backgroundColor: themeConfig.colors.card,
            borderColor: themeConfig.colors.border 
          }}
        >
          <ThemedSidebar 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            theme={theme}
                     />
        </div>
        
        <div className="flex-1 flex flex-col">
          {/* Professional Header - Minimal and Compact */}
          <div 
            className="h-14 border-b px-6 flex items-center justify-between transition-all duration-300"
            style={{ 
              backgroundColor: themeConfig.colors.background,
              borderColor: themeConfig.colors.border 
            }}
          >
            <Header onSectionChange={handleSectionChange} />
          </div>
          
          {/* Professional Content - Dense and Information-Rich */}
          <div className="flex-1 overflow-auto" style={{ backgroundColor: themeConfig.colors.background }}>
            <MainContent 
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
                         />
          </div>
        </div>
      </div>
    );
  }

  // Pure Dark Theme Layout - No purple, clean dark
  if (theme === 'dark') {
    return (
      <div 
        className="min-h-screen flex transition-all duration-300"
        style={{ 
          backgroundColor: themeConfig.colors.background,
          color: themeConfig.colors.foreground 
        }}
      >
        {onboarded === false && showSurvey && (
          <OnboardingSurvey onComplete={handleSurveyComplete} onSkip={handleSurveySkip} />
        )}
        
        {/* Dark Sidebar */}
        <div 
          className="w-72 border-r transition-all duration-300"
          style={{ 
            backgroundColor: themeConfig.colors.card,
            borderColor: themeConfig.colors.border 
          }}
        >
          <ThemedSidebar 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            theme={theme}
                     />
        </div>
        
        <div className="flex-1 flex flex-col">
          {/* Dark Header */}
          <div 
            className="h-20 border-b px-8 flex items-center justify-between transition-all duration-300"
            style={{ 
              backgroundColor: themeConfig.colors.card,
              borderColor: themeConfig.colors.border 
            }}
          >
            <Header onSectionChange={handleSectionChange} />
          </div>
          
          {/* Dark Content */}
          <div className="flex-1 overflow-auto" style={{ backgroundColor: themeConfig.colors.background }}>
            <MainContent 
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
                         />
          </div>
        </div>
      </div>
    );
  }

  // Sidebar-Only Theme Layout - No header, everything in sidebar
  if (theme === 'creative') {
    return (
      <div 
        className="min-h-screen flex transition-all duration-300"
        style={{ 
          backgroundColor: themeConfig.colors.background,
          color: themeConfig.colors.foreground 
        }}
      >
        {onboarded === false && showSurvey && (
          <OnboardingSurvey onComplete={handleSurveyComplete} onSkip={handleSurveySkip} />
        )}
        
        {/* Extended Sidebar with Everything */}
        <div 
          className="w-80 border-r transition-all duration-300"
          style={{ 
            backgroundColor: themeConfig.colors.card,
            borderColor: themeConfig.colors.border 
          }}
        >
          <ThemedSidebar 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            theme={theme}
                       extended={true}
          />
        </div>
        
        {/* Content without header - full height */}
        <div className="flex-1 overflow-auto" style={{ backgroundColor: themeConfig.colors.background }}>
          <MainContent 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
                       isMobile={false}
          />
        </div>
      </div>
    );
  }

  // Default Theme Layout - Original design with purple
  return (
    <div 
      className="min-h-screen flex transition-all duration-300"
      style={{ 
        backgroundColor: themeConfig.colors.background,
        color: themeConfig.colors.foreground 
      }}
    >
      {onboarded === false && showSurvey && (
        <OnboardingSurvey onComplete={handleSurveyComplete} onSkip={handleSurveySkip} />
      )}
      
      <div 
        className="w-72 border-r transition-all duration-300"
        style={{ 
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          borderColor: themeConfig.colors.border 
        }}
      >
        <ThemedSidebar 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          theme={theme}
                 />
      </div>
      
      <div className="flex-1 flex flex-col">
        <div 
          className="h-20 border-b px-8 flex items-center justify-between transition-all duration-300"
          style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: themeConfig.colors.border 
          }}
        >
          <Header onSectionChange={handleSectionChange} />
        </div>
        
        <div 
          className="flex-1 overflow-auto transition-all duration-300"
          style={{ 
            backgroundColor: 'rgba(3, 7, 18, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <MainContent 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
                     />
        </div>
      </div>
    </div>
  );
}