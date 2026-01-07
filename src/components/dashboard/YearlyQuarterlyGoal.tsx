import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Check, Sparkles, ChevronDown, ChevronUp, Calendar, Eye, X, CheckCircle2, Circle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalyticsSupabase } from '@/hooks/useAnalyticsSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStorageKey } from '@/lib/userStorage';

interface DayActivity {
    day: string;
    activity?: string; // Legacy format
    task?: string;     // New format - task title
    description?: string; // New format - detailed description
}

interface WeeklyPlanItem {
    week: string;
    focus: string;
    days?: DayActivity[];
}

interface QuarterlyGoal {
    quarter: string;
    goal: string;
    weeklyPlan?: WeeklyPlanItem[];
}

interface YearlyQuarterlyGoalProps {
    yearlyGoalTitle: string;
    quarterlyGoals: QuarterlyGoal[];
    yourWhyDetail: string;
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COMPLETIONS_KEY = 'aligned_quarterly_completions';

// Generate weekly plan for a quarter with daily breakdown
function generateWeeklyPlan(quarterGoal: string, quarterNum: number): WeeklyPlanItem[] {
    const weeks: WeeklyPlanItem[] = [];
    const startWeek = (quarterNum - 1) * 13 + 1;

    for (let i = 0; i < 13; i++) {
        const weekNum = startWeek + i;
        let focus = '';
        let dailyActivities: string[] = [];

        if (i < 4) {
            focus = 'Foundation & learning phase';
            dailyActivities = [
                'Research & study materials',
                'Watch tutorials/courses',
                'Take notes & practice',
                'Review concepts',
                'Small practice project',
                'Rest & reflect',
                'Plan next week'
            ];
        } else if (i < 8) {
            focus = 'Building & practicing skills';
            dailyActivities = [
                'Work on main project',
                'Practice core skills',
                'Build features',
                'Debug & improve',
                'Complete milestone',
                'Rest & reflect',
                'Plan next week'
            ];
        } else if (i < 11) {
            focus = 'Refining & improving';
            dailyActivities = [
                'Polish existing work',
                'Optimize & refine',
                'Get feedback',
                'Iterate on feedback',
                'Document progress',
                'Rest & reflect',
                'Plan next week'
            ];
        } else {
            focus = 'Review & prepare for next quarter';
            dailyActivities = [
                'Review achievements',
                'Identify gaps',
                'Celebrate wins',
                'Set next goals',
                'Wrap up projects',
                'Rest & reflect',
                'Plan next quarter'
            ];
        }

        weeks.push({
            week: `Week ${weekNum}`,
            focus,
            days: dayNames.map((day, idx) => ({
                day,
                activity: dailyActivities[idx]
            }))
        });
    }

    return weeks;
}

export function YearlyQuarterlyGoal({ yearlyGoalTitle, quarterlyGoals, yourWhyDetail }: YearlyQuarterlyGoalProps) {
    const { user } = useAuth();
    const { logHabitComplete } = useAnalyticsSupabase(user?.id);
    const [expandedQuarter, setExpandedQuarter] = useState<string | null>(null);
    const [showFullPlanModal, setShowFullPlanModal] = useState(false);
    const [selectedQuarterPlan, setSelectedQuarterPlan] = useState<{ quarter: string; goal: string; plan: WeeklyPlanItem[] } | null>(null);

    const [showYearlyRoadmap, setShowYearlyRoadmap] = useState(false);

    // Track completions: "Quarter-Week-Day" -> ISO Date String | null
    const [completedActivities, setCompletedActivities] = useState<Record<string, string | null>>({});

    // Load completions on mount
    useEffect(() => {
        const key = getUserStorageKey(COMPLETIONS_KEY, user?.id);
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                setCompletedActivities(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading completions:', e);
            }
        } else {
            setCompletedActivities({});
        }
    }, [user?.id]);

    const toggleActivity = (quarter: string, week: string, day: string) => {
        const activityKey = `${quarter}-${week}-${day}`;
        const isPreviouslyCompleted = !!completedActivities[activityKey];
        const todayStr = new Date().toISOString().split('T')[0];

        const newCompletions = {
            ...completedActivities,
            [activityKey]: isPreviouslyCompleted ? null : todayStr
        };

        setCompletedActivities(newCompletions);
        const storageKey = getUserStorageKey(COMPLETIONS_KEY, user?.id);
        localStorage.setItem(storageKey, JSON.stringify(newCompletions));

        if (!isPreviouslyCompleted) {
            // Log as a habit completion for productivity score
            logHabitComplete(10); // Assume 10 total possible habits/daily tasks
        }
    };

    if (!yearlyGoalTitle || quarterlyGoals.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full flex items-center justify-center"
            >
                <p className="text-muted-foreground text-sm">Analyzing your goals...</p>
            </motion.div>
        );
    }

    const toggleQuarter = (quarter: string) => {
        setExpandedQuarter(expandedQuarter === quarter ? null : quarter);
    };

    // Helper: Validate that a weeklyPlan item has proper days array (not a string placeholder)
    const hasValidDays = (week: WeeklyPlanItem): boolean => {
        return Array.isArray(week.days) && week.days.length > 0 && typeof week.days[0]?.day === 'string';
    };

    // Helper: Check if the entire weeklyPlan is valid (has at least one week with proper days)
    const isWeeklyPlanValid = (plan: WeeklyPlanItem[] | undefined): boolean => {
        if (!plan || !Array.isArray(plan) || plan.length === 0) return false;
        // Check if at least 50% of weeks have valid days (AI sometimes returns partial data)
        const validWeeks = plan.filter(hasValidDays);
        return validWeeks.length >= plan.length * 0.5;
    };

    // Get valid weekly plan - use AI data if valid, otherwise generate fallback
    const getValidWeeklyPlan = (qg: QuarterlyGoal, quarterNum: number): WeeklyPlanItem[] => {
        if (isWeeklyPlanValid(qg.weeklyPlan)) {
            // Ensure each week has days array (fill in missing ones)
            return qg.weeklyPlan!.map((week, idx) => {
                if (hasValidDays(week)) {
                    return week;
                }
                // Generate fallback days for this week
                const fallbackWeek = generateWeeklyPlan(qg.goal, quarterNum)[idx % 13];
                return {
                    ...week,
                    days: fallbackWeek?.days || []
                };
            });
        }
        // Fall back to fully generated plan
        return generateWeeklyPlan(qg.goal, quarterNum);
    };

    const openFullPlan = (quarter: string, goal: string, plan: WeeklyPlanItem[]) => {
        setSelectedQuarterPlan({ quarter, goal, plan });
        setShowFullPlanModal(true);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-foreground">Yearly & Quarterly Goal</h3>
                        <p className="text-xs text-muted-foreground">Track your long-term success path.</p>
                    </div>
                    <button
                        onClick={() => setShowYearlyRoadmap(true)}
                        className="flex items-center gap-2 px-3 h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 transition-all group border border-amber-500/20"
                        title="Click to view full plan"
                    >
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">View full plan</span>
                        <Target className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground text-sm">{yearlyGoalTitle}</span>
                </div>

                <div className="space-y-2 mb-4">
                    {quarterlyGoals.map((qg, index) => {
                        const quarterNum = index + 1;
                        const weeklyPlan = getValidWeeklyPlan(qg, quarterNum);
                        const isExpanded = expandedQuarter === qg.quarter;

                        return (
                            <div key={qg.quarter}>
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    onClick={() => toggleQuarter(qg.quarter)}
                                    className="flex items-start gap-3 w-full text-left p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-foreground">{qg.quarter}:</span> {qg.goal}
                                        </span>
                                    </div>
                                    <div className="shrink-0 mt-0.5">
                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </motion.button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="ml-9 mt-2 overflow-hidden"
                                        >
                                            <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3 text-primary" />
                                                        <span className="text-xs font-semibold text-primary">Weekly Plan</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openFullPlan(qg.quarter, qg.goal, weeklyPlan);
                                                        }}
                                                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        <span>Full View</span>
                                                    </button>
                                                </div>
                                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                    {weeklyPlan.slice(0, 4).map((week, i) => (
                                                        <div key={i} className="flex items-start gap-2">
                                                            <span className="text-xs font-medium text-foreground w-14 shrink-0">{week.week}</span>
                                                            <span className="text-xs text-muted-foreground">{week.focus}</span>
                                                        </div>
                                                    ))}
                                                    <p className="text-xs text-muted-foreground italic">+{weeklyPlan.length - 4} more weeks...</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {yourWhyDetail && (
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="font-medium text-foreground text-sm">Your Why</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {yourWhyDetail}
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Yearly Roadmap Modal */}
            <AnimatePresence>
                {showYearlyRoadmap && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4"
                        onClick={() => setShowYearlyRoadmap(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="bg-[#fffbeb] dark:bg-card rounded-[2.5rem] p-8 md:p-12 max-w-5xl w-full max-h-[90vh] border border-amber-200/50 shadow-[0_20px_60px_rgba(251,191,36,0.15)] overflow-y-auto relative custom-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="sticky top-0 right-0 flex justify-end z-10 -mr-6 -mt-6 mb-4">
                                <button
                                    onClick={() => setShowYearlyRoadmap(false)}
                                    className="p-4 rounded-full bg-white/90 dark:bg-secondary/90 backdrop-blur-md text-amber-900/50 hover:text-amber-600 transition-all duration-300 shadow-sm border border-amber-100"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center mb-16">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-amber-500/10 flex items-center justify-center shadow-inner mb-6 border-2 border-amber-500/20">
                                    <Target className="w-12 h-12 text-amber-600" />
                                </div>
                                <h2 className="text-5xl font-black text-foreground tracking-tight mb-4">Yearly Roadmap</h2>
                                <div className="max-w-2xl p-6 rounded-3xl bg-white dark:bg-background border-2 border-amber-500/10 shadow-sm">
                                    <p className="text-amber-800 dark:text-amber-400 font-bold uppercase tracking-[0.25em] text-xs mb-3">Core North Star</p>
                                    <p className="text-3xl font-bold text-foreground leading-tight">{yearlyGoalTitle}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {quarterlyGoals.map((qg, index) => (
                                    <motion.div
                                        key={qg.quarter}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group relative"
                                    >
                                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-200 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                        <div className="relative p-10 rounded-[2rem] bg-white dark:bg-background border border-amber-500/10 flex flex-col h-full shadow-lg hover:shadow-2xl transition-all duration-500">
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="px-6 py-2 rounded-full bg-amber-500/10 text-amber-600 font-black text-sm tracking-widest">{qg.quarter}</span>
                                                <div className="w-12 h-12 rounded-2xl bg-secondary/30 flex items-center justify-center">
                                                    <CheckCircle2 className="w-6 h-6 text-amber-500/40" />
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-bold text-foreground leading-snug flex-1 mb-8">{qg.goal}</h3>
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    const quarterNum = index + 1;
                                                    const weeklyPlan = getValidWeeklyPlan(qg, quarterNum);
                                                    openFullPlan(qg.quarter, qg.goal, weeklyPlan);
                                                }}
                                                className="w-full justify-between items-center bg-secondary/10 hover:bg-amber-500 hover:text-white rounded-2xl p-4 h-auto group/btn transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 opacity-60" />
                                                    <span className="font-bold text-sm">Deep Dive Strategy</span>
                                                </div>
                                                <Eye className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {yourWhyDetail && (
                                <div className="mt-16 p-10 rounded-[3rem] bg-gradient-to-br from-amber-50 to-white dark:from-secondary/20 dark:to-background border border-amber-200/50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Sparkles className="w-24 h-24 text-amber-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
                                        <Lightbulb className="w-6 h-6" />
                                        The Purpose Behind the Path
                                    </h4>
                                    <p className="text-lg text-foreground font-medium leading-relaxed max-w-3xl italic">
                                        "{yourWhyDetail}"
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Full Weekly Plan Modal */}
            <AnimatePresence>
                {showFullPlanModal && selectedQuarterPlan && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
                        onClick={() => setShowFullPlanModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-hidden border border-border flex flex-col shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">{selectedQuarterPlan.quarter} Weekly Plan</h2>
                                    <p className="text-sm text-muted-foreground">{selectedQuarterPlan.goal}</p>
                                </div>
                                <button
                                    onClick={() => setShowFullPlanModal(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1 space-y-4 pr-2 custom-scrollbar">
                                {selectedQuarterPlan.plan.map((week, weekIdx) => (
                                    <div key={weekIdx} className="rounded-xl bg-secondary/30 border border-border/30 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="font-semibold text-foreground">{week.week}</span>
                                            <span className="text-xs text-muted-foreground">• {week.focus}</span>
                                        </div>
                                        <div className="grid grid-cols-7 gap-2">
                                            {week.days?.map((day, dayIdx) => {
                                                const isDone = completedActivities[`${selectedQuarterPlan.quarter}-${week.week}-${day.day}`];
                                                const displayText = day.task || day.activity || 'No task';
                                                return (
                                                    <button
                                                        key={dayIdx}
                                                        onClick={() => toggleActivity(selectedQuarterPlan.quarter, week.week, day.day)}
                                                        className="text-center group transition-transform active:scale-95"
                                                        title={day.description || displayText}
                                                    >
                                                        <div className={`text-xs font-semibold mb-1 ${isDone ? 'text-primary' : 'text-muted-foreground group-hover:text-primary transition-colors'}`}>
                                                            {day.day}
                                                        </div>
                                                        <div className={`text-[10px] rounded-lg p-2 h-24 flex flex-col items-center justify-center gap-1 border transition-all ${isDone
                                                            ? 'bg-primary/10 border-primary/30 text-foreground'
                                                            : 'bg-background/50 border-border/50 text-muted-foreground group-hover:border-primary/20'
                                                            }`}>
                                                            {isDone ? (
                                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                            ) : (
                                                                <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0 group-hover:text-primary/30" />
                                                            )}
                                                            <span className="leading-tight text-center font-medium line-clamp-3">{displayText}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-border">
                                <Button onClick={() => setShowFullPlanModal(false)} className="w-full">
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}



