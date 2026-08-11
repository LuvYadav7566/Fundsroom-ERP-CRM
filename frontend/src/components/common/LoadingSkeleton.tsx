import React from 'react';

interface SkeletonProps {
  height?: string;
  width?: string;
  count?: number;
  borderRadius?: string;
}

export const LoadingSkeleton: React.FC<SkeletonProps> = ({
  height = '20px',
  width = '100%',
  count = 1,
  borderRadius = 'var(--radius-sm)',
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton"
          style={{ height, width, borderRadius }}
        />
      ))}
    </div>
  );
};
