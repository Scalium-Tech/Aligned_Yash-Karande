import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingTextarea } from '@/components/onboarding/OnboardingTextarea';
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation';
import { motion } from 'framer-motion';

export default function OnboardingStep5() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sleepDefinition, setSleepDefinition] = useState('');
  const [bodyCare, setBodyCare] = useState('');
  const [selfCarePractice, setSelfCarePractice] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleNext = () => {
    sessionStorage.setItem('onboarding_sleep', sleepDefinition);
    sessionStorage.setItem('onboarding_body_care', bodyCare);
    sessionStorage.setItem('onboarding_self_care', selfCarePractice);
    navigate('/onboarding/step-6');
  };

  const handleBack = () => {
    navigate('/onboarding/step-4');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isComplete = sleepDefinition.trim() && bodyCare.trim() && selfCarePractice.trim();

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={7}
      title="Protect your energy"
      subtitle="Your daily non-negotiables are the foundation of everything else"
    >
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <OnboardingTextarea
          label="What does good sleep look like for you on most days?"
          placeholder="7-8 hours, no screens an hour before bed, waking up naturally."
          value={sleepDefinition}
          onChange={(e) => setSleepDefinition(e.target.value)}
        />

        <OnboardingTextarea
          label="How do you want to take care of your body daily?"
          placeholder="A short walk, stretching, staying hydrated, eating at regular times."
          value={bodyCare}
          onChange={(e) => setBodyCare(e.target.value)}
        />

        <OnboardingTextarea
          label="What is one small self-care practice you want to protect daily?"
          placeholder="10 minutes of reading, journaling, or just sitting quietly."
          value={selfCarePractice}
          onChange={(e) => setSelfCarePractice(e.target.value)}
        />
      </motion.div>

      <OnboardingNavigation
        onBack={handleBack}
        onNext={handleNext}
        disabled={!isComplete}
      />
    </OnboardingLayout>
  );
}
