import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-surface"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">AI-Powered Startup Assistant</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
          Launch Your{' '}
          <span className="gradient-text">Dream Startup</span>
        </h1>

        {/* Subtitle */}
        <p className="text-subtitle max-w-3xl mx-auto mb-10">
          Transform your ideas into businesses with AI-powered strategy, planning, and execution. 
          Get personalized roadmaps, market analysis, and expert guidance to turn your vision into reality.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="xl" className="group" onClick={() => navigate('/login')}>
            Start My Startup
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="glass" size="xl">
            Watch Demo
          </Button>
        </div>

        {/* Dashboard Preview */}
        <div className="relative max-w-4xl mx-auto">
          <div className="glass-card p-6 rounded-2xl border-2 border-glass-border/30">
            <div className="bg-surface rounded-xl p-8 space-y-6">
              {/* Mock Dashboard Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
                  <span className="font-semibold">StartupCoPilot Dashboard</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">AI Ideas Generated</div>
                  <div className="text-2xl font-bold text-primary">47</div>
                </div>
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Market Score</div>
                  <div className="text-2xl font-bold text-secondary">8.9/10</div>
                </div>
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Launch Readiness</div>
                  <div className="text-2xl font-bold text-success">94%</div>
                </div>
              </div>

              {/* Mock Chart Area */}
              <div className="glass p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Business Roadmap</h4>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                  </div>
                </div>
                <div className="h-32 bg-gradient-surface rounded-lg flex items-end justify-between p-4">
                  <div className="w-8 bg-primary rounded-t h-16"></div>
                  <div className="w-8 bg-secondary rounded-t h-24"></div>
                  <div className="w-8 bg-primary rounded-t h-20"></div>
                  <div className="w-8 bg-secondary rounded-t h-28"></div>
                  <div className="w-8 bg-primary rounded-t h-24"></div>
                  <div className="w-8 bg-secondary rounded-t h-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}