import { Editor } from '@tinymce/tinymce-react';
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Target, 
  Zap, 
  Edit, 
  Upload, 
  Bot, 
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Building2,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar } from "../Sidebar";
import { getAICompletion } from "@/lib/ai";
import { AIResearchReport } from "./AIResearchReport";

interface SectionBuilderProps {
  sectionId: number;
  sectionTitle: string;
  onBack: () => void;
  onNext: (sectionId: number, content: string) => void;
}

interface SectionField {
  label: string;
  placeholder?: string;
  options?: string[];
}

const sectionContent: Record<number, {
  title: string;
  icon: string;
  description: string;
  items: string[];
  fields: Record<string, SectionField>;
}> = {
  5: {
    title: "Financial Projections",
    icon: "💰",
    description: "Build comprehensive financial forecasts and projections",
    items: [
      "Startup costs and initial investment",
      "Revenue projections and growth assumptions", 
      "Operating expenses and cost structure",
      "Break-even analysis and profitability timeline",
      "3-year financial forecast and scenarios"
    ],
    fields: {
      businessType: { label: "Business Type", options: ["Coffee Shop", "Restaurant", "Retail Store", "SaaS", "E-commerce", "Consulting"] },
      location: { label: "Location", placeholder: "Austin, TX" },
      investment: { label: "Investment Amount", placeholder: "$95,000" },
      targetOpening: { label: "Target Opening", placeholder: "Q2 2024" },
      dailyCustomers: { label: "Expected Daily Customers", placeholder: "25-50" },
      avgTransaction: { label: "Average Transaction", placeholder: "$4.50" }
    }
  },
  6: {
    title: "Marketing Strategy",
    icon: "📢",
    description: "Develop comprehensive marketing and customer acquisition plans",
    items: [
      "Target audience identification and personas",
      "Brand positioning and messaging strategy",
      "Marketing channels and budget allocation",
      "Customer acquisition cost analysis",
      "Launch strategy and growth marketing"
    ],
    fields: {
      targetAudience: { label: "Primary Target Audience", placeholder: "Tech professionals aged 25-40" },
      brandPosition: { label: "Brand Positioning", placeholder: "Premium coffee for busy professionals" },
      marketingBudget: { label: "Monthly Marketing Budget", placeholder: "$2,500" },
      channels: { label: "Primary Marketing Channels", options: ["Social Media", "Google Ads", "Local Events", "Email Marketing", "Influencer Marketing"] }
    }
  }
};

export function BusinessPlanSectionBuilder({ sectionId, sectionTitle, onBack, onNext }: SectionBuilderProps) {
  const navigate = useNavigate();
  const [generationMode, setGenerationMode] = useState<'ai' | 'manual' | 'import' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState("business-plan");
  const { register, handleSubmit, formState: { errors } } = useForm<{ manualInput: string }>();
  const editorRef = useRef<any>(null);
  const [showResearch, setShowResearch] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [importedContent, setImportedContent] = useState("");
  
  const section = sectionContent[sectionId as keyof typeof sectionContent];
  const sectionProgress = 60; // Mock progress

  const handleAIGeneration = async (tier: 'quick' | 'detailed') => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const prompt = `Generate a ${tier} ${section?.title} for a business with the following details:\n${JSON.stringify(formData, null, 2)}`;

    try {
      const response = await getAICompletion({ messages: [{ role: 'user', content: prompt }] });
      setAiContent(response);
      onNext(sectionId, response);
    } catch (error) {
      console.error("Error generating AI content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormSubmit = () => {
    if (editorRef.current) {
      onNext(sectionId, editorRef.current.getContent());
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportedContent(content);
      };
      reader.readAsText(file);
    }
  };

  if (generationMode === 'import') {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setGenerationMode(null)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Section
                </Button>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Upload className="w-6 h-6" />
                  Import Data: {section?.title}
                </h1>
              </div>
            </div>

            {/* Import Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Upload your {section?.title} Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileImport}
                />
                {importedContent && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <h4 className="font-semibold mb-2">Imported Content Preview:</h4>
                    <pre className="whitespace-pre-wrap text-sm">{importedContent}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
              <Button onClick={() => onNext(sectionId, importedContent)} disabled={!importedContent}>
                Save & Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (generationMode === 'manual') {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setGenerationMode(null)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Section
                </Button>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Edit className="w-6 h-6" />
                  Manual Input: {section?.title}
                </h1>
              </div>
            </div>

            {/* Manual Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {section?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Editor
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  onInit={(evt, editor) => editorRef.current = editor}
                  initialValue=""
                  init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                      'advlist autolink lists link image charmap preview anchor',
                      'searchreplace visualblocks code fullscreen',
                      'insertdatetime media table paste code help wordcount'
                    ],
                    toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                  }}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSubmit(handleFormSubmit)}>
                Save & Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
          <Card className="mt-20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Bot className="w-6 h-6 text-blue-500" />
                Building Your {section?.title}...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Progress value={generationProgress} className="h-3" />
                <p className="text-center text-muted-foreground">
                  {generationProgress}% Complete - {
                    generationProgress <= 20 ? "Analyzing business information..." :
                    generationProgress <= 40 ? "Researching industry benchmarks..." :
                    generationProgress <= 60 ? "Building financial models..." :
                    generationProgress <= 80 ? "Creating projections..." :
                    "Finalizing analysis..."
                  }
                </p>
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Analyzed Austin coffee market</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Researched industry benchmarks</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Calculated startup costs</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Built revenue model</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {generationProgress >= 80 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  <span>Creating expense projections</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {generationProgress >= 100 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span>Generating break-even analysis</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Time remaining: ~{Math.ceil((100 - generationProgress) / 20 * 15)} seconds
                </p>
                <p className="text-xs text-muted-foreground italic">
                  💡 Coffee shops typically break even in month 12-18
                </p>
              </div>

              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setIsGenerating(false)}
                  className="mt-4"
                >
                  Cancel Generation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    );
  }

  if (generationMode === 'ai') {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setGenerationMode(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Section
              </Button>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Bot className="w-6 h-6 text-blue-500" />
                AI {section?.title} Generator
              </h1>
            </div>
          </div>

          {/* Business Information Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 BUSINESS INFORMATION NEEDED
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {section?.fields && Object.entries(section.fields).map(([key, field]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{field.label}</Label>
                  {field.options ? (
                    <Select 
                      value={formData[key] || ""} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, [key]: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={key}
                      placeholder={field.placeholder}
                      value={formData[key] || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Generation Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">🎯 GENERATION OPTIONS</h3>
            
            {/* Quick Generation */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  ⚡ QUICK PROJECTIONS (FREE)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Basic 12-month forecast</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Standard industry assumptions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Simple break-even analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>30 seconds generation time</span>
                  </div>
                </div>
                <Button 
                  className="w-full flex items-center gap-2"
                  onClick={() => handleAIGeneration('quick')}
                  disabled={Object.keys(formData).length < 3}
                >
                  <Zap className="w-4 h-4" />
                  Generate Quick Forecast
                </Button>
              </CardContent>
            </Card>

            {/* Detailed Generation */}
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  💎 DETAILED PROJECTIONS (PRO)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>3-year detailed forecast</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Industry-specific market research</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Multiple scenario planning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Local market analysis integration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>2-3 minutes generation time</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => navigate('/upgrade')}
                >
                  🔓 Upgrade to Generate ($29/month)
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mt-8">
            <Button 
              variant="ghost" 
              onClick={() => setGenerationMode(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Section
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              How does this work?
            </Button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              {section?.icon} Section {sectionId}: {section?.title}
            </h1>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setShowResearch(!showResearch)}>
            <Bot className="w-4 h-4" />
            AI Research
          </Button>
          <Button className="flex items-center gap-2" onClick={() => onNext(sectionId, '')}>
            Save & Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {sectionProgress}% Complete
            </span>
          </div>
          <Progress value={sectionProgress} className="h-2" />
        </div>

        {/* Section Overview */}
        {showResearch && <AIResearchReport />}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 WHAT WE'LL BUILD IN THIS SECTION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {section?.items.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Approach Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 CHOOSE YOUR APPROACH
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AI Generation */}
            <div className="p-6 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500 rounded-lg text-white">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">⚡ AI GENERATION</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Let AI build your {section?.title.toLowerCase()} based on your business information
                  </p>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setGenerationMode('ai')}
                  >
                    <Bot className="w-4 h-4" />
                    Generate with AI
                  </Button>
                </div>
              </div>
            </div>

            {/* Manual Input */}
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-500 rounded-lg text-white">
                  <Edit className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">✏️ MANUAL INPUT</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Build your {section?.title.toLowerCase()} step by step with guided forms
                  </p>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => setGenerationMode('manual')}
                  >
                    <Edit className="w-4 h-4" />
                    Start Manual Entry
                  </Button>
                </div>
              </div>
            </div>

            {/* Import Data */}
            <div className="p-6 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500 rounded-lg text-white">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">📊 IMPORT DATA</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload existing financial data or spreadsheets
                  </p>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => setGenerationMode('import')}
                  >
                    <Upload className="w-4 h-4" />
                    Import Spreadsheet
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tip */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-yellow-600" />
            💡 TIP: Start with AI generation, then customize the results to match your specific needs
          </p>
        </div>

        {/* Help */}
        <div className="mt-6 text-center">
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Need help with this section?
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}