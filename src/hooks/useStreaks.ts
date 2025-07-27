import { useState, useEffect } from 'react';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivity: string | null;
  totalDays: number;
  streakType: 'login' | 'project_work' | 'idea_generation';
}

export interface AllStreaks {
  login: StreakData;
  projectWork: StreakData;
  ideaGeneration: StreakData;
}

const STORAGE_KEY = 'founder_streaks';

const createDefaultStreak = (type: StreakData['streakType']): StreakData => ({
  currentStreak: 0,
  longestStreak: 0,
  lastActivity: null,
  totalDays: 0,
  streakType: type
});

const getDefaultStreaks = (): AllStreaks => ({
  login: createDefaultStreak('login'),
  projectWork: createDefaultStreak('project_work'),
  ideaGeneration: createDefaultStreak('idea_generation')
});

export function useStreaks() {
  const [streaks, setStreaks] = useState<AllStreaks>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : getDefaultStreaks();
    } catch {
      return getDefaultStreaks();
    }
  });

  const updateStreak = (type: keyof AllStreaks) => {
    const today = new Date().toDateString();
    const currentStreak = streaks[type];
    
    // If already tracked today, no need to update
    if (currentStreak.lastActivity === today) {
      return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    let newCurrentStreak: number;
    
    if (currentStreak.lastActivity === yesterdayStr) {
      // Continuing streak
      newCurrentStreak = currentStreak.currentStreak + 1;
    } else if (currentStreak.lastActivity === null || currentStreak.lastActivity !== today) {
      // Starting new streak or breaking streak
      newCurrentStreak = 1;
    } else {
      // Already updated today
      return;
    }
    
    const updatedStreak: StreakData = {
      ...currentStreak,
      currentStreak: newCurrentStreak,
      longestStreak: Math.max(currentStreak.longestStreak, newCurrentStreak),
      lastActivity: today,
      totalDays: currentStreak.totalDays + 1
    };
    
    const newStreaks = {
      ...streaks,
      [type]: updatedStreak
    };
    
    setStreaks(newStreaks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStreaks));
  };

  const trackLogin = () => updateStreak('login');
  const trackProjectWork = () => updateStreak('projectWork');
  const trackIdeaGeneration = () => updateStreak('ideaGeneration');

  // Calculate total streak score for potential rewards
  const getStreakScore = () => {
    return streaks.login.currentStreak * 2 + 
           streaks.projectWork.currentStreak * 3 + 
           streaks.ideaGeneration.currentStreak * 1;
  };

  // Check if user deserves bonus credits based on streaks
  const checkStreakRewards = () => {
    const rewards = [];
    
    // Login streak rewards
    if (streaks.login.currentStreak >= 7) {
      rewards.push({ type: 'login_week', credits: 50, message: '7-day login streak!' });
    }
    if (streaks.login.currentStreak >= 30) {
      rewards.push({ type: 'login_month', credits: 200, message: '30-day login streak!' });
    }
    
    // Project work rewards
    if (streaks.projectWork.currentStreak >= 5) {
      rewards.push({ type: 'project_week', credits: 75, message: '5-day project work streak!' });
    }
    
    // Idea generation rewards
    if (streaks.ideaGeneration.currentStreak >= 10) {
      rewards.push({ type: 'idea_streak', credits: 100, message: '10-day idea generation streak!' });
    }
    
    return rewards;
  };

  return {
    streaks,
    trackLogin,
    trackProjectWork, 
    trackIdeaGeneration,
    getStreakScore,
    checkStreakRewards
  };
}