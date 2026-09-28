import React from 'react';
import PageTransition from '../components/PageTransition';
import { Card } from '../components/ui/Card';

export default function Nutrition() {
  return (
    <PageTransition>
      <div className="p-4 pb-28 max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold pt-2">Food & Protein</h1>
        <Card className="p-6 text-center text-xs text-[var(--color-text-secondary)]">
          Food tracker will be implemented in Stage 4.
        </Card>
      </div>
    </PageTransition>
  );
}
