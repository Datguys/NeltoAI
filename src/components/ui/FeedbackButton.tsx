import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FeedbackButtonProps {
  onFeedback: (feedback: 'thumbs-up' | 'thumbs-down') => Promise<boolean>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  onFeedback,
  className,
  size = 'sm'
}) => {
  const [feedback, setFeedback] = useState<'thumbs-up' | 'thumbs-down' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (type: 'thumbs-up' | 'thumbs-down') => {
    if (feedback) return; // Already provided feedback
    
    setIsSubmitting(true);
    const success = await onFeedback(type);
    
    if (success) {
      setFeedback(type);
    }
    setIsSubmitting(false);
  };

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (feedback) {
    return (
      <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
        {feedback === 'thumbs-up' ? (
          <>
            <ThumbsUp className={cn(iconSizes[size], "text-green-500")} />
            <span>Helpful</span>
          </>
        ) : (
          <>
            <ThumbsDown className={cn(iconSizes[size], "text-red-500")} />
            <span>Not helpful</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(sizeClasses[size], "p-0 hover:bg-green-100 hover:text-green-600")}
        onClick={() => handleFeedback('thumbs-up')}
        disabled={isSubmitting}
        title="This response was helpful"
      >
        <ThumbsUp className={iconSizes[size]} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(sizeClasses[size], "p-0 hover:bg-red-100 hover:text-red-600")}
        onClick={() => handleFeedback('thumbs-down')}
        disabled={isSubmitting}
        title="This response was not helpful"
      >
        <ThumbsDown className={iconSizes[size]} />
      </Button>
    </div>
  );
};