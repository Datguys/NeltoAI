import { useState, useEffect, useRef } from "react";
import { Editor } from '@tinymce/tinymce-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  CheckCircle,
  Clock,
  RefreshCw,
  Zap,
  Edit,
  Bot,
  Brain,
  FileText,
  Target,
  TrendingUp,
  Star,
  Lightbulb,
  AlertTriangle,
  SkipForward,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { routeAIRequest, getAIModelInfo } from '@/lib/aiRouter';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

interface SectionDetailProps {
  sectionId: number;
  sectionTitle: string;
  onBack: () => void;
  aiContent?: string;
}

interface Subsection {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending' | 'skipped';
  description: string;
  content?: string; // Save user content
}

const sectionData = {
  1: {
    title: "Executive Summary",
    icon: "💼",
    description: "Create a compelling 2-page overview of your business",
    progress: 65,
    estimatedTime: "25 minutes",
    subsections: [
      { id: "1.1", title: "Business Overview & Value Proposition", status: "in_progress", description: "Core business concept and unique value" },
      { id: "1.2", title: "Target Market Summary", status: "pending", description: "Key customer segments and market size" },
      { id: "1.3", title: "Competitive Advantages", status: "pending", description: "What sets your business apart" },
      { id: "1.4", title: "Financial Highlights", status: "pending", description: "Key financial projections and metrics" },
      { id: "1.5", title: "Funding Requirements", status: "pending", description: "Investment needs and use of funds" }
    ]
  },
  2: {
    title: "Business Description",
    icon: "🏢",
    description: "Define what you do and how you create value",
    progress: 30,
    estimatedTime: "30 minutes",
    subsections: [
      { id: "2.1", title: "Company Overview", status: "completed", description: "Business mission, vision, and legal structure" },
      { id: "2.2", title: "Products & Services", status: "in_progress", description: "Detailed description of offerings" },
      { id: "2.3", title: "Business Model", status: "pending", description: "How you generate revenue" },
      { id: "2.4", title: "Industry Analysis", status: "pending", description: "Industry overview and positioning" },
      { id: "2.5", title: "Location & Facilities", status: "pending", description: "Physical and operational requirements" }
    ]
  },
  3: {
    title: "Market Analysis", 
    icon: "📊",
    description: "Research your target customers and market opportunity",
    progress: 65,
    estimatedTime: "25 minutes",
    subsections: [
      { id: "3.1", title: "Market Size & Opportunity", status: "completed", description: "Total addressable market and growth potential" },
      { id: "3.2", title: "Target Customer Profile", status: "completed", description: "Detailed customer personas and demographics" },
      { id: "3.3", title: "Market Trends & Growth", status: "in_progress", description: "Industry trends and future projections" },
      { id: "3.4", title: "Customer Needs Analysis", status: "pending", description: "Pain points and unmet customer needs" },
      { id: "3.5", title: "Market Entry Strategy", status: "pending", description: "How you'll enter and capture market share" },
      { id: "3.6", title: "Competitive Landscape", status: "pending", description: "Direct and indirect competitors analysis" }
    ]
  },
  4: {
    title: "Organization & Management",
    icon: "👥",
    description: "Showcase your team and organizational structure",
    progress: 15,
    estimatedTime: "20 minutes",
    subsections: [
      { id: "4.1", title: "Organizational Structure", status: "pending", description: "Company hierarchy and ownership" },
      { id: "4.2", title: "Management Team", status: "pending", description: "Key personnel and their backgrounds" },
      { id: "4.3", title: "Advisory Board", status: "pending", description: "External advisors and mentors" },
      { id: "4.4", title: "Personnel Plan", status: "pending", description: "Hiring strategy and workforce planning" }
    ]
  },
  5: {
    title: "Service/Product Line",
    icon: "🎯",
    description: "Detailed description of your offerings",
    progress: 40,
    estimatedTime: "35 minutes",
    subsections: [
      { id: "5.1", title: "Product/Service Description", status: "completed", description: "Comprehensive offering details" },
      { id: "5.2", title: "Development & Lifecycle", status: "in_progress", description: "Development stage and future roadmap" },
      { id: "5.3", title: "Intellectual Property", status: "pending", description: "Patents, trademarks, and proprietary assets" },
      { id: "5.4", title: "Quality Control", status: "pending", description: "Standards and quality assurance processes" },
      { id: "5.5", title: "Research & Development", status: "pending", description: "Innovation strategy and R&D investments" }
    ]
  },
  6: {
    title: "Marketing & Sales",
    icon: "📈",
    description: "Strategy for reaching and converting customers",
    progress: 25,
    estimatedTime: "40 minutes",
    subsections: [
      { id: "6.1", title: "Marketing Strategy", status: "pending", description: "Brand positioning and marketing approach" },
      { id: "6.2", title: "Sales Strategy", status: "pending", description: "Sales process and customer acquisition" },
      { id: "6.3", title: "Pricing Strategy", status: "pending", description: "Pricing model and value proposition" },
      { id: "6.4", title: "Distribution Channels", status: "pending", description: "How products/services reach customers" },
      { id: "6.5", title: "Customer Retention", status: "pending", description: "Strategies for customer loyalty and repeat business" },
      { id: "6.6", title: "Digital Marketing", status: "pending", description: "Online presence and digital channels" }
    ]
  },
  7: {
    title: "Funding Request",
    icon: "💰",
    description: "Investment requirements and funding strategy",
    progress: 0,
    estimatedTime: "25 minutes",
    subsections: [
      { id: "7.1", title: "Funding Requirements", status: "pending", description: "Total funding needed and timeline" },
      { id: "7.2", title: "Use of Funds", status: "pending", description: "How investment will be utilized" },
      { id: "7.3", title: "Future Funding", status: "pending", description: "Long-term financing strategy" },
      { id: "7.4", title: "Return on Investment", status: "pending", description: "Expected returns for investors" },
      { id: "7.5", title: "Exit Strategy", status: "pending", description: "Potential exit opportunities" }
    ]
  },
  8: {
    title: "Financial Projections",
    icon: "📉",
    description: "Revenue forecasts and financial planning",
    progress: 10,
    estimatedTime: "45 minutes",
    subsections: [
      { id: "8.1", title: "Revenue Projections", status: "pending", description: "5-year revenue forecasts" },
      { id: "8.2", title: "Expense Projections", status: "pending", description: "Operating costs and expense breakdown" },
      { id: "8.3", title: "Cash Flow Analysis", status: "pending", description: "Monthly cash flow projections" },
      { id: "8.4", title: "Break-even Analysis", status: "pending", description: "Break-even point calculations" },
      { id: "8.5", title: "Financial Ratios", status: "pending", description: "Key financial metrics and benchmarks" },
      { id: "8.6", title: "Scenario Planning", status: "pending", description: "Best case, worst case, and realistic scenarios" }
    ]
  },
  9: {
    title: "Appendix",
    icon: "📋",
    description: "Supporting documents and additional information",
    progress: 5,
    estimatedTime: "15 minutes",
    subsections: [
      { id: "9.1", title: "Financial Documents", status: "pending", description: "Detailed financial statements and projections" },
      { id: "9.2", title: "Market Research", status: "pending", description: "Supporting market data and studies" },
      { id: "9.3", title: "Legal Documents", status: "pending", description: "Contracts, agreements, and legal filings" },
      { id: "9.4", title: "Product Documentation", status: "pending", description: "Technical specifications and product details" }
    ]
  },
  10: {
    title: "Implementation Timeline",
    icon: "⏰",
    description: "Execution roadmap and milestones",
    progress: 20,
    estimatedTime: "30 minutes",
    subsections: [
      { id: "10.1", title: "Launch Timeline", status: "pending", description: "Key milestones and launch phases" },
      { id: "10.2", title: "Operational Milestones", status: "pending", description: "Business development checkpoints" },
      { id: "10.3", title: "Growth Phases", status: "pending", description: "Scaling strategy and expansion timeline" },
      { id: "10.4", title: "Risk Management", status: "pending", description: "Risk assessment and mitigation strategies" },
      { id: "10.5", title: "Success Metrics", status: "pending", description: "KPIs and performance indicators" },
      { id: "10.6", title: "Contingency Plans", status: "pending", description: "Alternative strategies and backup plans" }
    ]
  }
};

type GenerationMode = 'manual' | 'ai' | null;

export function BusinessPlanSectionDetail({ sectionId, sectionTitle, onBack, aiContent }: SectionDetailProps) {
  const navigate = useNavigate();
  const { user } = useFirebaseUser();
  const [activeSection, setActiveSection] = useState("business-plan");
  const [currentSubsection, setCurrentSubsection] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(null);
  const [content, setContent] = useState(aiContent || "");
  const editorRef = useRef<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [subsectionContents, setSubsectionContents] = useState<Record<string, string>>({});
  const [localSectionData, setLocalSectionData] = useState(sectionData);
  const [skippedSubsections, setSkippedSubsections] = useState<string[]>([]);
  const [showSkippedReminder, setShowSkippedReminder] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedBusinessPlanType, setSelectedBusinessPlanType] = useState<'investors' | 'operations' | 'loan'>('investors');
  
  // Get user tier from localStorage with proper key format
  const getUserTier = (): 'free' | 'starter' | 'industry' | 'ultra' | 'lifetime' => {
    if (!user) return 'free';
    
    const userKey = user.uid || 'anonymous';
    const storageKey = `ai_credits_v1_${userKey}`;
    
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        return data.tier || 'free';
      }
    } catch (e) {
      console.warn('Failed to read tier from localStorage:', e);
    }
    
    return 'free';
  };
  
  const userTier = getUserTier();

  const section = localSectionData[sectionId as keyof typeof localSectionData];
  const currentSub = section?.subsections.find(sub => sub.status === 'in_progress') || section?.subsections.find(sub => sub.status === 'pending');
  
  // Calculate dynamic progress
  const completedCount = section?.subsections.filter(sub => sub.status === 'completed').length || 0;
  const totalCount = section?.subsections.length || 1;
  const dynamicProgress = Math.round((completedCount / totalCount) * 100);

  if (!section) {
    return <div>Section not found</div>;
  }

  // Auto-set current subsection to the first in_progress one
  useEffect(() => {
    if (!currentSubsection && currentSub) {
      setCurrentSubsection(currentSub.id);
      setContent(subsectionContents[currentSub.id] || "");
    }
  }, [currentSub, currentSubsection]);

  const saveContent = () => {
    if (currentSubsection && editorRef.current) {
      const editorContent = editorRef.current.getContent();
      setSubsectionContents(prev => ({
        ...prev,
        [currentSubsection]: editorContent
      }));
      // Save to localStorage for persistence
      localStorage.setItem(`businessplan_${sectionId}_${currentSubsection}`, editorContent);
    }
  };

  const completeCurrentSubsection = () => {
    if (!currentSubsection) return;
    
    saveContent();
    
    // Update section data
    setLocalSectionData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId as keyof typeof prev],
        subsections: prev[sectionId as keyof typeof prev].subsections.map(sub => 
          sub.id === currentSubsection 
            ? { ...sub, status: 'completed' as const }
            : sub
        )
      }
    }));

    // Move to next subsection
    const currentIndex = section.subsections.findIndex(sub => sub.id === currentSubsection);
    const nextSub = section.subsections[currentIndex + 1];
    
    if (nextSub) {
      // Unlock next subsection
      setLocalSectionData(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId as keyof typeof prev],
          subsections: prev[sectionId as keyof typeof prev].subsections.map(sub => 
            sub.id === nextSub.id 
              ? { ...sub, status: 'in_progress' as const }
              : sub
          )
        }
      }));
      setCurrentSubsection(nextSub.id);
      setContent(subsectionContents[nextSub.id] || "");
    } else {
      // Section completed, check for skipped subsections
      if (skippedSubsections.length > 0) {
        setShowSkippedReminder(true);
      }
    }
  };

  const skipCurrentSubsection = () => {
    if (!currentSubsection) return;
    
    // Mark as skipped
    setSkippedSubsections(prev => [...prev, currentSubsection]);
    setLocalSectionData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId as keyof typeof prev],
        subsections: prev[sectionId as keyof typeof prev].subsections.map(sub => 
          sub.id === currentSubsection 
            ? { ...sub, status: 'skipped' as const }
            : sub
        )
      }
    }));

    // Move to next subsection
    const currentIndex = section.subsections.findIndex(sub => sub.id === currentSubsection);
    const nextSub = section.subsections[currentIndex + 1];
    
    if (nextSub) {
      setLocalSectionData(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId as keyof typeof prev],
          subsections: prev[sectionId as keyof typeof prev].subsections.map(sub => 
            sub.id === nextSub.id 
              ? { ...sub, status: 'in_progress' as const }
              : sub
          )
        }
      }));
      setCurrentSubsection(nextSub.id);
      setContent(subsectionContents[nextSub.id] || "");
    }
  };

  // Load saved content on component mount
  useEffect(() => {
    const savedContents: Record<string, string> = {};
    section.subsections.forEach(sub => {
      const saved = localStorage.getItem(`businessplan_${sectionId}_${sub.id}`);
      if (saved) {
        savedContents[sub.id] = saved;
      }
    });
    setSubsectionContents(savedContents);
  }, [sectionId]);

  const handleAICoaching = async () => {
    try {
      // AI Content Coach & Reviewer Prompt
      const coachingPrompt = `You are an expert startup writing coach from OpenAI and Anthropic labs. Review the user's draft and provide a clear, structured audit.

**INPUTS:**  
• sectionId: "${sectionId}"
• subsectionId: "${currentSubsection}"
• draftText: "${content}"
• desiredTone: "Persuasive"
• audience: "Angel Investor"

**OUTPUT FORMAT:**  
1. **Overall Score (1–10):** One number, with 1‑sentence rationale.  
2. **Strengths (2 bullets):** What's working well.  
3. **Weaknesses (2–3 bullets):** Specific issues (clarity, data gaps, tone mismatch).  
4. **Suggested Edits:** For each weakness, "Before → After" rewrite snippet.  
5. **Tone Alignment:** Yes/No + rewrite of one sentence to match desiredTone.  
6. **Next Steps:** 2 actionable recommendations.

**CONSTRAINTS:**  
- ≤ 250 words.  
- Be brutally specific—no generic praise.  
- Don't change meaning unless you note it's a suggestion.`;

      // Use AI Router for coaching
      const response = await routeAIRequest({
        task: 'coaching',
        prompt: coachingPrompt,
        userTier
      });
      
      console.log('AI Coaching Response:', response);
      // TODO: Display response in UI (could be a modal or update a coaching panel)
    } catch (error) {
      console.error('AI Coaching Error:', error);
    }
  };

  const handleResearchHelp = async () => {
    try {
      // AI Research Help Prompt
      const researchPrompt = `You are a senior market research AI, trained on verified data sources like Statista, IBISWorld, government databases, and leading trade journals. Your task is to fetch and summarize hard data for a specific business plan subsection.

**INPUTS:**  
• topic: "tech support services market"
• region: "Ottawa, Canada metro area"
• timeframe: "past 12 months"
• dataPoints: ["average service rates", "market size", "top 3 competitors"]

**OUTPUT STRUCTURE (Markdown):**  
1. **Executive Summary (1–2 sentences)**  
2. **Key Statistics:**  
   - **Metric:** Value (Source, Year)  
3. **Top 3 Competitors:**  
   - Name — key fact or price range (Source)  
4. **Actionable Insight (2–3 sentences):** What this means for your plan  
5. **Data References:**  
   - URL or citation for each stat  

**CRITICAL RULES:**  
- Do **not** invent data. If you can't find a stat, say "No verified data available for [metric]."  
- Use realistic placeholders only if explicitly allowed, and label them clearly.  
- Keep output under 250 words.`;

      // Use AI Router for research
      const response = await routeAIRequest({
        task: 'research',
        prompt: researchPrompt,
        userTier
      });
      
      console.log('Research Help Response:', response);
      // TODO: Display response in UI
    } catch (error) {
      console.error('Research Help Error:', error);
    }
  };

  const handleQuickGenerateAll = async () => {
    // Bulk Section Generation Prompt
    const bulkGeneratePrompt = `You are an expert business plan AI trained on thousands of real startup plans. Your job is to generate a full, polished draft for a single section using all available project data.

Inputs:
- Project Context: ${JSON.stringify({
  name: "Local Tech Support & Consulting",
  description: "Offer on-demand tech support and consulting services to individuals and small businesses in Ottawa",
  market: "Ottawa tech support market",
  model: "Service-based B2C/Small Business"
})}
- Section ID: "${sectionId}"
- Subsection IDs: ${JSON.stringify(section.subsections.map(sub => sub.id))}

Requirements:
1. For each requested subsection:
   - Deliver 3–5 concise paragraphs of original, actionable content.
   - Anchor statements to realistic data or best-practice examples.
2. Use the project's unique keywords, tone, and style.
3. At the end of each subsection, include a **"Next Steps"** bullet list of 2–3 actionable items.
4. If any critical input is missing, pause and add a **"❓ Clarification Needed"** prompt with specific questions.

Tone: Professional yet conversational; investor-ready but founder-friendly.
Keep each subsection under 200 words.`;

    // TODO: Replace with actual AI API call
    // const response = await getAICompletion(bulkGeneratePrompt);
    console.log('Quick Generate All Prompt:', bulkGeneratePrompt);
  };

  const handleCustomResearch = async () => {
    // Targeted Deep Research Prompt
    const customResearchPrompt = `You are a senior market analyst AI with access to up-to-date datasets and trade publications. Your task is to perform focused research and return verifiable, hyper-relevant findings.

Inputs:
- Topic: "tech support services market analysis"
- Scope: "Ottawa, Canada metro area, small business segment"
- Data Needs: ["market size", "average service rates", "competitive landscape", "growth trends"]
- Output Format: Markdown with clear headers

Deliverables:
1. **Executive Summary** (2–3 sentences)  
2. **Key Metrics & Statistics**  
   - Use bullet points: data source + metric + date  
3. **Top 3 Competitors / Benchmarks**  
   - Name, brief description, price ranges, market share estimates  
4. **Trends & Insights**  
   - 2–3 actionable observations  
5. **Raw Data References**  
   - List URLs or datasets where user can verify or download more info

Constraints:
- Do not hallucinate—if data isn't readily available, state "No verified data found; consider primary research."  
- Keep each section succinct: total output under 300 words.`;

    // TODO: Replace with actual AI API call
    // const response = await getAICompletion(customResearchPrompt);
    console.log('Custom Research Prompt:', customResearchPrompt);
  };

  const handleModeSelection = (mode: GenerationMode) => {
    setGenerationMode(mode);
    if (currentSub) {
      setCurrentSubsection(currentSub.id);
    }
  };

  // Function to analyze content quality
  const analyzeContentQuality = (content: string) => {
    if (!content || content.trim().length === 0) {
      return {
        dataAccuracy: { score: 'N/A', icon: Clock },
        industryRelevance: { score: 'N/A', icon: Clock },
        localSpecificity: { score: 'N/A', icon: Clock },
        writingQuality: { score: 'N/A', icon: Clock },
        length: { score: 'N/A', icon: Clock, words: 0 }
      };
    }

    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
    
    // Data accuracy analysis
    const hasSpecificData = /\d+[\d,]*%|\$[\d,]+|\d+[\d,]*\s*(million|billion|thousand)/i.test(content);
    const hasSources = /\[source|\(source|according to|data from|statistics show/i.test(content);
    const dataAccuracy = hasSpecificData && hasSources ? 'Excellent' : hasSpecificData ? 'Good' : 'Basic';
    
    // Industry relevance analysis
    const businessTerms = /market|industry|customer|revenue|competitor|growth|strategy|business|service|product/gi;
    const businessTermCount = (content.match(businessTerms) || []).length;
    const industryRelevance = businessTermCount > 10 ? 'High' : businessTermCount > 5 ? 'Medium' : 'Low';
    
    // Local specificity analysis
    const localTerms = /ottawa|canada|canadian|local|region|area|community|city/gi;
    const localTermCount = (content.match(localTerms) || []).length;
    const localSpecificity = localTermCount > 3 ? 'High' : localTermCount > 1 ? 'Good' : 'Basic';
    
    // Writing quality analysis
    const hasGoodStructure = /^#+\s|\*\s|\d+\.\s|•\s/m.test(content);
    const readabilityScore = avgWordsPerSentence < 20 && avgWordsPerSentence > 10;
    const writingQuality = hasGoodStructure && readabilityScore ? 'Excellent' : hasGoodStructure || readabilityScore ? 'Good' : 'Fair';
    
    // Length analysis
    const lengthScore = words >= 200 && words <= 600 ? 'Perfect' : words >= 100 ? 'Good' : 'Too short';
    
    return {
      dataAccuracy: { 
        score: dataAccuracy, 
        icon: dataAccuracy === 'Excellent' ? CheckCircle : dataAccuracy === 'Good' ? Target : AlertTriangle 
      },
      industryRelevance: { 
        score: industryRelevance, 
        icon: industryRelevance === 'High' ? CheckCircle : industryRelevance === 'Medium' ? Target : AlertTriangle 
      },
      localSpecificity: { 
        score: localSpecificity, 
        icon: localSpecificity === 'High' ? CheckCircle : localSpecificity === 'Good' ? Target : AlertTriangle 
      },
      writingQuality: { 
        score: writingQuality, 
        icon: writingQuality === 'Excellent' ? CheckCircle : writingQuality === 'Good' ? Target : AlertTriangle 
      },
      length: { 
        score: lengthScore, 
        icon: lengthScore === 'Perfect' ? CheckCircle : lengthScore === 'Good' ? Target : AlertTriangle,
        words: words
      }
    };
  };

  const handleAIGeneration = async () => {
    setIsGenerating(true);
    
    try {
      // Use state instead of reading from DOM
      const currentBusinessPlanType = selectedBusinessPlanType;
      const selectedDetailLevel = (document.querySelector('input[name="detailLevel"]:checked') as HTMLInputElement)?.value || 'comprehensive';
      
      // Legacy form inputs (for advanced options)
      const selectedResearchFocus = Array.from(document.querySelectorAll('input[name="researchFocus"]:checked'))
        .map(el => (el as HTMLInputElement).value);
      const selectedTone = (document.querySelector('input[name="tone"]:checked') as HTMLInputElement)?.value || 'Professional';
      const selectedDetail = selectedDetailLevel;
      
      // Get advanced options if available
      const selectedContentStructure = Array.from(document.querySelectorAll('input[name="contentStructure"]:checked'))
        .map(el => (el as HTMLInputElement).value);
      const selectedAIModel = (document.querySelector('input[name="aiModel"]:checked') as HTMLInputElement)?.value;
      const additionalContext = (document.querySelector('textarea[name="additionalContext"]') as HTMLTextAreaElement)?.value || '';
      const selectedOutputFormat = (document.querySelector('input[name="outputFormat"]:checked') as HTMLInputElement)?.value || 'markdown';
      const selectedGenerationOptions = Array.from(document.querySelectorAll('input[name="generationOptions"]:checked'))
        .map(el => (el as HTMLInputElement).value);
      
      // Get current subsection details
      const currentSub = section.subsections.find(sub => sub.id === currentSubsection);

      // AI Content Generation Prompt with actual customization
      const businessPlanContext = {
        investors: 'Focus on growth potential, market size, competitive advantages, and funding needs. Include data that shows scalability and ROI.',
        operations: 'Focus on practical daily operations, management processes, team structure, and operational efficiency. Include actionable details.',
        loan: 'Focus on financial stability, conservative projections, risk mitigation, and clear loan repayment ability. Include cash flow analysis.'
      };

      const detailLevelInstructions = {
        quick: { words: '200-300', time: '30 seconds', description: 'Brief overview with key points' },
        comprehensive: { words: '400-600', time: '45 seconds', description: 'Professional quality with key details and data' },
        indepth: { words: '800+', time: '90 seconds', description: 'Extensive research with industry benchmarks' }
      };

      const currentDetailLevel = detailLevelInstructions[selectedDetailLevel as keyof typeof detailLevelInstructions];

      const aiPrompt = `You are a world‑class business planning AI, trained on thousands of vetted ${currentBusinessPlanType === 'investors' ? 'investor-ready' : currentBusinessPlanType === 'loan' ? 'bank-approved' : 'operational'} plans. Generate a focused draft for one subsection only, strictly following the user's inputs.

**BUSINESS PLAN TYPE: ${currentBusinessPlanType.toUpperCase()}**
${businessPlanContext[currentBusinessPlanType as keyof typeof businessPlanContext]}

**INPUTS:**  
• projectData: ${JSON.stringify({
  name: "Local Tech Support & Consulting",
  industry: "Technology Services", 
  stage: "Planning",
  keyMetrics: "Service-based B2C/Small Business"
})}
• sectionId: "${sectionId}"  
• subsectionId: "${currentSubsection}"
• subsectionTitle: "${currentSub?.title || 'Unknown'}"
• subsectionDescription: "${currentSub?.description || 'No description'}"
• userDescription: "Offer on-demand tech support and consulting services to individuals and small businesses in Ottawa"
• businessPlanType: "${currentBusinessPlanType}"
• detailLevel: "${selectedDetailLevel}" (${currentDetailLevel.words} words, ${currentDetailLevel.description})

**CUSTOMIZATION INSTRUCTIONS:**
- Target length: ${currentDetailLevel.words} words
- Writing approach: ${currentDetailLevel.description}
- Business plan focus: ${businessPlanContext[currentBusinessPlanType as keyof typeof businessPlanContext]}

**RESEARCH FOCUS REQUIREMENTS:**
${selectedResearchFocus.includes('Industry growth statistics') ? '- Include specific industry growth rates and market size data' : ''}
${selectedResearchFocus.includes('Local market trends (Austin area)') ? '- Focus on Ottawa/local market specific information' : ''}
${selectedResearchFocus.includes('Competitor landscape') ? '- Include competitor examples and market positioning' : ''}
${selectedResearchFocus.includes('Customer behavior patterns') ? '- Provide detailed customer segment analysis' : ''}

**ADVANCED CUSTOMIZATION:**
${selectedContentStructure.length > 0 ? `- Content Structure: ${selectedContentStructure.join(', ')}` : ''}
${additionalContext ? `- Additional Context: ${additionalContext}` : ''}
${selectedOutputFormat ? `- Output Format: ${selectedOutputFormat}` : ''}
${selectedGenerationOptions.length > 0 ? `- Special Options: ${selectedGenerationOptions.join(', ')}` : ''}

**OUTPUT RULES:**  
1. **Title:** Echo the subsection title exactly.  
2. **Intro (1 sentence):** State purpose clearly.  
3. **Body (${selectedDetail === 'Brief' ? '1-2' : selectedDetail === 'Comprehensive' ? '4-5' : '2-3'} paragraphs based on detail level):**  
   - Use only realistic data or clearly labeled estimates.  
   - Cite sources when possible, e.g. "[Source: Statistics Canada 2024]".  
   - Apply the selected tone and detail level consistently.
4. **Key Bullet Takeaways (3-5 bullets):** Summarize core points.  
5. **Data Sources:** List any data sources or assumptions made.

**CRITICAL RULES:**  
- Apply ALL customization options selected by the user
- Match the exact tone and detail level requested: ${selectedTone} tone, ${selectedDetail} detail
- Focus heavily on the selected research areas: ${selectedResearchFocus.join(', ')}
- Use Ottawa/local context when local trends are selected
- Do **not** invent specific statistics. Use realistic ranges and cite general sources.
- Word limit: ${selectedDetail === 'Brief' ? '≤ 250 words' : selectedDetail === 'Comprehensive' ? '≤ 800 words' : '≤ 500 words'}
- Keep output professional but match the requested tone exactly.`;

      // Use AI Router for content generation with optional model override
      const response = await routeAIRequest({
        task: 'content-generation',
        prompt: aiPrompt,
        userTier,
        ...(selectedAIModel && { modelOverride: selectedAIModel })
      });
      
      setContent(response);
    } catch (error) {
      console.error('AI Generation Error:', error);
      setContent('Sorry, there was an error generating content. Please try again.');
    }
    
    setIsGenerating(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'skipped':
        return <SkipForward className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getWritingGuide = (subsectionId: string) => {
    const guides: Record<string, JSX.Element> = {
      "1.1": (
        <ul className="space-y-2">
          <li>• Business mission and vision statement</li>
          <li>• Core value proposition (what makes you unique)</li>
          <li>• Target customer segments</li>
          <li>• Key success factors</li>
          <li>• Legal structure and ownership</li>
        </ul>
      ),
      "1.3": (
        <ul className="space-y-2">
          <li>• Unique selling propositions (USPs)</li>
          <li>• Barriers to entry you've created</li>
          <li>• Proprietary technology or processes</li>
          <li>• First-mover advantages</li>
          <li>• Strategic partnerships</li>
        </ul>
      ),
      "3.3": (
        <ul className="space-y-2">
          <li>• Industry growth rate (last 3-5 years)</li>
          <li>• Emerging trends affecting your business</li>
          <li>• Technology adoption rates</li>
          <li>• Consumer behavior changes</li>
          <li>• Economic factors and forecasts</li>
          <li>• Post-pandemic market shifts</li>
        </ul>
      ),
      "2.2": (
        <ul className="space-y-2">
          <li>• Detailed product/service descriptions</li>
          <li>• Features and benefits breakdown</li>
          <li>• Pricing structure and tiers</li>
          <li>• Quality standards and certifications</li>
          <li>• Customer support and warranties</li>
        </ul>
      ),
      "6.1": (
        <ul className="space-y-2">
          <li>• Brand positioning and messaging</li>
          <li>• Target audience segmentation</li>
          <li>• Marketing channels and tactics</li>
          <li>• Budget allocation by channel</li>
          <li>• Content marketing strategy</li>
          <li>• Social media and digital presence</li>
        </ul>
      ),
      "8.1": (
        <ul className="space-y-2">
          <li>• Monthly revenue forecasts (3-5 years)</li>
          <li>• Revenue streams breakdown</li>
          <li>• Growth assumptions and drivers</li>
          <li>• Seasonal variations</li>
          <li>• Market penetration rates</li>
          <li>• Pricing strategy impact</li>
        </ul>
      )
    };

    return guides[subsectionId] || (
      <ul className="space-y-2">
        <li>• Provide comprehensive analysis with data</li>
        <li>• Include relevant industry research</li>
        <li>• Support claims with credible sources</li>
        <li>• Use specific examples and case studies</li>
        <li>• Maintain professional, clear writing</li>
      </ul>
    );
  };

  const getWordTarget = (subsectionId?: string) => {
    const targets: Record<string, string> = {
      "1.1": "400-600",
      "1.2": "300-500",
      "1.3": "350-550",
      "2.1": "500-700",
      "2.2": "600-800",
      "3.1": "400-600",
      "3.3": "500-750",
      "6.1": "600-900",
      "8.1": "700-1000"
    };
    
    return targets[subsectionId || ""] || "300-500";
  };


  if (aiContent) {
    return (
      <div className="max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ✅ AI Generated Content - {sectionTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 max-h-96 overflow-y-auto border">
                  <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed text-foreground">
                    {aiContent}
                  </pre>
                </div>

                <div className="flex gap-4">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                    ✅ Accept Content
                  </Button>
                  <Button variant="outline" size="lg">
                    ✏️ Edit Before Accepting
                  </Button>
                  <Button variant="outline" size="lg">
                    🔄 Regenerate
                  </Button>
                </div>
              </CardContent>
            </Card>
        </div>
    );
  }

  if (!generationMode) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Mode Selection Modal */}
        {showModeSelection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Dark Overlay */}
              <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setShowModeSelection(false)}
              />
              
              {/* Modal Content */}
              <div className="relative w-[70%] max-w-4xl bg-card rounded-lg border shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h1 className="text-2xl font-bold text-card-foreground">
                    🎯 How would you like to complete this subsection?
                  </h1>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowModeSelection(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Manual Input */}
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50 bg-background border-border"
                      onClick={() => {
                        setGenerationMode('manual');
                        setShowModeSelection(false);
                        if (currentSub) {
                          setCurrentSubsection(currentSub.id);
                        }
                      }}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Edit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2 text-foreground">📝 MANUAL + AI ENHANCEMENT</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Write your content, then AI suggests improvements
                        </p>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div>⏱️ 15-25 min</div>
                          <div>🎯 Your authentic voice + AI polish</div>
                          <div>🤖 Powered by {getAIModelInfo('coaching', userTier).name}</div>
                        </div>
                        <Button className="w-full mt-4">Start Writing</Button>
                      </CardContent>
                    </Card>

                    {/* AI Research Mode */}
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50 bg-background border-border"
                      onClick={() => {
                        setGenerationMode('ai');
                        setShowModeSelection(false);
                        if (currentSub) {
                          setCurrentSubsection(currentSub.id);
                        }
                      }}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2 text-foreground">🤖 AI RESEARCH + USER DIRECTION</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          AI gathers data, you write with research foundation
                        </p>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div>⏱️ 8-12 min</div>
                          <div>🎯 AI research + your insights</div>
                          <div>🤖 Powered by {getAIModelInfo('content-generation', userTier).name}</div>
                        </div>
                        <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white">Start Research</Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      💡 Recommended: Try Manual + AI Enhancement for authentic, polished content
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="max-w-6xl mx-auto">
            {/* Header */}
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
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    {section.icon} Section {sectionId}: {section.title}
                  </h1>
                  <p className="text-muted-foreground mt-1">{section.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={saveContent}
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Progress
                </Button>
                {currentSub && (
                  <Button 
                    onClick={completeCurrentSubsection}
                    size="sm" 
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete & Next
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-foreground">
                  {dynamicProgress}% Complete ({completedCount}/{totalCount} subsections)
                </span>
                <span className="text-sm text-muted-foreground">
                  Estimated time remaining: {section.estimatedTime}
                </span>
              </div>
              <Progress value={dynamicProgress} className="h-3" />
            </div>

            {/* Section Roadmap */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 SECTION ROADMAP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.subsections.map((subsection, index) => {
                  const isUnlocked = index === 0 || section.subsections[index - 1].status === 'completed' || section.subsections[index - 1].status === 'skipped';
                  const isLocked = !isUnlocked && subsection.status === 'pending';
                  const isCurrent = subsection.status === 'in_progress';
                  
                  return (
                    <div
                      key={subsection.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        isLocked 
                          ? 'opacity-60 bg-muted/30' 
                          : isCurrent
                          ? 'bg-card border-blue-500/50'
                          : 'hover:shadow-sm cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!isLocked && (isCurrent || subsection.status === 'completed' || subsection.status === 'skipped')) {
                          setCurrentSubsection(subsection.id);
                          setContent(subsectionContents[subsection.id] || "");
                          setGenerationMode(null);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(subsection.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {subsection.id} {subsection.title}
                            </span>
                            {subsection.status === 'in_progress' && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                Current
                              </Badge>
                            )}
                            {subsection.status === 'completed' && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                ✓ Complete
                              </Badge>
                            )}
                            {subsection.status === 'skipped' && (
                              <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                                ⏭ Skipped
                              </Badge>
                            )}
                            {isLocked && (
                              <Badge variant="outline" className="text-xs">
                                🔒 Locked
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isLocked 
                              ? "Complete previous subsection to unlock"
                              : subsection.description
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {currentSub && (
                  <div className="pt-4 border-t">
                    <Button 
                      size="lg"
                      onClick={() => setShowModeSelection(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      🟣 Continue Current Subsection
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Assistance Options */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 AI ASSISTANCE OPTIONS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => handleQuickGenerateAll()}
                  >
                    <Zap className="w-4 h-4" />
                    Quick Generate All
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => handleCustomResearch()}
                  >
                    <Target className="w-4 h-4" />
                    Custom Research
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    );
  }

  // AI Generation Mode
  if (generationMode === 'ai') {
    return (
      <div className="max-w-6xl mx-auto">
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
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              🤖 AI Content Generation: {currentSub?.title}
            </h1>
          </div>
        </div>

            {!isGenerating && !content && (
              <div className="border border-border rounded-xl p-8 bg-card">
                {/* Business Plan Type Selection */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    🎯 What type of business plan do you need?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        type: 'investors',
                        icon: '💰',
                        title: 'For Investors',
                        description: 'Focus on growth, market size, and funding needs',
                        features: ['Market data', 'Growth metrics', 'Competitive analysis'],
                        buttonText: '📊 Select',
                        color: 'bg-blue-600 hover:bg-blue-700 border-blue-500 text-white'
                      },
                      {
                        type: 'operations',
                        icon: '🏪',
                        title: 'For Operations',
                        description: 'Focus on daily operations and management',
                        features: ['Process details', 'Team structure', 'Practical goals'],
                        buttonText: '📋 Select',
                        color: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white'
                      },
                      {
                        type: 'loan',
                        icon: '🏦',
                        title: 'For Bank Loan',
                        description: 'Focus on financial stability and loan repayment ability',
                        features: ['Conservative projections', 'Risk mitigation', 'Cash flow focus'],
                        buttonText: '💼 Select',
                        color: 'bg-purple-600 hover:bg-purple-700 border-purple-500 text-white'
                      }
                    ].map((planType) => {
                      const isSelected = selectedBusinessPlanType === planType.type;
                      return (
                      <div 
                        key={planType.type} 
                        className="cursor-pointer"
                        onClick={() => setSelectedBusinessPlanType(planType.type as 'investors' | 'operations' | 'loan')}
                      >
                        <Card className={`cursor-pointer transition-all border-2 hover:scale-105 ${
                          isSelected 
                            ? `${planType.color} ring-4 ring-yellow-400 ring-opacity-75 shadow-lg scale-105` 
                            : `${planType.color.replace('bg-', 'bg-opacity-80 bg-').replace('hover:bg-', 'hover:bg-opacity-90 hover:bg-')} opacity-80 hover:opacity-100`
                        }`}>
                          <CardContent className="p-6">
                            <div className="text-center mb-4">
                              <div className="text-3xl mb-2">{planType.icon}</div>
                              <h3 className="font-semibold text-lg text-white">{planType.title}</h3>
                            </div>
                            <p className="text-sm text-white/90 mb-4 text-center">
                              {planType.description}
                            </p>
                            <div className="space-y-2 mb-6">
                              {planType.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-white/90">
                                  <span className="text-green-300">✅</span>
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                            <div className={`w-full text-center font-medium ${
                              isSelected ? 'text-yellow-200 font-bold' : 'text-white/80'
                            }`}>
                              {isSelected ? '✅ SELECTED' : planType.buttonText}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detail Level Selection */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    🎨 How detailed should it be?
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        level: 'quick',
                        title: 'Quick Overview',
                        description: '200-300 words, 30 seconds',
                        subtitle: 'Perfect for initial drafts and getting started',
                        checked: false
                      },
                      {
                        level: 'comprehensive',
                        title: 'Comprehensive',
                        description: '400-600 words, 45 seconds',
                        subtitle: 'Professional quality with key details and data ← Recommended',
                        checked: true
                      },
                      {
                        level: 'indepth',
                        title: 'In-Depth Analysis',
                        description: '800+ words, 90 seconds',
                        subtitle: 'Extensive research with industry benchmarks',
                        checked: false
                      }
                    ].map((option) => (
                      <label key={option.level} className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input 
                          type="radio" 
                          name="detailLevel" 
                          value={option.level}
                          defaultChecked={option.checked}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium">
                            ○ {option.title} <span className="text-muted-foreground">({option.description})</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{option.subtitle}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* AI Features */}
                <div className="mb-8 p-6 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    💡 AI will automatically include:
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>• Local Austin market data and trends</div>
                    <div>• Tech support industry insights</div>
                    <div>• Competitive landscape analysis</div>
                    <div>• Financial projections template</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button 
                    size="lg"
                    onClick={handleAIGeneration}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  >
                    🟣 Generate My {currentSub?.title}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="flex items-center gap-2"
                  >
                    ⚙️ Advanced Customization
                  </Button>
                </div>
              </div>
            )}

            {/* Advanced Options Panel */}
            {!isGenerating && !content && showAdvancedOptions && (
              <div className="mt-6 border border-border rounded-xl p-8 bg-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    ⚙️ Customize Your Content
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAdvancedOptions(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ❌ Close
                  </Button>
                </div>

                <div className="border-t border-border mb-8"></div>

                <div className="space-y-8">
                  {/* Content Enhancements */}
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      📊 Content Enhancements
                    </h3>
                    <div className="space-y-4">
                      {[
                        { 
                          id: "charts-data", 
                          label: "Include charts and data visualizations", 
                          description: "Make your plan more professional and investor-ready",
                          defaultChecked: true
                        },
                        { 
                          id: "market-data", 
                          label: "Add real market data and industry benchmarks", 
                          description: "Strengthen credibility with actual market research",
                          defaultChecked: true
                        },
                        { 
                          id: "case-studies", 
                          label: "Include relevant case studies and examples", 
                          description: "Learn from similar successful businesses",
                          defaultChecked: false
                        },
                        { 
                          id: "multiple-versions", 
                          label: "Generate multiple versions to compare", 
                          description: "Get 3 different approaches and pick your favorite",
                          defaultChecked: false
                        }
                      ].map(option => (
                        <label key={option.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50">
                          <input 
                            type="checkbox" 
                            name="contentEnhancements" 
                            value={option.label}
                            defaultChecked={option.defaultChecked}
                            className="w-5 h-5 mt-0.5 rounded"
                          />
                          <div>
                            <div className="font-medium text-foreground">{option.defaultChecked ? '☑️' : '☐'} {option.label}</div>
                            <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Focus Areas */}
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      🎯 Focus Areas
                    </h3>
                    <div className="space-y-4">
                      {[
                        { 
                          id: "competitive-advantages", 
                          label: "Emphasize competitive advantages", 
                          description: "Highlight what makes your business unique",
                          defaultChecked: true
                        },
                        { 
                          id: "investor-presentation", 
                          label: "Optimize for investor presentation", 
                          description: "Focus on growth potential and funding needs",
                          defaultChecked: false
                        },
                        { 
                          id: "financial-assumptions", 
                          label: "Include detailed financial assumptions", 
                          description: "Show the math behind your projections",
                          defaultChecked: false
                        }
                      ].map(option => (
                        <label key={option.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50">
                          <input 
                            type="checkbox" 
                            name="focusAreas" 
                            value={option.label}
                            defaultChecked={option.defaultChecked}
                            className="w-5 h-5 mt-0.5 rounded"
                          />
                          <div>
                            <div className="font-medium text-foreground">{option.defaultChecked ? '☑️' : '☐'} {option.label}</div>
                            <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Context */}
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      📝 Additional Context (Optional)
                    </h3>
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="text-sm text-muted-foreground mb-3">
                        Tell the AI anything specific about your business:
                      </div>
                      <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                        <li>• Special requirements or constraints</li>
                        <li>• Unique aspects of your market</li>
                        <li>• Specific goals for this section</li>
                      </ul>
                      <div className="text-sm text-muted-foreground mb-3 italic">
                        Example: "Focus on remote work trends since we're targeting remote workers who need reliable tech support at home"
                      </div>
                      <textarea 
                        name="additionalContext"
                        placeholder="Enter your specific context here..."
                        className="w-full p-3 border border-input rounded-md bg-background text-foreground min-h-[100px] resize-none"
                      />
                    </div>
                  </div>

                  {/* Pro Tip and Action Buttons */}
                  <div className="pt-6 border-t border-border">
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        💡 <strong>Pro Tip:</strong> The defaults work great! Only change these if you have specific needs or preferences.
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        size="lg"
                        onClick={handleAIGeneration}
                        className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                      >
                        🟣 Generate Content
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => setShowAdvancedOptions(false)}
                        className="flex items-center gap-2"
                      >
                        📋 Use Simple Options
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="lg"
                        onClick={() => setShowAdvancedOptions(false)}
                        className="flex items-center gap-2"
                      >
                        ❌ Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isGenerating && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="text-lg font-semibold">Generating your content...</span>
                  </div>
                  <Progress value={33} className="mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Researching market trends and analyzing industry data...
                  </p>
                </CardContent>
              </Card>
            )}

            {content && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      ✅ AI Generated Content - {currentSub?.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">QUALITY:</span>
                      <div className="flex">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">9/10</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-6 max-h-96 overflow-y-auto border">
                    <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed text-foreground">
                      {content}
                    </pre>
                  </div>

                  <div className="flex gap-4">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                      ✅ Accept Content
                    </Button>
                    <Button variant="outline" size="lg">
                      ✏️ Edit Before Accepting
                    </Button>
                    <Button variant="outline" size="lg">
                      🔄 Regenerate
                    </Button>
                  </div>

                  {(() => {
                    const qualityAnalysis = analyzeContentQuality(content);
                    return (
                      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                        <CardHeader>
                          <CardTitle className="text-lg text-foreground">📊 QUALITY BREAKDOWN</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <qualityAnalysis.dataAccuracy.icon className={`w-4 h-4 ${
                                qualityAnalysis.dataAccuracy.score === 'Excellent' ? 'text-green-500' :
                                qualityAnalysis.dataAccuracy.score === 'Good' ? 'text-blue-500' :
                                qualityAnalysis.dataAccuracy.score === 'Basic' ? 'text-yellow-500' : 'text-gray-400'
                              }`} />
                              <span className="text-foreground">Data accuracy: {qualityAnalysis.dataAccuracy.score}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <qualityAnalysis.industryRelevance.icon className={`w-4 h-4 ${
                                qualityAnalysis.industryRelevance.score === 'High' ? 'text-green-500' :
                                qualityAnalysis.industryRelevance.score === 'Medium' ? 'text-blue-500' :
                                qualityAnalysis.industryRelevance.score === 'Low' ? 'text-yellow-500' : 'text-gray-400'
                              }`} />
                              <span className="text-foreground">Industry relevance: {qualityAnalysis.industryRelevance.score}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <qualityAnalysis.localSpecificity.icon className={`w-4 h-4 ${
                                qualityAnalysis.localSpecificity.score === 'High' ? 'text-green-500' :
                                qualityAnalysis.localSpecificity.score === 'Good' ? 'text-blue-500' :
                                qualityAnalysis.localSpecificity.score === 'Basic' ? 'text-yellow-500' : 'text-gray-400'
                              }`} />
                              <span className="text-foreground">Local specificity: {qualityAnalysis.localSpecificity.score}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <qualityAnalysis.writingQuality.icon className={`w-4 h-4 ${
                                qualityAnalysis.writingQuality.score === 'Excellent' ? 'text-green-500' :
                                qualityAnalysis.writingQuality.score === 'Good' ? 'text-blue-500' :
                                qualityAnalysis.writingQuality.score === 'Fair' ? 'text-yellow-500' : 'text-gray-400'
                              }`} />
                              <span className="text-foreground">Writing quality: {qualityAnalysis.writingQuality.score}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <qualityAnalysis.length.icon className={`w-4 h-4 ${
                                qualityAnalysis.length.score === 'Perfect' ? 'text-green-500' :
                                qualityAnalysis.length.score === 'Good' ? 'text-blue-500' :
                                qualityAnalysis.length.score === 'Too short' ? 'text-yellow-500' : 'text-gray-400'
                              }`} />
                              <span className="text-foreground">Length: {qualityAnalysis.length.score} ({qualityAnalysis.length.words} words)</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
        </div>
    );
  }

  // Manual Mode
  if (generationMode === 'manual') {
    return (
      <div className="max-w-6xl mx-auto">
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
                  Back to Mode Selection
                </Button>
                <h1 className="text-2xl font-bold text-foreground">
                  📝 Manual Input: {currentSub?.title}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Writing Guide */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      💡 WRITING GUIDE
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentSub && (
                      <div>
                        <h4 className="font-semibold mb-3">Writing Guide for {currentSub.title}:</h4>
                        <div className="space-y-3 text-sm text-muted-foreground">
                          {getWritingGuide(currentSub.id)}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm">
                        📊 <strong>Target:</strong> {getWordTarget(currentSub?.id)} words with specific data
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content Area */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>✏️ YOUR CONTENT</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      onInit={(evt, editor) => editorRef.current = editor}
                      initialValue={content}
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

                {/* AI Coach */}
                <Card className="bg-card border-blue-500/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      🤖 REAL-TIME AI COACHING
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-400">
                        💡 Looking good! Consider adding:
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Specific local market data for Austin</li>
                        <li>• Post-pandemic recovery statistics</li>
                        <li>• Generational coffee consumption differences</li>
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>📊 Word count: {content.trim().split(/\s+/).filter(word => word.length > 0).length} words</div>
                      <div>🎯 Quality score: 7/10 - Add more specific data</div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResearchHelp()}
                      >
                        🔍 Research Help
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAICoaching()}
                      >
                        💡 More Suggestions
                      </Button>
                      <Button variant="outline" size="sm">📊 Data</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={skipCurrentSubsection}
                    className="flex items-center gap-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip This Section
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={saveContent}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Progress
                    </Button>
                    <Button 
                      onClick={completeCurrentSubsection}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete & Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
        </div>
    );
  }

  // Skipped Subsection Reminder Modal
  if (showSkippedReminder) {
    return (
      <div className="max-w-4xl mx-auto">
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  Section Complete - Review Skipped Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-foreground">
                  Great job completing Section {sectionId}: {section.title}! 
                </p>
                <p className="text-muted-foreground">
                  However, you skipped {skippedSubsections.length} subsection(s). 
                  Going back to complete them will improve your business plan quality.
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Skipped Subsections:</h4>
                  {skippedSubsections.map(subId => {
                    const sub = section.subsections.find(s => s.id === subId);
                    return sub ? (
                      <div key={subId} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                        <SkipForward className="w-4 h-4 text-yellow-500" />
                        <div>
                          <span className="font-medium text-foreground">{sub.id} {sub.title}</span>
                          <p className="text-sm text-muted-foreground">{sub.description}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => {
                      setShowSkippedReminder(false);
                      onBack();
                    }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Continue to Next Section
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Go back to first skipped subsection
                      const firstSkipped = skippedSubsections[0];
                      setCurrentSubsection(firstSkipped);
                      setContent(subsectionContents[firstSkipped] || "");
                      setShowSkippedReminder(false);
                      // Mark as in_progress again
                      setLocalSectionData(prev => ({
                        ...prev,
                        [sectionId]: {
                          ...prev[sectionId as keyof typeof prev],
                          subsections: prev[sectionId as keyof typeof prev].subsections.map(sub => 
                            sub.id === firstSkipped 
                              ? { ...sub, status: 'in_progress' as const }
                              : sub
                          )
                        }
                      }));
                    }}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back and Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
        </div>
    );
  }

  return null;
}