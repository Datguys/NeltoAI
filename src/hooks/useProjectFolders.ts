import { useState, useEffect } from 'react';
import { ProjectFolder } from '@/components/dashboard/Features/YourProject';
import { useFirebaseUser } from './useFirebaseUser';

export function useProjectFolders() {
  const { user } = useFirebaseUser();
  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load folders from localStorage (TODO: sync with Firestore)
  useEffect(() => {
    if (!user) {
      setFolders([]);
      return;
    }

    const userKey = user.uid || user.email || 'anonymous';
    const stored = localStorage.getItem(`projectFolders_${userKey}`);
    
    if (stored) {
      try {
        const folderData = JSON.parse(stored);
        setFolders(folderData);
      } catch (error) {
        console.error('Error loading folders:', error);
        localStorage.removeItem(`projectFolders_${userKey}`);
      }
    }
  }, [user]);

  // Save folders to localStorage
  const saveFolders = (newFolders: ProjectFolder[]) => {
    if (!user) return;
    
    const userKey = user.uid || user.email || 'anonymous';
    localStorage.setItem(`projectFolders_${userKey}`, JSON.stringify(newFolders));
    setFolders(newFolders);
  };

  const createFolder = async (name: string, color: string = '#3B82F6') => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const newFolder: ProjectFolder = {
        id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        color,
        createdAt: new Date(),
        userId: user.uid || user.email || 'anonymous'
      };

      const updatedFolders = [...folders, newFolder];
      saveFolders(updatedFolders);
      
      return newFolder.id;
    } catch (err: any) {
      const errorMsg = `Failed to create folder: ${err.message}`;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateFolder = async (id: string, updates: Partial<Pick<ProjectFolder, 'name' | 'color'>>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedFolders = folders.map(folder =>
        folder.id === id ? { ...folder, ...updates } : folder
      );
      saveFolders(updatedFolders);
    } catch (err: any) {
      const errorMsg = `Failed to update folder: ${err.message}`;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteFolder = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const updatedFolders = folders.filter(folder => folder.id !== id);
      saveFolders(updatedFolders);
    } catch (err: any) {
      const errorMsg = `Failed to delete folder: ${err.message}`;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getFolderById = (id: string) => {
    return folders.find(folder => folder.id === id);
  };

  return {
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
    getFolderById,
    loading,
    error
  };
}