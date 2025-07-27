import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCredits } from '@/hooks/useCredits';
import { useActiveProject } from '@/hooks/useActiveProject';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { 
  Bot, 
  Send, 
  Loader2, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  MessageSquare,
  Bookmark,
  Star
} from 'lucide-react';
import { getAICompletion } from '@/lib/ai';

interface CoachingSession {
  id: string;
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  category: 'strategy' | 'marketing' | 'finance' | 'operations' | 'growth' | 'planning';
  helpful: boolean | null;
  saved: boolean;
}

interface CoachingPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  icon: React.ComponentType<any>;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const coachingPrompts: CoachingPrompt[] = [
  {
    id: 'mvp-validation',
    title: 'MVP Validation Strategy',
    description: 'How to validate your minimum viable product with real customers',
    category: 'strategy',
    prompt: 'I need help creating a strategy to validate my MVP. Can you provide a step-by-step approach for testing my product idea with potential customers, including specific metrics I should track and validation methods I can use?',
    icon: Target,
    difficulty: 'beginner'
  },
  {
    id: 'pricing-strategy',
    title: 'Pricing Strategy',
    description: 'Develop an effective pricing model for your product or service',
    category: 'finance',
    prompt: 'Help me develop a pricing strategy for my business. I need guidance on pricing models, competitor analysis, value-based pricing, and how to test different price points to maximize revenue.',
    icon: TrendingUp,
    difficulty: 'intermediate'
  },
  {
    id: 'customer-acquisition',
    title: 'Customer Acquisition',
    description: 'Build a systematic approach to acquiring your first customers',
    category: 'marketing',
    prompt: 'I need a comprehensive customer acquisition strategy. Can you help me identify the best channels for my target market, create a customer acquisition funnel, and develop tactics for converting leads into paying customers?',
    icon: Lightbulb,
    difficulty: 'intermediate'
  },
  {
    id: 'funding-roadmap',
    title: 'Funding Roadmap',
    description: 'Navigate the fundraising process and prepare for investors',
    category: 'finance',
    prompt: 'I want to raise funding for my startup. Can you guide me through the fundraising process, help me understand different funding options, prepare for investor meetings, and create a compelling pitch?',
    icon: Star,
    difficulty: 'advanced'
  },
  {
    id: 'scale-operations',
    title: 'Scaling Operations',
    description: 'Systematically scale your business operations and team',
    category: 'operations',
    prompt: 'My business is growing and I need help scaling operations efficiently. Can you provide guidance on hiring, process optimization, technology infrastructure, and maintaining quality as we grow?',
    icon: Zap,
    difficulty: 'advanced'
  },
  {
    id: 'market-positioning',
    title: 'Market Positioning',
    description: 'Position your product effectively in a competitive market',
    category: 'marketing',
    prompt: 'Help me position my product in the market. I need guidance on competitive analysis, unique value proposition, target market segmentation, and messaging that resonates with customers.',
    icon: Brain,
    difficulty: 'intermediate'
  }
];

export function AICoach() {
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePrompt, setActivePrompt] = useState<CoachingPrompt | null>(null);
  const { credits, deductCredits } = useCredits();
  const { activeProject } = useActiveProject();
  const { user } = useFirebaseUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('ai-coaching-sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed.map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp)
      })));
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('ai-coaching-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions]);

  const sendMessage = async (message: string, category: string = 'strategy') => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    
    try {
      // Create context from active project if available
      let contextualPrompt = message;
      if (activeProject) {
        contextualPrompt = `As an AI business coach, please provide helpful, actionable advice. Here's my project context:
        
Project: ${activeProject.name}
Category: ${activeProject.category}
Budget: $${activeProject.budget.allocated}
Stage: ${activeProject.status}

Question: ${message}

Please provide specific, actionable advice tailored to my situation. Include concrete next steps I can take.`;
      } else {
        contextualPrompt = `As an AI business coach, please provide helpful, actionable advice for this question: ${message}

Please provide specific, actionable advice with concrete next steps.`;
      }

      const response = await getAICompletion({
        messages: [
          {
            role: 'system',
            content: 'You are an experienced business coach and startup advisor. Provide helpful, actionable advice based on the user\'s questions and context.'
          },
          {
            role: 'user',
            content: contextualPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        userKey: user?.uid
      });

      const newSession: CoachingSession = {
        id: Date.now().toString(),
        timestamp: new Date(),
        userMessage: message,
        aiResponse: response,
        category: category as any,
        helpful: null,
        saved: false
      };

      setSessions(prev => [...prev, newSession]);
      setCurrentMessage('');
      
      // Deduct credits
      deductCredits(5); // 5 credits per coaching session
      
    } catch (error) {
      console.error('Error generating coaching response:', error);
      alert('Failed to get coaching response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSelect = (prompt: CoachingPrompt) => {
    setActivePrompt(prompt);
    setCurrentMessage(prompt.prompt);
  };

  const markHelpful = (sessionId: string, helpful: boolean) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, helpful }
        : session
    ));
  };

  const saveSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, saved: !session.saved }
        : session
    ));
  };

  const filteredSessions = selectedCategory === 'all' 
    ? sessions 
    : sessions.filter(s => s.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strategy': return Target;
      case 'marketing': return Lightbulb;
      case 'finance': return TrendingUp;
      case 'operations': return Zap;
      case 'growth': return Star;
      case 'planning': return Brain;
      default: return MessageSquare;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Business Coach
          </h1>
          <p className="text-muted-foreground">
            Get personalized business advice and strategic guidance powered by AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {credits} credits
          </Badge>
          {activeProject && (
            <Badge className="bg-primary/20 text-primary">
              Coaching for: {activeProject.name}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coaching Prompts Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Start Coaching</CardTitle>
              <CardDescription>
                Select a coaching topic to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {coachingPrompts.map((prompt) => {
                const Icon = prompt.icon;
                return (
                  <div
                    key={prompt.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                      activePrompt?.id === prompt.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => handlePromptSelect(prompt)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{prompt.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {prompt.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {prompt.category}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(prompt.difficulty)}`}>
                            {prompt.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Coaching Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Coaching Session</CardTitle>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Coach You!</h3>
                  <p className="text-muted-foreground mb-4">
                    Ask me anything about your business, or select a quick start topic on the left.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    💡 Tip: I work better when you provide context about your business and specific challenges
                  </div>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const CategoryIcon = getCategoryIcon(session.category);
                  return (
                    <div key={session.id} className="space-y-3">
                      {/* User Message */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user?.displayName?.[0] || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="bg-primary/10 rounded-lg p-3">
                            <p className="text-sm">{session.userMessage}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {session.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {session.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm whitespace-pre-wrap">{session.aiResponse}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant={session.helpful === true ? "default" : "outline"}
                              size="sm"
                              onClick={() => markHelpful(session.id, true)}
                              className="h-6 px-2 text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Helpful
                            </Button>
                            <Button
                              variant={session.helpful === false ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => markHelpful(session.id, false)}
                              className="h-6 px-2 text-xs"
                            >
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Not Helpful
                            </Button>
                            <Button
                              variant={session.saved ? "default" : "ghost"}
                              size="sm"
                              onClick={() => saveSession(session.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Bookmark className="w-3 h-3 mr-1" />
                              {session.saved ? 'Saved' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="space-y-3">
                {activePrompt && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <activePrompt.icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{activePrompt.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActivePrompt(null);
                          setCurrentMessage('');
                        }}
                        className="h-6 px-2 ml-auto"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Ask me anything about your business strategy, marketing, finance, operations, or growth..."
                    className="min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(currentMessage, activePrompt?.category || 'strategy');
                      }
                    }}
                  />
                  <Button
                    onClick={() => sendMessage(currentMessage, activePrompt?.category || 'strategy')}
                    disabled={!currentMessage.trim() || isLoading || credits < 5}
                    className="px-3"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>5 credits per coaching session</span>
                  <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Saved Sessions */}
      {sessions.some(s => s.saved) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Saved Coaching Sessions
            </CardTitle>
            <CardDescription>
              Your saved insights and advice for future reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {sessions
                .filter(s => s.saved)
                .map((session) => {
                  const CategoryIcon = getCategoryIcon(session.category);
                  return (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon className="w-4 h-4 text-primary" />
                        <Badge variant="secondary" className="text-xs">
                          {session.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {session.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-2 line-clamp-2">
                        {session.userMessage}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {session.aiResponse}
                      </p>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}