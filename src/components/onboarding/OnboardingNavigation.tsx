import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface OnboardingNavigationProps {
  onBack?: () => void;
  onNext: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  disabled?: boolean;
}

export function OnboardingNavigation({
  onBack,
  onNext,
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
  nextLabel,
  disabled = false
}: OnboardingNavigationProps) {
  return (
    <motion.div 
      className="flex items-center justify-between mt-10 pt-8 border-t border-border/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {!isFirstStep && onBack ? (
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      ) : (
        <div />
      )}

      <Button
        onClick={onNext}
        disabled={isLoading || disabled}
        className="gap-2 px-8 py-6 text-base bg-gradient-to-r from-primary to-violet hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Please wait...
          </>
        ) : (
          <>
            {nextLabel || (isLastStep ? 'Complete Setup' : 'Continue')}
            {!isLastStep && <ArrowRight className="w-4 h-4" />}
          </>
        )}
      </Button>
    </motion.div>
  );
}
