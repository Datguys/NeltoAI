import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface FeatureRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (feature: string) => void;
}

export function FeatureRequestModal({ open, onClose, onSubmit }: FeatureRequestModalProps) {
  const [feature, setFeature] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (feature.trim().length > 0) {
      onSubmit(feature);
      setSubmitted(true);
      setTimeout(() => {
        setFeature('');
        setSubmitted(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>What features would you like to see?</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="text-success text-center py-6">Thank you for your feedback!</div>
        ) : (
          <>
            <Textarea
              value={feature}
              onChange={e => setFeature(e.target.value)}
              placeholder="Describe a feature you'd love to see added..."
              className="min-h-[100px]"
              autoFocus
            />
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={feature.trim().length === 0}>
                Submit
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
