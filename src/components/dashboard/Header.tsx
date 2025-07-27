import { Button } from "@/components/ui/button";
import { 
  Search, 
  Bell, 
  Settings, 
  ChevronDown, 
  Crown,
  User,
  LogOut,
  Sparkles,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useCredits } from '@/hooks/useCredits';

interface HeaderProps {
  onSectionChange: (section: string) => void;
}

import { ChatbotTokenBar } from './ChatbotTokenBar';
import { ActiveProjectDropdown } from '@/components/ActiveProjectDropdown';
import { ProjectNotifications, NotificationPermissionBanner } from '@/components/ProjectNotifications';
import { useProjectReminders } from '@/hooks/useProjectReminders';
import { useState } from 'react';

export function Header({ onSectionChange }: HeaderProps) {
  const { user, loading } = useFirebaseUser();
  const { tier, usedThisMonth, getRemainingTokens, getMaxTokens, setTier } = useCredits();
  const { notifications, dismissNotification, clearAllNotifications } = useProjectReminders();
  const [showNotifications, setShowNotifications] = useState(false);
  // Robust tier label logic
  let tierLabel = 'Free';
  let badgeColor = 'bg-gray-300 text-gray-800';
  if (tier === 'starter') {
    tierLabel = 'Starter';
    badgeColor = 'bg-blue-500 text-white';
  } else if (tier === 'ultra') {
    tierLabel = 'Ultra';
    badgeColor = 'bg-purple-600 text-white';
  }
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <>
      <NotificationPermissionBanner />
      <ProjectNotifications />
      <header className="h-16 border-b border-border bg-card/30 backdrop-blur-md px-4 md:px-6 flex items-center justify-between">
      {/* Search Section */}
      <div className="flex items-center gap-4 flex-1">
        {/* Active Project Dropdown */}
        <ActiveProjectDropdown />
        
        <div className="relative max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search features..."
            className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
          />
        </div>
      </div>

      {/* Token Usage Bar */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:block" style={{ minWidth: 220 }}>
          <ChatbotTokenBar />
        </div>
        {/* Compact credits display for smaller screens */}
        <div className="lg:hidden flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-lg">
          <span className="text-xs text-muted-foreground">Tokens:</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{getRemainingTokens().toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">/ {getMaxTokens().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Current Plan Badge */}
        <div className="flex items-center gap-2">
          <Badge 
            className={badgeColor + " px-3 py-1 rounded-full text-xs font-semibold ml-1"}
          >
            {tierLabel}
          </Badge>
          {tier === 'free' && (
            <Button 
              variant="primary" 
              size="sm"
              className="glow-primary ml-2"
              onClick={() => navigate('/upgrade')}
            >
              Upgrade
            </Button>
          )}
        </div>

        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs font-bold text-destructive-foreground">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-80 max-h-96 overflow-y-auto bg-popover border-border"
            sideOffset={5}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {notifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllNotifications}
                    className="text-xs h-6"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-card/50 rounded-lg border border-border/50 hover:bg-card/70 transition-colors cursor-pointer"
                      onClick={() => {
                        // Handle notification click (navigate to project)
                        setShowNotifications(false);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bell className="w-3 h-3 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {notification.projectName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleTimeString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {notifications.length > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-xs text-muted-foreground">
                        {notifications.length - 5} more notifications...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-10 px-3">
              {user && user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover glow-primary" />
              ) : (
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center glow-primary">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-foreground">{user ? user.displayName || user.email : loading ? 'Loading...' : 'Anonymous'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-popover border-border glow-card"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-foreground">{user ? user.displayName || user.email : loading ? 'Loading...' : 'Anonymous'}</p>
              {user && user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onSectionChange("profile")}
              className="hover:bg-card-hover cursor-pointer"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/settings')}
              className="hover:bg-card-hover cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            {tier === 'free' && (
              <DropdownMenuItem 
                className="hover:bg-card-hover cursor-pointer text-warning glow-primary"
                onClick={() => navigate('/upgrade')}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="hover:bg-card-hover cursor-pointer text-primary"
              onClick={() => navigate('/affiliate')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Affiliate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-destructive/10 cursor-pointer text-destructive" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </>
  );
}