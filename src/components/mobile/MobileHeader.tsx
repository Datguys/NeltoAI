import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Bell, 
  Menu,
  Settings, 
  Crown,
  User,
  LogOut,
  Building2,
  Zap,
  X
} from 'lucide-react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useCredits } from '@/hooks/useCredits';
import { ActiveProjectDropdown } from '@/components/ActiveProjectDropdown';
import { ProjectNotifications } from '@/components/ProjectNotifications';
import { useProjectReminders } from '@/hooks/useProjectReminders';

interface MobileHeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function MobileHeader({ activeSection, onSectionChange }: MobileHeaderProps) {
  const { user } = useFirebaseUser();
  const { tier, credits } = useCredits();
  const { notifications, dismissNotification, clearAllNotifications } = useProjectReminders();
  const [showNotifications, setShowNotifications] = useState(false);

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'dashboard': return 'Dashboard';
      case 'idea-generator': return 'AI Ideas';
      case 'your-project': return 'My Projects';
      case 'analytics': return 'Analytics';
      case 'chatbot': return 'AI Assistant';
      case 'budget-assistant': return 'Budget Planner';
      case 'settings': return 'Settings';
      case 'affiliate': return 'Affiliate Program';
      case 'upgrade': return 'Upgrade';
      case 'more': return 'More Features';
      default: return 'Founder Launch';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo/Brand or Menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-lg flex items-center justify-center p-1">
              <img src="/veltoai-logo.png" alt="Velto AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{getSectionTitle(activeSection)}</h1>
            </div>
          </div>
        </div>

        {/* Right: Notifications, Credits, Profile */}
        <div className="flex items-center gap-2">
          {/* Credits display - compact for mobile */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-lg">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium">{credits.toLocaleString()}</span>
          </div>

          {/* Notifications */}
          <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  Project reminders and updates
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <ProjectNotifications />
              </div>
            </SheetContent>
          </Sheet>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || ''} alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName || user?.email || 'Anonymous'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <Badge variant="outline" className="w-fit mt-1">
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Mobile: Show credits here */}
              <div className="sm:hidden px-2 py-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">AI Credits</span>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="font-medium">{credits.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator className="sm:hidden" />
              
              <DropdownMenuItem onClick={() => onSectionChange('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSectionChange('upgrade')}>
                <Crown className="mr-2 h-4 w-4" />
                <span>Upgrade Plan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Project Bar - Only show on relevant sections */}
      {(['your-project', 'chatbot', 'budget-assistant'].includes(activeSection)) && (
        <div className="px-4 pb-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Active Project:</span>
            <div className="flex-1">
              <ActiveProjectDropdown />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}