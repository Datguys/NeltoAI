import { useEffect, useRef, useCallback } from 'react';
import { AutoSaveService } from '@/lib/aiServices';

interface UseAutoSaveOptions {
  sectionId: string;
  projectId: string;
  userId: string;
  content: string;
  enabled?: boolean;
  interval?: number; // in milliseconds
  onSave?: () => void;
  onError?: (error: Error) => void;
}

export function useAutoSave({
  sectionId,
  projectId,
  userId,
  content,
  enabled = true,
  interval = 30000, // 30 seconds
  onSave,
  onError
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContent = useRef<string>('');
  const isSaving = useRef<boolean>(false);

  const saveContent = useCallback(async () => {
    if (!enabled || isSaving.current || !content || content === lastSavedContent.current) {
      return;
    }

    try {
      isSaving.current = true;
      await AutoSaveService.saveContent(sectionId, projectId, userId, content);
      lastSavedContent.current = content;
      onSave?.();
    } catch (error) {
      console.error('Auto-save failed:', error);
      onError?.(error as Error);
    } finally {
      isSaving.current = false;
    }
  }, [sectionId, projectId, userId, content, enabled, onSave, onError]);

  const scheduleAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (enabled && content && content !== lastSavedContent.current) {
      timeoutRef.current = setTimeout(saveContent, interval);
    }
  }, [saveContent, interval, enabled, content]);

  // Schedule auto-save whenever content changes
  useEffect(() => {
    scheduleAutoSave();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scheduleAutoSave]);

  // Save immediately when component unmounts or user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (content && content !== lastSavedContent.current) {
        // Synchronous save for page unload
        navigator.sendBeacon('/api/autosave', JSON.stringify({
          sectionId,
          projectId,
          userId,
          content
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save on unmount
      if (content && content !== lastSavedContent.current) {
        saveContent();
      }
    };
  }, [sectionId, projectId, userId, content, saveContent]);

  const manualSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await saveContent();
  }, [saveContent]);

  const recoverContent = useCallback(async () => {
    try {
      const recovered = await AutoSaveService.recoverContent(sectionId, userId);
      return recovered;
    } catch (error) {
      console.error('Content recovery failed:', error);
      return null;
    }
  }, [sectionId, userId]);

  return {
    manualSave,
    recoverContent,
    isSaving: isSaving.current
  };
}