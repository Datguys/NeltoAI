import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Lightbulb, 
  Sparkles, 
  Loader2,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';

export default function IdeaGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    skills: '',
    interests: '',
    location: '',
    budget: [10000],
    timeAvailable: [20],
    industries: [] as string[],
    businessModel: [] as string[]
  });

  const industries = [
    'Technology', 'Healthcare', 'Education', 'Finance', 'E-commerce',
    'Entertainment', 'Food & Beverage', 'Travel', 'Fitness', 'Sustainability'
  ];

  const businessModels = [
    'SaaS', 'E-commerce', 'Marketplace', 'Subscription', 'Freemium',
    'Service-based', 'Product-based', 'Consulting', 'Affiliate', 'Advertising'
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // OpenRouter AI integration here - would call AI service
    setTimeout(() => {
      const mockIdeas = [
        {
          id: 1,
          title: 'AI-Powered Study Companion',
          description: 'An AI tutoring platform that adapts to individual learning styles and provides personalized study plans for students.',
          rating: 4.7,
          difficulty: 'Medium',
          timeToMarket: '4-6 months',
          estimatedCost: '$8,000',
          marketSize: 'Large',
          pros: [
            'Growing EdTech market',
            'High demand for personalized learning',
            'Scalable AI technology'
          ],
          cons: [
            'Competitive market',
            'Requires AI expertise',
            'Data privacy concerns'
          ],
          uniqueFeatures: [
            'Emotional intelligence tracking',
            'Voice-based interaction',
            'Collaborative learning tools'
          ]
        },
        {
          id: 2,
          title: 'Micro-Investment Platform',
          description: 'A mobile app that rounds up everyday purchases and invests the spare change in diversified portfolios.',
          rating: 4.3,
          difficulty: 'High',
          timeToMarket: '8-12 months',
          estimatedCost: '$25,000',
          marketSize: 'Medium',
          pros: [
            'Growing fintech sector',
            'Low barrier to entry for users',
            'Recurring revenue model'
          ],
          cons: [
            'Heavy regulation',
            'High development costs',
            'Established competitors'
          ],
          uniqueFeatures: [
            'Gamified investing',
            'Social sharing features',
            'Educational content integration'
          ]
        }
      ];
      
      setGeneratedIdeas(mockIdeas);
      setIsGenerating(false);
    }, 3000);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'industries' | 'businessModel', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Idea Generator</h1>
          <p className="text-muted-foreground">Tell us about yourself and we'll generate personalized business ideas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                Your Profile
              </CardTitle>
              <CardDescription>
                Provide details to get tailored business ideas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills & Expertise</Label>
                <Textarea
                  id="skills"
                  placeholder="e.g., Programming, Marketing, Design, Sales..."
                  value={formData.skills}
                  onChange={(e) => updateFormData('skills', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Interests & Passions</Label>
                <Textarea
                  id="interests"
                  placeholder="e.g., Technology, Health, Education, Environment..."
                  value={formData.interests}
                  onChange={(e) => updateFormData('interests', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, Remote, Global"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Available Budget: ${formData.budget[0].toLocaleString()}</Label>
                <Slider
                  value={formData.budget}
                  onValueChange={(value) => updateFormData('budget', value)}
                  max={100000}
                  min={1000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$1K</span>
                  <span>$100K+</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Time Available (hours/week): {formData.timeAvailable[0]}h</Label>
                <Slider
                  value={formData.timeAvailable}
                  onValueChange={(value) => updateFormData('timeAvailable', value)}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5h</span>
                  <span>60h+</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Preferred Industries</Label>
                <div className="grid grid-cols-2 gap-2">
                  {industries.map((industry) => (
                    <div key={industry} className="flex items-center space-x-2">
                      <Checkbox
                        id={industry}
                        checked={formData.industries.includes(industry)}
                        onCheckedChange={() => toggleArrayField('industries', industry)}
                      />
                      <Label htmlFor={industry} className="text-sm">{industry}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Business Models</Label>
                <div className="grid grid-cols-2 gap-2">
                  {businessModels.map((model) => (
                    <div key={model} className="flex items-center space-x-2">
                      <Checkbox
                        id={model}
                        checked={formData.businessModel.includes(model)}
                        onCheckedChange={() => toggleArrayField('businessModel', model)}
                      />
                      <Label htmlFor={model} className="text-sm">{model}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full" 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Ideas...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Generate Business Ideas
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Ideas */}
          <div className="space-y-6">
            {isGenerating && (
              <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Generating Ideas...</h3>
                  <p className="text-muted-foreground">Our AI is analyzing your profile and market trends</p>
                </CardContent>
              </Card>
            )}

            {generatedIdeas.map((idea) => (
              <Card key={idea.id} className="bg-glass-background border-glass-border backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{idea.rating}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">☆</Button>
                  </div>
                  <CardTitle className="text-lg">{idea.title}</CardTitle>
                  <CardDescription>{idea.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="text-xs">Time to Market</span>
                      </div>
                      <p className="font-medium">{idea.timeToMarket}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-muted-foreground">
                        <DollarSign className="w-3 h-3 mr-1" />
                        <span className="text-xs">Est. Cost</span>
                      </div>
                      <p className="font-medium">{idea.estimatedCost}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-muted-foreground">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span className="text-xs">Difficulty</span>
                      </div>
                      <p className="font-medium">{idea.difficulty}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        <span className="text-xs">Market Size</span>
                      </div>
                      <p className="font-medium">{idea.marketSize}</p>
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-2">Pros</h4>
                      <ul className="text-xs space-y-1">
                        {idea.pros.map((pro: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-400 mr-1">+</span>
                            <span className="text-muted-foreground">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-400 mb-2">Considerations</h4>
                      <ul className="text-xs space-y-1">
                        {idea.cons.map((con: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-400 mr-1">-</span>
                            <span className="text-muted-foreground">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Unique Features */}
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2">Unique Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {idea.uniqueFeatures.map((feature: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      Start Project
                    </Button>
                    <Button size="sm" variant="outline">
                      Save Idea
                    </Button>
                    <Button size="sm" variant="outline">
                      Get More Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!isGenerating && generatedIdeas.length === 0 && (
              <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
                <CardContent className="p-12 text-center">
                  <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-2">Ready to Generate Ideas</h3>
                  <p className="text-muted-foreground">
                    Fill out your profile on the left and click generate to get personalized business ideas
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}