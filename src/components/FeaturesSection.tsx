import { 
  Brain, 
  Target, 
  TrendingUp, 
  Wrench, 
  Calendar, 
  Share2,
  ArrowRight 
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: 'AI Idea Generator',
      description: 'Generate personalized startup ideas based on your skills, interests, and market trends',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Personalized Launch Plans',
      description: 'Get detailed roadmaps tailored to your specific business idea and goals',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Market Research & Analysis',
      description: 'In-depth market analysis, competitor research, and validation scores',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Wrench,
      title: 'BOM Builder',
      description: 'Build comprehensive Bills of Materials for your product or service',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Calendar,
      title: 'Budget + Timeline Planner',
      description: 'Detailed financial planning and project timelines for your startup journey',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Share2,
      title: 'Export + Collaboration',
      description: 'Export plans and collaborate with team members and advisors',
      gradient: 'from-teal-500 to-blue-500',
      badge: 'Pro+'
    }
  ];

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4">Everything You Need to Launch</h2>
          <p className="text-subtitle max-w-2xl mx-auto">
            Comprehensive AI-powered tools to take your startup from idea to launch
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="glass-card p-6 rounded-2xl group hover:shadow-large transition-all duration-300 relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Badge for Pro+ features */}
              {feature.badge && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-gradient-primary text-xs font-medium rounded-full text-primary-foreground">
                  {feature.badge}
                </div>
              )}

              {/* Icon */}
              <div className="mb-6">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {feature.description}
              </p>

              {/* Learn More Link */}
              <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all duration-300">
                <span className="text-sm">Learn more</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>

              {/* Hover Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}