import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Folder, 
  FolderPlus,
  FolderOpen,
  MoreVertical,
  Edit,
  Trash2,
  Move
} from 'lucide-react';
import { useProjectFolders } from '@/hooks/useProjectFolders';
import { Project } from '@/components/dashboard/Features/YourProject';

interface FolderManagementProps {
  projects: Project[];
  onMoveToFolder: (projectId: string, folderId: string | undefined) => void;
}

export function FolderManagement({ projects, onMoveToFolder }: FolderManagementProps) {
  const { folders, createFolder, updateFolder, deleteFolder } = useProjectFolders();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    
    setLoading(true);
    try {
      await createFolder(folderName.trim(), folderColor);
      setShowCreateDialog(false);
      setFolderName('');
      setFolderColor('#3B82F6');
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFolder = async () => {
    if (!selectedFolder || !folderName.trim()) return;
    
    setLoading(true);
    try {
      await updateFolder(selectedFolder, { name: folderName.trim(), color: folderColor });
      setShowEditDialog(false);
      setSelectedFolder(null);
      setFolderName('');
      setFolderColor('#3B82F6');
    } catch (error) {
      console.error('Failed to update folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    // Move all projects out of the folder first
    const projectsInFolder = projects.filter(p => p.folderId === folderId);
    for (const project of projectsInFolder) {
      onMoveToFolder(project.id, undefined);
    }
    
    try {
      await deleteFolder(folderId);
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const openEditDialog = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setSelectedFolder(folderId);
      setFolderName(folder.name);
      setFolderColor(folder.color);
      setShowEditDialog(true);
    }
  };

  const openMoveDialog = (project: Project) => {
    setSelectedProject(project);
    setShowMoveDialog(true);
  };

  const handleMoveProject = (folderId: string | undefined) => {
    if (selectedProject) {
      onMoveToFolder(selectedProject.id, folderId);
      setShowMoveDialog(false);
      setSelectedProject(null);
    }
  };

  const getProjectsInFolder = (folderId: string | undefined) => {
    return projects.filter(p => p.folderId === folderId);
  };

  const unorganizedProjects = getProjectsInFolder(undefined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Folders</h3>
          <p className="text-sm text-muted-foreground">
            Organize your projects into folders (Ultra feature)
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <FolderPlus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
      </div>

      {/* Folders List */}
      <div className="space-y-4">
        {/* Unorganized Projects */}
        {unorganizedProjects.length > 0 && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Unorganized</span>
                <Badge variant="outline">{unorganizedProjects.length}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {unorganizedProjects.map(project => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <span className="truncate">{project.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openMoveDialog(project)}
                  >
                    <Move className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Organized Folders */}
        {folders.map(folder => {
          const folderProjects = getProjectsInFolder(folder.id);
          return (
            <div key={folder.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen 
                    className="w-5 h-5" 
                    style={{ color: folder.color }}
                  />
                  <span className="font-medium">{folder.name}</span>
                  <Badge variant="outline">{folderProjects.length}</Badge>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Folder Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openEditDialog(folder.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {folderProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {folderProjects.map(project => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-2 border rounded text-sm"
                    >
                      <span className="truncate">{project.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openMoveDialog(project)}
                      >
                        <Move className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No projects in this folder
                </p>
              )}
            </div>
          );
        })}

        {folders.length === 0 && unorganizedProjects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No folders or projects yet</p>
            <p className="text-sm">Create a folder to organize your projects</p>
          </div>
        )}
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a folder to organize your projects
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Folder Color</Label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      folderColor === color ? 'border-foreground' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFolderColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFolder} 
              disabled={loading || !folderName.trim()}
            >
              {loading ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Update folder name and color
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-folder-name">Folder Name</Label>
              <Input
                id="edit-folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Folder Color</Label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      folderColor === color ? 'border-foreground' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFolderColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditFolder} 
              disabled={loading || !folderName.trim()}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Project Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Project</DialogTitle>
            <DialogDescription>
              Choose a folder for "{selectedProject?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleMoveProject(undefined)}
            >
              <Folder className="w-4 h-4 mr-2 text-muted-foreground" />
              Unorganized
            </Button>
            
            {folders.map(folder => (
              <Button
                key={folder.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleMoveProject(folder.id)}
              >
                <FolderOpen 
                  className="w-4 h-4 mr-2" 
                  style={{ color: folder.color }}
                />
                {folder.name}
              </Button>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}