import React from 'react';
import LoadingSkeleton, { LessonSkeleton } from '../components/common/LoadingSkeleton';

// Composant de test simple pour valider LoadingSkeleton
export const SkeletonTest: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Test LoadingSkeleton</h1>
      
      {/* Test des variants */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Variants</h2>
        <LoadingSkeleton variant="default" width="300px" height="20px" />
        <LoadingSkeleton variant="card" width="300px" height="100px" />
        <LoadingSkeleton variant="text" width="200px" />
        <LoadingSkeleton variant="avatar" className="w-16 h-16" />
        <LoadingSkeleton variant="button" width="120px" height="44px" />
      </div>
      
      {/* Test LessonSkeleton complet */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Lesson Skeleton</h2>
        <LessonSkeleton />
      </div>
    </div>
  );
};

export default SkeletonTest;