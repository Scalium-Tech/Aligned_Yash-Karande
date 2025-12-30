import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Settings, X, Sparkles, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeeklyPlanItem {
    day: string;
    activity: string;
}

interface AIWeeklyPlanProps {
    weeklyPlan: WeeklyPlanItem[];
    onPlanUpdate?: (newPlan: WeeklyPlanItem[]) => void;
}

export function AIWeeklyPlan({ weeklyPlan, onPlanUpdate }: AIWeeklyPlanProps) {
    const [showModal, setShowModal] = useState(false);
    const [editablePlan, setEditablePlan] = useState<WeeklyPlanItem[]>([]);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [adjustmentNote, setAdjustmentNote] = useState('');

    const [showViewModal, setShowViewModal] = useState(false);

    const handleOpenModal = () => {
        setEditablePlan([...weeklyPlan]);
        setShowModal(true);
    };

    const handleUpdateActivity = (index: number, newActivity: string) => {
        const updated = [...editablePlan];
        updated[index] = { ...updated[index], activity: newActivity };
        setEditablePlan(updated);
    };

    const handleSave = () => {
        onPlanUpdate?.(editablePlan);
        // Save to localStorage for persistence
        localStorage.setItem('aligned_custom_weekly_plan', JSON.stringify(editablePlan));
        setShowModal(false);
    };

    const handleRegenerate = async () => {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

        setIsRegenerating(true);

        // Fallback plan generator based on user request
        const generateFallbackPlan = () => {
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const userRequest = adjustmentNote.toLowerCase();

            // Check for specific requests in the user's note
            const wantsBreakOnFriday = userRequest.includes('break') && userRequest.includes('friday');
            const wantsRestDays = userRequest.includes('rest');
            const wantsDeepWork = userRequest.includes('deep work');

            return dayNames.map(day => {
                if (wantsBreakOnFriday && day === 'Fri') {
                    return { day, activity: 'Rest day - take a break and recharge' };
                }
                if (wantsRestDays && (day === 'Sat' || day === 'Sun')) {
                    return { day, activity: 'Rest and recover - light activities only' };
                }

                const activities: Record<string, string> = {
                    'Mon': wantsDeepWork ? 'Deep work session - focused project time' : 'Start week strong with key priorities',
                    'Tue': 'Continue momentum - tackle challenging tasks',
                    'Wed': 'Mid-week review and skill development',
                    'Thu': 'Collaboration and creative work',
                    'Fri': wantsRestDays ? 'Light work - wrap up the week' : 'Complete weekly goals and plan ahead',
                    'Sat': 'Personal project or learning time',
                    'Sun': 'Rest, reflect, and prepare for next week'
                };

                return { day, activity: activities[day] || 'Productive focus session' };
            });
        };

        if (!apiKey) {
            console.log('No API key found, using fallback plan generation');
            // Generate a smart fallback based on user input
            const fallbackPlan = generateFallbackPlan();
            setEditablePlan(fallbackPlan);
            setIsRegenerating(false);
            return;
        }

        try {
            const prompt = `You are a personal productivity coach. The user wants to adjust their weekly plan.

Current plan:
${weeklyPlan.map(p => `${p.day}: ${p.activity}`).join('\n')}

User's adjustment request: "${adjustmentNote || 'Make it more balanced and realistic'}"

Current time: ${new Date().toISOString()} - Generate a fresh, unique plan.

Generate an improved 7-day weekly plan based on the request. Return ONLY a JSON array with this exact format:
[
  {"day": "Mon", "activity": "Activity description"},
  {"day": "Tue", "activity": "Activity description"},
  {"day": "Wed", "activity": "Activity description"},
  {"day": "Thu", "activity": "Activity description"},
  {"day": "Fri", "activity": "Activity description"},
  {"day": "Sat", "activity": "Activity description"},
  {"day": "Sun", "activity": "Activity description"}
]

Keep activities concise (under 50 characters). Be creative and specific to the user's request. Return only JSON.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.8, maxOutputTokens: 500 },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

                if (text.startsWith('```json')) text = text.slice(7);
                if (text.startsWith('```')) text = text.slice(3);
                if (text.endsWith('```')) text = text.slice(0, -3);
                text = text.trim();

                const newPlan = JSON.parse(text);
                setEditablePlan(newPlan);
                console.log('Successfully regenerated plan:', newPlan);
            } else {
                console.error('Gemini API error:', response.status, await response.text());
                // Use fallback plan on API error
                const fallbackPlan = generateFallbackPlan();
                setEditablePlan(fallbackPlan);
            }
        } catch (error) {
            console.error('Error regenerating plan:', error);
            // Use fallback plan on error
            const fallbackPlan = generateFallbackPlan();
            setEditablePlan(fallbackPlan);
        } finally {
            setIsRegenerating(false);
        }
    };

    if (!weeklyPlan || weeklyPlan.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full flex items-center justify-center"
            >
                <p className="text-muted-foreground text-sm">Generating weekly plan...</p>
            </motion.div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-foreground">AI Weekly Plan</h3>
                        <p className="text-xs text-muted-foreground">Get a realistic, balanced week.</p>
                    </div>
                    <button
                        onClick={() => setShowViewModal(true)}
                        className="flex items-center gap-2 px-3 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all group border border-primary/20"
                        title="Click to view full plan"
                    >
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">View full plan</span>
                        <Calendar className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="space-y-2 mb-4">
                    {weeklyPlan.map((item, index) => (
                        <motion.div
                            key={item.day}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="flex items-start gap-3 py-1.5"
                        >
                            <span className="text-xs font-semibold text-primary w-8 shrink-0 pt-0.5">{item.day}</span>
                            <span className="text-sm text-foreground">{item.activity}</span>
                        </motion.div>
                    ))}
                </div>

                <Button
                    onClick={handleOpenModal}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                >
                    <Settings className="w-4 h-4" />
                    Adjust Plan
                </Button>
            </motion.div>

            {/* View Plan Modal */}
            <AnimatePresence>
                {showViewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                        onClick={() => setShowViewModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="bg-[#f8fafc] dark:bg-card rounded-[2.5rem] p-6 md:p-10 max-w-4xl w-full max-h-[90vh] border border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-y-auto relative custom-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="sticky top-0 right-0 flex justify-end z-10 -mr-4 -mt-4 mb-4">
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="p-3 rounded-full bg-white/80 dark:bg-secondary/80 backdrop-blur-md text-muted-foreground hover:text-foreground transition-all duration-300 shadow-sm border border-border/50"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center shadow-inner">
                                    <Calendar className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Weekly Strategy</h2>
                                    <p className="text-primary font-bold uppercase tracking-[0.2em] text-sm mt-1">Personalized Identity Alignment</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {weeklyPlan.map((item, index) => (
                                    <motion.div
                                        key={item.day}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                                        className="flex items-center gap-8"
                                    >
                                        <div className="w-20 h-16 rounded-2xl bg-white dark:bg-background border border-border/50 flex items-center justify-center font-black text-primary text-base shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                                            {item.day}
                                        </div>
                                        <div className="flex-1 py-6 px-10 rounded-3xl bg-white dark:bg-background border border-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-primary/20 transition-all duration-500 group">
                                            <p className="text-foreground font-semibold text-xl group-hover:text-primary transition-colors duration-300 leading-relaxed">{item.activity}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-center">
                                <Button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        handleOpenModal();
                                    }}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-10 py-6 text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Settings className="w-5 h-5 mr-3" />
                                    Refine Weekly Strategy
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Adjust Plan Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-border shadow-xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-foreground">Adjust Weekly Plan</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* AI Regeneration */}
                            <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium text-primary">AI Adjust</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g., Add more rest days, focus on deep work..."
                                    value={adjustmentNote}
                                    onChange={e => setAdjustmentNote(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm mb-2"
                                />
                                <Button
                                    onClick={handleRegenerate}
                                    disabled={isRegenerating}
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-primary to-violet"
                                >
                                    {isRegenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Regenerating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Regenerate with AI
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Manual Edit */}
                            <div className="space-y-3 mb-4">
                                <p className="text-sm text-muted-foreground">Or edit manually:</p>
                                {editablePlan.map((item, index) => (
                                    <div key={item.day} className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-primary w-10">{item.day}</span>
                                        <input
                                            type="text"
                                            value={item.activity}
                                            onChange={e => handleUpdateActivity(index, e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg bg-secondary/30 border border-border text-foreground text-sm"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowModal(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Plan
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
