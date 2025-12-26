import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingTextarea } from '@/components/onboarding/OnboardingTextarea';
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation';

export default function OnboardingStep4() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [dailyCapacity, setDailyCapacity] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleNext = () => {
    sessionStorage.setItem('onboarding_daily_capacity', dailyCapacity);
    navigate('/onboarding/step-5');
  };

  const handleBack = () => {
    navigate('/onboarding/step-3');
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
      currentStep={4}
      totalSteps={7}
      title="Let's be realistic"
      subtitle="Sustainable progress comes from knowing your limits"
    >
      <OnboardingTextarea
        label="How much focused time can you realistically give each day on average?"
        placeholder="Around 45 minutes on weekdays, less on weekends."
        helperText="Be honest. Small, consistent efforts are more powerful than unsustainable bursts."
        value={dailyCapacity}
        onChange={(e) => setDailyCapacity(e.target.value)}
      />

      <OnboardingNavigation
        onBack={handleBack}
        onNext={handleNext}
        disabled={!dailyCapacity.trim()}
      />
    </OnboardingLayout>
  );
}
