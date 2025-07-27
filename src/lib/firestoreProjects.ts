import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  serverTimestamp,
  getDoc,
  setDoc
} from "firebase/firestore";
import { auth } from "@/firebase";
import { Project } from "@/components/dashboard/Features/YourProject";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/firebase";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PROJECTS_COLLECTION = "projects";
const USERS_COLLECTION = "users";

import type { Tier } from './tiers';

interface UserData {
  tier: Tier;
  credits: number;
  usedThisMonth: number;
  inputTokensUsed?: number;
  outputTokensUsed?: number;
  lastReset: string;
  subscriptionStartDate?: string; // ISO date when subscription started
  lastPaymentDate?: string; // ISO date of last successful payment
  paymentStatus?: 'active' | 'failed' | 'cancelled'; // Payment status
  email?: string;
  displayName?: string;
  createdAt?: any;
  lastUpdated?: any;
  // Account deletion fields
  accountDeleted?: boolean; // True if account is deleted but recoverable
  deletedDate?: string; // ISO date when account was deleted
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    console.log('🔍 Fetching projects for user:', userId);
    const q = query(collection(db, PROJECTS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const projects = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Project));
    console.log('✅ Fetched projects:', projects.length);
    return projects;
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    throw error;
  }
}

export async function addUserProject(userId: string, project: Omit<Project, "id">): Promise<string> {
  try {
    console.log('➕ Adding project for user:', userId);
    const cleanProject = sanitize(project);
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), { 
      ...cleanProject, 
      userId,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });
    console.log('✅ Project added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding project:', error);
    throw error;
  }
}

export async function updateUserProject(projectId: string, updates: Partial<Project>) {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  
  try {
    console.log('📝 Updating project:', projectId);
    console.log('📝 Raw updates:', updates);
    
    // Check if the document exists first
    const existingDoc = await getDoc(docRef);
    if (!existingDoc.exists()) {
      console.warn('⚠️ Document not found in Firestore, treating as stale reference:', projectId);
      // Don't throw error for archive/update operations - just log warning
      return;
    }
    
    // Sanitize the updates to ensure Firestore compatibility
    const cleanUpdates = sanitize(updates);
    
    const updatePayload = {
      ...cleanUpdates,
      lastUpdated: serverTimestamp()
    };
    
    console.log('📝 Clean update payload:', updatePayload);
    
    await updateDoc(docRef, updatePayload);
    console.log('✅ Project updated successfully');
  } catch (error: any) {
    console.error('❌ Error updating project:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    
    if (error.code === 'not-found') {
      throw new Error('No document to update at path: projects/' + projectId);
    }
    
    throw error;
  }
}

export async function deleteUserProject(projectId: string) {
  try {
    console.log('🗑️ Deleting project:', projectId);
    
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    
    // Check if document exists before deleting
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn('⚠️ Document does not exist in Firestore, treating as already deleted:', projectId);
      // Don't throw error, just log warning - this allows frontend cleanup to proceed
      return;
    }
    
    // Check if user owns this project
    const projectData = docSnap.data();
    if (projectData.userId !== currentUser.uid) {
      throw new Error('User not authorized to delete this project');
    }
    
    console.log('📋 Document exists, user authorized, proceeding with deletion');
    await deleteDoc(docRef);
    console.log('✅ Project deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    throw error;
  }
}

export async function hardDeleteAllUserProjects(userId: string) {
  try {
    console.log('🗑️🔥 Hard deleting ALL projects for user:', userId);
    
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('User not authenticated or unauthorized');
    }
    
    // Get all user's projects
    const q = query(collection(db, PROJECTS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    console.log(`🔍 Found ${querySnapshot.docs.length} projects to delete`);
    
    // Delete all projects in batch
    const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
      try {
        await deleteDoc(doc(db, PROJECTS_COLLECTION, docSnapshot.id));
        console.log(`✅ Deleted project: ${docSnapshot.id}`);
      } catch (error) {
        console.warn(`⚠️ Failed to delete project ${docSnapshot.id}:`, error);
        // Continue with other deletions even if one fails
      }
    });
    
    await Promise.allSettled(deletePromises);
    console.log('🔥 Hard delete ALL projects completed');
    
    return querySnapshot.docs.length; // Return number of projects deleted
  } catch (error) {
    console.error('❌ Error hard deleting all projects:', error);
    throw error;
  }
}

// IMPROVED sanitize function - handles all Firestore-compatible types
function sanitize(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  // Handle Date objects - convert to Firestore Timestamp
  if (obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitize).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip undefined values entirely
      if (value === undefined) {
        continue;
      }
      
      // Skip functions (can cause Firestore errors)
      if (typeof value === 'function') {
        continue;
      }
      
      // Handle primitives
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        cleaned[key] = value;
      } else if (value === null) {
        cleaned[key] = null;
      } else if (value instanceof Date) {
        // Handle Date objects
        cleaned[key] = value;
      } else {
        // Recursively clean objects
        const cleanedValue = sanitize(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    
    return cleaned;
  }
  
  // Return primitive values as-is
  return obj;
}

// USER TIER MANAGEMENT FUNCTIONS
export async function getUserTier(userId: string): Promise<UserData | null> {
  try {
    console.log('🔍 Fetching user tier for:', userId);
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      console.log('✅ User tier fetched:', userData.tier);
      return userData;
    } else {
      console.log('❌ No user document found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching user tier:', error);
    throw error;
  }
}

export async function setUserTier(userId: string, tierData: Partial<UserData>): Promise<void> {
  try {
    console.log('💾 Setting user tier for:', userId, 'to:', tierData.tier);
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    
    // Get existing data first
    const existingDoc = await getDoc(userDocRef);
    const existingData = existingDoc.exists() ? existingDoc.data() : {};
    
    const updateData = {
      ...existingData,
      ...tierData,
      lastUpdated: serverTimestamp()
    };
    
    // If this is a new user, add creation timestamp
    if (!existingDoc.exists()) {
      updateData.createdAt = serverTimestamp();
    }
    
    await setDoc(userDocRef, updateData, { merge: true });
    console.log('✅ User tier updated successfully');
  } catch (error) {
    console.error('❌ Error setting user tier:', error);
    throw error;
  }
}

export async function updateUserCredits(userId: string, credits: number, usedThisMonth: number): Promise<void> {
  try {
    console.log('💰 Updating user credits for:', userId);
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user document exists, create if it doesn't
    const existingDoc = await getDoc(userDocRef);
    if (!existingDoc.exists()) {
      console.log('📝 Creating new user document for:', userId);
      await setDoc(userDocRef, {
        tier: 'free',
        credits,
        usedThisMonth,
        lastReset: new Date().toISOString(),
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
    } else {
      await updateDoc(userDocRef, {
        credits,
        usedThisMonth,
        lastUpdated: serverTimestamp()
      });
    }
    
    console.log('✅ User credits updated successfully');
  } catch (error) {
    console.error('❌ Error updating user credits:', error);
    throw error;
  }
}

// ACCOUNT DELETION FUNCTIONS
export async function deleteAccountImmediately(userId: string): Promise<void> {
  try {
    console.log('🗑️ Immediately deleting account for user:', userId);
    
    const now = new Date();
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    
    // Mark account as deleted but preserve data for recovery
    await updateDoc(userDocRef, {
      accountDeleted: true,
      deletedDate: now.toISOString(),
      lastUpdated: serverTimestamp()
    });
    
    console.log('✅ Account marked as deleted, user logged out');
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    throw error;
  }
}

export async function recoverDeletedAccount(userId: string): Promise<void> {
  try {
    console.log('🔄 Recovering deleted account for user:', userId);
    
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(userDocRef, {
      accountDeleted: false,
      deletedDate: null,
      lastUpdated: serverTimestamp()
    });
    
    console.log('✅ Account recovered successfully');
  } catch (error) {
    console.error('❌ Error recovering account:', error);
    throw error;
  }
}

export async function permanentlyDeleteAccount(userId: string): Promise<void> {
  try {
    console.log('🗑️ Permanently deleting account for user:', userId);
    
    // Delete all user's projects first
    const userProjects = await getUserProjects(userId);
    for (const project of userProjects) {
      await deleteDoc(doc(db, PROJECTS_COLLECTION, project.id));
    }
    console.log(`🗂️ Deleted ${userProjects.length} user projects`);
    
    // Delete user document
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
    console.log('👤 User document deleted');
    
    // Note: Firebase Auth deletion needs to be handled separately
    // This should be done via Firebase Admin SDK on the backend
    
    console.log('✅ Account permanently deleted');
  } catch (error) {
    console.error('❌ Error permanently deleting account:', error);
    throw error;
  }
}

export async function checkAccountDeletionStatus(userId: string): Promise<{
  isDeleted: boolean;
  deletedDate?: string;
}> {
  try {
    const userData = await getUserTier(userId);
    
    if (!userData || !userData.accountDeleted) {
      return { isDeleted: false };
    }
    
    return {
      isDeleted: true,
      deletedDate: userData.deletedDate
    };
  } catch (error) {
    console.error('❌ Error checking account deletion status:', error);
    return { isDeleted: false };
  }
}
