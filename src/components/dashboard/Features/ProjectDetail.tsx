import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import styles from './ProjectDetail.module.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Lightbulb, 
  Star, 
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Scale,
  Calculator,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Target,
  BarChart3,
  Play,
  ArrowRight,
  Brain,
  Zap,
  Shield,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectDetailProps {
  project: import('./YourProject').Project;
  onBack?: () => void;
}

import { useState } from 'react';
import { getAICompletion } from '@/lib/ai';
import { useProjects } from './YourProject';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useNavigate } from 'react-router-dom';
import { useStreaks } from '@/hooks/useStreaks';

const ProjectDetail = ({ project, onBack }: ProjectDetailProps) => {
  const { user } = useFirebaseUser();
  const navigate = useNavigate();
  const { trackProjectWork } = useStreaks();
  
  // Normalize field aliases for consistent prompt and UI
  const projectWithNormalizedFields = {
    ...project,
    title: project.title || project.name || 'Untitled Project',
    timeToLaunch: project.timeToLaunch || project.timeline?.endDate || 'Unknown',
  };

  // Debug: Log loaded project structure
  React.useEffect(() => {
    console.log('Loaded project:', project);
  }, []);
  // State for AI answer generation
  const [isGenerating, setIsGenerating] = useState(false);
  // If project.summary exists, use it as initial value
  let initialSummary = null;
  try {
    if (project.summary) {
      initialSummary = JSON.parse(project.summary);
    }
  } catch (e) {
    initialSummary = null;
  }
  const [generatedAnswers, setGeneratedAnswers] = useState<any | null>(initialSummary);
  const [error, setError] = useState<string | null>(null);

  // Handler for the Create/Regenerate button
  // Utility: Try to extract largest valid JSON substring
  function tryParseLargestJSON(str: string) {
    let lastGood = null;
    for (let i = str.length; i > 0; i--) {
      try {
        const candidate = str.slice(0, i);
        const parsed = JSON.parse(candidate);
        lastGood = parsed;
        break;
      } catch { /* keep going */ }
    }
    return lastGood;
  }

  const { updateProject } = useProjects();

  const handleGenerateAnswers = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Enhanced prompt for comprehensive analysis including legality, budget, and finances
      const prompt = `
You are an AI startup analyst. Output a comprehensive project evaluation in valid **raw JSON only**. Do NOT include explanations, markdown, or extra commentary.

✳️ Your response MUST follow this exact format and style:

{
  "riskAssessment": {
    "marketCompetition": "High Risk - Crowded niche",
    "technicalComplexity": "Medium Risk - Complex backend",
    "regulatoryCompliance": "Low Risk - Minimal regulations"
  },
  "successFactors": [
    "Rising market demand",
    "Simple technical stack",
    "Strong monetization plan"
  ],
  "aiRecommendations": [
    {
      "title": "Launch freemium pricing model",
      "detail": "Helps acquire users while monetizing premium features."
    },
    {
      "title": "Use influencer marketing",
      "detail": "Accelerates reach through social proof."
    },
    {
      "title": "Focus on mobile-first UX",
      "detail": "Improves retention through smooth experience."
    }
  ],
  "viabilityScore": {
    "score": 8.2,
    "explanation": "Strong market potential with solid execution plan"
  },
  "marketAnalysis": {
    "targetAudience": "Students and freelancers",
    "competitors": "Notion, Trello, ClickUp",
    "uniqueValueProposition": "AI-powered task automation"
  },
  "projectRequirements": [
    "AI Model Setup",
    "Frontend UI Design",
    "API Integration",
    "User Testing"
  ],
  "legalRequirements": [
    {
      "title": "Business registration",
      "risk": "High",
      "description": "Required for legal operation"
    },
    {
      "title": "Privacy policy",
      "risk": "Medium", 
      "description": "GDPR compliance needed"
    },
    {
      "title": "Terms of service",
      "risk": "Medium",
      "description": "User agreement required"
    }
  ],
  "deepBudgetAnalysis": {
    "bomCosts": {
      "development": 25000,
      "infrastructure": 5000,
      "marketing": 15000,
      "operations": 8000
    },
    "marketingBreakdown": {
      "digitalAds": 8000,
      "contentMarketing": 4000,
      "influencerPartnerships": 3000
    },
    "totalProjectCost": 53000,
    "contingencyFund": 8000,
    "breakdown": [
      {"category": "Development", "amount": 25000, "percentage": 47},
      {"category": "Marketing", "amount": 15000, "percentage": 28},
      {"category": "Operations", "amount": 8000, "percentage": 15},
      {"category": "Infrastructure", "amount": 5000, "percentage": 10}
    ]
  },
  "finances": {
    "revenueProjections": {
      "month1": 2000,
      "month6": 15000,
      "month12": 45000,
      "month24": 120000
    },
    "expenseProjections": {
      "month1": 8000,
      "month6": 18000,
      "month12": 32000,
      "month24": 75000
    },
    "profitProjections": {
      "month1": -6000,
      "month6": -3000,
      "month12": 13000,
      "month24": 45000
    },
    "breakEvenMonth": 10,
    "roi24Months": 85,
    "keyMetrics": {
      "customerAcquisitionCost": 75,
      "lifetimeValue": 450,
      "churnRate": 8,
      "grossMargin": 72
    }
  }
}

📌 Constraints:
- Keep every field very concise.
- Use **only** what’s shown in the sample (don’t add or change anything).
- No long explanations or paragraphs.
- Only respond with pure, valid JSON.

🔍 Project Info:
Title: ${project.title}
Description: ${project.description}
Original Rating: ${project.rating || 'Not specified'}/10 (from idea generator)
Budget: ${project.budget?.allocated || project.estimatedCost || '--'}
Team Size: ${project.teamSize || '--'}
Time to Launch: ${project.timeToLaunch || '--'}

📈 Important: The viabilityScore should be close to the Original Rating (${project.rating || 'N/A'}/10) unless there are compelling reasons for a significant difference. Explain any major deviations in the explanation field.
`;

      const userKey = user?.uid || user?.email || 'anonymous';
      const aiResult = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are a helpful startup business analyst.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        userKey
      });
      
      // Apply additional cost for comprehensive analysis (legality, budget, finances)
      // This increases the effective credit usage by 1.5x for the enhanced features
      const additionalCost = 500; // Extra credits for deep analysis
      try {
        if (typeof window !== 'undefined') {
          const storageKey = `ai_credits_v1_${userKey}`;
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const state = JSON.parse(raw);
            state.usedThisMonth = (state.usedThisMonth || 0) + additionalCost;
            const maxTokens = 10000; // Simplified for now
            state.credits = Math.max(0, maxTokens - state.usedThisMonth);
            localStorage.setItem(storageKey, JSON.stringify(state));
            
            // Trigger UI refresh
            window.dispatchEvent(new StorageEvent('storage', {
              key: storageKey,
              newValue: JSON.stringify(state),
              oldValue: raw,
              storageArea: localStorage
            }));
            console.log(`💰 Applied additional cost of ${additionalCost} credits for comprehensive analysis`);
          }
        }
      } catch (e) {
        console.warn('Failed to apply additional cost:', e);
      }
      // Try to parse JSON
      let parsed = null;
      let partial = false;
      try {
        parsed = JSON.parse(aiResult.match(/\{[\s\S]*\}/)?.[0] || aiResult);
      } catch (err) {
        // Try to recover largest valid JSON
        parsed = tryParseLargestJSON(aiResult.match(/\{[\s\S]*\}/)?.[0] || aiResult);
        partial = !!parsed;
      }
      if (!parsed) throw new Error('AI response was not valid JSON. Raw output: ' + aiResult);
      setGeneratedAnswers(parsed);
      // Persist to Firestore (updateProject) so it will be loaded after refresh
      try {
        // Only update if parsing succeeded
        await updateProject(project.id, { summary: JSON.stringify(parsed) });
        // Track project work for streak
        trackProjectWork();
      } catch (firestoreError) {
        setError('Failed to save summary to Firestore.');
      }
      if (partial) {
        setError('Warning: AI response was incomplete or truncated. Showing partial result.');
      }
    } catch (err: any) {
      setError((err?.message || 'AI generation failed. Please retry.') + (err?.message?.includes('not valid JSON') ? ' You can retry for a better result.' : ''));
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine next best action based on actual timeline tasks
  const getNextAction = () => {
    // First check if we have a timeline
    if (!project.businessTimeline) {
      return {
        action: 'Create Timeline',
        description: 'Generate AI-powered business timeline',
        tab: 'timeline',
        icon: Calendar,
        priority: 'high',
        task: null
      };
    }
    
    // Find the first incomplete task from the timeline
    const incompleteTasks = project.businessTimeline.tasks
      ?.filter(task => task.status !== 'completed')
      ?.sort((a, b) => (a.month || 0) - (b.month || 0));
    
    if (incompleteTasks && incompleteTasks.length > 0) {
      const nextTask = incompleteTasks[0];
      return {
        action: `Work on: ${nextTask.title}`,
        description: nextTask.description || `Month ${nextTask.month} • ${nextTask.estimatedHours}h • ${nextTask.priority} priority`,
        tab: 'timeline',
        icon: nextTask.status === 'in-progress' ? AlertCircle : Clock,
        priority: nextTask.priority || 'medium',
        task: nextTask
      };
    }
    
    // If all timeline tasks are complete, suggest next business phase
    return {
      action: 'All Timeline Tasks Complete!',
      description: 'Continue with business growth and optimization',
      tab: 'overview',
      icon: CheckCircle,
      priority: 'low',
      task: null
    };
  };

  const nextAction = getNextAction();

  const handleStartWorking = () => {
    // If project doesn't have a business timeline, navigate to timeline assistance first
    if (!project.businessTimeline) {
      navigate(`/dashboard/timeline-assistant/${project.id}`);
      return;
    }
    
    // Get the next task and create a contextual prompt for the chatbot
    const nextTaskAction = getNextAction();
    
    if (nextTaskAction.task) {
      // Create a contextual prompt about the specific task
      const contextualPrompt = `I'm working on my project "${project.name}" and need help with the next task: "${nextTaskAction.task.title}". ${nextTaskAction.task.description || 'This is scheduled for month ' + nextTaskAction.task.month + ' and has ' + nextTaskAction.priority + ' priority.'}

Can you help me understand what specific steps I need to take to complete this task? What should I focus on first?`;
      
      // Store the prompt in localStorage so the chatbot can pick it up
      localStorage.setItem('chatbot_initial_prompt', contextualPrompt);
      
      // Navigate to chatbot
      navigate('/chatbot');
    } else if (nextTaskAction.action.includes('Create Timeline')) {
      // No timeline exists, go to timeline assistance
      navigate(`/dashboard/timeline-assistant/${project.id}`);
    } else {
      // All tasks complete or other scenarios - still go to chatbot with general prompt
      const generalPrompt = `I'm working on my project "${project.name}" and all my timeline tasks are completed! What should I focus on next to grow my business?`;
      localStorage.setItem('chatbot_initial_prompt', generalPrompt);
      navigate('/chatbot');
    }
    
    // Scroll to the recommended section
    setTimeout(() => {
      const targetElement = document.querySelector(`[value="${nextAction.tab}"]`)?.closest('[role="tabpanel"]');
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-foreground">Project not found</h1>
        <Button asChild className="mt-4">
          <Link to="/ideas">Back to Ideas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 max-w-8xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/ideas">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Ideas
            </Link>
          </Button>
        </div>
        {/* Project Overview */}
        <Card className="bg-card border-none shadow-none w-full rounded-xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{project.title || project.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {project.description}
                  </CardDescription>
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{project.rating ?? '--'}</span>
                    </div>
                    <Badge variant="secondary">{project.difficulty ?? project.status}</Badge>
                    <div className="flex flex-wrap gap-1">
                      {(project.tags ?? []).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Button onClick={handleStartWorking} className="bg-primary hover:bg-primary/90">
                  <Play className="w-4 h-4 mr-2" />
                  {nextAction.task ? 'Continue to Chatbot' : nextAction.action.includes('Create Timeline') ? 'Create Timeline' : 'Start Working'}
                </Button>
                <div className="bg-muted/50 rounded-lg p-3 max-w-xs">
                  <div className="flex items-start space-x-2">
                    <nextAction.icon className={`w-4 h-4 mt-0.5 ${nextAction.priority === 'high' ? 'text-red-500' : 'text-blue-500'}`} />
                    <div>
                      <p className="text-sm font-medium">{nextAction.action}</p>
                      <p className="text-xs text-muted-foreground">{nextAction.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">Time to Launch</span>
                </div>
                <p className="font-medium">{project.timeToLaunch ?? project.timeToMarket ?? '--'}</p>
              </div>
              <div className="space-y-2">
  <div className="flex items-center text-muted-foreground">
    <DollarSign className="w-4 h-4 mr-2" />
    <span className="text-sm">Budget</span>
  </div>
  <p className="font-medium">{project.budget?.allocated ? `$${project.budget.allocated}` : project.estimatedCost ?? '--'}</p>
</div>
<div className="space-y-2">
  <div className="flex items-center text-muted-foreground">
    <Users className="w-4 h-4 mr-2" />
    <span className="text-sm">Team Size</span>
  </div>
  <p className="font-medium">{project.teamSize ?? '--'}</p>
</div>
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <Target className="w-4 h-4 mr-2" />
                  <span className="text-sm">Progress</span>
                </div>
                <div className="space-y-1">
                  <Progress value={project.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{project.progress}% Complete</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className={styles.cardSection}>
  {/* Create Button for AI Answer Generation */}
  <div className="flex justify-end mb-4">
    <Button
      variant="default"
      className="bg-primary"
      onClick={handleGenerateAnswers}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <span className="flex items-center"><span className="animate-spin mr-2">⏳</span>Generating...</span>
      ) : (
        generatedAnswers ? 'Regenerate Answers' : 'Create Answers'
      )}
    </Button>
  </div>
            {/* Deep Analysis Section */}
{error && (
  <div className="bg-destructive/20 text-destructive px-4 py-2 rounded mb-4">
    {error}
  </div>
)}
<Card className={styles.cardSection}>
  <CardHeader>
    <CardTitle className="flex items-center">
      <Brain className="w-5 h-5 mr-2" />
      AI Deep Analysis
    </CardTitle>
    <CardDescription>
      Comprehensive AI-powered insights about your project
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">
      {/* Risk Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="font-medium flex items-center">
            <Shield className="w-4 h-4 mr-2 text-red-500" />
            Risk Assessment
          </h4>
          <div className="space-y-2">
            {generatedAnswers?.riskAssessment ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Market Competition</span>
                  <Badge variant="destructive" className="text-xs">
                    {generatedAnswers.riskAssessment.marketCompetition}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Technical Complexity</span>
                  <Badge variant="secondary" className="text-xs">
                    {generatedAnswers.riskAssessment.technicalComplexity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Regulatory Compliance</span>
                  <Badge variant="destructive" className="text-xs">
                    {generatedAnswers.riskAssessment.regulatoryCompliance}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Generate analysis to see risk assessment</p>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-medium flex items-center">
            <Award className="w-4 h-4 mr-2 text-green-500" />
            Success Factors
          </h4>
          <div className="space-y-2">
            {generatedAnswers?.successFactors?.length ? (
              generatedAnswers.successFactors.map((factor: string, idx: number) => (
                <div className="flex items-center space-x-2" key={idx}>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-sm">{factor}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Generate analysis to see success factors</p>
            )}
          </div>
        </div>
      </div>
      {/* AI Recommendations */}
      <div className="border-t pt-4">
        <h4 className="font-medium flex items-center mb-3">
          <Zap className="w-4 h-4 mr-2 text-blue-500" />
          AI Recommendations
        </h4>
        {generatedAnswers?.aiRecommendations?.length ? (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            {generatedAnswers.aiRecommendations.map((rec: any, idx: number) => (
              <div className="flex items-start space-x-3" key={idx}>
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-muted-foreground">{rec.detail}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Generate analysis to see AI recommendations</p>
        )}
      </div>
      {/* Market Analysis Score */}
      <div className="border-t pt-4">
        {generatedAnswers?.viabilityScore ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Overall Viability Score</h4>
              <div className="text-2xl font-bold text-primary">
                {generatedAnswers.viabilityScore.score}/10
              </div>
            </div>
            <Progress value={Math.round(generatedAnswers.viabilityScore.score * 10)} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {generatedAnswers.viabilityScore.explanation}
            </p>
          </>
        ) : (
          <div>
            <h4 className="font-medium mb-2">Overall Viability Score</h4>
            <p className="text-sm text-muted-foreground">Generate analysis to see viability score</p>
          </div>
        )}
      </div>
    </div>
  </CardContent>
</Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={styles.cardSection}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
  {generatedAnswers?.marketAnalysis ? (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Target Audience</h4>
        <p className="text-sm text-muted-foreground">{generatedAnswers.marketAnalysis.targetAudience}</p>
      </div>
      <div>
        <h4 className="font-medium mb-2">Competition</h4>
        <p className="text-sm text-muted-foreground">{generatedAnswers.marketAnalysis.competition}</p>
      </div>
      <div>
        <h4 className="font-medium mb-2">Unique Value Proposition</h4>
        <p className="text-sm text-muted-foreground">{generatedAnswers.marketAnalysis.uniqueValueProposition}</p>
      </div>
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">Generate analysis to see market analysis</p>
  )}
</CardContent>
              </Card>

              <Card className={styles.cardSection}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Project Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
  {(generatedAnswers?.projectRequirements || generatedAnswers?.requirements) ? (
    <div className="space-y-3">
      {(generatedAnswers.projectRequirements || generatedAnswers.requirements).map((req: string, idx: number) => (
        <div className="flex items-center space-x-2" key={idx}>
          {req.toLowerCase().includes('ai') ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
          <span className="text-sm">{req}</span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">Generate analysis to see project requirements</p>
  )}
</CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="legal" className={styles.cardSection}>
            <Card className={styles.cardSection}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="w-5 h-5 mr-2" />
                  Legal Requirements
                </CardTitle>
                <CardDescription>
                  Regulatory compliance checklist for your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedAnswers?.legalRequirements ? (
                  <div className="space-y-4">
                    {generatedAnswers.legalRequirements.map((requirement: any, idx: number) => (
                      <div key={idx} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{requirement.title}</h4>
                          <p className="text-xs text-muted-foreground">{requirement.description}</p>
                        </div>
                        <Badge variant={requirement.risk === 'High' ? 'destructive' : requirement.risk === 'Medium' ? 'secondary' : 'outline'} className="text-xs ml-3">
                          {requirement.risk} Risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Generate analysis to see legal requirements</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className={styles.cardSection}>
  <Card className={styles.cardSection}>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Calculator className="w-5 h-5 mr-2" />
        Deep Budget Analysis
      </CardTitle>
      <CardDescription>Comprehensive breakdown including BOM and marketing costs</CardDescription>
    </CardHeader>
    <CardContent>
      {generatedAnswers?.deepBudgetAnalysis ? (
        <div className="space-y-6">
          {/* Total Budget Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-sm mb-1">Total Project Cost</h4>
              <p className="text-2xl font-bold text-primary">${generatedAnswers.deepBudgetAnalysis.totalProjectCost?.toLocaleString()}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-sm mb-1">Contingency Fund</h4>
              <p className="text-2xl font-bold text-orange-500">${generatedAnswers.deepBudgetAnalysis.contingencyFund?.toLocaleString()}</p>
            </div>
          </div>

          {/* Budget Breakdown Chart */}
          {generatedAnswers.deepBudgetAnalysis.breakdown && (
            <div>
              <h4 className="font-medium mb-3">Budget Breakdown</h4>
              <div className="space-y-3">
                {generatedAnswers.deepBudgetAnalysis.breakdown.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][idx % 4] }}></div>
                      <span className="text-sm font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${item.amount?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOM Costs */}
          {generatedAnswers.deepBudgetAnalysis.bomCosts && (
            <div>
              <h4 className="font-medium mb-3">Bill of Materials (BOM) Costs</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(generatedAnswers.deepBudgetAnalysis.bomCosts).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-3 border rounded-lg">
                    <h5 className="font-medium text-xs text-muted-foreground uppercase mb-1">{key.replace(/([A-Z])/g, ' $1')}</h5>
                    <p className="text-lg font-bold">${value?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marketing Breakdown */}
          {generatedAnswers.deepBudgetAnalysis.marketingBreakdown && (
            <div>
              <h4 className="font-medium mb-3">Marketing Cost Breakdown</h4>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(generatedAnswers.deepBudgetAnalysis.marketingBreakdown).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-sm font-bold">${value?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Generate analysis to see detailed budget breakdown</p>
      )}
    </CardContent>
  </Card>
</TabsContent>

<TabsContent value="finances" className={styles.cardSection}>
  <Card className={styles.cardSection}>
    <CardHeader>
      <CardTitle className="flex items-center">
        <CreditCard className="w-5 h-5 mr-2" />
        Financial Projections
      </CardTitle>
      <CardDescription>Revenue, profits, and expenses with visual charts</CardDescription>
    </CardHeader>
    <CardContent>
      {generatedAnswers?.finances ? (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg text-center">
              <h4 className="font-medium text-xs text-muted-foreground mb-1">Break Even</h4>
              <p className="text-lg font-bold text-primary">Month {generatedAnswers.finances.breakEvenMonth}</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <h4 className="font-medium text-xs text-muted-foreground mb-1">24M ROI</h4>
              <p className="text-lg font-bold text-green-500">{generatedAnswers.finances.roi24Months}%</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <h4 className="font-medium text-xs text-muted-foreground mb-1">CAC</h4>
              <p className="text-lg font-bold text-blue-500">${generatedAnswers.finances.keyMetrics?.customerAcquisitionCost}</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <h4 className="font-medium text-xs text-muted-foreground mb-1">LTV</h4>
              <p className="text-lg font-bold text-purple-500">${generatedAnswers.finances.keyMetrics?.lifetimeValue}</p>
            </div>
          </div>

          {/* Financial Chart */}
          <div>
            <h4 className="font-medium mb-3">Revenue vs Expenses vs Profit</h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Month 1</span>
                <span>Month 6</span>
                <span>Month 12</span>
                <span>Month 24</span>
              </div>
              {/* Simple bar chart representation */}
              {['month1', 'month6', 'month12', 'month24'].map((month, idx) => (
                <div key={month} className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="capitalize">Month {month.replace('month', '')}</span>
                    <div className="flex space-x-4">
                      <span className="text-green-500">R: ${generatedAnswers.finances.revenueProjections[month]?.toLocaleString()}</span>
                      <span className="text-red-500">E: ${generatedAnswers.finances.expenseProjections[month]?.toLocaleString()}</span>
                      <span className="text-blue-500">P: ${generatedAnswers.finances.profitProjections[month]?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1 h-4">
                    <div className="bg-green-500 rounded-sm" style={{ width: `${Math.max(5, (generatedAnswers.finances.revenueProjections[month] / generatedAnswers.finances.revenueProjections.month24) * 100)}%` }}></div>
                    <div className="bg-red-500 rounded-sm" style={{ width: `${Math.max(5, (generatedAnswers.finances.expenseProjections[month] / generatedAnswers.finances.expenseProjections.month24) * 100)}%` }}></div>
                    <div className={`rounded-sm ${generatedAnswers.finances.profitProjections[month] >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${Math.max(5, Math.abs(generatedAnswers.finances.profitProjections[month]) / Math.max(Math.abs(generatedAnswers.finances.profitProjections.month24), Math.abs(generatedAnswers.finances.profitProjections.month1)) * 60)}%` }}></div>
                  </div>
                </div>
              ))}
              <div className="flex justify-center space-x-4 text-xs mt-3">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                  <span>Revenue</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded"></div>
                  <span>Expenses</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                  <span>Profit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Business Metrics */}
          <div>
            <h4 className="font-medium mb-3">Key Business Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <h5 className="font-medium text-sm text-muted-foreground">Churn Rate</h5>
                <p className="text-lg font-bold">{generatedAnswers.finances.keyMetrics?.churnRate}%</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h5 className="font-medium text-sm text-muted-foreground">Gross Margin</h5>
                <p className="text-lg font-bold">{generatedAnswers.finances.keyMetrics?.grossMargin}%</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Generate analysis to see financial projections and charts</p>
      )}
    </CardContent>
  </Card>
</TabsContent>

          <TabsContent value="integrations" className={styles.cardSection}>
            <Card className={styles.cardSection}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Shop Integrations
                </CardTitle>
                <CardDescription>
                  Connect your Shopify or Etsy store to monetize your fitness app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Shopify Integration</h4>
                        <p className="text-sm text-muted-foreground">Sell fitness equipment and supplements</p>
                      </div>
                    </div>
                    <Button variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className={styles.cardSection}>
            <Card className={styles.cardSection}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Business Timeline
                  </div>
                  {project.businessTimeline && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link to={`/dashboard/timeline-assistant/${project.id}`}>
                        <Brain className="w-4 h-4 mr-2" />
                        Edit Timeline
                      </Link>
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  AI-generated business timeline and milestones for your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!project.businessTimeline ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Business Timeline Generated</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Generate an AI-powered 12-month business timeline with tasks, milestones, and priorities for your project.
                    </p>
                    <Button 
                      className="glow-primary"
                      onClick={() => {
                        navigate(`/dashboard/timeline-assistant/${project.id}`);
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Business Timeline
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{project.businessTimeline.timeToLaunch}</div>
                        <div className="text-sm text-muted-foreground">Months to Launch</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-500">{project.businessTimeline.tasks.length}</div>
                        <div className="text-sm text-muted-foreground">Total Tasks</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-500">
                          {project.businessTimeline.tasks.filter(t => t.status === 'completed').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {project.businessTimeline.tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <button
                            onClick={async () => {
                              const newStatus: 'pending' | 'in-progress' | 'completed' = task.status === 'completed' ? 'pending' : 'completed';
                              try {
                                // Update the task status in the project
                                const updatedTasks = project.businessTimeline.tasks.map(t => 
                                  t.id === task.id ? { ...t, status: newStatus } : t
                                );
                                const updatedTimeline = { ...project.businessTimeline, tasks: updatedTasks };
                                await updateProject(project.id, { businessTimeline: updatedTimeline });
                                // Track project work for streak
                                trackProjectWork();
                              } catch (error) {
                                console.error('Failed to update task status:', error);
                              }
                            }}
                            className="hover:scale-110 transition-transform"
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : task.status === 'in-progress' ? (
                              <AlertCircle className="w-5 h-5 text-primary" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Month {task.month} • {task.estimatedHours}h • {task.category}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={
                              task.priority === 'high' ? 'border-red-500/30 text-red-400' :
                              task.priority === 'medium' ? 'border-yellow-500/30 text-yellow-400' :
                              'border-green-500/30 text-green-400'
                            }
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                      
                      {project.businessTimeline.tasks.length > 5 && (
                        <div className="text-center pt-4">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              navigate(`/dashboard/timeline-assistant/${project.id}`);
                            }}
                          >
                            View All {project.businessTimeline.tasks.length} Tasks
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
};
export default ProjectDetail;