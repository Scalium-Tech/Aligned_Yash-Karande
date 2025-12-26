import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingTextarea } from '@/components/onboarding/OnboardingTextarea';
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation';

export default function OnboardingStep1() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [identityStatement, setIdentityStatement] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleNext = () => {
    // Store in session for now, will save to Supabase later
    sessionStorage.setItem('onboarding_identity', identityStatement);
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
      currentStep={1}
      totalSteps={7}
      title="Who are you working toward becoming?"
      subtitle="Let's start by exploring your aspirations"
    >
      <OnboardingTextarea
        label="Describe the version of yourself you are trying to become."
        placeholder="A focused person who finishes what they start without burning out."
        helperText="There's no right or wrong answer. Just share what feels true to you."
        value={identityStatement}
        onChange={(e) => setIdentityStatement(e.target.value)}
      />

      <OnboardingNavigation
        onNext={handleNext}
        isFirstStep
        disabled={!identityStatement.trim()}
      />
    </OnboardingLayout>
  );
}
