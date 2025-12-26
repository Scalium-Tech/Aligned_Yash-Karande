import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingTextarea } from '@/components/onboarding/OnboardingTextarea';
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation';

export default function OnboardingStep3() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [yearlyGoal, setYearlyGoal] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleNext = () => {
    sessionStorage.setItem('onboarding_yearly_goal', yearlyGoal);
    navigate('/onboarding/step-4');
  };

  const handleBack = () => {
    navigate('/onboarding/step-2');
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
      currentStep={3}
      totalSteps={7}
      title="What do you want to achieve this year?"
      subtitle="One meaningful goal is more powerful than many scattered ones"
    >
      <OnboardingTextarea
        label="What is the single most important goal you want to achieve this year?"
        placeholder="Build a strong portfolio and get placed."
        helperText="Focus on what matters most. You can always refine this later."
        value={yearlyGoal}
        onChange={(e) => setYearlyGoal(e.target.value)}
      />

      <OnboardingNavigation
        onBack={handleBack}
        onNext={handleNext}
        disabled={!yearlyGoal.trim()}
      />
    </OnboardingLayout>
  );
}
