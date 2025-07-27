import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How accurate are the AI-generated business ideas?',
      answer: 'Our AI analyzes millions of data points including market trends, consumer behavior, and successful business models. While no prediction is 100% accurate, our ideas are backed by comprehensive market research and have helped thousands of users identify viable opportunities.'
    },
    {
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'Yes! We offer a 30-day money-back guarantee for all paid plans. If you\'re not completely satisfied with StartupCoPilot, contact our support team within 30 days for a full refund.'
    },
    {
      question: 'What\'s included in the free plan?',
      answer: 'The free plan includes 5 AI-generated startup ideas per month, basic market analysis, limited planning tools, and access to our community. It\'s perfect for exploring the platform and getting a feel for our AI capabilities.'
    },
    {
      question: 'How do I upgrade or downgrade my plan?',
      answer: 'You can change your plan anytime from your account settings. Upgrades take effect immediately, while downgrades take effect at the end of your current billing cycle. No fees for plan changes.'
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Absolutely. We use enterprise-grade encryption and security measures. Your business ideas and personal information are never shared with third parties. You own your data and can export or delete it anytime.'
    },
    {
      question: 'Do you offer team collaboration features?',
      answer: 'Yes! Our Pro and Ultra plans include team collaboration features. You can invite team members, share plans, and work together on your startup journey. Ultra plans include advanced team management and analytics.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-gradient-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4">Frequently Asked Questions</h2>
          <p className="text-subtitle">
            Everything you need to know about StartupCoPilot
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="glass-card rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors duration-200"
              >
                <span className="font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 pb-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline">
              Contact Support
            </Button>
            <Button variant="ghost">
              Join Community
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}