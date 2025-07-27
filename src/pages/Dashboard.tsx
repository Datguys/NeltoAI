import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Clock, 
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

const stats = [
  { name: 'Active Projects', value: '3', icon: Target, change: '+1 this week' },
  { name: 'Ideas Generated', value: '12', icon: Lightbulb, change: '+4 this week' },
  { name: 'Tasks Completed', value: '28', icon: CheckCircle, change: '+12 this week' },
  { name: 'Total Budget', value: '$15,450', icon: DollarSign, change: '+$2,300 this month' },
];

const recentProjects = [
  {
    id: 1,
    name: 'SaaS Analytics Tool',
    progress: 75,
    status: 'In Progress',
    dueDate: '2024-02-15',
    budget: '$5,000'
  },
  {
    id: 2,
    name: 'E-commerce Mobile App',
    progress: 45,
    status: 'Planning',
    dueDate: '2024-03-01',
    budget: '$8,000'
  },
  {
    id: 3,
    name: 'AI Writing Assistant',
    progress: 90,
    status: 'Testing',
    dueDate: '2024-01-30',
    budget: '$2,450'
  }
];

export default function Dashboard() {
  const { user } = useFirebaseUser();
  const name = user?.email || 'there';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 flex items-center gap-2">
              Welcome back, {name}! <span role="img" aria-label="waving hand">👋</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Let's continue building your dream startup. Here's what's happening today.
            </p>

          </div>
          <Button asChild className="glow-primary">
            <Link to="/ideas/generate">
              <Lightbulb className="w-4 h-4 mr-2" />
              Generate New Idea
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.name} className="bg-glass-background border-glass-border backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <Card className="lg:col-span-2 bg-glass-background border-glass-border backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your active startup projects and their progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="border border-glass-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground">{project.name}</h3>
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 
                          project.status === 'Planning' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'}
                      `}>
                        {project.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Due {project.dueDate}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {project.budget}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Projects
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start glow-primary">
                  <Link to="/ideas/generate">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Generate Idea
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start glow-primary">
                  <Link to="/bom">
                    <Target className="w-4 h-4 mr-2" />
                    Create BOM
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start glow-primary">
                  <Link to="/budget">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Plan Budget
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start glow-primary">
                  <Link to="/timeline">
                    <Clock className="w-4 h-4 mr-2" />
                    Set Timeline
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Personalized recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-primary font-medium">🎯 Focus Recommendation</p>
                    <p className="text-muted-foreground mt-1">
                      Your SaaS Analytics project is 75% complete. Consider prioritizing the remaining features.
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                    <p className="text-secondary font-medium">💡 New Opportunity</p>
                    <p className="text-muted-foreground mt-1">
                      Based on your skills, here's a trending market opportunity in your area.
                    </p>
                  </div>
                </div>
                {/* OpenRouter AI integration here */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}