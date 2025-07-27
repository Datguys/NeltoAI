import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useCredits } from '@/hooks/useCredits';
import { useActiveProject } from '@/hooks/useActiveProject';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard,
  Lightbulb,
  FolderOpen,
  Bot,
  BarChart3,
  Calendar,
  DollarSign,
  Settings,
  Users,
  CreditCard,
  Crown,
  LogOut,
  User,
  Building2,
  Palette,
  Zap,
  TrendingUp,
  Shield,
  ChevronDown
} from "lucide-react";

interface ThemedSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  theme: string;
  extended?: boolean;
}

export function ThemedSidebar({ activeSection, onSectionChange, theme, extended = false }: ThemedSidebarProps) {
  const { themeConfig } = useTheme();
  const { user } = useFirebaseUser();
  const { tier, credits } = useCredits();
  const { activeProject } = useActiveProject();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "idea-generator", label: "Idea Generator", icon: Lightbulb },
    { id: "your-project", label: "Your Projects", icon: FolderOpen },
    { id: "chatbot", label: "AI Assistant", icon: Bot },
    { id: "budget-assistant", label: "Budget Planner", icon: DollarSign },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const settingsItems = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "affiliate", label: "Affiliate Program", icon: Users },
    { id: "upgrade", label: "Upgrade", icon: Crown },
  ];

  const renderCompanyHeader = () => {
    if (theme === 'professional') {
      return (
        <div className="p-4 border-b" style={{ borderColor: themeConfig.colors.border }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: themeConfig.colors.primary, color: 'white' }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: themeConfig.colors.foreground }}>
                Founder Launch
              </h2>
              <p className="text-xs" style={{ color: themeConfig.colors.muted }}>
                Startup Platform
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (theme === 'dark') {
      return (
        <div className="p-6 border-b" style={{ borderColor: themeConfig.colors.border }}>
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: themeConfig.colors.primary, color: 'white' }}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ color: themeConfig.colors.foreground }}>
                Founder Launch
              </h2>
              <p className="text-sm" style={{ color: themeConfig.colors.muted }}>
                AI-Powered Startup Platform
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (theme === 'creative') {
      return (
        <div className="p-6 border-b-4" style={{ borderColor: themeConfig.colors.border }}>
          <div className="text-center space-y-4">
            <div 
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl"
              style={{ backgroundColor: themeConfig.colors.primary, color: 'white' }}
            >
              🚀
            </div>
            <div>
              <h2 
                className="font-black text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
              >
                Founder Launch ✨
              </h2>
              <p className="text-lg font-bold" style={{ color: themeConfig.colors.muted }}>
                Make Magic Happen! 🪄
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Default theme
    return (
      <div className="p-6 border-b" style={{ borderColor: themeConfig.colors.border }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-foreground">Founder Launch</h2>
            <p className="text-sm text-muted-foreground">AI Startup Platform</p>
          </div>
        </div>
      </div>
    );
  };

  const renderProfileSection = () => {
    const profileContent = (
      <div className="flex items-center gap-3 w-full">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.photoURL || ''} />
          <AvatarFallback style={{ backgroundColor: themeConfig.colors.primary, color: 'white' }}>
            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate" style={{ color: themeConfig.colors.foreground }}>
            {user?.displayName || user?.email || 'Anonymous'}
          </div>
          <div className="text-xs truncate" style={{ color: themeConfig.colors.muted }}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
          </div>
        </div>
        {!extended && <ChevronDown className="w-4 h-4" style={{ color: themeConfig.colors.muted }} />}
      </div>
    );

    if (extended) {
      return (
        <div className="p-4 border-b space-y-4" style={{ borderColor: themeConfig.colors.border }}>
          {profileContent}
          
          {/* Extended profile actions for sidebar-only theme */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: themeConfig.colors.muted }}>AI Credits</span>
              <Badge variant="outline">{credits.toLocaleString()}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => onSectionChange('settings')}
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => onSectionChange('upgrade')}
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => onSectionChange('affiliate')}
            >
              <Users className="w-3 h-3 mr-1" />
              Affiliate Program
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 border-b" style={{ borderColor: themeConfig.colors.border }}>
        <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full p-2 h-auto justify-start">
              {profileContent}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSectionChange('settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSectionChange('upgrade')}>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSectionChange('affiliate')}>
              <Users className="w-4 h-4 mr-2" />
              Affiliate Program
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const handleNavigation = (itemId: string) => {
    
    // Handle other navigation
    onSectionChange(itemId);
  };

  const renderMenuItem = (item: any, isSettings = false) => {
    const isActive = activeSection === item.id;
    const Icon = item.icon;

    if (theme === 'professional') {
      return (
        <Button
          key={item.id}
          variant={isActive ? "secondary" : "ghost"}
          className="w-full justify-start text-sm h-9 px-3"
          onClick={() => handleNavigation(item.id)}
          style={{
            backgroundColor: isActive ? themeConfig.colors.primary : 'transparent',
            color: isActive ? 'white' : themeConfig.colors.foreground,
          }}
        >
          <Icon className="w-4 h-4 mr-3" />
          {item.label}
        </Button>
      );
    }

    if (theme === 'dark') {
      return (
        <Button
          key={item.id}
          variant={isActive ? "secondary" : "ghost"}
          className="w-full justify-start text-base h-11 px-4"
          onClick={() => handleNavigation(item.id)}
          style={{
            backgroundColor: isActive ? themeConfig.colors.primary : 'transparent',
            color: isActive ? 'white' : themeConfig.colors.foreground,
          }}
        >
          <Icon className="w-5 h-5 mr-4" />
          {item.label}
        </Button>
      );
    }

    if (theme === 'creative') {
      return (
        <Button
          key={item.id}
          variant={isActive ? "secondary" : "ghost"}
          className="w-full justify-start text-lg h-12 px-4 font-bold rounded-2xl"
          onClick={() => handleNavigation(item.id)}
          style={{
            backgroundColor: isActive ? themeConfig.colors.primary : 'transparent',
            color: isActive ? 'white' : themeConfig.colors.foreground,
          }}
        >
          <Icon className="w-6 h-6 mr-4" />
          {item.label}
          {isActive && <span className="ml-auto">✨</span>}
        </Button>
      );
    }

    // Default theme
    return (
      <Button
        key={item.id}
        variant={isActive ? "secondary" : "ghost"}
        className="w-full justify-start h-10 px-4"
        onClick={() => handleNavigation(item.id)}
        style={{
          backgroundColor: isActive ? 'rgba(147, 51, 234, 0.2)' : 'transparent',
          color: isActive ? 'rgb(147, 51, 234)' : themeConfig.colors.foreground,
        }}
      >
        <Icon className="w-4 h-4 mr-3" />
        {item.label}
      </Button>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {renderCompanyHeader()}
      {renderProfileSection()}
      
      <div className="flex-1 overflow-auto">
        <div className={theme === 'professional' ? 'p-2 space-y-1' : theme === 'creative' ? 'p-4 space-y-3' : 'p-4 space-y-2'}>
          {/* Main Navigation */}
          <div className="space-y-1">
            {theme === 'professional' && (
              <div className="text-xs font-medium uppercase tracking-wider px-3 py-2" style={{ color: themeConfig.colors.muted }}>
                Navigation
              </div>
            )}
            {menuItems.map(item => renderMenuItem(item))}
          </div>

          {/* Settings Section */}
          {!extended && (
            <div className="pt-4 mt-4 border-t space-y-1" style={{ borderColor: themeConfig.colors.border }}>
              {theme === 'professional' && (
                <div className="text-xs font-medium uppercase tracking-wider px-3 py-2" style={{ color: themeConfig.colors.muted }}>
                  Account
                </div>
              )}
              {settingsItems.map(item => renderMenuItem(item, true))}
            </div>
          )}
        </div>
      </div>

      {/* Credits display at bottom */}
      {theme !== 'creative' && (
        <div className="p-4 border-t" style={{ borderColor: themeConfig.colors.border }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: themeConfig.colors.muted }}>AI Credits</span>
            <Badge variant="outline" style={{ borderColor: themeConfig.colors.border }}>
              <Zap className="w-3 h-3 mr-1" />
              {credits.toLocaleString()}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}