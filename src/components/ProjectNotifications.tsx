import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Bell, Rocket, ExternalLink } from 'lucide-react';
import { useProjectReminders } from '@/hooks/useProjectReminders';
import { useNavigate } from 'react-router-dom';
import { useActiveProject } from '@/hooks/useActiveProject';
import { useProjects } from '@/components/dashboard/Features/YourProject';

export function ProjectNotifications() {
  const { notifications, dismissNotification, clearAllNotifications } = useProjectReminders();
  const { setActiveProject } = useActiveProject();
  const { projects } = useProjects();
  const navigate = useNavigate();

  if (notifications.length === 0) return null;

  const handleNotificationClick = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProject(project);
      navigate('/your-projects');
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllNotifications}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
      
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className="p-4 bg-card/95 backdrop-blur-sm border shadow-lg animate-in slide-in-from-right-full duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  Project Reminder
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mr-2 -mt-1"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-sm font-medium text-foreground mb-1">
                {notification.projectName}
              </p>
              
              <p className="text-xs text-muted-foreground mb-3">
                {notification.message}
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleNotificationClick(notification.projectId)}
                >
                  <Rocket className="w-3 h-3 mr-1" />
                  Open Project
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => dismissNotification(notification.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Component to show in Header for notification permission request
export function NotificationPermissionBanner() {
  const [showBanner, setShowBanner] = React.useState(false);
  const { requestNotificationPermission } = useProjectReminders();

  React.useEffect(() => {
    // Check if we should show the permission banner
    if ('Notification' in window && Notification.permission === 'default') {
      setShowBanner(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setShowBanner(false);
    
    if (granted) {
      // Show a success message
      console.log('Notification permission granted');
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40">
      <Card className="p-4 bg-card/95 backdrop-blur-sm border shadow-lg max-w-md">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Enable Project Reminders</p>
            <p className="text-xs text-muted-foreground">
              Get notified when it's time to work on your projects
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBanner(false)}>
              Later
            </Button>
            <Button size="sm" onClick={handleRequestPermission}>
              Enable
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}