import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Student, Fitness App',
      initials: 'SC',
      quote: 'StartupCoPilot helped me turn my fitness app idea into a real business plan. The AI-generated market analysis was incredibly detailed and gave me confidence to move forward.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Solo Founder, EdTech',
      initials: 'MR',
      quote: 'The budget and timeline planning features saved me weeks of research. I went from idea to MVP in half the time I expected.',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'Researcher, HealthTech',
      initials: 'EW',
      quote: 'As someone new to entrepreneurship, the personalized guidance was invaluable. The platform made complex business planning feel approachable.',
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'Solo Founder, SaaS',
      initials: 'DK',
      quote: 'The AI idea generator opened my eyes to opportunities I never considered. Now I have a clear roadmap for my next venture.',
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4">What Our Users Say</h2>
          <p className="text-subtitle max-w-2xl mx-auto">
            Join thousands of entrepreneurs who've transformed their ideas into successful businesses
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Card */}
          <div className="glass-card p-8 lg:p-12 rounded-2xl text-center">
            <div className="mb-6">
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl lg:text-2xl font-light text-foreground mb-8 leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonials[currentIndex].initials}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{testimonials[currentIndex].name}</div>
                  <div className="text-muted-foreground text-sm">{testimonials[currentIndex].role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button 
              variant="glass" 
              size="icon"
              onClick={goToPrevious}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-primary w-8' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <Button 
              variant="glass" 
              size="icon"
              onClick={goToNext}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}