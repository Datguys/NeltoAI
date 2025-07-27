import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Edit, 
  Archive, 
  ArchiveRestore,
  Trash2, 
  Bell,
  BellOff,
  Folder,
  FolderOpen,
  Settings as SettingsIcon
} from 'lucide-react';
import { Project, useProjects } from '@/components/dashboard/Features/YourProject';
import { useCredits } from '@/hooks/useCredits';
import { useStreaks } from '@/hooks/useStreaks';

interface ProjectManagementModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  mode: 'rename' | 'settings' | 'archive' | 'delete';
}

export function ProjectManagementModal({ project, isOpen, onClose, mode }: ProjectManagementModalProps) {
  const { renameProject, archiveProject, unarchiveProject, removeProject, toggleProjectReminder, updateReminderSettings } = useProjects();
  const { trackProjectWork } = useStreaks();
  const [newName, setNewName] = useState(project.name);
  const [reminderEnabled, setReminderEnabled] = useState(project.reminderSettings?.enabled || false);
  const [reminderFrequency, setReminderFrequency] = useState(project.reminderSettings?.frequency || 'weekly');
  const [customDays, setCustomDays] = useState(project.reminderSettings?.customDays || 7);
  const [quietStart, setQuietStart] = useState(project.reminderSettings?.quietHours?.start || '22:00');
  const [quietEnd, setQuietEnd] = useState(project.reminderSettings?.quietHours?.end || '08:00');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      switch (mode) {
        case 'rename':
          if (newName.trim() && newName !== project.name) {
            await renameProject(project.id, newName.trim());
            // Track project work for streak
            trackProjectWork();
          }
          break;
        case 'settings':
          await updateReminderSettings(project.id, {
            enabled: reminderEnabled,
            frequency: reminderFrequency as 'daily' | 'weekly' | 'custom',
            customDays: reminderFrequency === 'custom' ? customDays : undefined,
            quietHours: { start: quietStart, end: quietEnd }
          });
          // Track project work for streak
          trackProjectWork();
          break;
        case 'archive':
          if (project.isArchived) {
            await unarchiveProject(project.id);
          } else {
            await archiveProject(project.id);
          }
          // Track project work for streak
          trackProjectWork();
          break;
        case 'delete':
          await removeProject(project.id);
          break;
      }
      onClose();
    } catch (error) {
      console.error('Project operation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDialogContent = () => {
    switch (mode) {
      case 'rename':
        return {
          title: 'Rename Project',
          description: 'Enter a new name for your project.',
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter project name..."
                />
              </div>
            </div>
          )
        };
      
      case 'settings':
        return {
          title: 'Project Reminder Settings',
          description: 'Configure when and how you want to be reminded about this project.',
          content: (
            <div className="space-y-6">
              {/* Enable Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Project Reminders</Label>
                  <div className="text-sm text-muted-foreground">
                    Get notifications to stay on track with your project
                  </div>
                </div>
                <Switch
                  checked={reminderEnabled}
                  onCheckedChange={setReminderEnabled}
                />
              </div>

              {reminderEnabled && (
                <>
                  {/* Frequency */}
                  <div className="space-y-2">
                    <Label>Reminder Frequency</Label>
                    <Select value={reminderFrequency} onValueChange={(value) => setReminderFrequency(value as "daily" | "weekly" | "custom")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Days */}
                  {reminderFrequency === 'custom' && (
                    <div className="space-y-2">
                      <Label>Remind me every (days)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={customDays}
                        onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  )}

                  {/* Quiet Hours */}
                  <div className="space-y-4">
                    <Label>Quiet Hours</Label>
                    <div className="text-sm text-muted-foreground mb-2">
                      No reminders will be sent during these hours
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Start</Label>
                        <Input
                          type="time"
                          value={quietStart}
                          onChange={(e) => setQuietStart(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">End</Label>
                        <Input
                          type="time"
                          value={quietEnd}
                          onChange={(e) => setQuietEnd(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        };

      case 'archive':
        return {
          title: project.isArchived ? 'Unarchive Project' : 'Archive Project',
          description: project.isArchived 
            ? 'This will move the project back to your active projects list.'
            : 'This will move the project to your archived projects. You can unarchive it later.',
          content: (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{project.category}</Badge>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
              </div>
            </div>
          )
        };

      case 'delete':
        return {
          title: 'Delete Project',
          description: 'This action cannot be undone. All project data will be permanently deleted.',
          content: (
            <div className="space-y-4">
              <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <h3 className="font-medium text-destructive">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{project.category}</Badge>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                This will permanently delete:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Project details and settings</li>
                  <li>Timeline and milestones</li>
                  <li>Budget and financial data</li>
                  <li>Any associated reminders</li>
                </ul>
              </div>
            </div>
          )
        };

      default:
        return { title: '', description: '', content: null };
    }
  };

  const { title, description, content } = getDialogContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {content}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || (mode === 'rename' && (!newName.trim() || newName === project.name))}
            variant={mode === 'delete' ? 'destructive' : 'default'}
          >
            {loading ? 'Saving...' : 
             mode === 'delete' ? 'Delete Project' : 
             mode === 'archive' ? (project.isArchived ? 'Unarchive' : 'Archive') : 
             'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ProjectActionsMenuProps {
  project: Project;
  onAction: (action: string) => void;
}

export function ProjectActionsMenu({ project, onAction }: ProjectActionsMenuProps) {
  const { tier } = useCredits();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onAction('rename')}>
          <Edit className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction('settings')}>
          <SettingsIcon className="mr-2 h-4 w-4" />
          Reminder Settings
        </DropdownMenuItem>
        
        {tier === 'ultra' && (
          <DropdownMenuItem onClick={() => onAction('move-to-folder')}>
            <Folder className="mr-2 h-4 w-4" />
            Move to Folder
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onAction('archive')}>
          {project.isArchived ? (
            <>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive
            </>
          ) : (
            <>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onAction('delete')} 
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}