import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Send, Smile, Meh, Frown, Loader2, ChevronDown, ChevronUp, MessageCircle, Wand2, Brain, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJournalSupabase } from '@/hooks/useJournalSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { ProFeatureGate } from '@/components/ProFeatureGate';

export function ReflectionJournal() {
    const { user, profile } = useAuth();
    const {
        todayEntry,
        dailyPrompt,
        saveEntry,
        getRecentEntries,
        isGeneratingAI,
        isLoading,
        saveBrainDump,
        getBrainDumps,
        organizeBrainDump,
        saveAIGuidance,
        getRecentAIChats,
    } = useJournalSupabase(user?.id);

    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<'great' | 'okay' | 'low' | undefined>(undefined);
    const [showHistory, setShowHistory] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // AI Chat state
    const [showAIChat, setShowAIChat] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAskingAI, setIsAskingAI] = useState(false);

    // Brain Dump state
    const [showBrainDump, setShowBrainDump] = useState(false);
    const [brainDumpContent, setBrainDumpContent] = useState('');
    const [isBrainDumpSaved, setIsBrainDumpSaved] = useState(false);
    const [isOrganizing, setIsOrganizing] = useState(false);
    const [organizedContent, setOrganizedContent] = useState('');
    const [showBrainDumpHistory, setShowBrainDumpHistory] = useState(false);
    const [currentDumpId, setCurrentDumpId] = useState<string | null>(null);

    // Load today's entry when it changes
    useEffect(() => {
        if (todayEntry) {
            setContent(todayEntry.content || '');
            setSelectedMood(todayEntry.mood || undefined);
            setIsSaved(true);
        }
    }, [todayEntry]);

    const recentEntries = getRecentEntries(5);
    const brainDumps = getBrainDumps(5);
    const recentChats = getRecentAIChats(5);

    const handleSave = async () => {
        if (!content.trim()) return;
        const isPro = profile?.is_pro === true;
        await saveEntry(content, selectedMood, isPro);
        setIsSaved(true);
    };

    const handleSaveBrainDump = async () => {
        if (!brainDumpContent.trim()) return;
        const entry = await saveBrainDump(brainDumpContent);
        if (entry) {
            setCurrentDumpId(entry.id);
            setIsBrainDumpSaved(true);
            setOrganizedContent('');
        }
    };

    const handleOrganizeBrainDump = async () => {
        if (!currentDumpId) return;
        setIsOrganizing(true);
        const organized = await organizeBrainDump(currentDumpId);
        setOrganizedContent(organized);
        setIsOrganizing(false);
    };

    const handleNewBrainDump = () => {
        setBrainDumpContent('');
        setIsBrainDumpSaved(false);
        setOrganizedContent('');
        setCurrentDumpId(null);
    };

    const handleAskAI = async () => {
        if (!aiQuery.trim()) return;

        setIsAskingAI(true);
        setAiResponse('');

        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

        // Fallback responses for common questions
        const fallbackResponses: Record<string, string> = {
            'plan my week': `Here's a simple weekly planning framework:\n\n**📅 Weekly Planning Steps:**\n1. **Review your goals** - What are your top 3 priorities this week?\n2. **Block your time** - Schedule your most important tasks for when you have peak energy\n3. **Build in buffers** - Leave 20% of your time unscheduled for unexpected tasks\n4. **Daily review** - Spend 5 minutes each morning reviewing today's plan\n\n**💡 Pro tip:** Start with your "non-negotiables" - the tasks that will have the biggest impact on your goals.`,
            'create a morning routine': `Here's a powerful morning routine template:\n\n**🌅 Ideal Morning Routine (90 mins):**\n1. **Wake up** - Same time daily, no snooze\n2. **Hydrate** - Drink a full glass of water (5 mins)\n3. **Move** - Light exercise or stretching (15 mins)\n4. **Mindfulness** - Meditation or journaling (10 mins)\n5. **Plan** - Review your day's priorities (10 mins)\n6. **Deep work** - Tackle your most important task (50 mins)\n\n**💡 Start small:** Pick just 2-3 elements and build from there.`,
            'how to stay focused?': `Here are proven strategies to stay focused:\n\n**🎯 Focus Tips:**\n1. **Remove distractions** - Put phone in another room, close unnecessary tabs\n2. **Use time blocks** - Work in 25-50 minute focused sessions\n3. **Single-task** - Do one thing at a time, not multitasking\n4. **Take breaks** - 5-10 minute breaks between sessions\n5. **Optimize your environment** - Good lighting, comfortable temperature\n\n**💡 The 2-minute rule:** If a distracting thought comes up, write it down to address later.`,
            'motivate me': `You've got this! Here's some perspective:\n\n**💪 Remember:**\n- Every expert was once a beginner\n- Progress, not perfection, is the goal\n- Small steps lead to big changes\n- You're reading this because you WANT to improve\n\n**🔥 Action creates motivation:**\nStart with just 5 minutes of work. Motion creates emotion - once you begin, momentum builds.\n\n**Your identity:** You are becoming the person you want to be, one small action at a time. Keep going!`
        };

        // Check for fallback response
        const queryLower = aiQuery.toLowerCase().trim();
        const fallbackKey = Object.keys(fallbackResponses).find(key =>
            queryLower.includes(key) || key.includes(queryLower)
        );

        if (!apiKey || apiKey === 'your_google_api_key_here') {
            if (fallbackKey) {
                setAiResponse(fallbackResponses[fallbackKey]);
                await saveAIGuidance(aiQuery, fallbackResponses[fallbackKey]);
            } else {
                const fallbackMsg = `I'd love to help! To enable personalized AI responses, add your Google API key to the .env file.\n\nIn the meantime, try these quick asks: "Create a morning routine", "How to stay focused?", "Plan my week", or "Motivate me".`;
                setAiResponse(fallbackMsg);
            }
            setIsAskingAI(false);
            return;
        }

        try {
            const prompt = `You are a supportive life coach and personal assistant. The user is asking for help or guidance.

User's Question: "${aiQuery}"

${content ? `The user has also written this reflection today: "${content}"` : ''}

Respond helpfully and supportively. If they're asking for a plan, create a clear, actionable step-by-step plan. If they're asking for advice, provide thoughtful guidance. Keep your response concise but comprehensive (max 300 words).

Format your response in a clear, readable way. Use bullet points or numbered lists for plans.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
                    }),
                }
            );

            const data = await response.json();

            if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                const text = data.candidates[0].content.parts[0].text.trim();
                setAiResponse(text);
                // Save to database
                await saveAIGuidance(aiQuery, text);
            } else if (data.error) {
                console.error('API Error:', data.error);
                if (fallbackKey) {
                    setAiResponse(fallbackResponses[fallbackKey]);
                } else {
                    setAiResponse(`AI service is temporarily unavailable. Try one of our quick asks: "Create a morning routine", "How to stay focused?", "Plan my week", or "Motivate me".`);
                }
            } else if (data.candidates?.[0]?.finishReason === 'SAFETY') {
                setAiResponse("I couldn't respond to that query due to content safety guidelines. Please try rephrasing your question.");
            } else {
                console.error('Unexpected response:', data);
                if (fallbackKey) {
                    setAiResponse(fallbackResponses[fallbackKey]);
                } else {
                    setAiResponse("I couldn't process your request. Try one of our quick asks like 'Plan my week' or 'How to stay focused?'");
                }
            }
        } catch (error) {
            console.error('Error asking AI:', error);
            if (fallbackKey) {
                setAiResponse(fallbackResponses[fallbackKey]);
            } else {
                setAiResponse("Connection error. Try one of our quick asks: 'Create a morning routine', 'How to stay focused?', 'Plan my week', or 'Motivate me'.");
            }
        } finally {
            setIsAskingAI(false);
        }
    };

    const moodOptions = [
        { value: 'great' as const, icon: Smile, label: 'Great', color: 'text-emerald-500' },
        { value: 'okay' as const, icon: Meh, label: 'Okay', color: 'text-amber-500' },
        { value: 'low' as const, icon: Frown, label: 'Low', color: 'text-rose-500' },
    ];

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-secondary rounded"></div>
                            <div className="h-3 w-24 bg-secondary rounded"></div>
                        </div>
                    </div>
                    <div className="h-24 bg-secondary/50 rounded-xl mb-4"></div>
                    <div className="h-40 bg-secondary/30 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Today's Entry */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Today's Reflection</h3>
                        <p className="text-xs text-muted-foreground">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Prompt */}
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Today's Prompt</span>
                    </div>
                    <p className="text-foreground">{dailyPrompt}</p>
                </div>

                {/* Mood Selection */}
                <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">How are you feeling?</p>
                    <div className="flex gap-2">
                        {moodOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = selectedMood === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedMood(option.value)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isSelected
                                        ? 'bg-primary/10 border-2 border-primary'
                                        : 'bg-secondary/30 border-2 border-transparent hover:bg-secondary/50'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isSelected ? option.color : 'text-muted-foreground'}`} />
                                    <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {option.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Text Area */}
                <textarea
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        setIsSaved(false);
                    }}
                    placeholder="Write your thoughts here..."
                    className="w-full h-40 px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-foreground placeholder:text-muted-foreground"
                />

                {/* AI Smart Insights */}
                {todayEntry?.ai_summary && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-xl bg-gradient-to-br from-violet/10 to-primary/10 border border-violet/20 p-5"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-violet" />
                            <span className="text-sm font-semibold text-violet">Smart Insights</span>
                        </div>
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {todayEntry.ai_summary.split('\\n').join('\n')}
                        </div>
                    </motion.div>
                )}

                {/* Save Button */}
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        {content.length} characters
                    </span>
                    <Button
                        onClick={handleSave}
                        disabled={!content.trim() || isGeneratingAI}
                        className="bg-gradient-to-r from-primary to-violet hover:opacity-90"
                    >
                        {isGeneratingAI ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating AI insight...
                            </>
                        ) : isSaved ? (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Save Reflection
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* Brain Dump Section - Pro Only */}
            <ProFeatureGate featureName="Brain Dump">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
                >
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowBrainDump(!showBrainDump)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet/20 to-purple-500/20 flex items-center justify-center">
                                <Brain className="w-5 h-5 text-violet" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Brain Dump</h3>
                                <p className="text-xs text-muted-foreground">Quick capture for your thoughts</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">
                            {showBrainDump ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showBrainDump && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4"
                            >
                                {/* Brain Dump Textarea */}
                                <textarea
                                    value={brainDumpContent}
                                    onChange={(e) => {
                                        setBrainDumpContent(e.target.value);
                                        setIsBrainDumpSaved(false);
                                    }}
                                    placeholder="Dump your thoughts here... Tasks, ideas, worries, anything on your mind. No structure needed."
                                    className="w-full h-32 px-4 py-3 rounded-xl bg-gradient-to-br from-violet/5 to-purple-500/5 border border-violet/20 focus:border-violet/50 focus:ring-2 focus:ring-violet/20 outline-none resize-none text-foreground placeholder:text-muted-foreground"
                                />

                                {/* Actions */}
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        {brainDumpContent.length} characters
                                    </span>
                                    <div className="flex gap-2">
                                        {isBrainDumpSaved && (
                                            <Button
                                                onClick={handleOrganizeBrainDump}
                                                disabled={isOrganizing}
                                                variant="outline"
                                                size="sm"
                                                className="border-violet/30 hover:bg-violet/10"
                                            >
                                                {isOrganizing ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Organizing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-4 h-4 mr-2 text-violet" />
                                                        Organize with AI
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        {isBrainDumpSaved ? (
                                            <Button
                                                onClick={handleNewBrainDump}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Brain className="w-4 h-4 mr-2" />
                                                New Dump
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleSaveBrainDump}
                                                disabled={!brainDumpContent.trim()}
                                                size="sm"
                                                className="bg-gradient-to-r from-violet to-purple-500 hover:opacity-90"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Dump
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Organized Content */}
                                {organizedContent && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 rounded-xl bg-gradient-to-br from-violet/10 to-purple-500/10 border border-violet/20 p-4"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles className="w-4 h-4 text-violet" />
                                            <span className="text-sm font-medium text-violet">Organized by AI</span>
                                        </div>
                                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                            {organizedContent}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Brain Dump History Toggle */}
                                {brainDumps.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border/30">
                                        <button
                                            onClick={() => setShowBrainDumpHistory(!showBrainDumpHistory)}
                                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showBrainDumpHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            {showBrainDumpHistory ? 'Hide' : 'Show'} Brain Dump History ({brainDumps.length})
                                        </button>

                                        <AnimatePresence>
                                            {showBrainDumpHistory && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3 space-y-2"
                                                >
                                                    {brainDumps.map((dump) => (
                                                        <div
                                                            key={dump.id}
                                                            className="p-3 rounded-lg bg-secondary/30 border border-border/30"
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(dump.created_at).toLocaleString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: 'numeric',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                                {dump.organized_content && (
                                                                    <span className="text-xs text-violet flex items-center gap-1">
                                                                        <Sparkles className="w-3 h-3" /> Organized
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-foreground line-clamp-2">{dump.content}</p>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </ProFeatureGate>

            {/* AI Chat Section - Pro Only */}
            <ProFeatureGate featureName="AI Guidance">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
                >
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowAIChat(!showAIChat)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet/20 flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Ask AI for Guidance</h3>
                                <p className="text-xs text-muted-foreground">Get personalized advice, plans, or answers</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">
                            {showAIChat ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showAIChat && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4"
                            >
                                {/* Query Input */}
                                <div className="space-y-3">
                                    <textarea
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        placeholder="Ask anything... e.g., 'Create a morning routine plan' or 'How can I be more productive?'"
                                        className="w-full h-24 px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-foreground placeholder:text-muted-foreground"
                                        onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && handleAskAI()}
                                    />

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Ctrl + Enter to send</span>
                                        <Button
                                            onClick={handleAskAI}
                                            disabled={!aiQuery.trim() || isAskingAI}
                                            className="bg-gradient-to-r from-primary to-violet hover:opacity-90"
                                        >
                                            {isAskingAI ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Thinking...
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 className="w-4 h-4 mr-2" />
                                                    Ask AI
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* AI Response */}
                                {aiResponse && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 rounded-xl bg-gradient-to-br from-primary/10 to-violet/10 border border-primary/20 p-4"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium text-primary">AI Response</span>
                                        </div>
                                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                            {aiResponse}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Quick Suggestions */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="text-xs text-muted-foreground mr-2">Quick asks:</span>
                                    {['Create a morning routine', 'How to stay focused?', 'Plan my week', 'Motivate me'].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setAiQuery(suggestion)}
                                            className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>

                                {/* Recent AI Chats */}
                                {recentChats.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border/30">
                                        <p className="text-xs text-muted-foreground mb-2">Recent conversations:</p>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {recentChats.slice(0, 3).map((chat) => (
                                                <div
                                                    key={chat.id}
                                                    className="p-2 rounded-lg bg-secondary/20 cursor-pointer hover:bg-secondary/30 transition-colors"
                                                    onClick={() => {
                                                        setAiQuery(chat.query);
                                                        setAiResponse(chat.response);
                                                    }}
                                                >
                                                    <p className="text-xs text-foreground truncate">{chat.query}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </ProFeatureGate>

            {/* History Toggle - Pro Only */}
            <ProFeatureGate featureName="Reflection History">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showHistory ? 'Hide' : 'Show'} Recent Entries ({recentEntries.length})
                </button>

                {/* Recent Entries */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            {recentEntries.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No entries yet. Start journaling today!</p>
                            ) : (
                                recentEntries.map((entry) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-xl bg-card border border-border/50 p-4"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground">
                                                {new Date(entry.entry_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            {entry.mood && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary/50">
                                                    {entry.mood === 'great' ? '😊' : entry.mood === 'okay' ? '😐' : '😔'} {entry.mood}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2 italic">"{entry.prompt}"</p>
                                        <p className="text-sm text-foreground line-clamp-3">{entry.content}</p>
                                        {entry.ai_summary && (
                                            <div className="mt-2 pt-2 border-t border-border/30">
                                                <p className="text-xs text-violet flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" />
                                                    {entry.ai_summary}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </ProFeatureGate>
        </div>
    );
}
