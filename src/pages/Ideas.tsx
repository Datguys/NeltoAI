import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Lightbulb, 
  Star, 
  Search, 
  Filter,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const savedIdeas = [
  {
    id: 1,
    title: 'AI-Powered Fitness Coach',
    description: 'A personalized fitness app that uses AI to create custom workout plans based on user goals, fitness level, and available equipment.',
    rating: 4.8,
    difficulty: 'Medium',
    timeToMarket: '6-8 months',
    estimatedCost: '$15,000',
    marketSize: 'Large',
    tags: ['AI', 'Health', 'Mobile App'],
    saved: true,
    generated: '2 days ago'
  },
  {
    id: 2,
    title: 'Sustainable Packaging Platform',
    description: 'A B2B marketplace connecting eco-friendly packaging suppliers with small businesses looking to reduce their environmental impact.',
    rating: 4.5,
    difficulty: 'High',
    timeToMarket: '8-12 months',
    estimatedCost: '$25,000',
    marketSize: 'Medium',
    tags: ['Sustainability', 'B2B', 'Marketplace'],
    saved: true,
    generated: '1 week ago'
  },
  {
    id: 3,
    title: 'Local Service Booking App',
    description: 'An app that connects homeowners with local service providers for quick bookings of cleaning, repairs, and maintenance services.',
    rating: 4.2,
    difficulty: 'Medium',
    timeToMarket: '4-6 months',
    estimatedCost: '$12,000',
    marketSize: 'Large',
    tags: ['Services', 'Local', 'Mobile App'],
    saved: false,
    generated: '3 days ago'
  }
];

export default function Ideas() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Ideas</h1>
            <p className="text-muted-foreground">Explore and manage your AI-generated business ideas</p>
          </div>
          <Button asChild>
            <Link to="/ideas/generate">
              <Plus className="w-4 h-4 mr-2" />
              Generate New Ideas
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ideas by title, tags, or industry..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedIdeas.map((idea) => (
            <Card key={idea.id} className="bg-glass-background border-glass-border backdrop-blur-xl hover:shadow-lg transition-shadow">
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
                  <Button variant="ghost" size="sm">
                    {idea.saved ? '★' : '☆'}
                  </Button>
                </div>
                <CardTitle className="text-lg">{idea.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-3">
                  {idea.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {idea.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="text-xs">Time to Market</span>
                      </div>
                      <p className="font-medium">{idea.timeToMarket}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-muted-foreground">
                        <DollarSign className="w-3 h-3 mr-1" />
                        <span className="text-xs">Est. Cost</span>
                      </div>
                      <p className="font-medium">{idea.estimatedCost}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-muted-foreground">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span className="text-xs">Difficulty</span>
                      </div>
                      <p className="font-medium">{idea.difficulty}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        <span className="text-xs">Market Size</span>
                      </div>
                      <p className="font-medium">{idea.marketSize}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 glow-primary">
                      Start Project
                    </Button>
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Generated {idea.generated}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State - if no ideas */}
        {savedIdeas.length === 0 && (
          <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No Ideas Yet</h3>
              <p className="text-muted-foreground mb-6">
                Generate your first business idea with our AI-powered idea generator
              </p>
              <Button asChild>
                <Link to="/ideas/generate">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Ideas
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}