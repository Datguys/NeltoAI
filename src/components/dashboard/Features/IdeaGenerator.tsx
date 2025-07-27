import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';
import { useProjects } from './YourProject';
import { canCreateMoreProjects, getProjectLimit } from '@/lib/tiers';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useStreaks } from '@/hooks/useStreaks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Sparkles, Info, Bookmark, Search, Loader2, X, AlertCircle, Star, Brain, Target, TrendingUp } from 'lucide-react';
import { IdeaGeneratorService } from '@/lib/aiServices';
import { IdeaGeneratorRequest } from '@/lib/schemas';



interface IdeaResult {
  title: string;
  description: string;
  investment: string;
  timeframe: string;
  rating: number; // Rating out of 10
  category?: string;
  risks?: string[];
  opportunities?: string[];
  marketOpportunity?: string;
  startupCost?: string;
  timeToFirstSale?: string;
  difficultyRating?: number; // 1-5 stars
  shopifyCompatibility?: number; // 1-10 score
  targetAudience?: string;
  revenueModel?: string;
  // Enhanced fields from new AI system
  industry?: string;
  target_market?: string;
  required_skills?: string[];
  risk_factors?: string[];
  growth_potential?: string;
  market_size?: string;
  competition_level?: string;
  profitability_timeline?: string;
}

export function IdeaGenerator(props: { onSectionChange?: (section: string) => void }) {
  const navigate = useNavigate();
  const onSectionChange = props.onSectionChange || (() => {});
  const { addProject, projects } = useProjects();
  const { tier, credits } = useCredits();
  const { trackIdeaGeneration } = useStreaks();
  const [formData, setFormData] = useState({
    budget: "",
    timeAvailability: "",
    teamSize: "Sole Proprietor (1)",
    skills: "",
    interests: "",
    industries: [],
    experienceLevel: "",
    location: "",
    businessType: "",
    additionalInfo: ""
  });

  // Enhanced interest and industry options
  const interestOptions = [
    { id: 'tech', label: 'Technology', icon: '💻' },
    { id: 'health', label: 'Health & Wellness', icon: '🏥' },
    { id: 'food', label: 'Food & Beverage', icon: '🍕' },
    { id: 'fashion', label: 'Fashion & Beauty', icon: '👗' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'fitness', label: 'Fitness & Sports', icon: '💪' },
    { id: 'home', label: 'Home & Garden', icon: '🏠' },
    { id: 'pets', label: 'Pets & Animals', icon: '🐕' },
    { id: 'travel', label: 'Travel & Tourism', icon: '✈️' },
    { id: 'finance', label: 'Finance & Business', icon: '💰' },
    { id: 'arts', label: 'Arts & Crafts', icon: '🎨' },
    { id: 'automotive', label: 'Automotive', icon: '🚗' }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner (New to business)' },
    { value: 'some', label: 'Some Experience (1-2 ventures)' },
    { value: 'experienced', label: 'Experienced (3+ ventures)' },
    { value: 'expert', label: 'Expert (Serial entrepreneur)' }
  ];

  const businessTypes = [
    { value: 'physical', label: 'Physical Products' },
    { value: 'digital', label: 'Digital Products/Services' },
    { value: 'service', label: 'Service-Based Business' },
    { value: 'hybrid', label: 'Hybrid (Physical + Digital)' }
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [showExtendedQuestions, setShowExtendedQuestions] = useState(false);
  const [extendedAnswers, setExtendedAnswers] = useState({
    targetCustomers: "",
    uniqueValue: "",
    marketSize: "",
    competition: "",
    startupChallenges: "",
    successMetrics: "",
    riskTolerance: "",
    workLifeBalance: "",
    growthGoals: "",
    marketingPreference: "",
    technologyComfort: "",
    fundingPreference: ""
  });

  const [showResults, setShowResults] = useState(() => {
    const persisted = localStorage.getItem('showResults');
    return persisted === 'true';
  });
  const [aiIdeas, setAiIdeas] = useState<IdeaResult[]>(() => {
    const persisted = localStorage.getItem('aiIdeas');
    if (persisted) {
      try {
        return JSON.parse(persisted);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Track daily idea generations for free tier, per user
  const { user } = useFirebaseUser();
  const userKey = user?.uid || user?.email || 'anonymous';
  const [ideaCount, setIdeaCount] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saved = JSON.parse(localStorage.getItem('ideaGenCount') || '{}');
    const userData = saved[userKey] || {};
    return userData[today] || 0;
  });
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saved = JSON.parse(localStorage.getItem('ideaGenCount') || '{}');
    if (!saved[userKey]) saved[userKey] = {};
    saved[userKey][today] = ideaCount;
    localStorage.setItem('ideaGenCount', JSON.stringify(saved));
  }, [ideaCount, userKey]);
  // Reset ideaCount if user changes (switch account)
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saved = JSON.parse(localStorage.getItem('ideaGenCount') || '{}');
    const userData = saved[userKey] || {};
    setIdeaCount(userData[today] || 0);
  }, [userKey]);
  const [savedIdeaIds, setSavedIdeaIds] = useState<string[]>([]);
  const [savingIdeaIds, setSavingIdeaIds] = useState<string[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Scroll to results when they appear
  useEffect(() => {
    if (showResults && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest' 
        });
      }, 100);
    }
  }, [showResults]);
  // Analysis state per idea title
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<{ [title: string]: boolean }>({});
  const [analysis, setAnalysis] = useState<{ [title: string]: string }>({});
  const [analysisError, setAnalysisError] = useState<{ [title: string]: string | null }>({});
  
  // Summary state for inline display
  const [summaryStates, setSummaryStates] = useState<{ [title: string]: {
    isExpanded: boolean;
    isLoading: boolean;
    content: string;
    displayContent: string;
    isTyping: boolean;
    error: string | null;
  } }>({});

  // Fallback mock analysis if AI fails
  function mockAnalysis(idea: IdeaResult): string {
    return `
      <h3>Pros and Cons</h3>
      <ul><li><b>Pros:</b> Innovative, scalable, fits your budget.</li><li><b>Cons:</b> Market competition, requires technical expertise.</li></ul>
      <h3>Estimated Startup Budget</h3>
      <ul><li>Development: $3,000</li><li>Marketing: $1,500</li><li>Operations: $500</li></ul>
      <h3>Bill of Materials</h3>
      <ul><li>Cloud Hosting: $500</li><li>AI API: $1,000</li><li>Website: $1,000</li></ul>
      <h3>Timeline</h3>
      <ul><li>Month 1: MVP Build</li><li>Month 2: Beta Launch</li><li>Month 3: Marketing</li></ul>
      <h3>Market Analysis</h3>
      <ul><li>Market size: $1B+</li><li>Competitors: ExampleCo, StartupX</li></ul>
      <h3>Financial Forecast</h3>
      <ul><li>Year 1 Revenue: $20,000</li><li>Break-even: 8 months</li></ul>
      <h3>Marketing Strategy</h3>
      <ul><li>SEO, Social Media, Influencer Outreach</li></ul>
      <h3>Legal & Compliance</h3>
      <ul><li>LLC Registration, Privacy Policy</li></ul>
      <h3>Competitor Benchmarking</h3>
      <ul><li>Better pricing, more features than StartupX</li></ul>
    `;
  }

  // Render markdown to HTML (simple)
  function markdownToHtml(md: string): string {
    // Very basic conversion for demo; for production use a real markdown parser
    return md
      .replace(/^### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*)$/gm, '<h1>$1</h1>')
      .replace(/^\* (.*)$/gm, '<li>$1</li>')
      .replace(/^\- (.*)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  }

  // Typing animation for summary
  const typeText = (ideaTitle: string, fullText: string) => {
    let currentIndex = 0;
    const typingSpeed = 30; // milliseconds per character
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setSummaryStates(prev => ({
          ...prev,
          [ideaTitle]: {
            ...prev[ideaTitle],
            displayContent: fullText.slice(0, currentIndex),
            isTyping: currentIndex < fullText.length
          }
        }));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, typingSpeed);
  };

  // Generate summary for idea
  const generateSummary = async (idea: IdeaResult) => {
    const ideaTitle = idea.title;
    
    // Initialize or update state
    setSummaryStates(prev => ({
      ...prev,
      [ideaTitle]: {
        isExpanded: true,
        isLoading: true,
        content: '',
        displayContent: '',
        isTyping: false,
        error: null
      }
    }));

    try {
      const prompt = `Generate a concise 150-250 word business summary for this startup idea:

Title: ${idea.title}
Description: ${idea.description}
Investment: ${idea.investment}
Timeframe: ${idea.timeframe}
Rating: ${idea.rating}/10

Budget: ${formData.budget}
Location: ${formData.location}
Skills: ${formData.skills}

Focus on:
- Market opportunity and target audience
- Key competitive advantages
- Main revenue streams
- Critical success factors
- Primary risks and mitigation strategies

Keep it engaging, realistic, and actionable. Write in a professional yet accessible tone.`;

      const { getAICompletion } = await import('@/lib/ai');
      const response = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are a business analyst providing concise startup summaries.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.7,
        userKey: user?.uid || user?.email,
        userId: user?.uid
      });

      const summary = response || `${idea.title} presents a compelling opportunity with a ${idea.rating}/10 viability rating. With an estimated investment of ${idea.investment} and ${idea.timeframe} timeframe, this venture targets growing demand in its sector. Key success factors include strong execution, market validation, and strategic partnerships. Primary risks involve competition and market adoption, but these can be mitigated through focused customer development and iterative product improvement. Revenue potential appears strong given current market trends and the specific value proposition offered.`;

      // Update state with content
      setSummaryStates(prev => ({
        ...prev,
        [ideaTitle]: {
          ...prev[ideaTitle],
          isLoading: false,
          content: summary,
          displayContent: '',
          isTyping: true
        }
      }));

      // Start typing animation
      setTimeout(() => {
        typeText(ideaTitle, summary);
      }, 300);

    } catch (error) {
      setSummaryStates(prev => ({
        ...prev,
        [ideaTitle]: {
          ...prev[ideaTitle],
          isLoading: false,
          error: 'Failed to generate summary. Please try again.'
        }
      }));
    }
  };

  // Toggle summary visibility
  const toggleSummary = (ideaTitle: string) => {
    setSummaryStates(prev => ({
      ...prev,
      [ideaTitle]: {
        ...prev[ideaTitle],
        isExpanded: !prev[ideaTitle]?.isExpanded,
        isLoading: false,
        content: prev[ideaTitle]?.content || '',
        displayContent: prev[ideaTitle]?.displayContent || '',
        isTyping: false,
        error: null
      }
    }));
  };

  const [error, setError] = useState<string | null>(null);

  // Helper functions for the new AI service
  const parseBudgetMin = (budget: string): number => {
    const match = budget.match(/\$?(\d{1,3}(?:,\d{3})*)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 1000;
  };

  const parseBudgetMax = (budget: string): number => {
    const matches = budget.match(/\$?(\d{1,3}(?:,\d{3})*)/g);
    if (matches && matches.length > 1) {
      return parseInt(matches[1].replace(/[\$,]/g, ''));
    }
    if (budget.toLowerCase().includes('under')) {
      return parseBudgetMin(budget);
    }
    return parseBudgetMin(budget) * 3; // Default to 3x the min
  };

  const mapExperienceLevel = (skills: string): 'beginner' | 'intermediate' | 'advanced' => {
    const skillCount = skills.split(',').length;
    if (skillCount < 2) return 'beginner';
    if (skillCount < 5) return 'intermediate';
    return 'advanced';
  };

  const handleGenerate = async () => {
    if (tier === 'free' && ideaCount >= 3) {
      setError('Free users can generate up to 3 ideas per day. Upgrade to Pro or Ultra for unlimited ideas.');
      setIsLoading(false);
      return;
    }
    if (tier === 'free' && credits < 1000) { // Assume 1 idea = 1000 credits for demo
      setError('Free users are limited to 25,000 credits per month. Upgrade to Pro or Ultra for more.');
      setIsLoading(false);
      return;
    }
    setIdeaCount((c: number) => c + 1);
    setIsLoading(true);
    
    // Track idea generation streak
    trackIdeaGeneration();
    clearPersistedIdeas();
    setShowResults(false);
    setAiIdeas([]);
    setError(null);

    // Try the new AI service first
    try {
      const request: IdeaGeneratorRequest = {
        id: `req_${Date.now()}`,
        user_id: user?.uid || 'anonymous',
        industry_preferences: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
        budget_constraints: {
          min: parseBudgetMin(formData.budget),
          max: parseBudgetMax(formData.budget)
        },
        skill_sets: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        location_data: {
          country: formData.location || 'Unknown',
          state: '',
          city: ''
        },
        market_interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
        experience_level: mapExperienceLevel(formData.skills),
        time_commitment: formData.timeAvailability.includes('full') ? 'full-time' : 'part-time',
        request_timestamp: new Date()
      };

      const enhancedIdeas = await IdeaGeneratorService.generateIdeas(request);
      
      // Convert to legacy format for compatibility
      const legacyIdeas: IdeaResult[] = enhancedIdeas.map(idea => ({
        title: idea.title,
        description: idea.description,
        investment: `$${idea.startup_cost.toLocaleString()}`,
        timeframe: idea.profitability_timeline,
        rating: Math.round(idea.ai_confidence_score * 10),
        industry: idea.industry,
        target_market: idea.target_market,
        required_skills: idea.required_skills,
        risk_factors: idea.risk_factors,
        growth_potential: idea.growth_potential,
        market_size: idea.market_size,
        competition_level: idea.competition_level,
        profitability_timeline: idea.profitability_timeline
      }));

      setAiIdeas(legacyIdeas);
      setShowResults(true);
      localStorage.setItem('aiIdeas', JSON.stringify(legacyIdeas));
      localStorage.setItem('showResults', 'true');
      setIsLoading(false);
      return;
    } catch (aiServiceError) {
      console.warn('New AI service failed, falling back to legacy system:', aiServiceError);
      // Continue with legacy system below
    }
    // Legacy system fallback
    const cacheKey = `ideas-${JSON.stringify(formData)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAiIdeas(JSON.parse(cached));
      setShowResults(true);
      localStorage.setItem('aiIdeas', cached);
      localStorage.setItem('showResults', 'true');
      setIsLoading(false);
      return;
    }
    // Check for extremely long inputs that might cause parsing issues
    const totalInputLength = Object.values(formData).join('').length;
    if (totalInputLength > 10000) {
      setAiIdeas([{
        title: 'Input Too Long',
        description: 'Your input is very long which can cause parsing issues and waste tokens. Please try shorter, more focused descriptions in each field.',
        category: 'Error',
        rating: 5,
        investment: 'N/A',
        timeframe: 'N/A',
        risks: ['Reduce text length in form fields'],
        opportunities: ['Use bullet points', 'Focus on key details only']
      }]);
      setShowResults(true);
      setIsLoading(false);
      return;
    }
    
    let retries = 0;
    const maxRetries = 1; // Reduced from 2 to save tokens since we have better error handling
    // Create extended profile section if questionnaire was filled
    const extendedProfile = Object.values(extendedAnswers).some(answer => answer.trim() !== '') ? `
    
    🎯 EXTENDED PROFILE (Use this for highly personalized recommendations):
    - Target Customers: ${extendedAnswers.targetCustomers || 'Not specified'}
    - Unique Value Proposition: ${extendedAnswers.uniqueValue || 'Not specified'}
    - Market Size Preference: ${extendedAnswers.marketSize || 'Not specified'}
    - Competition Approach: ${extendedAnswers.competition || 'Not specified'}
    - Main Concerns: ${extendedAnswers.startupChallenges || 'Not specified'}
    - Success Definition: ${extendedAnswers.successMetrics || 'Not specified'}
    - Risk Tolerance: ${extendedAnswers.riskTolerance || 'Not specified'}
    - Work-Life Balance: ${extendedAnswers.workLifeBalance || 'Not specified'}
    - Growth Ambitions: ${extendedAnswers.growthGoals || 'Not specified'}
    - Marketing Preference: ${extendedAnswers.marketingPreference || 'Not specified'}
    - Technology Comfort: ${extendedAnswers.technologyComfort || 'Not specified'}
    - Funding Approach: ${extendedAnswers.fundingPreference || 'Not specified'}
    
    ⚡ CRITICAL: Since the user provided detailed preferences above, generate ideas that PRECISELY match their profile. Pay special attention to their target customers, unique value proposition, risk tolerance, and success metrics. The ideas should feel tailor-made for their specific situation and goals.` : '';

    const prompt = `
    You are an expert business startup consultant AI. Your task is to generate exactly 3 highly personalized, realistic, and viable business ideas based on the user's detailed profile below.
    
    ⛔ AVOID: Generic ideas like dropshipping, print-on-demand, crypto, affiliate marketing, or any oversaturated markets.
    
    📌 REQUIREMENTS: 
    - Each idea must solve a real, specific problem
    - Stay within the user's actual budget and timeframe
    - Match their skills, interests, and personal preferences
    - Consider their location and market access
    - Align with their risk tolerance and success definition
    
    Return a valid JSON array with 3 objects, each including:
    - "title" (string): compelling business name
    - "description" (string): 2-3 sentences explaining what it does, what problem it solves, and why it fits this user
    - "investment" (string): realistic total startup cost within their budget
    - "timeframe" (string): time needed to launch and generate first revenue
    - "rating" (number): business viability rating from 1-10 based on market demand and user fit
    
    BASIC PROFILE:
    - Budget: ${formData.budget || 'Not specified'}
    - Time Availability: ${formData.timeAvailability || 'Not specified'}
    - Team Size: ${formData.teamSize || 'Not specified'}
    - Skills: ${formData.skills || 'Not specified'}
    - Interests: ${formData.interests || 'Not specified'}
    - Location: ${formData.location || 'Not specified'}
    - Additional Info: ${formData.additionalInfo || 'Not specified'}${extendedProfile}
    
    Return ONLY the JSON array. No explanations or additional text.
    Example format:
    [
      {
        "title": "Affordable Pet Portraits",
        "description": "A local service offering hand-drawn or digitally illustrated pet portraits targeted to pet lovers. Solves the problem of expensive artwork for animal owners.",
        "investment": "$900",
        "timeframe": "1 month",
        "rating": 8
      },
      ...
    ]
    `;
    const attemptGeneration = async (): Promise<IdeaResult[]> => {
      try {
        const { getAICompletion } = await import('@/lib/ai');
        const aiResponse = await getAICompletion({
          messages: [
            { role: 'system', content: 'You must respond with ONLY valid JSON array format. Do not include any text before or after the JSON. Start with [ and end with ].' },
            { role: 'user', content: prompt }
          ],
          // Let the AI system choose the proper model based on user tier
          temperature: 0.7,
          max_tokens: 1000,
          userKey: user?.uid || user?.email,
          userId: user?.uid
        });
        // Robust JSON parsing with multiple fallback strategies
        let parsedData;
        
        try {
          // Try parsing the response directly first
          parsedData = JSON.parse(aiResponse);
        } catch (e1) {
          try {
            // Try to extract JSON from text that might have extra content
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedData = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No JSON found in response');
            }
          } catch (e2) {
            try {
              // Try to clean up the response by removing common prefixes/suffixes
              let cleanResponse = aiResponse
                .replace(/^[^{\[]*/, '') // Remove text before first JSON character
                .replace(/[^}\]]*$/, '') // Remove text after last JSON character
                .trim();
              
              // Try to fix common JSON issues
              cleanResponse = cleanResponse
                .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
                .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
                .replace(/:\s*([^",\[\{][^,\}\]]*)/g, (match, p1) => {
                  // Add quotes to unquoted string values
                  if (!p1.match(/^(true|false|null|\d+)$/)) {
                    return ': "' + p1.trim() + '"';
                  }
                  return match;
                });
              
              parsedData = JSON.parse(cleanResponse);
            } catch (e3) {
              console.error('Failed to parse AI response as JSON:', aiResponse);
              console.error('Parse errors:', e1, e2, e3);
              
              // Return fallback ideas instead of wasting tokens on retries
              return [{
                title: 'AI Response Processing Error',
                description: 'The AI generated a response but we had trouble parsing it as JSON. This might happen with very long or complex prompts. Try simplifying your input or breaking it into smaller parts.',
                category: 'Error',
                rating: 5,
                investment: 'N/A',
                timeframe: 'N/A',
                risks: ['Try with a shorter, more focused prompt'],
                opportunities: ['Use more specific keywords', 'Break complex ideas into smaller requests']
              }];
            }
          }
        }
        
        return Array.isArray(parsedData) ? parsedData : [parsedData];
      } catch (error: any) {
        if (retries < maxRetries) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          return attemptGeneration();
        }
        throw error;
      }
    };
    const tryGeneration = async (): Promise<IdeaResult[]> => {
      try {
        return await attemptGeneration();
      } catch (error) {
        // Retry with same model (tiered system will handle it)
        throw error;
      }
    };
    try {
      const ideas = await tryGeneration();
      setAiIdeas(Array.isArray(ideas) ? ideas : []);
      setShowResults(true);
      localStorage.setItem(cacheKey, JSON.stringify(ideas));
      localStorage.setItem('aiIdeas', JSON.stringify(ideas));
      localStorage.setItem('showResults', 'true');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate ideas. Please try again later.');
      // Fallback: 3 mock ideas if AI fails
      const mockIdeas: IdeaResult[] = [
        {
          title: 'Remote Team Collaboration App',
          description: 'A platform for distributed teams to manage projects, chat, and share files securely.',
          investment: '$2,000',
          timeframe: '2 months',
          rating: 7
        },
        {
          title: 'Healthy Meal Prep Service',
          description: 'Subscription-based healthy meal kits delivered weekly, tailored to dietary needs.',
          investment: '$5,000',
          timeframe: '3 months',
          rating: 9
        },
        {
          title: 'Eco-Friendly Packaging Startup',
          description: 'Manufacture and sell biodegradable packaging to small businesses and e-commerce stores.',
          investment: '$8,000',
          timeframe: '4 months',
          rating: 6
        }
      ];
      setAiIdeas(mockIdeas);
      setShowResults(true);
      localStorage.setItem('aiIdeas', JSON.stringify(mockIdeas));
      localStorage.setItem('showResults', 'true');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear persisted results when starting a new generation or resetting
  const clearPersistedIdeas = () => {
    localStorage.removeItem('aiIdeas');
    localStorage.removeItem('showResults');
  };

  // On mount, restore aiIdeas/showResults if present (already handled in useState initializers)
  // Clear persisted results when user clicks Try Again or generates new ideas

  useEffect(() => {
    return () => {
      setAiIdeas([]);
      setShowResults(false);
      localStorage.removeItem('aiIdeas');
      localStorage.removeItem('showResults');
    };
  }, []);

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Error UI */}
        {error && (
          <Card className="p-4 border-red-500 bg-red-50">
            <div className="text-red-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => { setError(null); setShowResults(false); setAiIdeas([]); clearPersistedIdeas(); }}
            >
              Try Again
            </Button>
          </Card>
        )}


        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 glow-primary">
            <Lightbulb className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Generate Your Perfect Business
          </h1>
          <p className="text-muted-foreground">
            Answer a few questions and get 3 personalized business ideas tailored to your skills and budget
          </p>
        </div>

        {/* Info Box */}
        <Card className="p-4 glass border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">AI-Powered Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Using advanced algorithms to analyze market trends, competition, and realistic timelines for your specific situation.
              </p>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 glass-card">
          <div className="space-y-6">
            {/* Budget Range */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-foreground font-medium">Budget Range</Label>
              <Input
                id="budget"
                placeholder="e.g. $5,000 - $15,000, Under $1,000, $50,000+"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              />
            </div>

            {/* Time Availability */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-foreground font-medium">Time Availability</Label>
              <Input
                id="time"
                placeholder="e.g. Part-time 10 hours/week, Full-time, Weekends only"
                value={formData.timeAvailability}
                onChange={(e) => setFormData({...formData, timeAvailability: e.target.value})}
              />
            </div>

            {/* Team Size */}
            <div className="space-y-2">
              <Label htmlFor="teamSize" className="text-foreground font-medium">Team Size</Label>
              <select
                id="teamSize"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
              >
                <option value="Sole Proprietor (1)">Sole Proprietor (1)</option>
                <option value="Partnership (2)">Partnership (2)</option>
                <option value="Group (5-10)">Group (5-10)</option>
                <option value="Large Team (10+)">Large Team (10+)</option>
              </select>
            </div>

            {/* Skills & Experience */}
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-foreground font-medium">Skills & Experience</Label>
              <Textarea
                id="skills"
                placeholder="Describe your professional skills, experience, and expertise..."
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Interests & Passions */}
            <div className="space-y-2">
              <Label htmlFor="interests" className="text-foreground font-medium">Interests & Passions</Label>
              <Textarea
                id="interests"
                placeholder="What are you passionate about? What industries interest you?"
                value={formData.interests}
                onChange={(e) => setFormData({...formData, interests: e.target.value})}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground font-medium">Location</Label>
              <Input
                id="location"
                placeholder="Where are you located? (e.g. Canada, USA, Europe, Asia)"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="additional" className="text-foreground font-medium">Additional Information</Label>
              <Textarea
                id="additional"
                placeholder="Any additional details? Do you already have an idea in mind? Specific target audience? E-commerce or In-person? Other preferences?"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Extended Questionnaire Section */}
        <Card className="glass-card p-6 border-primary/20">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">Want more personalized results?</h3>
            <p className="text-muted-foreground text-sm mb-4">Answer 12 additional questions for better recommendations</p>
            <Button 
              variant="outline" 
              onClick={() => setShowExtendedQuestions(!showExtendedQuestions)}
              className="border-primary/30 hover:bg-primary/10"
            >
              {showExtendedQuestions ? 'Hide Questions' : 'Answer Extra Questions'}
            </Button>
          </div>

          {showExtendedQuestions && (
            <div className="space-y-4 mt-6 animate-in slide-in-from-top-5 duration-300">
              <div className="border-t border-border pt-4">
                
                {/* Target Customers */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">1. Who would be your ideal customer?</Label>
                  <Textarea
                    placeholder="Describe your target audience in detail..."
                    value={extendedAnswers.targetCustomers}
                    onChange={(e) => setExtendedAnswers({...extendedAnswers, targetCustomers: e.target.value})}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Unique Value */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">2. What unique value would you want to provide?</Label>
                  <Textarea
                    placeholder="What would make your business different from competitors?"
                    value={extendedAnswers.uniqueValue}
                    onChange={(e) => setExtendedAnswers({...extendedAnswers, uniqueValue: e.target.value})}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Market Size */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">3. What market size interests you?</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={extendedAnswers.marketSize}
                    onChange={(e) => setExtendedAnswers({ ...extendedAnswers, marketSize: e.target.value })}
                  >
                    <option value="">Select market size preference</option>
                    <option value="niche">Niche market (small but focused)</option>
                    <option value="local">Local/Regional market</option>
                    <option value="national">National market</option>
                    <option value="global">Global market</option>
                  </select>
                </div>

                {/* Competition */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">4. How do you feel about competition?</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={extendedAnswers.competition}
                    onChange={(e) => setExtendedAnswers({ ...extendedAnswers, competition: e.target.value })}
                  >
                    <option value="">Select your preference</option>
                    <option value="avoid">I prefer markets with less competition</option>
                    <option value="compete">I'm comfortable competing in crowded markets</option>
                    <option value="pioneer">I want to create entirely new markets</option>
                    <option value="improve">I want to improve on existing solutions</option>
                  </select>
                </div>

                {/* Startup Challenges */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">5. What startup challenges concern you most?</Label>
                  <Textarea
                    placeholder="e.g., funding, marketing, hiring, product development..."
                    value={extendedAnswers.startupChallenges}
                    onChange={(e) => setExtendedAnswers({...extendedAnswers, startupChallenges: e.target.value})}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Success Metrics */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">6. How do you define business success?</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={extendedAnswers.successMetrics}
                    onChange={(e) => setExtendedAnswers({ ...extendedAnswers, successMetrics: e.target.value })}
                  >
                    <option value="">Select your primary goal</option>
                    <option value="revenue">High revenue/profit</option>
                    <option value="impact">Social impact/helping others</option>
                    <option value="freedom">Personal freedom/flexibility</option>
                    <option value="growth">Rapid growth/scaling</option>
                    <option value="stability">Stable, sustainable business</option>
                  </select>
                </div>

                {/* Risk Tolerance */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">7. What's your risk tolerance?</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={extendedAnswers.riskTolerance}
                    onChange={(e) => setExtendedAnswers({ ...extendedAnswers, riskTolerance: e.target.value })}
                  >
                    <option value="">Select risk level</option>
                    <option value="low">Low risk - I prefer proven business models</option>
                    <option value="medium">Medium risk - I'm open to some uncertainty</option>
                    <option value="high">High risk - I'm comfortable with big risks for big rewards</option>
                  </select>
                </div>

                {/* Work Life Balance */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">8. How important is work-life balance?</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={extendedAnswers.workLifeBalance}
                    onChange={(e) => setExtendedAnswers({ ...extendedAnswers, workLifeBalance: e.target.value })}
                  >
                    <option value="">Select importance level</option>
                    <option value="essential">Essential - I need flexible hours</option>
                    <option value="important">Important - I want some balance</option>
                    <option value="secondary">Secondary - I'm willing to work long hours initially</option>
                  </select>
                </div>

                {/* Growth Goals */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">9. What are your growth ambitions?</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={extendedAnswers.growthGoals}
                    onChange={(e) => setExtendedAnswers({ ...extendedAnswers, growthGoals: e.target.value })}
                  >
                    <option value="">Select growth preference</option>
                    <option value="lifestyle">Lifestyle business - sustainable income</option>
                    <option value="moderate">Moderate growth - steady expansion</option>
                    <option value="aggressive">Aggressive growth - scale quickly</option>
                    <option value="exit">Build to sell/exit eventually</option>
                  </select>
                </div>

                {/* Marketing Preference */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">10. What marketing approach appeals to you?</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={extendedAnswers.marketingPreference}
                    onChange={(e) => setExtendedAnswers({ ...extendedAnswers, marketingPreference: e.target.value })}
                  >
                    <option value="">Select marketing style</option>
                    <option value="digital">Digital marketing (social media, ads, SEO)</option>
                    <option value="personal">Personal networking and relationships</option>
                    <option value="content">Content creation and thought leadership</option>
                    <option value="traditional">Traditional marketing (print, events, etc.)</option>
                    <option value="viral">Viral/word-of-mouth marketing</option>
                  </select>
                </div>

                {/* Technology Comfort */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">11. How comfortable are you with technology?</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={extendedAnswers.technologyComfort}
                    onChange={(e) => setExtendedAnswers({ ...extendedAnswers, technologyComfort: e.target.value })}
                  >
                    <option value="">Select comfort level</option>
                    <option value="expert">Expert - I can build tech solutions</option>
                    <option value="advanced">Advanced - I'm very comfortable with tech</option>
                    <option value="intermediate">Intermediate - I can learn what I need</option>
                    <option value="basic">Basic - I prefer simple, low-tech solutions</option>
                  </select>
                </div>

                {/* Funding Preference */}
                <div className="space-y-2 mb-4">
                  <Label className="text-foreground font-medium">12. How would you prefer to fund your business?</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={extendedAnswers.fundingPreference}
                    onChange={(e) => setExtendedAnswers({ ...extendedAnswers, fundingPreference: e.target.value })}
                  >
                    <option value="">Select funding approach</option>
                    <option value="bootstrap">Bootstrap - self-funded</option>
                    <option value="friends-family">Friends and family funding</option>
                    <option value="loans">Bank loans or SBA loans</option>
                    <option value="investors">Angel investors or VCs</option>
                    <option value="crowdfunding">Crowdfunding platforms</option>
                    <option value="revenue">Revenue-based funding</option>
                  </select>
                </div>

              </div>
            </div>
          )}
        </Card>

        {/* Generate Button */}
        <Button 
          variant="primary"
          size="lg"
          className="w-full glow-primary transition-bounce hover:scale-105"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Ideas...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate My Business Ideas
              <span className="ml-2 text-sm opacity-75">(3 options left)</span>
            </>
          )}
        </Button>

        {/* Results Section */}
        {showResults && (
          <div ref={resultsRef} className="space-y-6 mt-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Personalized Business Ideas</h2>
              <p className="text-muted-foreground">Based on your preferences and market analysis</p>
            </div>

            <div className="space-y-6">
              {aiIdeas.map((idea, index) => (
                <div key={index} className="space-y-4 animate-scale-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <Card className="p-6 glass-card hover-lift transition-smooth">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">{idea.title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{idea.rating || 8}/10</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {idea.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Investment Range</p>
                      <p className="font-semibold text-foreground">{idea.investment}</p>
                    </div>
                    <div className="glass p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Time to Launch</p>
                      <p className="font-semibold text-foreground">{idea.timeframe}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => {
                        const summaryState = summaryStates[idea.title];
                        if (!summaryState?.content) {
                          generateSummary(idea);
                        } else {
                          toggleSummary(idea.title);
                        }
                      }}
                      disabled={summaryStates[idea.title]?.isLoading}
                    >
                      {summaryStates[idea.title]?.isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : summaryStates[idea.title]?.content ? (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          {summaryStates[idea.title]?.isExpanded ? 'Hide Summary' : 'Show Summary'}
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Generate Summary
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      disabled={savedIdeaIds.includes(idea.title) || savingIdeaIds.includes(idea.title)}
                      onClick={async () => {
                        setSavingIdeaIds(prev => [...prev, idea.title]);
                        
                        const parseInvestment = (investment: string) => {
                          const matches = investment.match(/\d{1,3}(?:[,.\d]*)/g);
                          if (!matches || matches.length === 0) return 0;
                          const numbers = matches.map(m => Number(m.replace(/,/g, '')));
                          return Math.max(...numbers);
                        };

                        const parseTimeframeToDate = (timeframe: string): string => {
                          const now = new Date();
                          const monthsMatch = timeframe.match(/(\d+)\s*month/);
                          const weeksMatch = timeframe.match(/(\d+)\s*week/);
                          const daysMatch = timeframe.match(/(\d+)\s*day/);

                          if (monthsMatch) {
                            now.setMonth(now.getMonth() + parseInt(monthsMatch[1]));
                          } else if (weeksMatch) {
                            now.setDate(now.getDate() + parseInt(weeksMatch[1]) * 7);
                          } else if (daysMatch) {
                            now.setDate(now.getDate() + parseInt(daysMatch[1]));
                          } else {
                            now.setMonth(now.getMonth() + 3); // Default 3 months
                          }

                          return now.toISOString().split('T')[0];
                        };

                        const calculateDaysRemaining = (timeframe: string): number => {
                          const monthsMatch = timeframe.match(/(\d+)\s*month/);
                          const weeksMatch = timeframe.match(/(\d+)\s*week/);
                          const daysMatch = timeframe.match(/(\d+)\s*day/);

                          if (monthsMatch) {
                            return parseInt(monthsMatch[1]) * 30;
                          } else if (weeksMatch) {
                            return parseInt(weeksMatch[1]) * 7;
                          } else if (daysMatch) {
                            return parseInt(daysMatch[1]);
                          }
                          return 90; // Default 3 months
                        };

                        try {
                          // Check project limits before saving
                          const activeProjects = projects.filter(p => p.status === 'Planning' || p.status === 'In Progress');
                          const projectLimit = getProjectLimit(tier);
                          const canCreateMore = canCreateMoreProjects(tier, activeProjects.length);
                          
                          if (!canCreateMore) {
                            alert(`Project limit reached! ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier allows ${projectLimit === 1 ? '1 project' : 'unlimited projects'}. Upgrade your plan to save more projects.`);
                            return;
                          }
                          
                          const investmentAmount = parseInvestment(idea.investment);
                          const launchDate = parseTimeframeToDate(idea.timeframe);
                          const daysToLaunch = calculateDaysRemaining(idea.timeframe);

                          // Simple project creation with just basic info
                          const newProject = {
                            name: idea.title,
                            description: idea.description,
                            rating: idea.rating, // Include the star rating
                            status: "Planning" as const,
                            progress: 0,
                            budget: {
                              allocated: investmentAmount,
                              spent: 0,
                              remaining: investmentAmount
                            },
                            timeline: {
                              startDate: new Date().toISOString().split('T')[0],
                              endDate: launchDate,
                              daysRemaining: daysToLaunch
                            },
                            analytics: { revenue: 0, customers: 0, growth: 0 },
                            category: "AI Generated",
                            teamSize: formData.teamSize,
                            timeToLaunch: idea.timeframe,
                            targetAudience: `Target market for ${idea.title}`,
                            summary: `${idea.title} - ${idea.description}`
                          };

                          await addProject(newProject);
                          setSavedIdeaIds([...savedIdeaIds, idea.title]);
                          setSavingIdeaIds(prev => prev.filter(id => id !== idea.title));
                          
                        } catch (error) {
                          console.error('Failed to save idea:', error);
                          setSavingIdeaIds(prev => prev.filter(id => id !== idea.title));
                        }
                      }}
                    >
                      {savingIdeaIds.includes(idea.title) ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : savedIdeaIds.includes(idea.title) ? (
                        <Bookmark className="w-4 h-4 mr-2 fill-current" />
                      ) : (
                        <Bookmark className="w-4 h-4 mr-2" />
                      )}
                      {savingIdeaIds.includes(idea.title) ? 'Saving...' : savedIdeaIds.includes(idea.title) ? 'Saved!' : 'Save Idea'}
                    </Button>
                  </div>
                </Card>
                
                {/* Summary Display */}
                {summaryStates[idea.title]?.isExpanded && (
                  <div className="mt-4 p-6 bg-card rounded-lg border border-border animate-slide-down">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-foreground flex items-center">
                        <Search className="w-5 h-5 mr-2 text-primary" />
                        Business Summary
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSummary(idea.title)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {summaryStates[idea.title]?.isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Sparkles className="w-6 h-6 animate-spin text-primary mr-2" />
                        <span className="text-muted-foreground">Generating comprehensive summary...</span>
                      </div>
                    ) : summaryStates[idea.title]?.content ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                          {summaryStates[idea.title].content}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>Failed to generate summary. Please try again.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => generateSummary(idea)}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline" onClick={() => onSectionChange("dashboard")}>Back to Dashboard</Button>
            </div>
            {/* Continue to Timeline Assistant Prompt */}
            {showResults && aiIdeas.length > 0 && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="text-lg font-semibold text-foreground">Do you want to continue with this idea or Ready to Plan?</div>
                <Button
                  variant="primary"
                  size="lg"
                  className="glow-primary"
                  onClick={async () => {
                    // Use the first idea as the project to continue (or let user pick if needed)
                    const idea = aiIdeas[0];
                    if (!idea) return;
                    // Check if already saved
                    let projectId = `${idea.title}-${Date.now()}`;
                    const parseInvestment = (investment: string) => {
                      // Extract first number from string (e.g., "$350", "$5,000 - $15,000")
                      const match = investment.match(/\d+[,.\d]*/);
                      if (match) {
                        return Number(match[0].replace(/,/g, ''));
                      }
                      return 0;
                    };
                    const newProject = {
                      name: idea.title,
                      description: idea.description,
                      status: "Planning" as const,
                      progress: 0,
                      budget: { allocated: parseInvestment(idea.investment || formData.budget), spent: 0, remaining: 0 },
                      timeline: { startDate: '', endDate: idea.timeframe || formData.timeAvailability, daysRemaining: 0 },
                      analytics: { revenue: 0, customers: 0, growth: 0 },
                      category: "AI Generated",
                      teamSize: formData.teamSize,
                    };
                    const id = await addProject(newProject);
                    // Navigate to Timeline Assistant with project context
                    navigate(`/dashboard/timeline-assistant/${id}`);
                  }}
                >
                  Continue to Timeline Assistant
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
