import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-in';
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  animation = 'fade-up',
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  const animationClasses = {
    'fade-up': 'animate-fade-up',
    'fade-in': 'animate-fade-in',
    'slide-left': 'animate-slide-in-left',
    'slide-right': 'animate-slide-in-right',
    'scale-in': 'animate-scale-in',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'opacity-0',
        isVisible && animationClasses[animation],
        className
      )}
      style={{
        animationDelay: isVisible ? `${delay}ms` : '0ms',
        animationFillMode: 'forwards',
      }}
    >
      {children}
    </div>
  );
}
