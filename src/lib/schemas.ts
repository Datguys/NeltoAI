// Database schemas for the comprehensive AI startup platform

export interface IdeaGeneratorRequest {
  id: string;
  user_id: string;
  industry_preferences: string[];
  budget_constraints: {
    min: number;
    max: number;
  };
  skill_sets: string[];
  location_data: {
    country: string;
    state?: string;
    city?: string;
  };
  market_interests: string[];
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  time_commitment: 'part-time' | 'full-time';
  request_timestamp: Date;
}

export interface Idea {
  idea_id: string;
  user_id: string;
  title: string;
  description: string;
  industry: string;
  startup_cost: number;
  target_market: string;
  ai_confidence_score: number;
  creation_timestamp: Date;
  selection_status: 'pending' | 'selected' | 'rejected';
  profitability_timeline: string;
  market_size: string;
  competition_level: 'low' | 'medium' | 'high';
  required_skills: string[];
  risk_factors: string[];
  growth_potential: 'low' | 'medium' | 'high';
}

export interface Project {
  project_id: string;
  user_id: string;
  business_idea: string;
  idea_id?: string; // Link to the original idea
  current_section: number;
  current_subsection: number;
  completion_percentage: number;
  last_modified: Date;
  project_status: 'active' | 'completed' | 'paused' | 'archived';
  total_time_spent: number; // in minutes
  project_name: string;
  creation_date: Date;
  target_launch_date?: Date;
  industry: string;
  business_model: string;
  target_market: string;
  funding_goal?: number;
  team_size: number;
}

export interface BusinessPlanSection {
  section_id: string;
  project_id: string;
  section_number: number;
  subsection_number: number;
  section_title: string;
  subsection_title: string;
  content_type: 'manual' | 'ai_generated' | 'hybrid';
  raw_content: string;
  ai_enhanced_content?: string;
  completion_status: 'not_started' | 'in_progress' | 'completed' | 'needs_review';
  ai_quality_score?: number;
  user_satisfaction_rating?: number;
  word_count: number;
  data_sources_used: string[];
  modification_history: {
    timestamp: Date;
    change_type: 'created' | 'edited' | 'ai_enhanced' | 'reviewed';
    user_id: string;
    summary: string;
  }[];
  required_fields: string[];
  completion_criteria: string[];
  estimated_time_to_complete: number; // in minutes
  dependencies: string[]; // other section_ids that must be completed first
}

export interface AIFeedback {
  feedback_id: string;
  section_id: string;
  project_id: string;
  feedback_type: 'content_quality' | 'missing_elements' | 'improvement_suggestions' | 'structure_feedback';
  suggestion_text: string;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  implementation_status: 'pending' | 'implemented' | 'rejected' | 'in_progress';
  user_response?: string;
  confidence_score: number;
  ai_model_used: string;
  creation_timestamp: Date;
  category: string;
  specific_issues: string[];
  suggested_improvements: string[];
  estimated_impact: 'low' | 'medium' | 'high';
}

export interface AIGeneratedContent {
  content_id: string;
  section_id: string;
  project_id: string;
  user_id: string;
  generated_content: string;
  generation_parameters: {
    model_used: string;
    temperature: number;
    max_tokens: number;
    prompt_used: string;
    context_provided: string[];
  };
  confidence_scores: {
    relevance: number;
    accuracy: number;
    completeness: number;
    coherence: number;
  };
  alternative_versions: string[];
  generation_timestamp: Date;
  token_usage: {
    input_tokens: number;
    output_tokens: number;
    total_cost: number;
  };
  user_rating?: number;
  usage_status: 'active' | 'archived' | 'superseded';
  quality_metrics: {
    readability_score: number;
    professional_tone_score: number;
    keyword_relevance: number;
  };
}

export interface ResearchData {
  research_id: string;
  project_id: string;
  section_id?: string;
  query: string;
  research_type: 'market_statistics' | 'competitor_analysis' | 'industry_trends' | 'regulatory_info' | 'demographic_data';
  source_urls: string[];
  data_points: {
    metric: string;
    value: string | number;
    source: string;
    confidence_rating: number;
    date_collected: Date;
  }[];
  confidence_ratings: {
    source_reliability: number;
    data_freshness: number;
    relevance: number;
  };
  retrieval_timestamp: Date;
  ai_model_used: string;
  summary: string;
  key_insights: string[];
  recommendations: string[];
  limitations: string[];
}

export interface ContentEnhancement {
  enhancement_id: string;
  section_id: string;
  project_id: string;
  original_text: string;
  enhanced_text: string;
  enhancement_type: 'grammar' | 'structure' | 'clarity' | 'professional_tone' | 'keyword_optimization' | 'completeness';
  confidence_score: number;
  user_acceptance_status: 'pending' | 'accepted' | 'rejected' | 'modified';
  improvement_areas: string[];
  enhancement_timestamp: Date;
  ai_model_used: string;
  before_metrics: {
    readability_score: number;
    word_count: number;
    sentiment_score: number;
  };
  after_metrics: {
    readability_score: number;
    word_count: number;
    sentiment_score: number;
  };
  user_feedback?: string;
}

export interface APIUsage {
  usage_id: string;
  user_id: string;
  project_id?: string;
  model_used: string;
  feature_type: 'idea_generation' | 'content_generation' | 'research' | 'enhancement' | 'coaching';
  tokens_consumed: {
    input: number;
    output: number;
    total: number;
  };
  cost_per_request: number;
  response_time: number; // in milliseconds
  user_satisfaction?: number;
  request_timestamp: Date;
  success: boolean;
  error_message?: string;
  request_parameters: Record<string, any>;
  response_quality_metrics: {
    relevance: number;
    accuracy: number;
    helpfulness: number;
  };
}

export interface AutoSaveData {
  autosave_id: string;
  section_id: string;
  project_id: string;
  user_id: string;
  content: string;
  save_timestamp: Date;
  content_hash: string; // to avoid duplicate saves
  device_info: string;
  recovery_used: boolean;
}

export interface UserSession {
  session_id: string;
  user_id: string;
  current_project?: string;
  current_section?: string;
  session_start: Date;
  session_end?: Date;
  session_duration: number; // in minutes
  user_actions: {
    action_type: string;
    timestamp: Date;
    details: Record<string, any>;
  }[];
  ai_interactions_count: number;
  total_tokens_used: number;
  device_info: string;
  ip_address: string;
  pages_visited: string[];
  features_used: string[];
}

export interface BusinessPlanTemplate {
  template_id: string;
  name: string;
  description: string;
  industry: string;
  sections: {
    section_number: number;
    section_title: string;
    subsections: {
      subsection_number: number;
      subsection_title: string;
      description: string;
      required_fields: string[];
      estimated_time: number;
      ai_prompts: {
        generation_prompt: string;
        coaching_prompt: string;
        enhancement_prompt: string;
      };
    }[];
  }[];
  created_by: string;
  creation_date: Date;
  usage_count: number;
  rating: number;
  tags: string[];
}

export interface ProgressMilestone {
  milestone_id: string;
  project_id: string;
  milestone_name: string;
  description: string;
  target_date: Date;
  completion_date?: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  dependencies: string[];
  assigned_sections: string[];
  progress_percentage: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_date: Date;
  last_updated: Date;
}

// AI Model Configuration
export interface AIModelConfig {
  model_id: string;
  model_name: string;
  provider: 'openrouter' | 'groq';
  api_endpoint: string;
  use_cases: string[];
  tier_access: ('free' | 'pro' | 'ultra')[];
  cost_per_1k_tokens: {
    input: number;
    output: number;
  };
  max_tokens: number;
  supports_streaming: boolean;
  rate_limits: {
    requests_per_minute: number;
    tokens_per_minute: number;
  };
  quality_metrics: {
    accuracy_score: number;
    creativity_score: number;
    coherence_score: number;
  };
}

// Webhook and Integration schemas
export interface WebhookEvent {
  event_id: string;
  event_type: 'project_created' | 'section_completed' | 'payment_processed' | 'tier_upgraded';
  user_id: string;
  project_id?: string;
  timestamp: Date;
  payload: Record<string, any>;
  processed: boolean;
  retry_count: number;
  next_retry?: Date;
}

// Analytics and Reporting
export interface UserAnalytics {
  user_id: string;
  date: Date;
  daily_metrics: {
    projects_created: number;
    sections_completed: number;
    ai_interactions: number;
    time_spent: number;
    tokens_used: number;
    features_accessed: string[];
  };
  weekly_metrics: {
    total_projects: number;
    completion_rate: number;
    average_session_time: number;
    most_used_features: string[];
  };
  monthly_metrics: {
    total_tokens_consumed: number;
    upgrade_probability: number;
    churn_risk: number;
    satisfaction_score: number;
  };
}

// Export system schemas
export interface ExportRequest {
  export_id: string;
  project_id: string;
  user_id: string;
  export_type: 'pdf' | 'docx' | 'excel' | 'json';
  sections_included: string[];
  format_options: {
    include_charts: boolean;
    include_financials: boolean;
    template_style: string;
    custom_branding: boolean;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  request_timestamp: Date;
  completion_timestamp?: Date;
  file_size?: number;
  download_count: number;
  expiry_date: Date;
}