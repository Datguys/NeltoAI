// components/FirestoreTest.tsx - Temporary debugging component
import React, { useState } from 'react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { addUserProject, updateUserProject, getUserProjects } from '@/lib/firestoreProjects';
import type { Project } from '@/components/dashboard/Features/YourProject';

export function FirestoreTest() {
  const { user } = useFirebaseUser();
  const [status, setStatus] = useState<string>('Ready');
  const [lastProjectId, setLastProjectId] = useState<string | null>(null);

  const testAdd = async () => {
    if (!user) {
      setStatus('❌ No user authenticated');
      return;
    }

    try {
      setStatus('🔄 Testing add project...');
      
      const testProject: Omit<Project, 'id'> = {
        name: `Test Project ${Date.now()}`,
        description: 'This is a test project to verify Firestore saving',
        status: 'Planning',
        progress: 0,
        budget: { allocated: 1000, spent: 0, remaining: 1000 },
        timeline: { startDate: '2025-01-01', endDate: '2025-12-31', daysRemaining: 365 },
        analytics: { revenue: 0, customers: 0, growth: 0 },
        category: 'Test',
        milestones: [
          {
            id: '1',
            title: 'Test Milestone',
            description: 'Test milestone description',
            status: 'pending',
            priority: 'medium',
            estimatedHours: 5,
            deadline: '2025-08-01'
          }
        ]
      };

      const id = await addUserProject(user.uid, testProject);
      setLastProjectId(id);
      setStatus(`✅ Successfully added project with ID: ${id}`);
    } catch (error: any) {
      setStatus(`❌ Failed to add: ${error.message}`);
      console.error('Add test failed:', error);
    }
  };

  const testUpdate = async () => {
    if (!lastProjectId) {
      setStatus('❌ No project to update (add one first)');
      return;
    }

    try {
      setStatus('🔄 Testing update project...');
      
      const updates = {
        summary: JSON.stringify({
          budget: "$1,000",
          estimatedCost: "$800",
          marketSize: "$50M",
          rating: 8.5,
          riskAssessment: [
            { label: "Market Competition", level: "Medium", color: "Yellow" },
            { label: "Technical Complexity", level: "Low", color: "Green" }
          ],
          successFactors: ["Clear target market", "Simple technology stack"],
          aiRecommendations: ["Focus on MVP", "Validate early", "Build team", "Secure funding"],
          overallViabilityScore: 8.0
        }),
        description: 'Updated test description with AI summary'
      };

      await updateUserProject(lastProjectId, updates);
      setStatus(`✅ Successfully updated project ${lastProjectId}`);
    } catch (error: any) {
      setStatus(`❌ Failed to update: ${error.message}`);
      console.error('Update test failed:', error);
    }
  };

  const testRead = async () => {
    if (!user) {
      setStatus('❌ No user authenticated');
      return;
    }

    try {
      setStatus('🔄 Testing read projects...');
      
      const projects = await getUserProjects(user.uid);
      setStatus(`✅ Successfully read ${projects.length} projects`);
      console.log('Projects:', projects);
    } catch (error: any) {
      setStatus(`❌ Failed to read: ${error.message}`);
      console.error('Read test failed:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg max-w-2xl mx-auto my-4">
      <h2 className="text-xl font-bold mb-4">🧪 Firestore Test Component</h2>
      
      <div className="mb-4 p-3 bg-white rounded border">
        <strong>Status:</strong> <span className="ml-2">{status}</span>
      </div>

      <div className="space-y-2">
        <button 
          onClick={testAdd}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={!user}
        >
          🧪 Test Add Project
        </button>
        
        <button 
          onClick={testUpdate}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!lastProjectId}
        >
          🧪 Test Update Project (with AI summary)
        </button>
        
        <button 
          onClick={testRead}
          className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          disabled={!user}
        >
          🧪 Test Read Projects
        </button>
      </div>

      {!user && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
          ⚠️ Please authenticate first to test Firestore operations
        </div>
      )}

      {lastProjectId && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 rounded">
          📝 Last created project ID: <code className="bg-white px-1 rounded">{lastProjectId}</code>
        </div>
      )}
    </div>
  );
}

export default FirestoreTest;