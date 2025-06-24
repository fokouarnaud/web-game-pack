import React, { useEffect, useRef } from 'react';

interface AutoScrollContainerProps {
  children: React.ReactNode;
  shouldScroll: boolean;
  className?: string;
}

export const AutoScrollContainer: React.FC<AutoScrollContainerProps> = ({
  children,
  shouldScroll,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldScroll && containerRef.current) {
      const timer = setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldScroll]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};