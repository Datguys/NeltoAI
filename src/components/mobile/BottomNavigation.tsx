import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCredits } from '@/hooks/useCredits';
import { 
  Home,
  Lightbulb, 
  FolderOpen, 
  BarChart3,
  MoreHorizontal,
  Bot,
  DollarSign,
  Calendar,
  Settings,
  Users,
  Crown,
  Zap
} from 'lucide-react';

interface BottomNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function BottomNavigation({ activeSection, onSectionChange }: BottomNavigationProps) {
  const { credits, tier } = useCredits();

  const mainTabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      description: 'Dashboard'
    },
    {
      id: 'idea-generator',
      label: 'Ideas',
      icon: Lightbulb,
      description: 'AI Ideas'
    },
    {
      id: 'your-project',
      label: 'Projects',
      icon: FolderOpen,
      description: 'My Projects'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Analytics'
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      description: 'More Features'
    }
  ];

  const moreFeatures = [
    {
      id: 'chatbot',
      label: 'AI Assistant',
      icon: Bot,
      description: 'Chat with AI',
      tier: 'pro'
    },
    {
      id: 'budget-assistant',
      label: 'Budget Planner',
      icon: DollarSign,
      description: 'Financial Planning',
      tier: 'pro'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'App Settings'
    },
    {
      id: 'affiliate',
      label: 'Affiliate',
      icon: Users,
      description: 'Earn Money'
    },
    {
      id: 'upgrade',
      label: 'Upgrade',
      icon: Crown,
      description: 'Pro Features'
    }
  ];

  const renderTabButton = (tab: any) => {
    const Icon = tab.icon;
    const isActive = activeSection === tab.id;
    
    return (
      <button
        key={tab.id}
        onClick={() => onSectionChange(tab.id)}
        className={`
          flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }
        `}
      >
        <Icon className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">{tab.label}</span>
      </button>
    );
  };

  const renderMoreGrid = () => {
    if (activeSection !== 'more') return null;

    return (
      <div className="absolute bottom-full left-0 right-0 bg-background border-t border-border p-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">More Features</h3>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{credits.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          {moreFeatures.map((feature) => {
            const Icon = feature.icon;
            const isLocked = feature.tier && tier === 'free';
            
            return (
              <button
                key={feature.id}
                onClick={() => {
                  if (isLocked) {
                    onSectionChange('upgrade');
                  } else {
                    onSectionChange(feature.id);
                  }
                }}
                className={`
                  relative p-4 rounded-xl border transition-all duration-200
                  ${isLocked 
                    ? 'border-border bg-muted/30 opacity-60' 
                    : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
                  }
                `}
              >
                {isLocked && (
                  <div className="absolute -top-1 -right-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon className={`w-6 h-6 ${isLocked ? 'text-muted-foreground' : 'text-primary'}`} />
                  <div>
                    <div className="text-sm font-medium text-foreground">{feature.label}</div>
                    <div className="text-xs text-muted-foreground">{feature.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tier indicator */}
        <div className="flex items-center justify-center">
          <Badge 
            variant={tier === 'free' ? 'secondary' : tier === 'starter' ? 'default' : 'destructive'}
            className="text-xs"
          >
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderMoreGrid()}
      
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50">
        <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
          {mainTabs.map(renderTabButton)}
        </div>
        
        {/* Safe area for iOS */}
        <div className="h-safe-area-inset-bottom bg-background/95"></div>
      </nav>
    </>
  );
}