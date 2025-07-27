import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface OnboardingSurveyProps {
  onComplete: (answers: any) => void;
  onSkip: () => void;
}

const questions = [
  {
    key: 'referral',
    question: 'Where did you first hear about Founder Launch?',
    subheading: "Help us understand where our users come from so we can improve our marketing.",
    type: 'options',
    options: [
      'Instagram', 'YouTube', 'TikTok', 'Facebook', 'Friends/Colleagues', 'Google Search', 'Other'
    ]
  },
  {
    key: 'role',
    question: 'Which best describes you?',
    subheading: 'Knowing our audience helps us build the best features for you.',
    type: 'options',
    options: ['Entrepreneur', 'Student', 'Parent', 'Developer', 'Designer', 'Other']
  },
  {
    key: 'purpose',
    question: 'What will you use Founder Launch for?',
    subheading: 'Choose the main reason you signed up. This helps us improve your experience.',
    type: 'options',
    options: [
      'Launch a startup',
      'Validate a business idea',
      'Build an MVP',
      'Find cofounders or collaborators',
      'Learn entrepreneurship',
      'Grow my existing business',
      'Side project',
      'Other'
    ]
  },

  {
    key: 'theme',
    question: 'Choose your preferred theme (you can change this in settings later)',
    type: 'options',
    options: ['Original', 'Professional', 'Dark themed', 'Light themed']
  }
];

export function OnboardingSurvey({ onComplete, onSkip }: OnboardingSurveyProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');

  const current = questions[step];
  const isOptions = current.type === 'options';
  const isOther = isOptions && selected === 'Other';

  const canContinue = (selected && (selected !== 'Other' || !!otherText.trim()));

  const handleNext = () => {
    let answer = selected;
    if (isOther) answer = otherText;
    setAnswers({ ...answers, [current.key]: answer });
    setSelected(null);
    setOtherText('');
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({ ...answers, [current.key]: answer });
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/90">
      <div className="bg-background rounded-xl shadow-2xl p-8 max-w-xl w-full flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <span className="text-4xl">🎯</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground text-center mb-1">{current.question}</h2>
          {current.subheading && <div className="text-muted-foreground text-center text-sm mb-2">{current.subheading}</div>}
        </div>
        {isOptions ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-6">
            {current.options.map((opt: string) => (
              <button
                key={opt}
                className={`rounded-lg px-4 py-2 font-medium border transition-all duration-150 focus:outline-none ${selected === opt ? 'bg-primary text-white border-primary shadow-lg' : 'bg-card text-foreground border-border hover:border-primary'}`}
                onClick={() => setSelected(opt)}
                type="button"
              >
                {opt}
              </button>
            ))}
          </div>
        ) : null}
        {isOther && (
          <input
            className="w-full p-2 border rounded mb-4 bg-card text-foreground placeholder:text-muted-foreground"
            placeholder="Please specify..."
            value={otherText}
            onChange={e => setOtherText(e.target.value)}
            autoFocus
          />
        )}
        {/* Progress bar */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex gap-4 justify-end w-full">
          <Button variant="ghost" onClick={onSkip}>Skip</Button>
          <Button onClick={handleNext} disabled={!canContinue}>Continue</Button>
        </div>
      </div>
    </div>
  );
}
