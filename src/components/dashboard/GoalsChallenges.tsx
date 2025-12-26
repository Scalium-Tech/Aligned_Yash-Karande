import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Plus, CheckCircle2, Trophy, Calendar, Flame,
    Award, Trash2, X, Sparkles, Loader2, Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoals } from '@/hooks/useGoals';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useJournal } from '@/hooks/useJournal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Confetti from 'react-confetti';

interface UserIdentity {
    identity_statement?: string;
    purpose_why?: string;
    yearly_goal?: string;
    daily_time_capacity?: string;
    habits_focus?: string;
    health_focus?: string;
    friction_triggers?: string;
}

interface WeekPlan {
    week: string;  // e.g., "Week 1 (Days 1-7)"
    focus: string; // Main focus for this week
    activities: string[];
}

interface SuggestedChallenge {
    title: string;
    description: string;
    dailyActions: string[];
    weeklyPlan?: WeekPlan[];
}

export function GoalsChallenges() {
    const {
        createChallenge,
        checkInChallenge,
        deleteChallenge,
        checkAllBadges,
        getActiveChallenges,
        getCompletedChallenges,
        getEarnedBadges,
        getUnearnedBadges,
        showCelebration,
        celebrationMessage,
        dismissCelebration,
    } = useGoals();

    const { analytics } = useAnalytics();
    const { journal } = useJournal();
    const { user } = useAuth();

    const [showNewChallenge, setShowNewChallenge] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newDays, setNewDays] = useState(90);

    // AI Challenge Generation State
    const [userIdentity, setUserIdentity] = useState<UserIdentity | null>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [suggestedChallenge, setSuggestedChallenge] = useState<SuggestedChallenge | null>(null);
    const [showAIChallenge, setShowAIChallenge] = useState(false);
    const [aiDays, setAiDays] = useState(30);

    // Weekly Plan Modal State
    const [showWeeklyPlanModal, setShowWeeklyPlanModal] = useState(false);
    const [selectedChallengeWeeklyPlan, setSelectedChallengeWeeklyPlan] = useState<{ title: string; plan: WeekPlan[]; currentWeek: number } | null>(null);

    const activeChallenges = getActiveChallenges();
    const completedChallenges = getCompletedChallenges();
    const earnedBadges = getEarnedBadges();
    const unearnedBadges = getUnearnedBadges();

    // Fetch user identity data from Supabase
    useEffect(() => {
        const fetchUserIdentity = async () => {
            if (!user?.id) return;

            try {
                const { data, error } = await supabase
                    .from('user_identity')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    setUserIdentity(data);
                }
            } catch (err) {
                console.error('Error fetching user identity:', err);
            }
        };

        fetchUserIdentity();
    }, [user?.id]);

    // Check badges on load
    useEffect(() => {
        checkAllBadges({
            streak: analytics.currentStreak,
            focus: analytics.totalFocusMinutes,
            tasks: analytics.totalTasksCompleted,
            journal: journal.entries.length,
        });
    }, [analytics, journal, checkAllBadges]);

    // Generate AI Challenge based on user's onboarding data
    const generateAIChallenge = async (days: number = aiDays) => {
        if (!userIdentity) {
            toast.error('Complete onboarding first to get personalized challenges');
            return;
        }

        setIsGeneratingAI(true);
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

        if (!apiKey) {
            // Fallback challenge
            setSuggestedChallenge({
                title: `${days}-Day Identity Challenge`,
                description: `Become the person you want to be through ${days} days of consistent action.`,
                dailyActions: [
                    'Complete one task aligned with your identity',
                    'Reflect on your progress for 5 minutes',
                    'Do one thing outside your comfort zone',
                ],
            });
            setShowAIChallenge(true);
            setIsGeneratingAI(false);
            return;
        }

        const numWeeks = Math.ceil(days / 7);

        try {
            const prompt = `You are a personal development coach. Based on the user's profile, create a personalized ${days}-day challenge with a detailed week-by-week plan.

User Profile:
- Identity Goal: "${userIdentity.identity_statement || 'Becoming their best self'}"
- Purpose/Why: "${userIdentity.purpose_why || 'Personal growth'}"
- Yearly Goal: "${userIdentity.yearly_goal || 'Self improvement'}"
- Daily Capacity: "${userIdentity.daily_time_capacity || '1-2 hours'}"
- Habits Focus: "${userIdentity.habits_focus || 'Building good habits'}"
- Health Focus: "${userIdentity.health_focus || 'Overall wellness'}"
- Friction Points: "${userIdentity.friction_triggers || 'Procrastination'}"

Create a ${days}-day challenge (${numWeeks} weeks) that:
1. Aligns with their identity goal
2. Is achievable given their daily time capacity
3. Addresses their friction points
4. Builds momentum progressively week by week

Return ONLY valid JSON in this exact format:
{
  "title": "Challenge name (max 40 chars)",
  "description": "One sentence explaining the challenge goal",
  "dailyActions": ["Daily action 1", "Daily action 2", "Daily action 3"],
  "weeklyPlan": [
    {"week": "Week 1", "focus": "Foundation & Habits", "activities": ["Activity for week 1", "Another activity"]},
    {"week": "Week 2", "focus": "Building Momentum", "activities": ["Activity for week 2", "Another activity"]}
  ]
}

Generate exactly ${numWeeks} weeks in the weeklyPlan array.
Make each week progressively build on the previous.
Keep activities concise and actionable.
Return only JSON.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

                // Clean up JSON response
                if (text.startsWith('```json')) text = text.slice(7);
                if (text.startsWith('```')) text = text.slice(3);
                if (text.endsWith('```')) text = text.slice(0, -3);
                text = text.trim();

                const challenge = JSON.parse(text);
                setSuggestedChallenge(challenge);
                setShowAIChallenge(true);
            }
        } catch (error) {
            console.error('Error generating AI challenge:', error);
            toast.error('Failed to generate challenge. Please try again.');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const acceptAIChallenge = () => {
        if (!suggestedChallenge) return;

        // Build description with daily actions
        let description = `${suggestedChallenge.description}\n\nDaily Actions:\n${suggestedChallenge.dailyActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;

        // Add weekly plan as JSON marker if available
        if (suggestedChallenge.weeklyPlan && suggestedChallenge.weeklyPlan.length > 0) {
            description += `\n\n<!-- WEEKLY_PLAN_JSON:${JSON.stringify(suggestedChallenge.weeklyPlan)} -->`;
        }

        createChallenge(suggestedChallenge.title, description, aiDays);

        toast.success('Challenge created!', {
            description: `Your ${aiDays}-day challenge has started.`,
        });

        setSuggestedChallenge(null);
        setShowAIChallenge(false);
    };

    const handleCreateChallenge = () => {
        if (!newTitle.trim()) return;
        createChallenge(newTitle, newDescription, newDays);
        setNewTitle('');
        setNewDescription('');
        setNewDays(90);
        setShowNewChallenge(false);
    };

    const getTodayKey = () => new Date().toISOString().split('T')[0];
    const hasCheckedInToday = (challenge: ReturnType<typeof getActiveChallenges>[0]) => {
        return challenge.checkIns.includes(getTodayKey());
    };

    return (
        <div className="space-y-6">
            {/* Celebration Overlay */}
            <AnimatePresence>
                {showCelebration && (
                    <>
                        <Confetti
                            width={window.innerWidth}
                            height={window.innerHeight}
                            recycle={false}
                            numberOfPieces={500}
                        />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                            onClick={dismissCelebration}
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="bg-card rounded-2xl p-8 max-w-md mx-4 text-center"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Challenge Complete!</h2>
                                <p className="text-muted-foreground mb-6">{celebrationMessage}</p>
                                <Button onClick={dismissCelebration} className="bg-gradient-to-r from-primary to-violet">
                                    Celebrate!
                                </Button>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Active Challenges */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Active Challenges</h3>
                            <p className="text-xs text-muted-foreground">Build consistency with 30, 60, or 90 day challenges</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                setShowAIChallenge(true);
                                if (!suggestedChallenge) generateAIChallenge();
                            }}
                            size="sm"
                            variant="outline"
                            disabled={isGeneratingAI}
                            className="border-primary/30"
                        >
                            {isGeneratingAI ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <Wand2 className="w-4 h-4 mr-1" />
                            )}
                            AI Generate
                        </Button>
                        <Button
                            onClick={() => setShowNewChallenge(true)}
                            size="sm"
                            className="bg-gradient-to-r from-primary to-violet"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            New Challenge
                        </Button>
                    </div>
                </div>

                {/* AI Suggested Challenge */}
                <AnimatePresence>
                    {showAIChallenge && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-violet/10 border border-primary/20"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    <h4 className="font-medium text-foreground">AI-Suggested Challenge</h4>
                                </div>
                                <button onClick={() => setShowAIChallenge(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Duration Selector */}
                            <div className="flex gap-2 mb-4">
                                <span className="text-sm text-muted-foreground mr-2">Duration:</span>
                                {[30, 60, 90].map(days => (
                                    <button
                                        key={days}
                                        onClick={() => {
                                            setAiDays(days);
                                            setSuggestedChallenge(null);
                                            generateAIChallenge(days);
                                        }}
                                        disabled={isGeneratingAI}
                                        className={`px-3 py-1 rounded-lg text-sm transition-all ${aiDays === days
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {days} days
                                    </button>
                                ))}
                            </div>

                            {isGeneratingAI ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                                    <span className="text-muted-foreground">Generating personalized challenge...</span>
                                </div>
                            ) : suggestedChallenge ? (
                                <div className="space-y-3">
                                    <div>
                                        <h5 className="font-semibold text-foreground text-lg">{suggestedChallenge.title}</h5>
                                        <p className="text-sm text-muted-foreground">{suggestedChallenge.description}</p>
                                    </div>

                                    <div className="bg-background/50 rounded-lg p-3">
                                        <p className="text-xs font-medium text-foreground mb-2">Daily Actions:</p>
                                        <ul className="space-y-1">
                                            {suggestedChallenge.dailyActions.map((action, i) => (
                                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Weekly Plan Breakdown */}
                                    {suggestedChallenge.weeklyPlan && suggestedChallenge.weeklyPlan.length > 0 && (
                                        <div className="bg-background/50 rounded-lg p-3">
                                            <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-primary" />
                                                Weekly Plan ({aiDays} days):
                                            </p>
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                                {suggestedChallenge.weeklyPlan.map((week, i) => (
                                                    <div key={i} className="border-l-2 border-primary/30 pl-3 py-1">
                                                        <p className="text-xs font-semibold text-primary">{week.week}</p>
                                                        <p className="text-xs text-foreground">{week.focus}</p>
                                                        <ul className="mt-1">
                                                            {week.activities.map((activity, j) => (
                                                                <li key={j} className="text-xs text-muted-foreground">• {activity}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <Button onClick={acceptAIChallenge} className="flex-1 bg-gradient-to-r from-primary to-violet">
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Start {aiDays}-Day Challenge
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setSuggestedChallenge(null);
                                                generateAIChallenge(aiDays);
                                            }}
                                            variant="outline"
                                            disabled={isGeneratingAI}
                                        >
                                            <Wand2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground">Complete onboarding to get personalized AI challenges</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* New Challenge Form */}
                <AnimatePresence>
                    {showNewChallenge && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-4 rounded-xl bg-secondary/30 border border-border/50"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-foreground">Create Custom Challenge</h4>
                                <button onClick={() => setShowNewChallenge(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Challenge title (e.g., Daily Meditation)"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Description (optional)"
                                value={newDescription}
                                onChange={e => setNewDescription(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground mb-2"
                            />
                            <div className="flex gap-2 mb-3">
                                {[30, 60, 90].map(days => (
                                    <button
                                        key={days}
                                        onClick={() => setNewDays(days)}
                                        className={`px-3 py-1 rounded-lg text-sm ${newDays === days
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary/50 text-muted-foreground'
                                            }`}
                                    >
                                        {days} days
                                    </button>
                                ))}
                            </div>
                            <Button onClick={handleCreateChallenge} disabled={!newTitle.trim()} className="w-full">
                                Start Challenge
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Challenges List */}
                {activeChallenges.length === 0 ? (
                    <div className="text-center py-8">
                        <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">No active challenges</p>
                        <p className="text-sm text-muted-foreground">Start a 90-day challenge to transform your habits</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeChallenges.map(challenge => {
                            const progress = (challenge.daysCompleted / challenge.totalDays) * 100;
                            const checkedToday = hasCheckedInToday(challenge);

                            // Calculate current week based on days completed
                            const currentWeekNumber = Math.floor(challenge.daysCompleted / 7) + 1;

                            // Parse weekly plan from description if available
                            let weeklyPlan: WeekPlan[] = [];
                            const weeklyPlanMatch = challenge.description?.match(/<!-- WEEKLY_PLAN_JSON:(.+?) -->/);
                            if (weeklyPlanMatch) {
                                try {
                                    weeklyPlan = JSON.parse(weeklyPlanMatch[1]);
                                } catch (e) {
                                    console.error('Error parsing weekly plan:', e);
                                }
                            }

                            const currentWeek = weeklyPlan[currentWeekNumber - 1];

                            return (
                                <motion.div
                                    key={challenge.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 rounded-xl bg-secondary/30 border border-border/50"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-foreground">{challenge.title}</h4>
                                            {challenge.description && (
                                                <div className="mt-2">
                                                    {/* Parse description to show daily actions nicely */}
                                                    {challenge.description.includes('Daily Actions:') ? (
                                                        <div className="space-y-2">
                                                            <p className="text-sm text-muted-foreground">
                                                                {challenge.description.split('\n\nDaily Actions:')[0]}
                                                            </p>

                                                            {/* Current Week's Focus */}
                                                            {currentWeek && (
                                                                <div className="p-3 bg-gradient-to-r from-primary/10 to-violet/10 rounded-lg border border-primary/20">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <p className="text-xs font-semibold text-primary flex items-center gap-1">
                                                                            <Calendar className="w-3 h-3" />
                                                                            {currentWeek.week} Focus:
                                                                        </p>
                                                                        {weeklyPlan.length > 1 && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedChallengeWeeklyPlan({
                                                                                        title: challenge.title,
                                                                                        plan: weeklyPlan,
                                                                                        currentWeek: currentWeekNumber
                                                                                    });
                                                                                    setShowWeeklyPlanModal(true);
                                                                                }}
                                                                                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                                                                                title="View all weeks"
                                                                            >
                                                                                <Calendar className="w-3 h-3" />
                                                                                View All
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm font-medium text-foreground">{currentWeek.focus}</p>
                                                                    <ul className="mt-2 space-y-1">
                                                                        {currentWeek.activities.map((activity, i) => (
                                                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                                                                <span className="text-primary">•</span> {activity}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            <div className="mt-2 p-3 bg-background/50 rounded-lg border border-border/30">
                                                                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                                                                    <Sparkles className="w-3 h-3 text-primary" />
                                                                    Today's Actions:
                                                                </p>
                                                                <ul className="space-y-1">
                                                                    {challenge.description
                                                                        .split('Daily Actions:\n')[1]
                                                                        ?.split('\n')
                                                                        .filter(line => line.trim() && !line.includes('WEEKLY_PLAN_JSON'))
                                                                        .map((action, i) => (
                                                                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                                                <span>{action.replace(/^\d+\.\s*/, '')}</span>
                                                                            </li>
                                                                        ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteChallenge(challenge.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                            <span>Day {challenge.daysCompleted} of {challenge.totalDays}</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.5 }}
                                                className="h-full bg-gradient-to-r from-primary to-violet rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Check In Button */}
                                    <Button
                                        onClick={() => checkInChallenge(challenge.id)}
                                        disabled={checkedToday}
                                        variant={checkedToday ? 'outline' : 'default'}
                                        size="sm"
                                        className={checkedToday ? '' : 'bg-emerald-600 hover:bg-emerald-700'}
                                    >
                                        {checkedToday ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                Checked In Today
                                            </>
                                        ) : (
                                            <>
                                                <Flame className="w-4 h-4 mr-1" />
                                                Check In
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Badges */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Badges</h3>
                        <p className="text-xs text-muted-foreground">{earnedBadges.length} of {earnedBadges.length + unearnedBadges.length} earned</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {earnedBadges.map(badge => (
                        <motion.div
                            key={badge.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                            title={`${badge.name}: ${badge.description}`}
                        >
                            <span className="text-2xl mb-1">{badge.icon}</span>
                            <span className="text-xs text-center font-medium text-foreground">{badge.name}</span>
                        </motion.div>
                    ))}
                    {unearnedBadges.map(badge => (
                        <div
                            key={badge.id}
                            className="flex flex-col items-center p-3 rounded-xl bg-secondary/30 border border-border/30 opacity-40"
                            title={`${badge.name}: ${badge.description}`}
                        >
                            <span className="text-2xl mb-1 grayscale">{badge.icon}</span>
                            <span className="text-xs text-center text-muted-foreground">???</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Completed Challenges</h3>
                            <p className="text-xs text-muted-foreground">{completedChallenges.length} challenges conquered</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {completedChallenges.map(challenge => (
                            <div
                                key={challenge.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                            >
                                <div className="flex items-center gap-3">
                                    <Trophy className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <p className="font-medium text-foreground">{challenge.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Completed on {new Date(challenge.completedAt!).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-emerald-500">{challenge.totalDays} days</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Weekly Plan Modal */}
            <AnimatePresence>
                {showWeeklyPlanModal && selectedChallengeWeeklyPlan && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowWeeklyPlanModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-border"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">{selectedChallengeWeeklyPlan.title}</h2>
                                    <p className="text-sm text-muted-foreground">Complete Weekly Plan</p>
                                </div>
                                <button
                                    onClick={() => setShowWeeklyPlanModal(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {selectedChallengeWeeklyPlan.plan.map((week, i) => (
                                    <div
                                        key={i}
                                        className={`p-4 rounded-xl border ${i + 1 === selectedChallengeWeeklyPlan.currentWeek
                                                ? 'bg-gradient-to-r from-primary/20 to-violet/20 border-primary/40'
                                                : 'bg-secondary/30 border-border/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-semibold text-primary flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {week.week}
                                            </p>
                                            {i + 1 === selectedChallengeWeeklyPlan.currentWeek && (
                                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-foreground mb-2">{week.focus}</p>
                                        <ul className="space-y-1">
                                            {week.activities.map((activity, j) => (
                                                <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                                    <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                                    {activity}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => setShowWeeklyPlanModal(false)}
                                className="w-full mt-4"
                                variant="outline"
                            >
                                Close
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
