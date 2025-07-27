import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedInSection } from '@/components/FeaturedInSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { MissionSection } from '@/components/MissionSection';
import { PricingSection } from '@/components/PricingSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { AffiliateSection } from '@/components/AffiliateSection';
import { FAQSection } from '@/components/FAQSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="landing-theme min-h-screen">
      <Navigation />
      
      <main>
        <HeroSection />
        <FeaturedInSection />
        <HowItWorksSection />
        <FeaturesSection />
        <MissionSection />
        <PricingSection />
        <TestimonialsSection />
        <AffiliateSection />
        <FAQSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
