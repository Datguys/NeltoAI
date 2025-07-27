import { Sparkles } from 'lucide-react';

export function MissionSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-secondary/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Icon */}
        <div className="inline-flex p-4 rounded-2xl glass-card mb-8 group">
          <Sparkles className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
        </div>

        {/* Mission Statement */}
        <h2 className="mb-6">Our Mission</h2>
        <div className="space-y-6 text-lg lg:text-xl text-muted-foreground leading-relaxed">
          <p>
            We believe that <span className="text-foreground font-medium">great ideas shouldn't die</span> because 
            of lack of guidance, resources, or business knowledge.
          </p>
          <p>
            StartupCoPilot was born from the frustration of seeing brilliant minds held back by the complexity 
            of turning ideas into businesses. We've democratized access to <span className="text-foreground font-medium">expert-level 
            business intelligence</span> through AI.
          </p>
          <p>
            Our platform doesn't just generate ideas—it provides the <span className="gradient-text font-medium">complete roadmap</span> to 
            turn your vision into reality, no matter your background or experience.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {[
            { number: '10K+', label: 'Ideas Generated' },
            { number: '500+', label: 'Startups Launched' },
            { number: '95%', label: 'User Satisfaction' },
            { number: '24/7', label: 'AI Support' }
          ].map((stat, index) => (
            <div key={stat.label} className="glass p-4 rounded-xl">
              <div className="text-2xl lg:text-3xl font-bold gradient-text mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}