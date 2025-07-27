import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  X, 
  MessageSquare, 
  Loader2,
  Lightbulb,
  TrendingUp,
  Target,
  Users
} from 'lucide-react';
import { getAICompletion } from '@/lib/ai';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BusinessPlanAICoachProps {
  isOpen: boolean;
  onToggle: () => void;
  sectionId: number;
  subsectionId?: string;
  sectionTitle: string;
  content?: string;
}

const coachingPrompts = [
  {
    icon: Lightbulb,
    title: "Value Propositions",
    prompt: "How do I write a compelling value proposition that stands out from competitors?"
  },
  {
    icon: Target,
    title: "Target Market",
    prompt: "How do I identify and describe my target market effectively?"
  },
  {
    icon: TrendingUp,
    title: "Competitive Analysis",
    prompt: "What should I include in my competitive analysis section?"
  },
  {
    icon: Users,
    title: "Customer Insights",
    prompt: "How can I better understand and describe my ideal customers?"
  }
];

export function BusinessPlanAICoach({ 
  isOpen, 
  onToggle, 
  sectionId, 
  subsectionId, 
  sectionTitle,
  content = ""
}: BusinessPlanAICoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useFirebaseUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Create context-aware prompt for business plan coaching
      const contextualPrompt = `You are an expert business plan coach. I'm working on Section ${sectionId}: ${sectionTitle}${subsectionId ? `, Subsection ${subsectionId}` : ''}.

Current content I'm working on:
${content ? `"${content.substring(0, 500)}${content.length > 500 ? '...' : ''}"` : 'No content written yet.'}

User question: ${message}

Please provide specific, actionable advice tailored to this business plan section. Be concise but helpful, focusing on practical guidance I can immediately apply. If relevant, suggest specific content or improvements.`;

      const response = await getAICompletion({
        messages: [
          {
            role: 'system',
            content: 'You are an experienced business plan coach. Provide helpful, specific advice for business plan writing. Keep responses concise and actionable.'
          },
          {
            role: 'user',
            content: contextualPrompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
        userKey: user?.uid
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setCurrentMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(currentMessage);
    }
  };

  if (!isOpen) {
    return (
      <div className="border-t border-border mt-4 pt-4">
        <Button
          onClick={onToggle}
          variant="outline"
          className="w-full flex items-center gap-2 justify-center"
        >
          <Bot className="w-4 h-4" />
          💬 Start Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="border-t border-border mt-4">
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              🤖 AI BUSINESS COACH
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Chat Messages */}
          <div className="h-48 overflow-y-auto space-y-2 border rounded-md p-2 bg-muted/30">
            {messages.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-4">
                <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p>Ask me anything about writing this section!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className="space-y-1">
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs p-2 rounded-md ${
                      message.role === 'user' 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-background border border-border'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Coach is thinking...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Buttons */}
          {messages.length === 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Quick help topics:</p>
              <div className="grid grid-cols-1 gap-1">
                {coachingPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                      className="h-auto text-left p-2 justify-start"
                    >
                      <Icon className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="text-xs truncate">{prompt.title}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="space-y-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              className="min-h-[60px] text-xs resize-none"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Press Enter to send
              </span>
              <Button
                onClick={() => sendMessage(currentMessage)}
                disabled={!currentMessage.trim() || isLoading}
                size="sm"
                className="h-6"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}