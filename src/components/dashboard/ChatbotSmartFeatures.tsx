import { Button } from '@/components/ui/button';
import { useProjects, Project } from './Features/YourProject';
import { useState } from 'react';
import { Sparkles, FileText, BarChart, Briefcase, Lightbulb, Gavel, PlusCircle, ArrowRightCircle } from 'lucide-react';

export interface CommandButton {
  label: string;
  icon: React.ReactNode;
  action: string;
}

const COMMAND_BUTTONS: CommandButton[] = [
  { label: 'Generate Startup Idea', icon: <Lightbulb className="w-4 h-4 mr-2" />, action: 'startup-idea' },
  { label: 'Summarize My Business Plan', icon: <FileText className="w-4 h-4 mr-2" />, action: 'summarize-plan' },
  { label: 'Estimate My Monthly Revenue', icon: <BarChart className="w-4 h-4 mr-2" />, action: 'estimate-revenue' },
  { label: 'Draft a Pitch Deck', icon: <Briefcase className="w-4 h-4 mr-2" />, action: 'draft-pitch-deck' },
  { label: 'Refine My Idea', icon: <Sparkles className="w-4 h-4 mr-2" />, action: 'refine-idea' },
  { label: 'Check Legal Requirements', icon: <Gavel className="w-4 h-4 mr-2" />, action: 'check-legal' },
];

export function ChatbotCommandBar({ onCommand, loading }: { onCommand: (action: string) => void, loading: boolean }) {
  return (
    <div className="flex flex-wrap gap-2 py-3 px-2 bg-transparent">
      {COMMAND_BUTTONS.map((cmd) => (
        <Button
          key={cmd.action}
          variant="secondary"
          size="sm"
          className="flex items-center gap-1 rounded-full shadow glow-primary"
          onClick={() => onCommand(cmd.action)}
          disabled={loading}
        >
          {cmd.icon}
          {cmd.label}
        </Button>
      ))}
    </div>
  );
}



export function ChatbotDynamicSuggestions({ suggestions, onSuggestion }: { suggestions: { label: string, action: string }[], onSuggestion: (action: string) => void }) {
  if (!suggestions.length) return null;
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {suggestions.map((s) => (
        <Button
          key={s.action}
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => onSuggestion(s.action)}
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
