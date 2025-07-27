import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Clock, 
  ChevronRight,
  FileText,
  Play,
  Save,
  BookOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { BusinessPlanSectionDetail } from "./BusinessPlanSectionDetail";
import { addUserProject, getUserProjects } from '@/lib/firestoreProjects';
import { ExportService, ExportOptions } from '@/lib/exportService';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { Project } from './YourProject';

interface BusinessPlanProject {
  id: string;
  title: string;
  description: string;
  isAIGenerated?: boolean;
}

const mockProjects: BusinessPlanProject[] = [
  {
    id: "local-tech-support",
    title: "Local Tech Support & Consulting (B2C/Small Biz)",
    description: "Offer on-demand tech support and consulting services to individuals and small businesses in Ottawa. This includes troubleshooting, software installation, basic network setup, and device optimization, leveraging strong tech skills for immediate problem-solving.",
    isAIGenerated: true
  }
];

interface BusinessPlanSection {
  id: number;
  title: string;
  description: string;
  subItems: string[];
  estimatedTime: string;
  status: 'not_started' | 'locked';
  isLocked?: boolean;
}

const businessPlanSections: BusinessPlanSection[] = [
  {
    id: 1,
    title: "Executive Summary",
    description: "Create a compelling 2-page overview of your business",
    subItems: [
      "Business overview and value proposition",
      "Target market and competitive advantages", 
      "Financial highlights and funding needs"
    ],
    estimatedTime: "20 min",
    status: "not_started"
  },
  {
    id: 2,
    title: "Business Description", 
    description: "Define what you do and how you create value",
    subItems: [
      "Products and services overview",
      "Business model and revenue streams",
      "Industry analysis and positioning"
    ],
    estimatedTime: "25 min",
    status: "locked",
    isLocked: true
  },
  {
    id: 3,
    title: "Market Analysis",
    description: "Research your target customers and market opportunity", 
    subItems: [
      "Target customer profiles and personas",
      "Market size and growth potential",
      "Industry trends and opportunities"
    ],
    estimatedTime: "30 min",
    status: "locked",
    isLocked: true
  },
  {
    id: 4,
    title: "Competition Analysis",
    description: "Identify competitors and your competitive advantage",
    subItems: [
      "Direct and indirect competitors",
      "Competitive analysis and positioning",
      "Unique value proposition"
    ],
    estimatedTime: "35 min",
    status: "locked",
    isLocked: true
  },
  {
    id: 5,
    title: "Financial Projections",
    description: "Build comprehensive financial forecasts",
    subItems: [
      "3-year revenue and expense projections",
      "Break-even analysis and cash flow",
      "Funding requirements and use of funds"
    ],
    estimatedTime: "45 min",
    status: "locked",
    isLocked: true
  },
  {
    id: 6,
    title: "Marketing Strategy",
    description: "Plan your go-to-market approach",
    subItems: [
      "Customer acquisition strategies",
      "Marketing channels and budget allocation",
      "Brand positioning and messaging"
    ],
    estimatedTime: "30 min",
    status: "locked",
    isLocked: true
  },
  {
    id: 7,
    title: "Operations Plan",
    description: "Detail your day-to-day operations",
    subItems: [
      "Operational workflows and processes",
      "Staffing and organizational structure",
      "Technology and infrastructure needs"
    ],
    estimatedTime: "25 min",
    status: "locked",
    isLocked: true
  },
  {
    id: 8,
    title: "Risk Assessment",
    description: "Identify risks and mitigation strategies",
    subItems: [
      "Market and competitive risks",
      "Financial and operational risks",
      "Contingency planning and mitigation"
    ],
    estimatedTime: "20 min",
    status: "locked",
    isLocked: true
  }
];

export function BusinessPlanMode() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<BusinessPlanProject | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDataShowcase, setShowDataShowcase] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeSections: [],
    includeCharts: false,
    includeFinancials: false,
    templateStyle: 'professional',
    customBranding: false,
  });
  const [activeSection, setActiveSection] = useState("business-plan");
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useFirebaseUser();

  const handleSectionClick = (sectionId: number) => {
    setCurrentSectionId(sectionId);
  };

  const handleBackToOverview = () => {
    setCurrentSectionId(null);
  };

  // Load saved projects on component mount
  useEffect(() => {
    const loadSavedProjects = async () => {
      if (user) {
        try {
          const projects = await getUserProjects(user.uid);
          // Load ALL projects from Firestore, not just Business Plan category
          setSavedProjects(projects);
        } catch (error) {
          console.error('Error loading saved projects:', error);
        }
      }
    };
    loadSavedProjects();
  }, [user]);

  const handleSaveProject = async () => {
    if (!user || !selectedProject) return;
    
    setIsSaving(true);
    try {
      const projectData: Omit<Project, "id"> = {
        name: selectedProject.title,
        description: selectedProject.description,
        status: "Planning" as const,
        progress: 0,
        budget: {
          allocated: 0,
          spent: 0,
          remaining: 0
        },
        timeline: {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
          daysRemaining: 90
        },
        analytics: {
          revenue: 0,
          customers: 0,
          growth: 0
        },
        category: "Business Plan",
        lastUpdated: new Date().toISOString()
      };

      const projectId = await addUserProject(user.uid, projectData);
      
      // Refresh the saved projects list
      const updatedProjects = await getUserProjects(user.uid);
      setSavedProjects(updatedProjects);
      
      console.log('Project saved successfully:', projectId);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAskAI = async () => {
    // On‑Demand Business Plan Consultant Prompt
    const askAIPrompt = `You are a veteran startup advisor AI, steeped in lean methodology and investor best practices. Answer the user's question about their business plan directly and accurately, citing frameworks when relevant.

**INPUTS:**  
• businessDescription: "Offer on-demand tech support and consulting services to individuals and small businesses in Ottawa"
• sectionContext: "General Business Planning"
• userQuestion: "How do I structure my business plan effectively?"

**OUTPUT REQUIREMENTS:**  
1. **Direct Answer (2–4 sentences)** addressing the question  
2. **Framework Reference:** Name and briefly describe one relevant tool  
3. **Brief Example or Analogy (1 sentence)** to illustrate  
4. **Next Action:** One clear step the user should take  

**LIMITATIONS:**  
- If you lack specific data, respond: "This may require further market validation."  
- Keep total response ≤ 150 words.  
- No filler—be concise and authoritative.`;

    // TODO: Replace with actual AI API call
    // const response = await getAICompletion(askAIPrompt);
    console.log('Ask AI Prompt:', askAIPrompt);
  };

  const handleExportPlan = async () => {
    if (!user || !selectedProject) return;

    try {
      const { downloadUrl, filename } = await ExportService.exportBusinessPlan(
        selectedProject.id,
        user.uid,
        exportOptions
      );
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowExportModal(false);
      alert(`Successfully exported ${filename}`);
    } catch (error) {
      console.error('Error exporting plan:', error);
      alert('Failed to export plan. Please try again.');
    }
  };

  // If we're viewing a specific section, render the detail view
  if (currentSectionId && selectedProject) {
    const sectionTitles = {
      1: "Executive Summary",
      2: "Business Description", 
      3: "Market Analysis",
      4: "Competition Analysis",
      5: "Financial Projections",
      6: "Marketing Strategy",
      7: "Operations Plan",
      8: "Risk Assessment"
    };

    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1">
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBackToOverview}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Plan Overview
                </Button>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  📊 {selectedProject.title} - {sectionTitles[currentSectionId as keyof typeof sectionTitles]}
                </h1>
              </div>
            </div>
            <BusinessPlanSectionDetail
              sectionId={currentSectionId}
              sectionTitle={sectionTitles[currentSectionId as keyof typeof sectionTitles]}
              onBack={handleBackToOverview}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
                📋 Business Plan Builder
              </h1>
              <p className="text-lg text-muted-foreground">
                Create a professional business plan in simple steps
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                Choose Your Project
              </h2>

              {/* Saved Projects Section */}
              {savedProjects.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Your Saved Projects ({savedProjects.length})
                  </h3>
                  <div className="space-y-4">
                    {savedProjects.slice(0, 3).map((project) => (
                      <Card 
                        key={project.id}
                        className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
                        onClick={() => setSelectedProject({
                          id: project.id,
                          title: project.name,
                          description: project.description,
                          isAIGenerated: false
                        })}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-foreground mb-3">
                                {project.name}
                              </h3>
                              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                {project.description}
                              </p>
                              <div className="flex items-center gap-3">
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Saved Project
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {project.progress}% Complete
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-muted-foreground ml-4" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {savedProjects.length > 3 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/dashboard/projects')}
                      >
                        View All {savedProjects.length} Saved Projects
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Template Projects Section */}
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Start from Template
              </h3>
              <div className="space-y-4">
                {mockProjects.map((project) => (
                  <Card 
                    key={project.id}
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
                    onClick={() => setSelectedProject(project)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-3">
                            {project.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            {project.description}
                          </p>
                          {project.isAIGenerated && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              AI Generated
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className="w-6 h-6 text-muted-foreground ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedProject(null)}
                className="flex items-center gap-2 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  📊 {selectedProject.title}
                </h1>
                <p className="text-blue-100 text-sm">Business Plan Builder • AI-Powered</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleSaveProject}
                disabled={isSaving}
                variant="outline"
                className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Project'}
              </Button>
              <Button 
                onClick={() => setShowDataShowcase(true)}
                variant="outline"
                className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <FileText className="w-4 h-4" />
                Data Showcase
              </Button>
              <Button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100"
              >
                <Download className="w-4 h-4" />
                Export Plan
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1">
          <div className="max-w-6xl mx-auto p-6">

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md p-6">
              <CardHeader>
                <CardTitle>Export Business Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="exportFormat">Format</Label>
                    <Select
                      value={exportOptions.format}
                      onValueChange={(value: "pdf" | "docx" | "html" | "json") =>
                        setExportOptions({ ...exportOptions, format: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="docx">DOCX</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Include Sections</Label>
                    {businessPlanSections.map((section) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`section-${section.id}`}
                          checked={exportOptions.includeSections.includes(section.id.toString())}
                          onChange={(e) => {
                            const sectionIdStr = section.id.toString();
                            setExportOptions((prev) => ({
                              ...prev,
                              includeSections: e.target.checked
                                ? [...prev.includeSections, sectionIdStr]
                                : prev.includeSections.filter((id) => id !== sectionIdStr),
                            }));
                          }}
                        />
                        <Label htmlFor={`section-${section.id}`}>{section.title}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeCharts"
                      checked={exportOptions.includeCharts}
                      onChange={(e) =>
                        setExportOptions({ ...exportOptions, includeCharts: e.target.checked })
                      }
                    />
                    <Label htmlFor="includeCharts">Include Charts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeFinancials"
                      checked={exportOptions.includeFinancials}
                      onChange={(e) =>
                        setExportOptions({ ...exportOptions, includeFinancials: e.target.checked })
                      }
                    />
                    <Label htmlFor="includeFinancials">Include Financials</Label>
                  </div>
                  <div>
                    <Label htmlFor="templateStyle">Template Style</Label>
                    <Select
                      value={exportOptions.templateStyle}
                      onValueChange={(value: "professional" | "modern" | "creative") =>
                        setExportOptions({ ...exportOptions, templateStyle: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="customBranding"
                      checked={exportOptions.customBranding}
                      onChange={(e) =>
                        setExportOptions({ ...exportOptions, customBranding: e.target.checked })
                      }
                    />
                    <Label htmlFor="customBranding">Custom Branding</Label>
                  </div>
                  {exportOptions.customBranding && (
                    <>
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={exportOptions.companyName || ""}
                          onChange={(e) =>
                            setExportOptions({ ...exportOptions, companyName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyLogo">Company Logo URL</Label>
                        <Input
                          id="companyLogo"
                          value={exportOptions.companyLogo || ""}
                          onChange={(e) =>
                            setExportOptions({ ...exportOptions, companyLogo: e.target.value })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowExportModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleExportPlan}>Export</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Showcase Modal */}
        {showDataShowcase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto m-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Data Organization Showcase
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDataShowcase(false)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Business Plan Structure */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">📊 Business Plan Structure</h3>
                    <div className="grid gap-4">
                      {businessPlanSections.map((section) => (
                        <div key={section.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Section {section.id}: {section.title}</h4>
                            <Badge variant="outline">{section.estimatedTime}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                          <div className="grid md:grid-cols-2 gap-2">
                            {section.subItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <div className="w-1 h-1 bg-primary rounded-full" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Organization Features */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">🗂️ How Data is Organized</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">📝 Content Storage</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Auto-save every 30 seconds</li>
                          <li>• Local storage backup</li>
                          <li>• Version history tracking</li>
                          <li>• Export to multiple formats</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">🤖 AI Integration</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Claude 3.5 Haiku for research</li>
                          <li>• Content quality analysis</li>
                          <li>• Real-time suggestions</li>
                          <li>• Smart coaching prompts</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">📊 Progress Tracking</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Section completion status</li>
                          <li>• Word count targets</li>
                          <li>• Quality metrics</li>
                          <li>• Time estimates</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">🔗 Data Integration</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Cross-section references</li>
                          <li>• Financial data linking</li>
                          <li>• Market research integration</li>
                          <li>• Team collaboration features</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* AI Models Used */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">🧠 AI Models & Capabilities</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4 bg-blue-50">
                        <h4 className="font-medium text-blue-900">Claude 3.5 Haiku (Research & Analysis)</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Fast, accurate research with deep business understanding. Used for market analysis, 
                          competitive research, and industry insights.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4 bg-purple-50">
                        <h4 className="font-medium text-purple-900">Content Quality Engine</h4>
                        <p className="text-sm text-purple-700 mt-1">
                          Real-time analysis of writing quality, data accuracy, industry relevance, 
                          and local market specificity.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4 bg-green-50">
                        <h4 className="font-medium text-green-900">Smart Suggestions System</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Context-aware recommendations based on your content, industry trends, 
                          and best practices from successful business plans.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold">PROGRESS: 0% Complete</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>

          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                    🎯 Next: Executive Summary
                  </h3>
                  <p className="text-muted-foreground mb-1">Estimated: 20 min</p>
                </div>
                <Button 
                  size="lg"
                  onClick={() => handleSectionClick(1)}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Section
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              📋 SECTIONS
            </h2>
            
            <div className="space-y-4">
              {businessPlanSections.map((section) => (
                <Card 
                  key={section.id} 
                  className={`transition-all ${section.isLocked ? 'opacity-60' : 'hover:shadow-md cursor-pointer'}`}
                  onClick={() => !section.isLocked && handleSectionClick(section.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-primary">
                            {section.id}. {section.title}
                          </span>
                          {section.isLocked && (
                            <Badge variant="secondary" className="text-xs">
                              🔒 Locked
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">
                          📄 {section.description}
                        </p>
                        <div className="space-y-1">
                          {section.subItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                              {item}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {section.estimatedTime}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                            <span className="text-muted-foreground">Not started</span>
                          </div>
                          {section.id === 1 && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                              ✨ AI Available
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!section.isLocked && (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-card border-yellow-500/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-card-foreground mb-2 flex items-center justify-center gap-2">
                💡 Need help?
              </h3>
              <p className="text-muted-foreground mb-4">
                Get assistance with your business plan
              </p>
              <div className="flex justify-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAskAI()}
                >
                  💬 Ask AI
                </Button>
                <Button variant="outline" size="sm">
                  📖 Guide
                </Button>
                <Button variant="outline" size="sm">
                  🎯 Get Support
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}