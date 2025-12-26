import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingTextarea } from '@/components/onboarding/OnboardingTextarea';
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation';
import { motion } from 'framer-motion';

export default function OnboardingStep6() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [habitsFocus, setHabitsFocus] = useState('');
  const [healthFocus, setHealthFocus] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleNext = () => {
    sessionStorage.setItem('onboarding_habits', habitsFocus);
    sessionStorage.setItem('onboarding_health', healthFocus);
    navigate('/onboarding/step-7');
  };

  const handleBack = () => {
    navigate('/onboarding/step-5');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={7}
      title="What do you want to stay consistent with?"
      subtitle="These are the practices that shape who you become"
    >
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <OnboardingTextarea
          label="What habits do you want to practice regularly right now?"
          placeholder="Daily writing, learning something new, exercising 3x a week."
          value={habitsFocus}
          onChange={(e) => setHabitsFocus(e.target.value)}
        />

        <OnboardingTextarea
          label="Is there anything about your health or energy you want to improve? (optional)"
          placeholder="Better hydration, reducing screen time, managing stress better."
          helperText="This is completely optional. Skip if nothing comes to mind."
          value={healthFocus}
          onChange={(e) => setHealthFocus(e.target.value)}
        />
      </motion.div>

      <OnboardingNavigation
        onBack={handleBack}
        onNext={handleNext}
        disabled={!habitsFocus.trim()}
      />
    </OnboardingLayout>
  );
}
