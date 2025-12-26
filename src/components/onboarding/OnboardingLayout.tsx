import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

export function OnboardingLayout({ 
  children, 
  currentStep, 
  totalSteps, 
  title,
  subtitle 
}: OnboardingLayoutProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex flex-col">
      {/* Header with Logo */}
      <header className="py-6 px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <span className="font-semibold text-xl text-foreground">Aligned</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-violet rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <motion.div 
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Title Section */}
            <div className="text-center mb-10">
              <motion.h1 
                className="text-2xl md:text-3xl font-bold text-foreground mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.h1>
              {subtitle && (
                <motion.p 
                  className="text-muted-foreground text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>

            {/* Content */}
            {children}
          </div>
        </motion.div>
      </main>

      {/* Ambient Glow Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
