import { useEffect, useState } from 'react';
import { useProjects, Project } from '@/components/dashboard/Features/YourProject';
import { useFirebaseUser } from './useFirebaseUser';

interface ProjectReminder {
  id: string;
  projectId: string;
  projectName: string;
  message: string;
  scheduledFor: Date;
  createdAt: Date;
  sent: boolean;
}

export function useProjectReminders() {
  const { projects, updateProject } = useProjects();
  const { user } = useFirebaseUser();
  const [reminders, setReminders] = useState<ProjectReminder[]>([]);
  const [notifications, setNotifications] = useState<ProjectReminder[]>([]);

  // Check for due reminders every minute
  useEffect(() => {
    if (!user || projects.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const activeProjects = projects.filter(p => 
        !p.isArchived && 
        p.reminderSettings?.enabled && 
        p.status !== 'Completed'
      );

      activeProjects.forEach(project => {
        const settings = project.reminderSettings!;
        const lastReminder = settings.lastReminderSent ? new Date(settings.lastReminderSent) : null;
        
        // Calculate next reminder time
        let shouldSendReminder = false;
        let nextReminderTime: Date;

        if (!lastReminder) {
          // First reminder - send immediately if outside quiet hours
          shouldSendReminder = !isInQuietHours(now, settings.quietHours);
          nextReminderTime = now;
        } else {
          // Calculate based on frequency
          const daysSinceLastReminder = Math.floor((now.getTime() - lastReminder.getTime()) / (24 * 60 * 60 * 1000));
          
          let requiredDays = 1;
          switch (settings.frequency) {
            case 'daily':
              requiredDays = 1;
              break;
            case 'weekly':
              requiredDays = 7;
              break;
            case 'custom':
              requiredDays = settings.customDays || 7;
              break;
          }

          if (daysSinceLastReminder >= requiredDays) {
            shouldSendReminder = !isInQuietHours(now, settings.quietHours);
            nextReminderTime = new Date(lastReminder.getTime() + (requiredDays * 24 * 60 * 60 * 1000));
          }
        }

        if (shouldSendReminder) {
          const reminder: ProjectReminder = {
            id: `${project.id}-${Date.now()}`,
            projectId: project.id,
            projectName: project.name,
            message: generateReminderMessage(project),
            scheduledFor: nextReminderTime,
            createdAt: now,
            sent: false
          };

          // Send notification
          sendNotification(reminder);
          
          // Update last reminder sent time
          updateProject(project.id, {
            reminderSettings: {
              ...settings,
              lastReminderSent: now
            }
          }).catch(console.error);
        }
      });
    };

    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [projects, user]);

  const isInQuietHours = (time: Date, quietHours?: { start: string; end: string }) => {
    if (!quietHours) return false;

    const timeStr = time.toTimeString().slice(0, 5); // HH:mm format
    const { start, end } = quietHours;

    // Handle cases where quiet hours span midnight
    if (start <= end) {
      return timeStr >= start && timeStr <= end;
    } else {
      return timeStr >= start || timeStr <= end;
    }
  };

  const generateReminderMessage = (project: Project): string => {
    const messages = [
      `Time to make progress on "${project.name}"! 🚀`,
      `Don't forget about your project "${project.name}" - every step counts! 💪`,
      `Your project "${project.name}" is waiting for you! Let's keep the momentum going! ⚡`,
      `Ready to work on "${project.name}"? Small progress is still progress! 🎯`,
      `"${project.name}" needs your attention. What's the next milestone? 📈`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  const sendNotification = (reminder: ProjectReminder) => {
    // Browser notification (if permission granted)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Project Reminder: ${reminder.projectName}`, {
        body: reminder.message,
        icon: '/favicon.ico',
        tag: reminder.projectId // Prevent duplicate notifications
      });
    }

    // In-app notification
    setNotifications(prev => [reminder, ...prev.slice(0, 4)]); // Keep last 5 notifications

    // Auto-remove notification after 10 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== reminder.id));
    }, 10000);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    reminders,
    notifications,
    requestNotificationPermission,
    dismissNotification,
    clearAllNotifications
  };
}