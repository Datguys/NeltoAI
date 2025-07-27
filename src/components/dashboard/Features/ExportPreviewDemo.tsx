import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportPDFButton, type ExportSection } from './ExportPDFButton';

const sampleSections: ExportSection[] = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    content: `VeltoAI is a comprehensive startup platform that leverages artificial intelligence to help entrepreneurs build and manage their businesses. Our platform provides AI-powered tools for idea generation, budget planning, timeline management, and market analysis.

With over 10,000 users already benefiting from our services, VeltoAI is positioned to become the leading platform for startup development and business planning.

Key highlights:
• AI-powered business idea generation
• Comprehensive budget and financial planning
• Market intelligence and competitive analysis
• Project management and timeline tracking
• Multi-format export capabilities`,
    category: 'business-plan',
    wordCount: 89
  },
  {
    id: 'market-analysis',
    title: 'Market Analysis',
    content: `The global startup ecosystem market is valued at over $3.8 trillion and continues to grow rapidly. Small and medium enterprises (SMEs) represent 99% of all businesses worldwide, creating a massive addressable market for our platform.

Market Trends:
• 75% of startups fail due to poor planning and execution
• 68% of entrepreneurs struggle with financial planning
• 82% need assistance with market research and validation
• Growing demand for AI-powered business tools

Target Market:
• First-time entrepreneurs (35% of user base)
• Serial entrepreneurs (28% of user base)  
• Small business owners (25% of user base)
• Business consultants and advisors (12% of user base)

Our total addressable market (TAM) is estimated at $45 billion, with a serviceable addressable market (SAM) of $8.2 billion.`,
    category: 'analysis',
    wordCount: 142
  },
  {
    id: 'financial-projections',
    title: 'Financial Projections',
    content: `VeltoAI's financial model is based on a freemium SaaS approach with three distinct pricing tiers:

Revenue Streams:
• Free Tier: $0/month (Lead generation, 15% conversion)
• Starter Tier: $29.99/month (Core features, 65% of paid users)
• Ultra Tier: $79.99/month (Premium features, 35% of paid users)

5-Year Financial Forecast:
Year 1: $450K revenue, 2,500 users (15% paid)
Year 2: $1.2M revenue, 6,000 users (22% paid)
Year 3: $2.8M revenue, 12,000 users (28% paid)
Year 4: $5.1M revenue, 20,000 users (32% paid)
Year 5: $8.7M revenue, 30,000 users (35% paid)

Key Metrics:
• Customer Acquisition Cost (CAC): $85
• Customer Lifetime Value (LTV): $540
• LTV:CAC Ratio: 6.4:1
• Monthly Churn Rate: 5.2%
• Annual Recurring Revenue (ARR) Growth: 180%`,
    category: 'financial',
    wordCount: 156
  },
  {
    id: 'technology-stack',
    title: 'Technology & Infrastructure',
    content: `VeltoAI is built on a modern, scalable technology stack designed for performance, security, and user experience:

Frontend Technologies:
• React 18 with TypeScript for type safety
• Tailwind CSS for responsive design
• Vite for fast development and building
• Progressive Web App (PWA) capabilities

Backend Infrastructure:
• Firebase for authentication and real-time database
• Node.js serverless functions
• OpenRouter and Groq APIs for AI integration
• Stripe for payment processing

AI & Machine Learning:
• Integration with multiple AI models (GPT-4, Claude, Gemini)
• Custom prompt engineering for business use cases
• Token optimization and cost management
• Intelligent content generation and analysis

Security & Compliance:
• Enterprise-grade security protocols
• GDPR and CCPA compliance
• End-to-end encryption for sensitive data
• Regular security audits and penetration testing`,
    category: 'analysis',
    wordCount: 134
  }
];

export function ExportPreviewDemo() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Export with Preview Demo</CardTitle>
          <CardDescription>
            Demonstration of the enhanced ExportPDFButton component with live preview functionality.
            Click "Preview" to see how your document will look before exporting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportPDFButton 
            sections={sampleSections}
            fileName="veltoai-business-plan.pdf"
            defaultCompanyName="VeltoAI Inc."
            defaultReportTitle="Business Plan & Market Analysis"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features Showcase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Preview Functionality:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Live preview with iframe rendering</li>
                <li>• Real-time updates as you change settings</li>
                <li>• Full-screen preview option</li>
                <li>• Section and word count tracking</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Export Options:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• PDF, HTML, and JSON formats</li>
                <li>• Customizable company branding</li>
                <li>• Configurable layout options</li>
                <li>• Selective section inclusion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Sections</CardTitle>
          <CardDescription>
            The demo includes {sampleSections.length} sample sections with {sampleSections.reduce((sum, s) => sum + (s.wordCount || 0), 0)} total words.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {sampleSections.map((section, index) => (
              <div key={section.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <span className="font-medium">{index + 1}. {section.title}</span>
                  {section.category && (
                    <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                      {section.category}
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {section.wordCount} words
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}