import { forwardRef, useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
}

export const OnboardingTextarea = forwardRef<HTMLTextAreaElement, OnboardingTextareaProps>(
  ({ label, helperText, className, id, name, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const textareaName = name || textareaId;

    return (
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <label htmlFor={textareaId} className="block text-foreground font-medium">{label}</label>
        <textarea
          ref={ref}
          id={textareaId}
          name={textareaName}
          className={cn(
            "w-full min-h-[120px] px-5 py-4 rounded-2xl",
            "bg-background/60 border-2 border-border/50",
            "text-foreground placeholder:text-muted-foreground/60",
            "focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
            "transition-all duration-300 resize-none",
            "text-base leading-relaxed",
            className
          )}
          {...props}
        />
        {helperText && (
          <p className="text-sm text-muted-foreground/80 italic">{helperText}</p>
        )}
      </motion.div>
    );
  }
);

OnboardingTextarea.displayName = 'OnboardingTextarea';

