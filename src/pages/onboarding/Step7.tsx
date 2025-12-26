import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingTextarea } from '@/components/onboarding/OnboardingTextarea';
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export default function OnboardingStep7() {
  const { user, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [frictionTriggers, setFrictionTriggers] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Gather all onboarding data from session storage
      const onboardingData = {
        identity_statement: sessionStorage.getItem('onboarding_identity') || '',
        purpose_why: sessionStorage.getItem('onboarding_purpose') || '',
        yearly_goal: sessionStorage.getItem('onboarding_yearly_goal') || '',
        daily_time_capacity: sessionStorage.getItem('onboarding_daily_capacity') || '',
        sleep_definition: sessionStorage.getItem('onboarding_sleep') || '',
        body_care: sessionStorage.getItem('onboarding_body_care') || '',
        self_care_practice: sessionStorage.getItem('onboarding_self_care') || '',
        habits_focus: sessionStorage.getItem('onboarding_habits') || '',
        health_focus: sessionStorage.getItem('onboarding_health') || '',
        friction_triggers: frictionTriggers,
      };

      // Insert or update user_identity table
      const { error: identityError } = await supabase
        .from('user_identity')
        .upsert({
          id: user.id,
          ...onboardingData,
          updated_at: new Date().toISOString(),
        });

      if (identityError) {
        console.error('Error saving identity:', identityError);
        throw identityError;
      }

      // Update profiles to mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      // Clear session storage
      sessionStorage.removeItem('onboarding_identity');
      sessionStorage.removeItem('onboarding_purpose');
      sessionStorage.removeItem('onboarding_yearly_goal');
      sessionStorage.removeItem('onboarding_daily_capacity');
      sessionStorage.removeItem('onboarding_sleep');
      sessionStorage.removeItem('onboarding_body_care');
      sessionStorage.removeItem('onboarding_self_care');
      sessionStorage.removeItem('onboarding_habits');
      sessionStorage.removeItem('onboarding_health');

      // Refresh profile to update auth context
      await refreshProfile();

      toast({
        title: "You're all set!",
        description: "Your personal space is ready. Welcome to Aligned.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again. Your answers have been saved.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/step-6');
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
      currentStep={7}
      totalSteps={7}
      title="What usually holds you back?"
      subtitle="Self-awareness is the first step to overcoming obstacles"
    >
      <OnboardingTextarea
        label="When you fall off track, what usually causes it?"
        placeholder="Overplanning, low energy, stress, distractions, perfectionism."
        helperText="Knowing your patterns helps us support you better on hard days."
        value={frictionTriggers}
        onChange={(e) => setFrictionTriggers(e.target.value)}
      />

      <OnboardingNavigation
        onBack={handleBack}
        onNext={handleComplete}
        isLastStep
        isLoading={isSubmitting}
        disabled={!frictionTriggers.trim()}
        nextLabel="Complete Setup"
      />
    </OnboardingLayout>
  );
}
