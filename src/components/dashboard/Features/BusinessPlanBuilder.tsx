import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Brain, 
  FileText, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Target,
  Loader2,
  Save,
  Lightbulb,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Shield,
  Rocket
} from 'lucide-react';
import { 
  BusinessPlanBuilderService,
  AICoachingService,
  AIGenerationService,
  ResearchService,
  ContentEnhancementService,
  AutoSaveService,
  setupAutoSave
} from '@/lib/aiServices';
import { BusinessPlanSection, AIFeedback, AIGeneratedContent } from '@/lib/schemas';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useCredits } from '@/hooks/useCredits';

interface BusinessPlanBuilderProps {
  projectId?: string;
  businessIdea?: string;
  onSectionChange?: (section: string) => void;
}

export function BusinessPlanBuilder({ projectId, businessIdea, onSectionChange }: BusinessPlanBuilderProps) {
  const { user } = useFirebaseUser();
  const { tier } = useCredits();
  const navigate = useNavigate();
  const params = useParams();
  const currentProjectId = projectId || params.projectId;
  
  // State management
  const [sections, setSections] = useState<BusinessPlanSection[]>([]);
  const [currentSection, setCurrentSection] = useState<BusinessPlanSection | null>(null);
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'manual' | 'ai_generation'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedback[]>([]);
  const [showCoaching, setShowCoaching] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Load sections on mount
  useEffect(() => {
    if (currentProjectId && user) {
      loadProjectSections();
    }
  }, [currentProjectId, user]);

  // Auto-save setup
  useEffect(() => {
    if (currentSection && currentProjectId && user) {
      const cleanup = setupAutoSave(
        currentSection.section_id,
        currentProjectId,
        user.uid,
        () => content
      );
      return () => {
        if (cleanup) {
          clearInterval(cleanup);
        }
      };
    }
  }, [currentSection, currentProjectId, user, content]);

  const loadProjectSections = async () => {
    try {
      setIsLoading(true);
      const projectSections = await BusinessPlanBuilderService.getProjectSections(currentProjectId!);
      setSections(projectSections);
      
      // Set the first incomplete section as current
      const firstIncomplete = projectSections.find(s => s.completion_status !== 'completed');
      if (firstIncomplete) {
        setCurrentSection(firstIncomplete);
        setContent(firstIncomplete.raw_content);
      }
      
      // Calculate progress
      const completedCount = projectSections.filter(s => s.completion_status === 'completed').length;
      setProgressPercentage(Math.round((completedCount / projectSections.length) * 100));
    } catch (error) {
      console.error('Failed to load project sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async () => {
    if (!currentSection || !user) return;
    
    try {
      setIsLoading(true);
      await BusinessPlanBuilderService.updateSectionContent(
        currentSection.section_id,
        content,
        user.uid
      );
      
      // Update local state
      const updatedSection = {
        ...currentSection,
        raw_content: content,
        completion_status: content.length > 50 ? 'completed' as const : 'in_progress' as const
      };
      setCurrentSection(updatedSection);
      
      // Update sections list
      setSections(sections.map(s => 
        s.section_id === currentSection.section_id ? updatedSection : s
      ));
      
      // Recalculate progress
      const updatedSections = sections.map(s => 
        s.section_id === currentSection.section_id ? updatedSection : s
      );
      const completedCount = updatedSections.filter(s => s.completion_status === 'completed').length;
      setProgressPercentage(Math.round((completedCount / updatedSections.length) * 100));
      
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIContent = async () => {
    if (!currentSection || !user || !currentProjectId) return;
    
    try {
      setIsLoading(true);
      setMode('ai_generation');
      
      const businessContext = {
        project_id: currentProjectId,
        business_idea: businessIdea || 'New Business Venture',
        industry: 'General',
        target_market: 'TBD',
        business_model: 'TBD'
      };
      
      const requirements = `Generate comprehensive content for the ${currentSection.section_title} - ${currentSection.subsection_title} section of a business plan.`;
      
      const generatedContent = await AIGenerationService.generateSectionContent(
        currentSection.section_id,
        businessContext,
        requirements,
        user.uid
      );
      
      setContent(generatedContent.generated_content);
      
    } catch (error) {
      console.error('AI content generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAICoaching = async () => {
    if (!currentSection || !user || !content.trim()) return;
    
    try {
      setIsLoading(true);
      setShowCoaching(true);
      
      const aiCoaching = await AICoachingService.analyzeContent(
        currentSection.section_id,
        content,
        user.uid
      );
      
      setFeedback([aiCoaching]);
      
    } catch (error) {
      console.error('AI coaching failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceContent = async () => {
    if (!currentSection || !user || !content.trim()) return;
    
    try {
      setIsLoading(true);
      
      const enhancement = await ContentEnhancementService.enhanceContent(
        currentSection.section_id,
        content,
        'professional_tone',
        user.uid
      );
      
      setContent(enhancement.enhanced_text);
      
    } catch (error) {
      console.error('Content enhancement failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const conductResearch = async () => {
    if (!currentSection || !user || !currentProjectId) return;
    
    try {
      setIsLoading(true);
      
      const query = `Research data for ${currentSection.section_title} section of business plan`;
      const researchType = currentSection.section_title.toLowerCase().includes('market') 
        ? 'market_statistics' 
        : 'industry_trends';
      
      const research = await ResearchService.conductResearch(
        query,
        researchType,
        currentProjectId,
        user.uid
      );
      
      // Append research insights to content
      const researchInsights = `\n\n## Research Insights\n${research.summary}\n\n### Key Findings:\n${research.key_insights.map(insight => `• ${insight}`).join('\n')}`;
      setContent(content + researchInsights);
      
    } catch (error) {
      console.error('Research failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSection = (section: BusinessPlanSection) => {
    setCurrentSection(section);
    setContent(section.raw_content);
    setFeedback([]);
    setShowCoaching(false);
    setMode('manual');
  };

  const getSectionIcon = (sectionTitle: string) => {
    const title = sectionTitle.toLowerCase();
    if (title.includes('executive')) return <Rocket className="w-4 h-4" />;
    if (title.includes('company')) return <Users className="w-4 h-4" />;
    if (title.includes('market')) return <TrendingUp className="w-4 h-4" />;
    if (title.includes('competitive')) return <Shield className="w-4 h-4" />;
    if (title.includes('organization')) return <Users className="w-4 h-4" />;
    if (title.includes('product') || title.includes('service')) return <Target className="w-4 h-4" />;
    if (title.includes('marketing')) return <MessageSquare className="w-4 h-4" />;
    if (title.includes('financial')) return <DollarSign className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  if (!currentProjectId) {
    return (
      <div className="flex-1 p-8 text-center">
        <div className="max-w-md mx-auto">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a project to start building your business plan.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-screen bg-background">
      {/* Sidebar - Section Navigator */}
      <div className="w-80 border-r border-border bg-card p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Business Plan Builder
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        <div className="space-y-2">
          {sections.map((section) => (
            <Card
              key={section.section_id}
              className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                currentSection?.section_id === section.section_id 
                  ? 'bg-primary/10 border-primary' 
                  : ''
              }`}
              onClick={() => selectSection(section)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getSectionIcon(section.section_title)}
                  <div>
                    <p className="text-sm font-medium">
                      {section.section_number}.{section.subsection_number} {section.subsection_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {section.section_title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {section.completion_status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {section.completion_status === 'in_progress' && (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                  <Badge 
                    variant={section.content_type === 'ai_generated' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {section.content_type === 'ai_generated' ? 'AI' : 'Manual'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {currentSection ? (
          <>
            {/* Header */}
            <div className="border-b border-border p-4 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold">
                    {currentSection.section_number}.{currentSection.subsection_number} {currentSection.subsection_title}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {currentSection.section_title}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={mode === 'ai_generation' ? 'default' : 'secondary'}>
                    {mode === 'ai_generation' ? 'AI Mode' : 'Manual Mode'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode(mode === 'manual' ? 'ai_generation' : 'manual')}
                  >
                    {mode === 'manual' ? (
                      <><Brain className="w-4 h-4 mr-1" /> AI Mode</>
                    ) : (
                      <><FileText className="w-4 h-4 mr-1" /> Manual Mode</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="border-b border-border p-4 bg-card">
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                {mode === 'ai_generation' ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={generateAIContent}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-1" />
                      )}
                      Generate Content
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={conductResearch}
                      disabled={isLoading}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Research
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getAICoaching}
                      disabled={isLoading || !content.trim()}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-1" />
                      )}
                      Get AI Feedback
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={enhanceContent}
                      disabled={isLoading || !content.trim()}
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Enhance
                    </Button>
                  </>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={saveContent}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>

            {/* Content Editor */}
            <div className="flex-1 flex">
              <div className="flex-1 p-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Write your ${currentSection.subsection_title} content here...`}
                  className="w-full h-full min-h-[400px] resize-none"
                  disabled={isLoading}
                />
              </div>

              {/* AI Coaching Sidebar */}
              {showCoaching && feedback.length > 0 && (
                <div className="w-80 border-l border-border p-4 bg-card">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Coach Feedback
                  </h3>
                  <div className="space-y-4">
                    {feedback.map((fb) => (
                      <Card key={fb.feedback_id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={
                              fb.priority_level === 'critical' ? 'destructive' :
                              fb.priority_level === 'high' ? 'default' :
                              fb.priority_level === 'medium' ? 'secondary' : 'outline'
                            }
                          >
                            {fb.priority_level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(fb.confidence_score * 100)}% confident
                          </span>
                        </div>
                        <p className="text-sm mb-2">{fb.suggestion_text}</p>
                        {fb.suggested_improvements.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">Suggestions:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {fb.suggested_improvements.map((improvement, idx) => (
                                <li key={idx}>• {improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Select a Section</h2>
              <p className="text-muted-foreground">
                Choose a section from the sidebar to start building your business plan.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}