import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MotivationalQuote } from "./MotivationalQuote";
import { Settings } from "./Settings";
import { IdeaGenerator } from "./Features/IdeaGenerator";
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { Affiliate } from "./Affiliate";

import { YourProject } from "./Features/YourProject";
import { Chatbot } from "./Chatbot";
import { ExportPreviewDemo } from "./Features/ExportPreviewDemo";
import { AICoach } from "./Features/AICoach";
import { 
  Lightbulb, 
  Calculator, 
  Clock, 
  TrendingUp, 
  Target,
  Zap,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle,
  DollarSign,
  HelpCircle,
  CheckSquare,
  Flame,
  FileText,
  Bot
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface MainContentProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobile?: boolean;
}

const featureCards = [
  {
    id: "business-ideas",
    title: "AI Idea Generator",
    description: "Get tailored business ideas based on your skills and budget",
    icon: Lightbulb,
    color: "from-blue-500 to-purple-600",
    action: "Generate Ideas",
    isPro: false,
  },
  {
    id: "chatbot",
    title: "Chatbot",
    description: "Real-time business Q&A with tiered access",
    icon: HelpCircle,
    color: "from-cyan-500 to-blue-600",
    action: "Ask a Question",
    isPro: false,
  },
  {
    id: "legal-checklist",
    title: "Legal & Compliance",
    description: "Step-by-step checklist for business setup",
    icon: CheckSquare,
    color: "from-green-500 to-emerald-600",
    action: "View Checklist",
    isPro: false,
  },
  {
    id: "export-demo",
    title: "Export & Preview Demo",
    description: "See how document export and preview functionality works",
    icon: FileText,
    color: "from-purple-500 to-pink-600",
    action: "Try Demo",
    isPro: false,
  },
  {
    id: "ai-coach",
    title: "AI Business Coach",
    description: "Get real-time strategic advice and personalized guidance",
    icon: Bot,
    color: "from-emerald-500 to-cyan-600",
    action: "Start Coaching",
    isPro: false,
  },
];

// Stats will be calculated dynamically

import { useProjects } from "./Features/YourProject";
import { useActiveProject } from '@/hooks/useActiveProject';
import { useStreaks } from '@/hooks/useStreaks';

export function MainContent({ activeSection, onSectionChange, isMobile = false }: MainContentProps) {
  // All hooks must be declared first!
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { projects, addProject, removeProject, updateProject, loading: projectsLoading, error: projectsError } = useProjects();
  const { user, loading } = useFirebaseUser();
  const { activeProject } = useActiveProject();
  const { streaks, trackLogin, trackProjectWork } = useStreaks();
  const navigate = useNavigate();

  // Track login on mount
  useEffect(() => {
    if (user && !loading) {
      trackLogin();
    }
  }, [user, loading, trackLogin]);

  // Calculate time to launch for active project
  const getActiveProjectTimeToLaunch = () => {
    if (!activeProject) return "---"; // No active project selected
    
    // Check if the project has a timeToLaunch field
    if (!activeProject.timeToLaunch) return "---";
    
    let days = 0;
    const timeStr = activeProject.timeToLaunch.toLowerCase();
    
    // Parse different time formats
    if (timeStr.includes('month')) {
      const months = parseInt(timeStr.match(/\d+/)?.[0] || '0');
      days = months * 30; // Approximate days per month
    } else if (timeStr.includes('week')) {
      const weeks = parseInt(timeStr.match(/\d+/)?.[0] || '0');
      days = weeks * 7;
    } else if (timeStr.includes('day')) {
      days = parseInt(timeStr.match(/\d+/)?.[0] || '0');
    } else if (timeStr.includes('year')) {
      const years = parseInt(timeStr.match(/\d+/)?.[0] || '0');
      days = years * 365;
    } else {
      // Try to parse as just a number (assume days)
      const parsed = parseInt(timeStr.match(/\d+/)?.[0] || '0');
      if (parsed > 0) days = parsed;
    }
    
    if (days <= 0) return "---";
    
    // Adjust based on progress if available
    if (activeProject.progress && activeProject.progress > 0) {
      // If project has made progress, reduce estimated time
      const progressRatio = Math.min(activeProject.progress / 100, 0.9); // Cap at 90%
      days = Math.round(days * (1 - progressRatio * 0.3)); // Reduce by up to 30%
    }
    
    return `${days} days`;
  };

  // Calculate dynamic stats
  const stats = [
    { 
      label: "Active Projects", 
      value: projects.filter(p => p.status === 'In Progress').length.toString(), 
      change: projects.length > 0 ? "+12%" : "0%", 
      positive: true 
    },
    { 
      label: "Total Investment", 
      value: projects.length > 0 ? `$${projects.reduce((sum, p) => sum + parseInt(p.budget.allocated.toString()), 0).toLocaleString()}` : "$0", 
      change: projects.length > 0 ? "+8%" : "0%", 
      positive: true 
    },
    { 
      label: "Ideas Generated", 
      value: projects.length.toString(), 
      change: projects.length > 0 ? "+15%" : "0%", 
      positive: true 
    },
    { 
      label: "Time to Launch", 
      value: getActiveProjectTimeToLaunch(), 
      change: activeProject && activeProject.progress > 0 ? "-5%" : "0%", 
      positive: true 
    },
    { 
      label: "Login Streak", 
      value: `${streaks.login.currentStreak} days`, 
      change: streaks.login.currentStreak >= streaks.login.longestStreak ? "🔥" : "", 
      positive: true,
      icon: Flame
    },
  ];

  // Settings section
  if (activeSection === "settings") {
    return <Settings onSectionChange={onSectionChange} />;
  }

  if (activeSection === "business-ideas") {
    return <IdeaGenerator />;
  }

  if (activeSection === "affiliate") {
    return <Affiliate />;
  }

  if (activeSection === "chatbot") {
    const handleFileUpload = (file: File) => {
      // TODO: Implement file upload logic
    };
    return (
      <Chatbot
        selectedProjectId={selectedProjectId}
        onProjectSelect={setSelectedProjectId}
        onFileUpload={handleFileUpload}
      />
    );
  }

  if (activeSection === "legal-checklist") {
    return <div className="flex-1 flex items-center justify-center text-lg text-muted-foreground">Legal & Compliance Checklist coming soon</div>;
  }

  if (activeSection === "export-demo") {
    return <ExportPreviewDemo />;
  }

  if (activeSection === "ai-coach") {
    return <AICoach />;
  }


  if (activeSection === "your-project") {
    return <YourProject onSectionChange={onSectionChange} />;
  }

  // Other sections placeholder
  if (activeSection !== "dashboard") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Card className="p-8 flex flex-col items-center">
          <div className="mb-4">
            <Badge className="bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4 py-2 text-lg rounded-full">
              <Zap className="inline-block mr-2" />
              {featureCards.find((f) => f.id === activeSection)?.title || "Section"}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {featureCards.find((f) => f.id === activeSection)?.title || "Section"}
          </h2>
          <p className="text-muted-foreground mb-6">
            This section is under development. Coming soon with amazing features!
          </p>
          <Button variant="outline" onClick={() => onSectionChange("dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`flex-1 ${isMobile ? 'p-4' : 'p-8'} animate-fade-in`}>
      <div className={`${isMobile ? 'max-w-none' : 'max-w-7xl'} mx-auto space-y-${isMobile ? '6' : '8'}`}>
        {/* Welcome Section */}
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'}`}>
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-foreground mb-2`}>
              Welcome back, {user ? user.displayName || user.email : loading ? 'Loading...' : 'there'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Let's continue building your dream startup. Here's what's happening today.
            </p>
          </div>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => navigate('/business-ideas')}
            className="hidden sm:flex glow-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start New Project
          </Button>
        </div>

        {/* Stats Overview */}
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6'}`}>
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-gradient-card glow-card hover-lift">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <Badge 
                  variant={stat.positive ? "default" : "secondary"}
                  className={stat.positive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}
                >
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </Card>
          ))}
          {/* Motivational Quote as a fifth card */}
          <MotivationalQuote />
        </div>

        {/* Feature Cards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">AI-Powered Tools</h2>
            <Badge className="bg-primary/20 text-primary">5 Tools Available</Badge>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.id} 
                  className="p-6 bg-gradient-card glow-card hover-lift cursor-pointer transition-smooth group"
                  onClick={() => {
                    if (feature.id === "chatbot") {
                      navigate('/chatbot');
                    } else if (feature.id === "your-project") {
                      navigate('/your-projects');
                    } else if (feature.id === "business-ideas") {
                      navigate('/business-ideas');
                    } else if (feature.id === "legal-checklist") {
                      navigate('/legal-compliance');
                    } else {
                      onSectionChange(feature.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center glow-primary`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {feature.isPro && (
                      <Badge className="bg-warning/20 text-warning">Pro Feature</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <Button 
                    variant={feature.isPro ? "outline" : "primary"}
                    size="sm"
                    className="w-full group-hover:scale-105 transition-smooth glow-primary"
                  >
                    {feature.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Real Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Your Projects</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/business-ideas')}
            >
              Generate Ideas
            </Button>
          </div>
          <div className="space-y-4">
            {projects.length === 0 ? (
              <Card className="p-6 text-center">No saved projects yet. Generate and save ideas to get started!</Card>
            ) : (
              projects.map((project, index) => (
                <Card key={project.id} className="p-6 bg-gradient-card glow-card hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {project.status}
                      </Badge>
                      <Badge 
                        variant="default"
                        className="text-xs"
                      >
                        {project.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${project.budget.allocated}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {project.analytics.customers} customers
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">{project.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}