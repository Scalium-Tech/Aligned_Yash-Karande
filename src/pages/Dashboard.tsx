import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { IdentitySetup } from '@/components/dashboard/IdentitySetup';
import { YearlyQuarterlyGoal } from '@/components/dashboard/YearlyQuarterlyGoal';
import { AIWeeklyPlan } from '@/components/dashboard/AIWeeklyPlan';
import { MoodEnergyCheckin } from '@/components/dashboard/MoodEnergyCheckin';
import { WeeklyProgress } from '@/components/dashboard/WeeklyProgress';
import { IdentityScore } from '@/components/dashboard/IdentityScore';
import { ReflectionJournal } from '@/components/dashboard/ReflectionJournal';
import { FrictionAlerts } from '@/components/dashboard/FrictionAlerts';
import { WeeklyCoachSummary } from '@/components/dashboard/WeeklyCoachSummary';
import { FocusSessions } from '@/components/dashboard/FocusSessions';
import { GoalsChallenges } from '@/components/dashboard/GoalsChallenges';
import { NotificationsSection } from '@/components/dashboard/NotificationsSection';
import { SettingsSection } from '@/components/dashboard/SettingsSection';
import { WeeklyInsights } from '@/components/dashboard/WeeklyInsights';
import { DailyHabitsSection } from '@/components/dashboard/DailyHabitsSection';
import { useAIInsights } from '@/hooks/useAIInsights';
import { getUserStorageKey } from '@/lib/userStorage';
import { ProFeatureGate } from '@/components/ProFeatureGate';
import { useDashboardSupabase } from '@/hooks/useDashboardSupabase';

// Section components
function GoalsSection() {
  return <GoalsChallenges />;
}

function JournalSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ReflectionJournal />
      </div>
      <div className="space-y-6">
        <ProFeatureGate featureName="Weekly Coach Summary">
          <WeeklyCoachSummary />
        </ProFeatureGate>
        <ProFeatureGate featureName="Smart Insights">
          <FrictionAlerts />
        </ProFeatureGate>
      </div>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <WeeklyInsights />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyProgress />
        <IdentityScore />
      </div>
    </div>
  );
}

function FocusSection() {
  return <FocusSessions />;
}

// Removed - using imported NotificationsSection component

// Removed - using imported SettingsSection component

const sectionMeta: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your personalized command center' },
  habits: { title: 'Daily Habits', subtitle: 'Your non-negotiables and health tracking' },
  goals: { title: 'Goals & Challenges', subtitle: 'Track your 90-day challenges and milestones' },
  journal: { title: 'Reflection Journal', subtitle: 'AI-powered daily reflections' },
  analytics: { title: 'Analytics', subtitle: 'Track your progress and patterns' },
  focus: { title: 'Focus Sessions', subtitle: 'Deep work tracking and stats' },
  notifications: { title: 'Notifications', subtitle: 'Manage your reminders' },
  settings: { title: 'Settings', subtitle: 'Customize your experience' },
};

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { insights, loading: insightsLoading, isAligning, error, refetch } = useAIInsights(user?.id);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Use dashboard Supabase hook for custom weekly plan
  const { customWeeklyPlan, saveCustomWeeklyPlan } = useDashboardSupabase(user?.id);

  const handleWeeklyPlanUpdate = async (newPlan: { day: string; activity: string }[]) => {
    await saveCustomWeeklyPlan(newPlan);
  };
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (profile && !profile.onboarding_completed) {
        navigate('/onboarding/step-1');
      }
    }
  }, [user, profile, loading, navigate]);

  const handleLogout = async () => {
    const isPro = profile?.is_pro;
    await signOut();
    // Redirect free users to pricing, pro users to login
    navigate(isPro ? '/login' : '/#pricing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const currentMeta = sectionMeta[activeSection] || sectionMeta.dashboard;

  const renderSection = () => {
    switch (activeSection) {
      case 'habits':
        return (
          <ProFeatureGate featureName="Daily Habits">
            <DailyHabitsSection />
          </ProFeatureGate>
        );
      case 'goals':
        return (
          <ProFeatureGate featureName="Goals & Challenges">
            <GoalsSection />
          </ProFeatureGate>
        );
      case 'journal':
        return <JournalSection />;
      case 'analytics':
        return (
          <ProFeatureGate featureName="Analytics">
            <AnalyticsSection />
          </ProFeatureGate>
        );
      case 'focus':
        return (
          <ProFeatureGate featureName="Focus Sessions">
            <FocusSessions userIdentities={insights?.identities} />
          </ProFeatureGate>
        );
      case 'notifications':
        return <NotificationsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    if (insightsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
            <Sparkles className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-foreground font-medium">
              {isAligning ? "Your dashboard is aligning..." : "AI is analyzing your responses..."}
            </p>
            <p className="text-muted-foreground text-sm">
              Generating personalized insights from your onboarding.
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <p className="text-foreground font-medium">Unable to generate insights</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <Button onClick={refetch} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      );
    }

    if (!insights) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">No dashboard data available</p>
          <Button onClick={() => navigate('/onboarding/step-1')} variant="outline">
            Complete Onboarding
          </Button>
        </div>
      );
    }

    return (
      <>
        {/* AI Generated Notice */}
        {insights.is_ai_generated && insights.generated_at && (
          <div className="mb-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Personalized by AI based on your responses</span>
            <span className="text-border">•</span>
            <span>Generated {new Date(insights.generated_at).toLocaleTimeString()}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {/* Row 1 - Identity Setup is FREE */}
          <IdentitySetup
            identities={insights.identities}
            myWhy={insights.my_why}
            identitySummary={insights.identity_summary}
            onGetStarted={() => setActiveSection('goals')}
          />
          {/* Pro-only sections */}
          <ProFeatureGate featureName="Yearly & Quarterly Goals">
            <YearlyQuarterlyGoal
              yearlyGoalTitle={insights.yearly_goal_title}
              quarterlyGoals={insights.quarterly_goals}
              yourWhyDetail={insights.your_why_detail}
            />
          </ProFeatureGate>
          <ProFeatureGate featureName="AI Weekly Plan">
            <AIWeeklyPlan
              weeklyPlan={customWeeklyPlan || insights.weekly_plan}
              onPlanUpdate={handleWeeklyPlanUpdate}
            />
          </ProFeatureGate>

          {/* Row 2: Daily Check-in and Identity Score are FREE */}
          <MoodEnergyCheckin />
          <IdentityScore />
          {/* Weekly Progress is Pro */}
          <ProFeatureGate featureName="Weekly Progress">
            <WeeklyProgress />
          </ProFeatureGate>
        </div>
      </>
    );
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
      userName={profile.full_name}
      sectionTitle={currentMeta.title}
      sectionSubtitle={currentMeta.subtitle}
    >
      {renderSection()}
    </DashboardLayout>
  );
}
