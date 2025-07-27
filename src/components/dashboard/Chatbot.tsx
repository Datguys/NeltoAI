import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';
import { ChatbotSidebar } from './ChatbotSidebar';
import { ThinkingDots } from '@/components/ui/ThinkingDots';
import { getAICompletion } from '@/lib/ai';
import { useProjects } from './Features/YourProject';
import { ChatbotTokenBar } from './ChatbotTokenBar';
import { useCredits } from '@/hooks/useCredits';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useDataCollection } from '@/hooks/useDataCollection';
import { FeedbackButton } from '@/components/ui/FeedbackButton';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  command?: string;
  suggestions?: { label: string; action: string }[];
  projectContext?: any;
  isTyping?: boolean;
  displayText?: string;
  interactionId?: string;
}

interface ChatbotProps {
  onProjectSelect: (projectId: string | null) => void;
  onFileUpload: (file: File) => void;
  selectedProjectId: string | null;
}

// Enhanced Markdown parser for chatbot messages
const parseMarkdown = (text: string): JSX.Element => {
  // Process text line by line to handle headings properly
  const lines = text.split('\n');
  
  return (
    <>
      {lines.map((line, lineIndex) => {
        let processedLine = line;
        const elements: JSX.Element[] = [];
        
        // Handle headings with potential bold inside
        if (line.match(/^#{1,3}\s/)) {
          const headingMatch = line.match(/^(#{1,3})\s*(.*)/);
          if (headingMatch) {
            const [, hashes, content] = headingMatch;
            const headingLevel = hashes.length;
            
            // Process bold within heading content
            const processedContent = processBoldText(content);
            
            const HeadingTag = headingLevel === 1 ? 'h2' : headingLevel === 2 ? 'h3' : 'h4';
            const headingClass = headingLevel === 1 
              ? 'text-xl font-bold text-foreground mt-6 mb-3 block'
              : headingLevel === 2 
                ? 'text-lg font-semibold text-foreground mt-4 mb-2 block'
                : 'text-base font-medium text-foreground mt-3 mb-2 block';
            
            return (
              <HeadingTag key={lineIndex} className={headingClass}>
                {processedContent}
              </HeadingTag>
            );
          }
        }
        
        // Handle regular lines with bold text
        const processedContent = processBoldText(line);
        return (
          <div key={lineIndex} className={lineIndex > 0 ? 'mt-1' : ''}>
            {processedContent}
          </div>
        );
      })}
    </>
  );
};

// Helper function to process bold text within a string
const processBoldText = (text: string): (string | JSX.Element)[] => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-primary">
          {boldContent}
        </strong>
      );
    }
    return part;
  });
};

export function Chatbot({ onProjectSelect, onFileUpload, selectedProjectId }: ChatbotProps) {
  const { projects } = useProjects();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [history, setHistory] = useState<{ id: number, text: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { tier, deductCredits, usedThisMonth } = useCredits();
  const { user } = useFirebaseUser();
  const { logInteraction, provideFeedback } = useDataCollection();

  // Storage key for conversation persistence (user and project specific)
  const getConversationKey = () => {
    const userId = user?.uid || 'anonymous';
    return selectedProjectId 
      ? `chatbot_conversation_${userId}_${selectedProjectId}` 
      : `chatbot_conversation_${userId}_global`;
  };

  // Load conversation from localStorage
  const loadConversation = () => {
    try {
      const key = getConversationKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsedMessages = JSON.parse(stored);
        return Array.isArray(parsedMessages) && parsedMessages.length > 0 
          ? parsedMessages 
          : [{ id: 1, text: 'Hello! I\'m your AI business assistant. How can I help you with your startup today?', sender: 'bot' }];
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
    return [{ id: 1, text: 'Hello! I\'m your AI business assistant. How can I help you with your startup today?', sender: 'bot' }];
  };

  // Save conversation to localStorage
  const saveConversation = (messagesToSave: Message[]) => {
    try {
      const key = getConversationKey();
      // Only save essential data, not temporary states like isTyping
      const messagesToStore = messagesToSave.map(msg => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender,
        command: msg.command,
        suggestions: msg.suggestions,
        projectContext: msg.projectContext
      }));
      localStorage.setItem(key, JSON.stringify(messagesToStore));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  // Load conversation when component mounts, project changes, or user changes
  useEffect(() => {
    const loadedMessages = loadConversation();
    setMessages(loadedMessages);
    
    // Check for initial prompt from localStorage (from Project Detail "Start Working")
    const initialPrompt = localStorage.getItem('chatbot_initial_prompt');
    if (initialPrompt) {
      // Clear the stored prompt so it doesn't trigger again
      localStorage.removeItem('chatbot_initial_prompt');
      
      // Wait a bit for the component to fully load, then send the prompt
      setTimeout(() => {
        handleSend(initialPrompt);
      }, 1000);
    }
  }, [selectedProjectId, user?.uid]);

  // Save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveConversation(messages);
    }
  }, [messages, selectedProjectId, user?.uid]);

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    if (messagesContainerRef.current && shouldAutoScroll) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Handle scroll events to detect manual scrolling
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold for better UX
      setShouldAutoScroll(isAtBottom);
    }
  };

  // Typing animation function
  const stopTyping = () => {
    if (typingIntervalRef.current) {
      cancelAnimationFrame(typingIntervalRef.current);
      typingIntervalRef.current = null;
      
      // Complete all typing messages immediately
      setMessages(prev => prev.map(msg => 
        msg.isTyping 
          ? { ...msg, displayText: msg.text, isTyping: false }
          : msg
      ));
      
      setLoading(false);
    }
  };

  const typeMessage = (messageId: number, fullText: string) => {
    let currentIndex = 0;
    const typingSpeed = 8; // milliseconds per character - much faster typing
    let lastTime = Date.now();
    
    const typeStep = () => {
      const now = Date.now();
      if (now - lastTime >= typingSpeed) {
        if (currentIndex <= fullText.length) {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, displayText: fullText.slice(0, currentIndex), isTyping: currentIndex < fullText.length }
              : msg
          ));
          currentIndex++;
          scrollToBottom();
          lastTime = now;
        } else {
          setLoading(false);
          return;
        }
      }
      
      if (currentIndex <= fullText.length) {
        typingIntervalRef.current = requestAnimationFrame(typeStep);
      }
    };

    typingIntervalRef.current = requestAnimationFrame(typeStep);
    return typingIntervalRef.current;
  };

  // Get selected project context
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;



  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle visibility change to keep typing when tab becomes inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Do nothing - let typing continue regardless of visibility
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSend = async (cmdInput?: string, command?: string) => {
    const text = cmdInput !== undefined ? cmdInput : input;
    if (!text.trim()) return;
    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
      command,
      projectContext: selectedProject,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShouldAutoScroll(true); // Enable auto-scroll when user sends message
    setLoading(true);
    setHistory((prev) => [{ id: userMessage.id, text }, ...prev.slice(0, 19)]); // keep last 20
    // AI call with project-aware context
    try {
      const aiPrompt = [
        selectedProject ? { role: 'system', content: `Project context: ${JSON.stringify(selectedProject)}` } : null,
        { role: 'user', content: command ? `${command}: ${text}` : text }
      ].filter(Boolean);
      const userKey = user?.uid || user?.email || 'anonymous';
      const aiText = await getAICompletion({ 
        messages: aiPrompt, 
        tier, 
        usedThisMonth, 
        userKey,
        userId: user?.uid,
        max_tokens: 1500 // Higher token limit for more detailed responses = faster credit consumption
      });
      
      // Log the interaction for data collection
      const interactionId = await logInteraction(
        'chatbot',
        text,
        aiText || 'No response from AI.',
        {
          projectId: selectedProjectId,
          command: command || undefined,
          model: 'ai-completion'
        }
      );
      
      const botMessageId = Date.now() + 1;
      const botMessage: Message = {
        id: botMessageId,
        text: aiText || 'No response from AI.',
        sender: 'bot',
        displayText: '',
        isTyping: true,
        interactionId: interactionId || undefined,
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // Start typing animation
      setTimeout(() => {
        typeMessage(botMessageId, aiText || 'No response from AI.');
      }, 500);
    } catch (err: any) {
      const fallbackMessageId = Date.now() + 1;
      const fallbackText = `AI unavailable. Here's a mock answer: ${mockAIResponse(command, text)}`;
      const fallbackMessage: Message = {
        id: fallbackMessageId,
        text: fallbackText,
        sender: 'bot',
        displayText: '',
        isTyping: true,
      };
      
      setMessages((prev) => [...prev, fallbackMessage]);
      
      // Start typing animation for fallback
      setTimeout(() => {
        typeMessage(fallbackMessageId, fallbackText);
      }, 500);
    } finally {
      setLoading(false);
    }
  };


  // Fallback mock generator
  function mockAIResponse(command?: string, text?: string) {
    if (command === 'startup-idea') return '1. Social AI Platform\n2. Green Delivery App\n3. Smart Budget Tool';
    if (command === 'summarize-plan') return 'Summary: Your plan covers product, market, and growth. Next: Validate with users.';
    if (command === 'estimate-revenue') return 'Estimated revenue: $5,000/month (mock)';
    if (command === 'draft-pitch-deck') return 'Pitch deck outline: Problem, Solution, Market, Team, Financials.';
    if (command === 'refine-idea') return 'Refined idea: Focus on B2B SaaS for remote teams.';
    if (command === 'check-legal') return 'Check: Register your business, review local regulations, consider IP.';
    return 'This is a mock AI response.';
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  // Block Chatbot for free users
  if (tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Chatbot is a Pro feature</h2>
        <p className="mb-6 text-muted-foreground">Upgrade to Pro or Ultra to access the AI Business Chatbot and unlock unlimited chat, analysis, and more.</p>
        <Button variant="primary" className="glow-primary" onClick={() => window.location.href = '/upgrade'}>
          Upgrade Now
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full relative">
      <ChatbotSidebar
        onSelectProject={onProjectSelect}
        onFileUpload={onFileUpload}
        selectedProjectId={selectedProjectId}
      />
      <div className="flex-1 flex flex-col items-stretch justify-stretch p-8 relative overflow-hidden">
        {/* Usage bar at the top */}
        <div className="mb-4 z-10">
          <ChatbotTokenBar />
        </div>
        {/* Chat area */}
        <div className="relative flex-1 flex flex-col bg-background/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-border/50 mb-6">
          <div className="absolute inset-0 flex flex-col">
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-8 py-10 space-y-8 relative scroll-smooth" 
              style={{ minHeight: 0, scrollBehavior: 'smooth' }}
              onScroll={handleScroll}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col gap-2 max-w-[80%] ${msg.sender === 'user' ? 'ml-8' : 'mr-8'}`}>
                    <div
                      className={`px-4 py-3 rounded-lg text-base whitespace-pre-line transition-all duration-200 ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground border border-border/50'
                      }`}
                    >
                      {msg.sender === 'bot' && msg.isTyping ? (
                        <>
                          {parseMarkdown(msg.displayText || '')}
                          {msg.isTyping && <span className="animate-pulse">|</span>}
                        </>
                      ) : msg.sender === 'bot' ? (
                        parseMarkdown(msg.displayText || msg.text)
                      ) : (
                        msg.displayText || msg.text
                      )}
                    </div>
                    {msg.sender === 'bot' && !msg.isTyping && msg.interactionId && (
                      <div className="flex justify-end">
                        <FeedbackButton
                          onFeedback={(feedback) => provideFeedback(msg.interactionId!, feedback)}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* AI thinking indicator */}
              {loading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-muted px-4 py-3 rounded-lg mr-8 border border-border/50">
                    <ThinkingDots />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>
        {/* Fixed bottom input area with proper separation */}
        <div className="mt-auto bg-background/95 backdrop-blur-md border-t border-border p-6 rounded-b-3xl">
          <div className="flex flex-col gap-4">
            
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm border border-border/50 transition-all duration-200"
                  placeholder="Message ChatBot..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  disabled={loading}
                />
              </div>
              
              <label className="cursor-pointer flex items-center gap-2 text-primary hover:text-primary/80 transition-colors px-3 py-2 rounded-lg hover:bg-primary/10">
                <input type="file" className="hidden" onChange={e => {
                  if (e.target.files && e.target.files[0]) onFileUpload(e.target.files[0]);
                }} />
                <span className="text-sm font-medium">📎</span>
              </label>
              
              <Button
                size="icon"
                className={`rounded-lg transition-all duration-200 w-10 h-10 ${
                  loading ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
                onClick={() => loading ? stopTyping() : handleSend()}
                disabled={!loading && !input.trim()}
              >
                {loading ? <X className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
