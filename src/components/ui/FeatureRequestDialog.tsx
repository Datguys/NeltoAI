import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Sparkles, TrendingUp, DollarSign, FileText, X } from 'lucide-react';

interface FeatureRequestDialogProps {
  open: boolean;
  onSubmit: (feature: string) => Promise<void>;
  onDismiss: () => void;
}

const FEATURE_OPTIONS = [
  {
    id: 'competitor-summary',
    title: 'Competitor Summary Generator',
    description: 'Ultra-only: Get a 150-word summary of top competitors in your space',
    icon: TrendingUp,
    tier: 'Ultra'
  },
  {
    id: 'market-validation',
    title: 'Market Validation Assistant',
    description: 'Ask users questions to help validate idea (target audience, pain points, competitors, monetization)',
    icon: Sparkles,
    tier: 'Pro'
  },
  {
    id: 'revenue-tracker',
    title: 'Revenue Tracker (Mock)',
    description: 'Input monthly $ estimates and track goals visually (not actual integrations)',
    icon: DollarSign,
    tier: 'Free'
  },
  {
    id: 'pdf-export',
    title: 'Save Business Summary to PDF',
    description: 'Export summary or timeline plan as branded mini-PDF',
    icon: FileText,
    tier: 'Pro'
  }
];

export const FeatureRequestDialog: React.FC<FeatureRequestDialogProps> = ({
  open,
  onSubmit,
  onDismiss
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedFeature) return;
    
    setIsSubmitting(true);
    await onSubmit(selectedFeature);
    setIsSubmitting(false);
    setSelectedFeature(null);
  };

  const handleDismiss = () => {
    setSelectedFeature(null);
    onDismiss();
  };

  return (
    <Dialog open={open} onOpenChange={handleDismiss}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Help Shape Our Platform!
              </DialogTitle>
              <DialogDescription className="mt-1">
                We've noticed this is your 5th visit! Which feature would you most like to see implemented?
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid gap-3 mt-4">
          {FEATURE_OPTIONS.map((feature) => {
            const Icon = feature.icon;
            const isSelected = selectedFeature === feature.id;
            
            return (
              <Card
                key={feature.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedFeature(feature.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-md ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{feature.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          feature.tier === 'Ultra' ? 'bg-purple-100 text-purple-700' :
                          feature.tier === 'Pro' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {feature.tier}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleDismiss}>
            Maybe later
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedFeature || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Request Feature'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};