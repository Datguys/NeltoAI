import { User, Lightbulb, Rocket } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      icon: User,
      title: 'Fill Your Profile',
      description: 'Tell us about your skills, interests, and startup goals'
    },
    {
      icon: Lightbulb,
      title: 'Get Tailored Ideas',
      description: 'Receive AI-generated startup ideas personalized for you'
    },
    {
      icon: Rocket,
      title: 'Launch Roadmap',
      description: 'Get a complete plan with timelines, budgets, and next steps'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4">How It Works</h2>
          <p className="text-subtitle max-w-2xl mx-auto">
            Three simple steps to transform your entrepreneurial dreams into a actionable business plan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center group">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground font-bold text-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="glass-card p-4 rounded-2xl group-hover:shadow-glow-primary transition-all duration-300">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>

              {/* Connector Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent transform translate-y-6" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}