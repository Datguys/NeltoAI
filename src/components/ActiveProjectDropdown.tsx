import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  ChevronDown, 
  Rocket, 
  Plus, 
  Search, 
  Clock,
  Archive,
  FolderOpen
} from 'lucide-react';
import { useActiveProject } from '@/hooks/useActiveProject';
import { useProjects } from '@/components/dashboard/Features/YourProject';

export function ActiveProjectDropdown() {
  const { activeProject, setActiveProject, recentProjects } = useActiveProject();
  const { projects, addProject } = useProjects();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateProject = async () => {
    // Redirect to business ideas page for project creation
    navigate('/business-ideas');
    setIsOpen(false);
  };

  const handleProjectSelect = (project: any) => {
    setActiveProject(project);
    setIsOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-blue-500/20 text-blue-400';
      case 'In Progress': return 'bg-green-500/20 text-green-400';
      case 'Completed': return 'bg-purple-500/20 text-purple-400';
      case 'On Hold': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-10 px-3 text-left justify-between min-w-[200px] max-w-[300px] hover:bg-muted/50"
        >
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <Rocket className="w-4 h-4 text-primary flex-shrink-0" />
            {activeProject ? (
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-medium truncate">{activeProject.name}</span>
                  <Badge className={`text-xs ${getStatusColor(activeProject.status)}`}>
                    {activeProject.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground truncate">{activeProject.category}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select a project</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start">
        <DropdownMenuLabel className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Active Project
        </DropdownMenuLabel>
        
        {/* Search */}
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
        </div>

        {/* Recent Projects */}
        {recentProjects.length > 0 && !searchTerm && (
          <>
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Recent
            </DropdownMenuLabel>
            {recentProjects.slice(0, 3).map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => handleProjectSelect(project)}
                className="flex items-center justify-between p-3 cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="truncate">{project.name}</span>
                </div>
                <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                  {project.status}
                </Badge>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* All Projects */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          All Projects ({filteredProjects.length})
        </DropdownMenuLabel>
        
        <div className="max-h-60 overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </div>
          ) : (
            filteredProjects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => handleProjectSelect(project)}
                className="flex items-center justify-between p-3 cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activeProject?.id === project.id ? 'bg-primary' : 'bg-muted-foreground'
                  }`} />
                  <div className="overflow-hidden">
                    <div className="truncate font-medium">{project.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {project.category}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">
                    {project.progress}%
                  </div>
                  <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                    {project.status}
                  </Badge>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator />
        
        {/* Actions */}
        <DropdownMenuItem onClick={handleCreateProject} className="cursor-pointer p-3">
          <Plus className="w-4 h-4 mr-2" />
          Create New Project
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => {
            navigate('/your-projects');
            setIsOpen(false);
          }} 
          className="cursor-pointer p-3"
        >
          <Archive className="w-4 h-4 mr-2" />
          Manage Projects
        </DropdownMenuItem>
        
        {activeProject && (
          <DropdownMenuItem 
            onClick={() => {
              setActiveProject(null);
              setIsOpen(false);
            }} 
            className="cursor-pointer p-3 text-muted-foreground"
          >
            Clear Active Project
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}