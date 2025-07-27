import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

const steps = [
  { id: 1, title: 'How did you hear about us?' },
  { id: 2, title: 'Tell us about yourself' },
  { id: 3, title: 'What brings you here?' },
  { id: 4, title: 'Choose your theme' }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    referralSource: '',
    referralCode: '',
    userType: '',
    skills: '',
    goals: '',
    purpose: '',
    theme: 'dark'
  });
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save onboarding data to Firebase here
      console.log('Onboarding completed:', formData);
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            StartupCoPilot
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-foreground">
            Welcome to StartupCoPilot
          </h1>
          <p className="mt-2 text-muted-foreground">
            Let's personalize your experience
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-full h-0.5 mx-4
                  ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              Step {currentStep} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: How did you hear about us? */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <RadioGroup
                  value={formData.referralSource}
                  onValueChange={(value) => updateFormData('referralSource', value)}
                >
                  {[
                    'Social Media (TikTok, Instagram, YouTube)',
                    'Google Search',
                    'Friend or Colleague',
                    'LinkedIn',
                    'Product Hunt',
                    'Other'
                  ].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                  <Input
                    id="referralCode"
                    placeholder="Enter referral code"
                    value={formData.referralCode}
                    onChange={(e) => updateFormData('referralCode', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Tell us about yourself */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Who are you?</Label>
                  <RadioGroup
                    value={formData.userType}
                    onValueChange={(value) => updateFormData('userType', value)}
                    className="mt-3"
                  >
                    {[
                      'Student',
                      'Solo Founder',
                      'Aspiring Entrepreneur',
                      'Researcher',
                      'Content Creator',
                      'Other'
                    ].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">What are your skills and interests?</Label>
                  <Textarea
                    id="skills"
                    placeholder="e.g., Programming, Marketing, Design, Business..."
                    value={formData.skills}
                    onChange={(e) => updateFormData('skills', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: What brings you here? */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <RadioGroup
                  value={formData.purpose}
                  onValueChange={(value) => updateFormData('purpose', value)}
                >
                  {[
                    'Start a side hustle',
                    'Learn about business',
                    'Validate an existing idea',
                    'Find a co-founder',
                    'Build my first startup',
                    'Research opportunities'
                  ].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="space-y-2">
                  <Label htmlFor="goals">Any specific goals? (Optional)</Label>
                  <Textarea
                    id="goals"
                    placeholder="Tell us about your entrepreneurial goals..."
                    value={formData.goals}
                    onChange={(e) => updateFormData('goals', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Choose your theme */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <RadioGroup
                  value={formData.theme}
                  onValueChange={(value) => updateFormData('theme', value)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'light', name: 'Light', preview: 'bg-white text-black' },
                      { id: 'dark', name: 'Dark', preview: 'bg-gray-900 text-white' },
                      { id: 'modern', name: 'Modern', preview: 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' },
                      { id: 'classic', name: 'Classic', preview: 'bg-blue-50 text-blue-900' }
                    ].map((theme) => (
                      <div key={theme.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={theme.id} id={theme.id} />
                        <Label htmlFor={theme.id} className="flex-1">
                          <div className={`
                            p-4 rounded-lg border-2 cursor-pointer transition-colors
                            ${formData.theme === theme.id ? 'border-primary' : 'border-muted'}
                            ${theme.preview}
                          `}>
                            <div className="text-center font-medium">{theme.name}</div>
                            <div className="text-center text-sm opacity-75">Preview</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext}>
                {currentStep === steps.length ? 'Complete Setup' : 'Next'}
                {currentStep !== steps.length && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}