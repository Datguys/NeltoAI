import { useState, useEffect, createContext, useContext } from 'react';
import { useProjects, Project } from '@/components/dashboard/Features/YourProject';
import { useFirebaseUser } from './useFirebaseUser';

interface ActiveProjectContextType {
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  recentProjects: Project[];
  isLoading: boolean;
}

export const ActiveProjectContext = createContext<ActiveProjectContextType | undefined>(undefined);

export function useActiveProject() {
  const context = useContext(ActiveProjectContext);
  if (context === undefined) {
    throw new Error('useActiveProject must be used within an ActiveProjectProvider');
  }
  return context;
}

export function useActiveProjectLogic() {
  const { projects } = useProjects();
  const { user } = useFirebaseUser();
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load active project from localStorage on mount and when user changes
  useEffect(() => {
    if (!user) {
      setActiveProjectState(null);
      setRecentProjects([]);
      return;
    }

    const userKey = user.uid || user.email || 'anonymous';
    const stored = localStorage.getItem(`activeProject_${userKey}`);
    const recentStored = localStorage.getItem(`recentProjects_${userKey}`);
    
    if (stored) {
      try {
        const activeProjectData = JSON.parse(stored);
        // Find the project in the current projects list to get latest data
        const currentProject = projects.find(p => p.id === activeProjectData.id);
        if (currentProject) {
          setActiveProjectState(currentProject);
        } else {
          // Project no longer exists, clear from storage
          localStorage.removeItem(`activeProject_${userKey}`);
          setActiveProjectState(null);
        }
      } catch (error) {
        console.error('Error loading active project:', error);
        localStorage.removeItem(`activeProject_${userKey}`);
      }
    }

    if (recentStored) {
      try {
        const recentIds = JSON.parse(recentStored);
        const recentProjects = recentIds
          .map((id: string) => projects.find(p => p.id === id))
          .filter(Boolean)
          .slice(0, 3); // Keep only last 3
        setRecentProjects(recentProjects);
      } catch (error) {
        console.error('Error loading recent projects:', error);
        localStorage.removeItem(`recentProjects_${userKey}`);
      }
    }
  }, [user, projects]);

  // Save active project to localStorage and update recent projects
  const setActiveProject = (project: Project | null) => {
    if (!user) return;

    const userKey = user.uid || user.email || 'anonymous';
    
    setActiveProjectState(project);
    
    if (project) {
      // Save active project
      localStorage.setItem(`activeProject_${userKey}`, JSON.stringify({ 
        id: project.id, 
        name: project.name,
        lastActiveAt: Date.now()
      }));
      
      // Update recent projects
      const newRecent = [project.id, ...recentProjects
        .map(p => p.id)
        .filter(id => id !== project.id)
      ].slice(0, 3);
      
      setRecentProjects(newRecent.map(id => projects.find(p => p.id === id)).filter(Boolean) as Project[]);
      localStorage.setItem(`recentProjects_${userKey}`, JSON.stringify(newRecent));

      // TODO: Sync to Firestore for cross-device sync
      syncActiveProjectToCloud(project.id, userKey);
    } else {
      // Clear active project
      localStorage.removeItem(`activeProject_${userKey}`);
    }
  };

  // TODO: Implement cloud sync for cross-device functionality
  const syncActiveProjectToCloud = async (projectId: string, userKey: string) => {
    try {
      // This will be implemented in a future task
      // For now, we only use localStorage
      console.log('Cloud sync not yet implemented');
    } catch (error) {
      console.error('Failed to sync active project to cloud:', error);
    }
  };

  return {
    activeProject,
    setActiveProject,
    recentProjects,
    isLoading,
  };
}