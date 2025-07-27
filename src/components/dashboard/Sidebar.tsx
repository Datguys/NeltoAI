import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Calculator, 
  Package, 
  CheckSquare, 
  Clock,
  Zap,
  Settings,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Crown,
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  comingSoon?: boolean;
}

const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "your-project", label: "Your Projects", icon: LayoutDashboard },
  { id: "business-plan", label: "Business Plan Mode", icon: Package },
  { id: "market-intelligence", label: "Market Intelligence", icon: TrendingUp },
  { id: "business-ideas", label: "Business Ideas", icon: Lightbulb },
  { id: "store-sync", label: "Store Sync", icon: Store },
];

const accountItems = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help Center", icon: HelpCircle },
];

export function Sidebar({ activeSection, onSectionChange, className }: SidebarProps) {
  const [progress] = useState(32); // Mock progress value
  const navigate = useNavigate();

  return (
    <div className={cn(
      "w-64 h-full bg-card/30 backdrop-blur-md border-r border-border flex flex-col md:w-64 sm:w-20 xs:hidden",
      className
    )}>
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-lg flex items-center justify-center glow-primary p-1">
            <img src="/veltoai-logo.png" alt="Velto AI" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Velto AI</h1>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-4 py-6">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Navigation
          </h3>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "sidebar-active" : "sidebar"}
                size="default"
                onClick={() => {
                  if (item.comingSoon) {
                    return;
                  }
                  
                  if (item.id === "dashboard") {
                    navigate('/dashboard');
                  } else if (item.id === "your-project") {
                    navigate('/dashboard/your-projects');
                  } else if (item.id === "business-plan") {
                    navigate('/dashboard/business-plan');
                  } else if (item.id === "market-intelligence") {
                    navigate('/dashboard/business-plan?view=market-intelligence');
                  } else if (item.id === "store-sync") {
                    navigate('/dashboard/store-sync');
                  } else if (item.id === "business-ideas") {
                    navigate('/business-ideas');
                  } else if (item.id === "settings") {
                    navigate('/settings');
                  } else {
                    onSectionChange(item.id);
                  }
                }}
                className={cn(
                  "mb-1 h-12 text-left font-medium bg-card/30",
                  isActive && "animate-slide-in",
                  item.comingSoon && "opacity-70 cursor-not-allowed"
                )}
                disabled={item.comingSoon}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.id === "business-ideas" && (
                  <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                    3
                  </span>
                )}
                {item.comingSoon && (
                  <span className="ml-auto bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full border border-border">
                    Coming Soon
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Account Section */}
        <div className="mt-8 space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Account
          </h3>
          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "sidebar-active" : "sidebar"}
                size="default"
                onClick={() => {
                  if (item.id === "settings") {
                    navigate('/settings');
                  } else {
                    onSectionChange(item.id);
                  }
                }}
                className="mb-1 h-12 text-left font-medium bg-card/30"
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </div>


        {/* Upgrade Section */}
        <div className="mt-6 p-4 bg-gradient-secondary rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold text-foreground">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock advanced analytics, unlimited projects, and priority support.
          </p>
          <Button 
            variant="upgrade" 
            size="sm" 
            className="w-full"
            onClick={() => window.location.href = '/upgrade'}
          >
            Start Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
}