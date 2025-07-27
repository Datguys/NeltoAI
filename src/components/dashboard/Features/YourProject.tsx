import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { getUserProjects, addUserProject, updateUserProject, deleteUserProject, hardDeleteAllUserProjects } from '@/lib/firestoreProjects';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ProjectDetail from "./ProjectDetail";
import { 
  FolderOpen,
  Folder,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  Archive,
  Star
} from "lucide-react";
import { getAICompletion } from '@/lib/ai';
import { ProjectActionsMenu, ProjectManagementModal } from '@/components/ProjectManagementModal';
import { FolderManagement } from '@/components/FolderManagement';
import { useCredits } from '@/hooks/useCredits';
import { useProjectFolders } from '@/hooks/useProjectFolders';
import { canCreateMoreProjects, getProjectLimit } from '@/lib/tiers';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStreaks } from '@/hooks/useStreaks';

// --- Shared Project Storage Hook ---
export interface ProjectFolder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  userId: string;
}

export interface Project {
  timeToLaunch?: string;
  teamSize?: string;
  targetAudience?: string;
  summary?: string; // Stores the AI-generated summary for this project
  milestones?: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority?: string;
    estimatedHours?: number;
    deadline?: string;
    summary?: string;
    tasks?: string[];
  }>;
  // Required fields
  lastUpdated?: string;
  id: string;
  name: string;
  description: string;
  rating?: number; // Star rating out of 10
  status: "Planning" | "In Progress" | "Completed" | "On Hold";
  progress: number;
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  timeline: {
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
  analytics: {
    revenue: number;
    customers: number;
    growth: number;
  };
  category: string;

  // Enhanced project management fields
  isArchived?: boolean;
  archivedAt?: Date;
  folderId?: string; // For Ultra users
  
  // Reminder settings
  reminderSettings?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'custom';
    customDays?: number;
    lastReminderSent?: Date;
    quietHours?: {
      start: string; // HH:mm format
      end: string;   // HH:mm format
    };
  };

  // Optional fields for ProjectDetail compatibility
  title?: string;
  difficulty?: string;
  tags?: string[];
  timeToMarket?: string;
  estimatedCost?: string;
  marketSize?: string;
  legal?: {
    requirements: string[];
    completed: number;
  };
  // Enhanced budget breakdown
  budgetBreakdown?: {
    development: number;
    marketing: number;
    legal: number;
    operations: number;
    contingency: number;
    total: number;
  };
  finances?: {
    revenue: number;
    expenses: number;
    projectedRevenue?: number;
    breakEvenMonth?: number;
    monthlyRevenue?: number[];
    monthlyExpenses?: number[];
  };
  businessTimeline?: {
    id: string;
    projectId: string;
    projectName: string;
    timeToLaunch: number;
    launchDate: Date;
    tasks: Array<{
      id: string;
      title: string;
      description: string;
      month: number;
      priority: 'high' | 'medium' | 'low';
      status: 'pending' | 'in-progress' | 'completed';
      estimatedHours: number;
      dependencies: string[];
      category: 'development' | 'marketing' | 'business' | 'design' | 'legal' | 'finance';
    }>;
    generatedAt: Date;
  };
}

export function useProjects() {
  const { user } = useFirebaseUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackProjectWork } = useStreaks();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserProjects(user.uid)
      .then(setProjects)
      .catch((err) => setError("Failed to load projects"))
      .finally(() => setLoading(false));
  }, [user]);

  const addProject = async (project: Omit<Project, "id">) => {
    if (!user) {
      const errorMsg = "Not authenticated";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('🔄 useProjects.addProject called');
    console.log('👤 User ID:', user.uid);
    console.log('📝 Project to add:', project);

    setLoading(true);
    setError(null);
    
    try {
      const id = await addUserProject(user.uid, project);
      console.log('✅ Firestore returned ID:', id);
      
      const savedProjects = await getUserProjects(user.uid);
      console.log('📦 All projects after save:', savedProjects);
      
      const savedProject = savedProjects.find(p => p.id === id);
      if (!savedProject) {
        throw new Error('Project was not saved properly');
      }
      
      setProjects(savedProjects);
      // Track project work for streak when adding new project
      trackProjectWork();
      return id;
    } catch (err: any) {
      const errorMsg = `Failed to add project: ${err.message}`;
      console.error('❌', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeProject = async (id: string) => {
    if (!user) {
      setError("Not authenticated");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Attempting to remove project:', id);
      console.log('📋 Project ID details:', {
        id: id,
        type: typeof id,
        length: id.length,
        charCodes: id.split('').map(c => c.charCodeAt(0))
      });
      
      // Verify project exists locally first
      const projectToDelete = projects.find(p => p.id === id);
      if (!projectToDelete) {
        console.error('❌ Project not found in local state:', id);
        console.log('📋 Available project IDs:', projects.map(p => ({ id: p.id, name: p.name })));
        throw new Error(`Project with ID ${id} not found in local state`);
      }
      
      console.log('📋 Found project to delete:', {
        id: projectToDelete.id,
        name: projectToDelete.name
      });
      
      // Delete from Firestore first (this won't throw for non-existent projects)
      console.log('🗑️ Calling deleteUserProject...');
      await deleteUserProject(id);
      console.log('✅ Project deletion attempt completed');
      
      // Always update local state to remove the project (whether it existed in Firestore or not)
      setProjects((prev) => {
        const filtered = prev.filter((p) => p.id !== id);
        console.log('🔄 Local state updated. Projects before:', prev.length, 'after:', filtered.length);
        return filtered;
      });
      
      // Clean up localStorage
      const userKey = user.uid || user.email || 'anonymous';
      const storageKeys = [
        `projects_${userKey}`,
        `project_${id}`,
        `project_data_${id}`
      ];
      
      storageKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log('🗑️ Cleaned localStorage key:', key);
        } catch (e) {
          console.warn('Failed to clean localStorage key:', key, e);
        }
      });
      
      console.log('✅ Project removal completed successfully');
    } catch (err: any) {
      console.error('❌ Failed to delete project:', err);
      console.error('❌ Error details:', {
        message: err.message,
        code: err.code,
        name: err.name,
        stack: err.stack
      });
      
      setError(`Failed to delete project: ${err.message}`);
      
      // Refresh from server to ensure UI consistency
      try {
        console.log('🔄 Refreshing projects from server after error...');
        const allProjects = await getUserProjects(user.uid);
        setProjects(allProjects);
        console.log('🔄 Projects refreshed, count:', allProjects.length);
      } catch (refreshErr) {
        console.error('❌ Failed to refresh projects after delete error:', refreshErr);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) {
      const errorMsg = "Not authenticated";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('🔄 useProjects.updateProject called');
    console.log('📝 Project ID:', id);
    console.log('📝 Updates:', updates);

    const existingProject = projects.find(p => p.id === id);
    if (!existingProject) {
      const errorMsg = `Project with ID ${id} not found in local state`;
      console.error('❌', errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    
    try {
      await updateUserProject(id, updates);
      console.log('✅ Firestore update successful');
      
      // Always update local state
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      
      // Track project work for streak when updating project
      trackProjectWork();
      
    } catch (err: any) {
      const errorMsg = `Failed to update project: ${err.message}`;
      console.error('❌', errorMsg);
      setError(errorMsg);
      
      if (err.message.includes('No document to update')) {
        console.log('🔄 Attempting to refresh projects from Firestore...');
        try {
          const freshProjects = await getUserProjects(user.uid);
          setProjects(freshProjects);
          console.log('✅ Projects refreshed from Firestore');
        } catch (refreshErr) {
          console.error('❌ Failed to refresh projects:', refreshErr);
        }
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced project management functions
  const renameProject = async (id: string, newName: string) => {
    await updateProject(id, { name: newName });
    // trackProjectWork is already called in updateProject
  };

  const archiveProject = async (id: string) => {
    try {
      console.log('📎 Archiving project:', id);
      await updateProject(id, { 
        isArchived: true, 
        archivedAt: new Date() 
      });
      console.log('✅ Project archived successfully');
      // trackProjectWork is already called in updateProject
    } catch (err: any) {
      console.error('❌ Failed to archive project:', err);
      throw err;
    }
  };

  const unarchiveProject = async (id: string) => {
    await updateProject(id, { 
      isArchived: false, 
      archivedAt: undefined 
    });
    // trackProjectWork is already called in updateProject
  };

  const toggleProjectReminder = async (id: string, enabled: boolean) => {
    const project = projects.find(p => p.id === id);
    const reminderSettings = project?.reminderSettings || {
      enabled: false,
      frequency: 'weekly',
      quietHours: { start: '22:00', end: '08:00' }
    };
    
    await updateProject(id, {
      reminderSettings: { ...reminderSettings, enabled }
    });
    // trackProjectWork is already called in updateProject
  };

  const updateReminderSettings = async (id: string, settings: Partial<Project['reminderSettings']>) => {
    const project = projects.find(p => p.id === id);
    const currentSettings = project?.reminderSettings || {
      enabled: false,
      frequency: 'weekly',
      quietHours: { start: '22:00', end: '08:00' }
    };
    
    await updateProject(id, {
      reminderSettings: { ...currentSettings, ...settings }
    });
    // trackProjectWork is already called in updateProject
  };

  const moveToFolder = async (projectId: string, folderId: string | undefined) => {
    if (!user) {
      setError("Not authenticated");
      return;
    }

    console.log('📁 Moving project to folder:', projectId, '->', folderId);
    console.log('📁 Project ID type:', typeof projectId, 'Length:', projectId.length);
    console.log('📁 Project ID chars:', projectId.split('').map(c => c.charCodeAt(0)));
    
    // Check if projectId looks like a malformed ID (name-timestamp format)
    if (projectId.includes('-') && projectId.match(/.*-\d{13}$/)) {
      console.warn('⚠️ Detected malformed project ID:', projectId);
      const errorMsg = `Project ID appears to be malformed (${projectId}). Please refresh the page and try again.`;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    // First check if the project exists in local state
    const existingProject = projects.find(p => p.id === projectId);
    if (!existingProject) {
      const errorMsg = `Project with ID ${projectId} not found in local state`;
      console.error('❌', errorMsg);
      console.log('📦 Available project IDs:', projects.map(p => p.id));
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // Update local state immediately for better UX
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, folderId } : p
      ));
      
      // Then update Firestore
      await updateProject(projectId, { folderId });
      console.log('✅ Project moved to folder successfully');
      // trackProjectWork is already called in updateProject
    } catch (err: any) {
      console.error('❌ Failed to move project to folder:', err);
      
      // Revert local state change
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, folderId: existingProject.folderId } : p
      ));
      
      setError(`Failed to move project: ${err.message}`);
      throw err;
    }
  };

  const refreshProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const freshProjects = await getUserProjects(user.uid);
      setProjects(freshProjects);
      console.log('🔄 Projects refreshed from Firestore:', freshProjects.length);
    } catch (err) {
      setError("Failed to refresh projects");
    } finally {
      setLoading(false);
    }
  };

  // Clean up projects that exist locally but not in Firestore
  const cleanupStaleProjects = async () => {
    if (!user) return;
    try {
      const freshProjects = await getUserProjects(user.uid);
      const freshProjectIds = new Set(freshProjects.map(p => p.id));
      
      setProjects(prev => {
        const cleaned = prev.filter(p => freshProjectIds.has(p.id));
        if (cleaned.length !== prev.length) {
          console.log(`🧹 Cleaned up ${prev.length - cleaned.length} stale projects`);
        }
        return cleaned;
      });
    } catch (err) {
      console.error('Failed to cleanup stale projects:', err);
    }
  };

  // Hard delete ALL projects - removes from Firebase AND local state
  const hardDeleteAllProjects = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔥 Starting hard delete of ALL projects');
      const deletedCount = await hardDeleteAllUserProjects(user.uid);
      
      // Clear all projects from local state
      setProjects([]);
      
      console.log(`🔥 Hard deleted ${deletedCount} projects successfully`);
      return deletedCount;
    } catch (err: any) {
      console.error('❌ Failed to hard delete all projects:', err);
      setError(`Failed to hard delete projects: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    projects, 
    addProject, 
    removeProject, 
    updateProject, 
    renameProject,
    archiveProject,
    unarchiveProject,
    toggleProjectReminder,
    updateReminderSettings,
    moveToFolder,
    refreshProjects,
    cleanupStaleProjects,
    hardDeleteAllProjects,
    loading, 
    error 
  };
}

interface YourProjectProps {
  onSectionChange: (section: string) => void;
}

export function YourProject({ onSectionChange }: YourProjectProps) {
  const [generatingSummaryId, setGeneratingSummaryId] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const { trackProjectWork } = useStreaks();

  // Generate summary for a project if missing
  const handleGenerateSummary = async (project: Project) => {
    if (project.summary) return;
    setGeneratingSummaryId(project.id);
    setSummaryError(null);
    try {
      // Gather authoritative values from project
      const authoritative = [];
      if (project.budget?.allocated) authoritative.push(`Budget: $${project.budget.allocated}`);
      if (project.estimatedCost) authoritative.push(`Estimated Cost: $${project.estimatedCost}`);
      if (project.marketSize) authoritative.push(`Market Size: ${project.marketSize}`);
      if (project.timeline?.daysRemaining) authoritative.push(`Time to Launch: ${project.timeline.daysRemaining} days`);
      if (project.teamSize) authoritative.push(`Team Size: ${project.teamSize}`);
      if (project.targetAudience) authoritative.push(`Target Audience: ${project.targetAudience}`);
      // Compose authoritative info string
      const authoritativeInfo = authoritative.length > 0 ? `\n\nAuthoritative project values (these must be used as-is and not contradicted):\n${authoritative.join("; ")}` : '';
      const prompt = `You are a highly experienced business analyst with deep expertise in evaluating project viability, financial forecasting, and risk assessment. I need your specialized skills to generate a comprehensive JSON-based project evaluation based on the provided project details.${authoritativeInfo}

Please structure the evaluation to include:

Budget & Financials: Provide realistic budget and estimated cost figures based on industry benchmarks and project scope.

Market Analysis: Assess market size with supporting data, considering the project's category and competitive landscape.

Risk Assessment: Evaluate key risks (Market Competition, Technical Complexity, Regulatory Compliance) with precise severity levels (Low/Medium/High).

Success Factors: Identify 3-5 critical success drivers relevant to the project's category and objectives.

AI Recommendations: Provide four actionable recommendations to improve project feasibility, cost efficiency, or risk mitigation.

Scoring: Assign a rating (0-10) based on financial viability, market potential, and risk factors, along with an overall viability score.

Ensure all risk levels are color-coded (Green = Low, Yellow/Grey = Medium, Red = High) for visual clarity in the final output.

Leverage your analytical expertise to deliver a data-driven, structured JSON response that aids decision-making for stakeholders. The evaluation must be precise, well-reasoned, and aligned with industry best practices.

Return ONLY a valid JSON object with this structure:
{
  "budget": "$[amount]",
  "estimatedCost": "$[amount]",
  "marketSize": "$[amount or data]",
  "rating": [decimal out of 10],
  "riskAssessment": [
    { "label": "Market Competition", "level": "Low"|"Medium"|"High", "color": "Green"|"Yellow"|"Red" },
    { "label": "Technical Complexity", "level": "Low"|"Medium"|"High", "color": "Green"|"Yellow"|"Red" },
    { "label": "Regulatory Compliance", "level": "Low"|"Medium"|"High", "color": "Green"|"Yellow"|"Red" }
  ],
  "successFactors": [string, ...],
  "aiRecommendations": [string, string, string, string],
  "overallViabilityScore": [decimal out of 10]
}

Project info: Name: ${project.name}, Description: ${project.description}, Category: ${project.category}`;
      const aiSummary = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are a business analyst AI.' },
          { role: 'user', content: prompt }
        ],
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        provider: 'openrouter',
        max_tokens: 3000,
        temperature: 0.7,
        userKey: user?.uid || user?.email
      });
      console.log('[AI RAW SUMMARY]', aiSummary); // Log raw AI output
      // Robust JSON parser
      let parsed: any = null;
      try {
        parsed = JSON.parse(aiSummary.replace(/```json|```/g, '').trim());
        console.log('[AI PARSED SUMMARY]', parsed); // Log parsed JSON
      } catch (e) {
        setSummaryError('AI response was not valid JSON. Please retry.');
        return;
      }
      try {
        await updateProject(project.id, { summary: JSON.stringify(parsed) });
        // Track project work for streak
        trackProjectWork();
      } catch (firestoreError) {
        console.error('[FIRESTORE ERROR]', firestoreError, {
          id: project.id,
          summary: typeof parsed === 'string' ? parsed : JSON.stringify(parsed),
        });
        setSummaryError('Failed to update Firestore. See console for details.');
        return;
      }
    } catch (err: any) {
      setSummaryError('Failed to generate summary. Please try again.');
    } finally {
      setGeneratingSummaryId(null);
    }
  };

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [modalMode, setModalMode] = useState<'rename' | 'settings' | 'archive' | 'delete'>('rename');
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [showFolderView, setShowFolderView] = useState(false);
  const [showArchivedProjects, setShowArchivedProjects] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { projects, addProject, removeProject, updateProject, moveToFolder, refreshProjects, cleanupStaleProjects, hardDeleteAllProjects, loading, error } = useProjects();
  const { user, loading: userLoading } = useFirebaseUser();
  const { tier } = useCredits();
  const { folders, getFolderById, createFolder } = useProjectFolders();
  const navigate = useNavigate();
  const location = useLocation();

  // Hard delete ALL projects handler
  const handleHardDeleteAll = async () => {
    if (!user) return;
    
    if (projects.length === 0) {
      alert('No projects to delete!');
      return;
    }
    
    const confirm = window.confirm(
      `⚠️ DANGER: This will PERMANENTLY DELETE all ${projects.length} of your projects from Firebase and local storage. This action CANNOT be undone!\n\nAre you absolutely sure you want to proceed?`
    );
    
    if (!confirm) return;
    
    // Double confirmation for safety
    const doubleConfirm = window.confirm(
      `🔥 FINAL WARNING: You are about to delete ${projects.length} projects forever. Type YES in the next prompt to confirm.`
    );
    
    if (!doubleConfirm) return;
    
    const finalConfirm = prompt('Type "YES" to confirm permanent deletion:');
    if (finalConfirm !== 'YES') {
      alert('Deletion cancelled. Projects are safe.');
      return;
    }
    
    try {
      const deletedCount = await hardDeleteAllProjects();
      alert(`🔥 Successfully hard deleted ${deletedCount} projects. All data has been permanently removed.`);
    } catch (err: any) {
      alert(`Failed to delete projects: ${err.message}`);
    }
  };

  // Function to clean up projects with malformed IDs
  const cleanupMalformedProjects = async () => {
    if (!user) return;
    
    const malformedProjects = projects.filter(p => 
      p.id.includes('-') && p.id.match(/.*-\d{13}$/)
    );
    
    if (malformedProjects.length === 0) {
      alert('No malformed projects found!');
      return;
    }
    
    const confirm = window.confirm(
      `Found ${malformedProjects.length} projects with malformed IDs. This will recreate them with proper IDs. Continue?`
    );
    
    if (!confirm) return;
    
    for (const project of malformedProjects) {
      try {
        console.log('🔧 Recreating project:', project.name);
        
        // Create new project without the ID
        const { id, ...projectData } = project;
        const newId = await addUserProject(user.uid, projectData);
        
        console.log('✅ Recreated project with new ID:', newId);
      } catch (err) {
        console.error('❌ Failed to recreate project:', project.name, err);
      }
    }
    
    // Refresh the projects list
    try {
      await refreshProjects();
      alert('Projects cleaned up! Please refresh the page.');
    } catch (err) {
      console.error('Failed to refresh projects:', err);
    }
  };

  const handleAddProject = async () => {
    // Check project limits before allowing navigation to create new project
    const activeProjects = projects.filter(p => p.status === 'Planning' || p.status === 'In Progress');
    const projectLimit = getProjectLimit(tier);
    const canCreateMore = canCreateMoreProjects(tier, activeProjects.length);
    
    if (!canCreateMore) {
      alert(`Project limit reached! ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier allows ${projectLimit === 1 ? '1 project' : 'unlimited projects'}. Upgrade your plan to create more projects.`);
      navigate('/upgrade'); // Redirect to upgrade page
      return;
    }
    
    // Redirect to business ideas page for project creation
    navigate('/business-ideas');
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;
    
    try {
      await createFolder(folderName);
      console.log('✅ Folder created successfully');
    } catch (error) {
      console.error('❌ Failed to create folder:', error);
    }
  };

  const handleAddProjectOld = async () => {
    if (!user) return;
    const name = prompt('Project name?');
    if (!name) return;
    
    console.log('🚀 Starting to add project:', name);
    console.log('👤 Current user:', user.uid);
    
    // Clean the name to ensure no invalid characters
    const cleanName = name.trim().replace(/[^\w\s-]/g, '');
    
    const newProject: Omit<Project, 'id'> = {
      name: cleanName,
      description: '',
      status: 'Planning',
      progress: 0,
      budget: { allocated: 0, spent: 0, remaining: 0 },
      timeline: { startDate: '', endDate: '', daysRemaining: 0 },
      analytics: { revenue: 0, customers: 0, growth: 0 },
      category: '',
      milestones: [
        {
          id: '1',
          title: 'Validate Idea',
          description: 'Interview 5 potential users.',
          status: 'in-progress',
          priority: 'high',
          estimatedHours: 8,
          deadline: '2025-07-30'
        },
        {
          id: '2',
          title: 'Build MVP',
          description: 'Create a basic product version.',
          status: 'pending',
          priority: 'medium',
          estimatedHours: 20,
          deadline: '2025-08-15'
        },
        {
          id: '3',
          title: 'Launch Beta',
          description: 'Release to first 10 users and collect feedback.',
          status: 'pending',
          priority: 'low',
          estimatedHours: 12,
          deadline: '2025-08-30'
        }
      ]
    };

    try {
      console.log('📝 Project data to save:', newProject);
      
      const id = await addProject(newProject);
      console.log('✅ Project saved with ID:', id);
      
      // Track project work for streak
      trackProjectWork();
      
      // Wait a moment for Firestore to sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now try to generate summary
      const savedProject = { ...newProject, id };
      console.log('🤖 Generating summary for project:', savedProject);
      
      await handleGenerateSummary(savedProject);
      
      // Don't redirect immediately, let user see the result
      // onSectionChange('business-ideas');
    } catch (err: any) {
      console.error('❌ Failed to add project:', err);
      alert(`Failed to add project: ${err.message}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!user) return;
    try {
      await removeProject(id);
      setSelectedProject(null);
    } catch (err) {
      // error is handled by the hook
    }
  };

  const handleProjectAction = (action: string, project: Project) => {
    console.log('🎯 Project action triggered:', action, 'for project:', project.name);
    setModalProject(project);
    
    switch (action) {
      case 'rename':
        setModalMode('rename');
        setShowManagementModal(true);
        break;
      case 'settings':
        setModalMode('settings');
        setShowManagementModal(true);
        break;
      case 'archive':
        setModalMode('archive');
        setShowManagementModal(true);
        break;
      case 'delete':
        console.log('🗑️ Setting delete modal for project:', project.name);
        setModalMode('delete');
        setShowManagementModal(true);
        break;
      case 'move-to-folder':
        // This will be handled by the folder management component
        console.log('📁 Move to folder action for project:', project.name);
        break;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case "Planning": return "secondary";
      case "In Progress": return "default";
      case "Completed": return "default";
      case "On Hold": return "destructive";
      default: return "secondary";
    }
  };

  const filteredProjects = projects.filter(project => {
    // Filter by archive status
    if (showArchivedProjects) {
      // Only show archived projects
      if (!project.isArchived) return false;
    } else {
      // Exclude archived projects by default
      if (project.isArchived && !showFolderView) return false;
    }
    
    // Search filter
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading || userLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg text-destructive">{error}</div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />
    );
  }

  return (
    <div className="flex-1 p-8 animate-fade-in" ref={containerRef}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 glow-primary">
            <FolderOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Projects
          </h1>
          <p className="text-muted-foreground">
            Track progress, analytics, and manage all your business ventures in one place
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFolderView(!showFolderView)}>
              <Filter className="w-4 h-4 mr-2" />
              {showFolderView ? 'Project View' : 'Folder View'}
            </Button>
            <Button 
              variant={showArchivedProjects ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowArchivedProjects(!showArchivedProjects)}
            >
              <Archive className="w-4 h-4 mr-2" />
              {showArchivedProjects ? 'Active Projects' : 'Archive'}
            </Button>
          </div>
          <Button onClick={handleAddProject}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          
          {/* Debug cleanup buttons */}
          {projects.some(p => p.id.includes('-') && p.id.match(/.*-\d{13}$/)) && (
            <Button variant="outline" onClick={cleanupMalformedProjects}>
              🔧 Fix Project IDs
            </Button>
          )}
          <Button variant="outline" onClick={cleanupStaleProjects}>
            🧹 Sync with Database
          </Button>
          
          {/* Hard delete all projects button */}
          {projects.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleHardDeleteAll}
              className="border-2 border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700"
            >
              🔥 Delete ALL Projects
            </Button>
          )}
        </div>

        {/* Conditional Content: Folder View vs Projects Grid */}
        {showFolderView && tier === 'ultra' ? (
          <FolderManagement 
            projects={projects}
            onMoveToFolder={moveToFolder}
          />
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="p-6 glass-card hover-lift group transition-all duration-200 relative cursor-pointer hover:ring-2 hover:ring-primary"
              onClick={() => {
                // Check if we're in dashboard context or standalone page
                if (location.pathname.startsWith('/dashboard')) {
                  navigate(`/dashboard/your-projects/${project.id}`);
                } else {
                  setSelectedProject(project);
                }
              }}
            >

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1" onClick={(e) => {
                  e.stopPropagation();
                  if (location.pathname.startsWith('/dashboard')) {
                    navigate(`/dashboard/your-projects/${project.id}`);
                  } else {
                    setSelectedProject(project);
                  }
                }}>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  {project.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{project.rating}/10</span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    {project.isArchived && (
                      <Badge variant="outline" className="text-xs">
                        Archived
                      </Badge>
                    )}
                    {project.folderId && getFolderById(project.folderId) && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Folder className="w-3 h-3" style={{ color: getFolderById(project.folderId)?.color }} />
                        {getFolderById(project.folderId)?.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <ProjectActionsMenu 
                      project={project} 
                      onAction={(action) => handleProjectAction(action, project)} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="glass p-2 rounded">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-sm font-semibold text-foreground">
                      ${project.analytics.revenue > 0 ? (project.analytics.revenue / 1000).toFixed(0) + 'k' : '0'}
                    </p>
                  </div>
                  <div className="glass p-2 rounded">
                    <p className="text-xs text-muted-foreground">Customers</p>
                    <p className="text-sm font-semibold text-foreground">{project.analytics.customers}</p>
                  </div>
                  <div className="glass p-2 rounded">
                    <p className="text-xs text-muted-foreground">Growth</p>
                    <p className="text-sm font-semibold text-foreground">+{project.analytics.growth}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center">
                    {project.category}
                    {project.category && project.category.toLowerCase().includes('legal') && (
                      <span className="ml-2 inline-block bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold animate-pulse border border-accent-foreground/30 shadow">Coming Soon</span>
                    )}
                  </span>
                </div>
              </div>
            </Card>
          ))}
            </div>

            <div className="text-center">
              <Button variant="outline" onClick={() => onSectionChange("dashboard")}>Back to Dashboard</Button>
            </div>
          </>
        )}

        {/* Project Management Modal */}
        {modalProject && showManagementModal && (
          <ProjectManagementModal
            project={modalProject}
            isOpen={showManagementModal}
            onClose={() => {
              console.log('🚪 Closing modal');
              setShowManagementModal(false);
              setModalProject(null);
              // Force refresh the projects list after modal closes
              refreshProjects();
            }}
            mode={modalMode}
          />
        )}
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs">
            Modal: {showManagementModal ? 'OPEN' : 'CLOSED'} | 
            Project: {modalProject?.name || 'NONE'} | 
            Mode: {modalMode}
          </div>
        )}
      </div>
    </div>
  );
}


export default YourProject;
