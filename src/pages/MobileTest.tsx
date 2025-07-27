import React from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';

export default function MobileTestPage() {
  return (
    <div className="min-h-screen">
      <div className="text-center p-4 bg-primary/10 text-primary text-sm">
        📱 Mobile Layout Test - Force mobile view
      </div>
      <MobileLayout />
    </div>
  );
}