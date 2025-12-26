import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingTextarea } from '@/components/onboarding/OnboardingTextarea';
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation';

export default function OnboardingStep2() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [purposeWhy, setPurposeWhy] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleNext = () => {
    sessionStorage.setItem('onboarding_purpose', purposeWhy);
    navigate('/onboarding/step-3');
  };

  const handleBack = () => {
    navigate('/onboarding/step-1');
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
      currentStep={2}
      totalSteps={7}
      title="Why does this matter to you?"
      subtitle="Understanding your 'why' helps you stay aligned"
    >
      <OnboardingTextarea
        label="Why does becoming this version of yourself matter in your life right now?"
        placeholder="To feel confident, reduce stress, and build a better future."
        helperText="Your motivation is personal. Be honest with yourself."
        value={purposeWhy}
        onChange={(e) => setPurposeWhy(e.target.value)}
      />

      <OnboardingNavigation
        onBack={handleBack}
        onNext={handleNext}
        disabled={!purposeWhy.trim()}
      />
    </OnboardingLayout>
  );
}
