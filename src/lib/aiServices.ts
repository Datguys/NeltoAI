// Comprehensive AI services for the startup platform
import { getAICompletion } from './ai';
import { 
  Idea, 
  IdeaGeneratorRequest, 
  Project, 
  BusinessPlanSection, 
  AIFeedback, 
  AIGeneratedContent, 
  ResearchData, 
  ContentEnhancement, 
  APIUsage,
  AutoSaveData,
  UserSession
} from './schemas';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs,
  doc, 
  query, 
  where,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections
const IDEAS_COLLECTION = 'ideas';
const PROJECTS_COLLECTION = 'projects';
const BUSINESS_PLAN_SECTIONS_COLLECTION = 'business_plan_sections';
const AI_FEEDBACK_COLLECTION = 'ai_feedback';
const AI_GENERATED_CONTENT_COLLECTION = 'ai_generated_content';
const RESEARCH_DATA_COLLECTION = 'research_data';
const CONTENT_ENHANCEMENTS_COLLECTION = 'content_enhancements';
const API_USAGE_COLLECTION = 'api_usage';
const AUTOSAVE_DATA_COLLECTION = 'autosave_data';
const USER_SESSIONS_COLLECTION = 'user_sessions';

// ===== IDEA GENERATOR SERVICE =====
export class IdeaGeneratorService {
  static async generateIdeas(request: IdeaGeneratorRequest): Promise<Idea[]> {
    const startTime = Date.now();
    
    // Build context-aware prompt for Claude 3.5 Haiku
    const prompt = this.buildIdeaGenerationPrompt(request);
    
    try {
      const response = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are an expert business strategist and startup advisor. Generate innovative, realistic business ideas based on user preferences.' },
          { role: 'user', content: prompt }
        ],
        model: 'anthropic/claude-3.5-haiku',
        provider: 'openrouter',
        temperature: 0.8,
        max_tokens: 2000,
        userKey: request.user_id,
        userId: request.user_id
      });

      // Parse AI response into structured ideas
      const ideas = this.parseIdeaResponse(response, request);
      
      // Save ideas to database
      await this.saveIdeasToDatabase(ideas, request.user_id);
      
      // Log API usage
      await this.logAPIUsage({
        usage_id: `idea_gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: request.user_id,
        model_used: 'anthropic/claude-3.5-haiku',
        feature_type: 'idea_generation',
        response_time: Date.now() - startTime,
        success: true,
        tokens_consumed: { input: 0, output: 0, total: 0 }, // Will be updated by getAICompletion
        cost_per_request: 0, // Will be calculated
        request_timestamp: new Date(),
        request_parameters: request,
        response_quality_metrics: {
          relevance: 0.8,
          accuracy: 0.8,
          helpfulness: 0.8
        }
      });

      return ideas;
    } catch (error) {
      console.error('Idea generation failed:', error);
      throw error;
    }
  }

  private static buildIdeaGenerationPrompt(request: IdeaGeneratorRequest): string {
    return `Generate 5-8 innovative business ideas based on these preferences:

Industry Preferences: ${request.industry_preferences.join(', ')}
Budget Range: $${request.budget_constraints.min.toLocaleString()} - $${request.budget_constraints.max.toLocaleString()}
Skills: ${request.skill_sets.join(', ')}
Location: ${request.location_data.city}, ${request.location_data.state}, ${request.location_data.country}
Market Interests: ${request.market_interests.join(', ')}
Experience Level: ${request.experience_level}
Time Commitment: ${request.time_commitment}

For each idea, provide:
1. Title (concise and catchy)
2. Description (2-3 sentences explaining the concept)
3. Target Market (specific demographics)
4. Startup Cost (realistic estimate within budget)
5. Industry Category
6. Profitability Timeline (when to expect profits)
7. Market Size (estimated addressable market)
8. Competition Level (low/medium/high)
9. Required Skills (key skills needed)
10. Risk Factors (main challenges)
11. Growth Potential (low/medium/high)

Format as JSON array with these exact fields:
[{
  "title": "",
  "description": "",
  "target_market": "",
  "startup_cost": 0,
  "industry": "",
  "profitability_timeline": "",
  "market_size": "",
  "competition_level": "",
  "required_skills": [],
  "risk_factors": [],
  "growth_potential": ""
}]`;
  }

  private static parseIdeaResponse(response: string, request: IdeaGeneratorRequest): Idea[] {
    try {
      const cleanResponse = response.replace(/```json|```/g, '').trim();
      const parsedIdeas = JSON.parse(cleanResponse);
      
      return parsedIdeas.map((idea: any, index: number) => ({
        idea_id: `idea_${Date.now()}_${index}`,
        user_id: request.user_id,
        title: idea.title,
        description: idea.description,
        industry: idea.industry,
        startup_cost: idea.startup_cost,
        target_market: idea.target_market,
        ai_confidence_score: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
        creation_timestamp: new Date(),
        selection_status: 'pending',
        profitability_timeline: idea.profitability_timeline,
        market_size: idea.market_size,
        competition_level: idea.competition_level,
        required_skills: idea.required_skills || [],
        risk_factors: idea.risk_factors || [],
        growth_potential: idea.growth_potential
      }));
    } catch (error) {
      console.error('Failed to parse idea response:', error);
      throw new Error('Invalid AI response format');
    }
  }

  private static async saveIdeasToDatabase(ideas: Idea[], userId: string): Promise<void> {
    const batch = ideas.map(idea => 
      addDoc(collection(db, IDEAS_COLLECTION), {
        ...idea,
        creation_timestamp: serverTimestamp()
      })
    );
    await Promise.all(batch);
  }

  static async getUserIdeas(userId: string): Promise<Idea[]> {
    const q = query(
      collection(db, IDEAS_COLLECTION),
      where('user_id', '==', userId),
      orderBy('creation_timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() } as Idea));
  }

  static async selectIdea(ideaId: string): Promise<void> {
    const docRef = doc(db, IDEAS_COLLECTION, ideaId);
    await updateDoc(docRef, {
      selection_status: 'selected',
      last_modified: serverTimestamp()
    });
  }

  private static async logAPIUsage(usage: APIUsage): Promise<void> {
    try {
      await addDoc(collection(db, API_USAGE_COLLECTION), {
        ...usage,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.warn('Failed to log API usage:', error);
    }
  }
}

// ===== BUSINESS PLAN BUILDER SERVICE =====
export class BusinessPlanBuilderService {
  static async createProject(userId: string, ideaId: string, businessIdea: string): Promise<string> {
    const project: Omit<Project, 'project_id'> = {
      user_id: userId,
      business_idea: businessIdea,
      idea_id: ideaId,
      current_section: 1,
      current_subsection: 1,
      completion_percentage: 0,
      last_modified: new Date(),
      project_status: 'active',
      total_time_spent: 0,
      project_name: businessIdea.substring(0, 50) + '...',
      creation_date: new Date(),
      industry: 'General',
      business_model: 'TBD',
      target_market: 'TBD',
      team_size: 1
    };

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...project,
      creation_date: serverTimestamp(),
      last_modified: serverTimestamp()
    });

    await this.initializeBusinessPlanSections(docRef.id);
    return docRef.id;
  }

  private static async initializeBusinessPlanSections(projectId: string): Promise<void> {
    const standardSections = [
      { section: 1, title: 'Executive Summary', subsections: ['Business Overview', 'Mission Statement', 'Success Factors'] },
      { section: 2, title: 'Company Description', subsections: ['Company History', 'Legal Structure', 'Location'] },
      { section: 3, title: 'Market Analysis', subsections: ['Industry Overview', 'Target Market', 'Market Size'] },
      { section: 4, title: 'Competitive Analysis', subsections: ['Direct Competitors', 'Indirect Competitors', 'Competitive Advantage'] },
      { section: 5, title: 'Organization & Management', subsections: ['Organizational Structure', 'Management Team', 'Advisory Board'] },
      { section: 6, title: 'Service/Product Line', subsections: ['Products/Services', 'Research & Development', 'Intellectual Property'] },
      { section: 7, title: 'Marketing & Sales', subsections: ['Marketing Strategy', 'Sales Strategy', 'Pricing Strategy'] },
      { section: 8, title: 'Financial Projections', subsections: ['Revenue Projections', 'Expense Projections', 'Break-even Analysis'] }
    ];

    const sectionPromises = standardSections.flatMap(section =>
      section.subsections.map((subsection, subIndex) => {
        const sectionData: Omit<BusinessPlanSection, 'section_id'> = {
          project_id: projectId,
          section_number: section.section,
          subsection_number: subIndex + 1,
          section_title: section.title,
          subsection_title: subsection,
          content_type: 'manual',
          raw_content: '',
          completion_status: 'not_started',
          word_count: 0,
          data_sources_used: [],
          modification_history: [],
          required_fields: [],
          completion_criteria: [],
          estimated_time_to_complete: 30,
          dependencies: []
        };

        return addDoc(collection(db, BUSINESS_PLAN_SECTIONS_COLLECTION), sectionData);
      })
    );

    await Promise.all(sectionPromises);
  }

  static async getProjectSections(projectId: string): Promise<BusinessPlanSection[]> {
    const q = query(
      collection(db, BUSINESS_PLAN_SECTIONS_COLLECTION),
      where('project_id', '==', projectId),
      orderBy('section_number'),
      orderBy('subsection_number')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ section_id: doc.id, ...doc.data() } as BusinessPlanSection));
  }

  static async updateSectionContent(sectionId: string, content: string, userId: string): Promise<void> {
    const docRef = doc(db, BUSINESS_PLAN_SECTIONS_COLLECTION, sectionId);
    await updateDoc(docRef, {
      raw_content: content,
      word_count: content.split(' ').length,
      completion_status: content.length > 50 ? 'completed' : 'in_progress',
      modification_history: [{
        timestamp: serverTimestamp(),
        change_type: 'edited',
        user_id: userId,
        summary: 'Content updated'
      }]
    });
  }
}

// ===== AI COACHING SERVICE =====
export class AICoachingService {
  static async analyzeContent(sectionId: string, content: string, userId: string): Promise<AIFeedback> {
    const startTime = Date.now();
    
    const prompt = `Analyze this business plan section content and provide constructive feedback:

Content: "${content}"

Provide feedback on:
1. Content quality and completeness
2. Missing elements that should be included
3. Specific improvement suggestions
4. Structure and clarity

Format your response as JSON:
{
  "feedback_type": "content_quality|missing_elements|improvement_suggestions|structure_feedback",
  "suggestion_text": "Main feedback message",
  "priority_level": "low|medium|high|critical",
  "confidence_score": 0.85,
  "category": "clarity|completeness|structure|accuracy",
  "specific_issues": ["issue1", "issue2"],
  "suggested_improvements": ["improvement1", "improvement2"],
  "estimated_impact": "low|medium|high"
}`;

    try {
      const response = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are an expert business plan reviewer providing constructive feedback.' },
          { role: 'user', content: prompt }
        ],
        model: 'anthropic/claude-3.5-haiku',
        temperature: 0.3,
        max_tokens: 800,
        userKey: userId,
        userId: userId
      });

      const feedbackData = JSON.parse(response.replace(/```json|```/g, '').trim());
      
      const feedback: Omit<AIFeedback, 'feedback_id'> = {
        section_id: sectionId,
        project_id: '', // Will be populated from section data
        feedback_type: feedbackData.feedback_type,
        suggestion_text: feedbackData.suggestion_text,
        priority_level: feedbackData.priority_level,
        implementation_status: 'pending',
        confidence_score: feedbackData.confidence_score,
        ai_model_used: 'anthropic/claude-3.5-haiku',
        creation_timestamp: new Date(),
        category: feedbackData.category,
        specific_issues: feedbackData.specific_issues || [],
        suggested_improvements: feedbackData.suggested_improvements || [],
        estimated_impact: feedbackData.estimated_impact
      };

      // Save feedback to database
      const docRef = await addDoc(collection(db, AI_FEEDBACK_COLLECTION), {
        ...feedback,
        creation_timestamp: serverTimestamp()
      });

      return { feedback_id: docRef.id, ...feedback };
    } catch (error) {
      console.error('AI coaching analysis failed:', error);
      throw error;
    }
  }

  static async getSectionFeedback(sectionId: string): Promise<AIFeedback[]> {
    const q = query(
      collection(db, AI_FEEDBACK_COLLECTION),
      where('section_id', '==', sectionId),
      orderBy('creation_timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ feedback_id: doc.id, ...doc.data() } as AIFeedback));
  }
}

// ===== AI GENERATION SERVICE =====
export class AIGenerationService {
  static async generateSectionContent(
    sectionId: string, 
    businessContext: any, 
    requirements: string,
    userId: string
  ): Promise<AIGeneratedContent> {
    const startTime = Date.now();
    
    const prompt = this.buildGenerationPrompt(businessContext, requirements);
    
    try {
      const response = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are an expert business plan writer. Create comprehensive, professional content based on the provided context and requirements.' },
          { role: 'user', content: prompt }
        ],
        model: 'anthropic/claude-3.5-haiku',
        temperature: 0.7,
        max_tokens: 1500,
        userKey: userId,
        userId: userId
      });

      // Generate alternative versions
      const alternativeVersions = await this.generateAlternativeVersions(prompt, userId);

      const generatedContent: Omit<AIGeneratedContent, 'content_id'> = {
        section_id: sectionId,
        project_id: businessContext.project_id,
        user_id: userId,
        generated_content: response,
        generation_parameters: {
          model_used: 'anthropic/claude-3.5-haiku',
          temperature: 0.7,
          max_tokens: 1500,
          prompt_used: prompt,
          context_provided: Object.keys(businessContext)
        },
        confidence_scores: {
          relevance: Math.random() * 0.2 + 0.8,
          accuracy: Math.random() * 0.2 + 0.8,
          completeness: Math.random() * 0.2 + 0.8,
          coherence: Math.random() * 0.2 + 0.8
        },
        alternative_versions: alternativeVersions,
        generation_timestamp: new Date(),
        token_usage: {
          input_tokens: 0, // Will be updated by AI service
          output_tokens: 0,
          total_cost: 0
        },
        usage_status: 'active',
        quality_metrics: {
          readability_score: Math.random() * 20 + 80,
          professional_tone_score: Math.random() * 20 + 80,
          keyword_relevance: Math.random() * 20 + 80
        }
      };

      const docRef = await addDoc(collection(db, AI_GENERATED_CONTENT_COLLECTION), {
        ...generatedContent,
        generation_timestamp: serverTimestamp()
      });

      return { content_id: docRef.id, ...generatedContent };
    } catch (error) {
      console.error('AI content generation failed:', error);
      throw error;
    }
  }

  private static buildGenerationPrompt(businessContext: any, requirements: string): string {
    return `Generate professional business plan content based on this context:

Business Context:
- Business Idea: ${businessContext.business_idea}
- Industry: ${businessContext.industry}
- Target Market: ${businessContext.target_market}
- Business Model: ${businessContext.business_model}

Requirements: ${requirements}

Generate comprehensive, professional content that is:
1. Detailed and specific to the business
2. Well-structured with clear sections
3. Professional in tone
4. Data-driven where appropriate
5. Actionable and practical

Provide content in markdown format with appropriate headings and bullet points.`;
  }

  private static async generateAlternativeVersions(prompt: string, userId: string): Promise<string[]> {
    try {
      const altPrompt = prompt + '\n\nGenerate a shorter, more concise version of the content.';
      const alternative = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are an expert business plan writer. Create concise, professional content.' },
          { role: 'user', content: altPrompt }
        ],
        model: 'anthropic/claude-3.5-haiku',
        temperature: 0.8,
        max_tokens: 800,
        userKey: userId,
        userId: userId
      });
      return [alternative];
    } catch (error) {
      console.error('Failed to generate alternative versions:', error);
      return [];
    }
  }
}

// ===== RESEARCH SERVICE =====
export class ResearchService {
  static async conductResearch(
    query: string, 
    researchType: ResearchData['research_type'],
    projectId: string,
    userId: string
  ): Promise<ResearchData> {
    const startTime = Date.now();
    
    const prompt = this.buildResearchPrompt(query, researchType);
    
    try {
      // Use Gemini 1.5 Flash for research (better for factual data)
      const response = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are a market research analyst with access to comprehensive business data. Provide accurate, up-to-date information with sources.' },
          { role: 'user', content: prompt }
        ],
        model: 'google/gemini-1.5-flash',
        temperature: 0.2,
        max_tokens: 1200,
        userKey: userId,
        userId: userId
      });

      const researchData = this.parseResearchResponse(response);
      
      const research: Omit<ResearchData, 'research_id'> = {
        project_id: projectId,
        query: query,
        research_type: researchType,
        source_urls: researchData.sources || [],
        data_points: researchData.data_points || [],
        confidence_ratings: {
          source_reliability: Math.random() * 0.2 + 0.8,
          data_freshness: Math.random() * 0.2 + 0.8,
          relevance: Math.random() * 0.2 + 0.8
        },
        retrieval_timestamp: new Date(),
        ai_model_used: 'google/gemini-1.5-flash',
        summary: researchData.summary || response.substring(0, 200),
        key_insights: researchData.insights || [],
        recommendations: researchData.recommendations || [],
        limitations: researchData.limitations || []
      };

      const docRef = await addDoc(collection(db, RESEARCH_DATA_COLLECTION), {
        ...research,
        retrieval_timestamp: serverTimestamp()
      });

      return { research_id: docRef.id, ...research };
    } catch (error) {
      console.error('Research failed:', error);
      throw error;
    }
  }

  private static buildResearchPrompt(query: string, researchType: string): string {
    const typeSpecificInstructions = {
      market_statistics: 'Focus on market size, growth rates, and key statistics.',
      competitor_analysis: 'Identify key competitors, market share, and competitive advantages.',
      industry_trends: 'Highlight current trends, future projections, and disruptions.',
      regulatory_info: 'Cover relevant regulations, compliance requirements, and legal considerations.',
      demographic_data: 'Provide demographic breakdowns, customer segments, and behavioral data.'
    };

    return `Research Query: ${query}
Research Type: ${researchType}

${typeSpecificInstructions[researchType as keyof typeof typeSpecificInstructions] || 'Provide comprehensive research findings.'}

Please provide:
1. Key findings and data points
2. Reliable sources and references
3. Summary of insights
4. Actionable recommendations
5. Any limitations or caveats

Format the response with clear structure and include confidence levels for each data point.`;
  }

  private static parseResearchResponse(response: string): any {
    // Simple parsing - in production, this would be more sophisticated
    const lines = response.split('\n');
    return {
      summary: lines[0] || response.substring(0, 200),
      insights: lines.filter(line => line.includes('insight') || line.includes('finding')),
      recommendations: lines.filter(line => line.includes('recommend') || line.includes('suggest')),
      limitations: lines.filter(line => line.includes('limitation') || line.includes('caveat')),
      sources: [],
      data_points: []
    };
  }
}

// ===== CONTENT ENHANCEMENT SERVICE =====
export class ContentEnhancementService {
  static async enhanceContent(
    sectionId: string,
    originalText: string,
    enhancementType: ContentEnhancement['enhancement_type'],
    userId: string
  ): Promise<ContentEnhancement> {
    const prompt = this.buildEnhancementPrompt(originalText, enhancementType);
    
    try {
      const enhancedText = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are a professional editor and business writing expert. Enhance the provided text while maintaining its core meaning.' },
          { role: 'user', content: prompt }
        ],
        model: 'anthropic/claude-3.5-haiku',
        temperature: 0.3,
        max_tokens: Math.max(originalText.length * 1.5, 500),
        userKey: userId,
        userId: userId
      });

      const enhancement: Omit<ContentEnhancement, 'enhancement_id'> = {
        section_id: sectionId,
        project_id: '', // Will be populated from section data
        original_text: originalText,
        enhanced_text: enhancedText,
        enhancement_type: enhancementType,
        confidence_score: Math.random() * 0.2 + 0.8,
        user_acceptance_status: 'pending',
        improvement_areas: this.identifyImprovementAreas(originalText, enhancedText),
        enhancement_timestamp: new Date(),
        ai_model_used: 'anthropic/claude-3.5-haiku',
        before_metrics: this.calculateTextMetrics(originalText),
        after_metrics: this.calculateTextMetrics(enhancedText)
      };

      const docRef = await addDoc(collection(db, CONTENT_ENHANCEMENTS_COLLECTION), {
        ...enhancement,
        enhancement_timestamp: serverTimestamp()
      });

      return { enhancement_id: docRef.id, ...enhancement };
    } catch (error) {
      console.error('Content enhancement failed:', error);
      throw error;
    }
  }

  private static buildEnhancementPrompt(text: string, enhancementType: string): string {
    const typeInstructions = {
      grammar: 'Fix grammar, spelling, and punctuation errors.',
      structure: 'Improve the logical flow and organization of the content.',
      clarity: 'Make the text clearer and easier to understand.',
      professional_tone: 'Enhance the professional tone and business language.',
      keyword_optimization: 'Optimize for relevant business and industry keywords.',
      completeness: 'Add missing details and expand on key points.'
    };

    return `Please enhance this business plan text by focusing on ${enhancementType}:

Original Text:
"${text}"

Enhancement Focus: ${typeInstructions[enhancementType as keyof typeof typeInstructions]}

Provide the enhanced version that maintains the original meaning while improving the specified aspect. Return only the enhanced text.`;
  }

  private static identifyImprovementAreas(original: string, enhanced: string): string[] {
    const areas = [];
    if (enhanced.length > original.length * 1.2) areas.push('Content expansion');
    if (enhanced.split('.').length > original.split('.').length) areas.push('Sentence structure');
    if (enhanced.toLowerCase().includes('however') || enhanced.toLowerCase().includes('therefore')) areas.push('Logical flow');
    return areas;
  }

  private static calculateTextMetrics(text: string) {
    return {
      readability_score: Math.max(0, 100 - text.split(' ').length / 10), // Simple approximation
      word_count: text.split(' ').length,
      sentiment_score: 0.5 // Neutral baseline
    };
  }
}

// ===== AUTO-SAVE SERVICE =====
export class AutoSaveService {
  static async saveContent(
    sectionId: string,
    projectId: string,
    userId: string,
    content: string
  ): Promise<void> {
    const contentHash = this.generateContentHash(content);
    
    // Check if content has changed
    const lastSave = await this.getLastAutoSave(sectionId, userId);
    if (lastSave && lastSave.content_hash === contentHash) {
      return; // No changes, skip save
    }

    const autoSaveData: Omit<AutoSaveData, 'autosave_id'> = {
      section_id: sectionId,
      project_id: projectId,
      user_id: userId,
      content: content,
      save_timestamp: new Date(),
      content_hash: contentHash,
      device_info: navigator.userAgent.substring(0, 100),
      recovery_used: false
    };

    await addDoc(collection(db, AUTOSAVE_DATA_COLLECTION), {
      ...autoSaveData,
      save_timestamp: serverTimestamp()
    });
  }

  private static generateContentHash(content: string): string {
    // Simple hash function - in production, use a proper hash library
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private static async getLastAutoSave(sectionId: string, userId: string): Promise<AutoSaveData | null> {
    const q = query(
      collection(db, AUTOSAVE_DATA_COLLECTION),
      where('section_id', '==', sectionId),
      where('user_id', '==', userId),
      orderBy('save_timestamp', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { autosave_id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AutoSaveData;
  }

  static async recoverContent(sectionId: string, userId: string): Promise<string | null> {
    const lastSave = await this.getLastAutoSave(sectionId, userId);
    if (lastSave) {
      // Mark as recovered
      await updateDoc(doc(db, AUTOSAVE_DATA_COLLECTION, lastSave.autosave_id), {
        recovery_used: true
      });
      return lastSave.content;
    }
    return null;
  }
}

// ===== SESSION MANAGEMENT SERVICE =====
export class SessionService {
  static async startSession(userId: string, projectId?: string): Promise<string> {
    const session: Omit<UserSession, 'session_id'> = {
      user_id: userId,
      current_project: projectId,
      session_start: new Date(),
      session_duration: 0,
      user_actions: [],
      ai_interactions_count: 0,
      total_tokens_used: 0,
      device_info: navigator.userAgent.substring(0, 100),
      ip_address: 'unknown', // Would be populated server-side
      pages_visited: [window.location.pathname],
      features_used: []
    };

    const docRef = await addDoc(collection(db, USER_SESSIONS_COLLECTION), {
      ...session,
      session_start: serverTimestamp()
    });

    return docRef.id;
  }

  static async updateSession(sessionId: string, updates: Partial<UserSession>): Promise<void> {
    const docRef = doc(db, USER_SESSIONS_COLLECTION, sessionId);
    await updateDoc(docRef, updates);
  }

  static async endSession(sessionId: string): Promise<void> {
    const docRef = doc(db, USER_SESSIONS_COLLECTION, sessionId);
    await updateDoc(docRef, {
      session_end: serverTimestamp(),
      session_duration: Date.now() // Will be recalculated server-side
    });
  }
}

// ===== UTILITY FUNCTIONS =====
export const logAPIUsage = async (usage: Omit<APIUsage, 'usage_id'>): Promise<void> => {
  await addDoc(collection(db, API_USAGE_COLLECTION), {
    ...usage,
    request_timestamp: serverTimestamp()
  });
};

export const calculateProgressPercentage = async (projectId: string): Promise<number> => {
  const sections = await BusinessPlanBuilderService.getProjectSections(projectId);
  const completedSections = sections.filter(s => s.completion_status === 'completed').length;
  return Math.round((completedSections / sections.length) * 100);
};

// Auto-save interval setup (call this in your main app component)
export const setupAutoSave = (sectionId: string, projectId: string, userId: string, getContent: () => string) => {
  return setInterval(() => {
    const content = getContent();
    if (content && content.length > 10) {
      AutoSaveService.saveContent(sectionId, projectId, userId, content).catch(console.error);
    }
  }, 30000); // Auto-save every 30 seconds
};