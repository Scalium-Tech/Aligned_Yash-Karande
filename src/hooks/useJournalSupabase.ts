import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserData, removeUserData } from '@/lib/userStorage';

// Database types
export interface JournalEntry {
    id: string;
    user_id: string;
    entry_date: string;
    prompt: string;
    content: string;
    ai_summary: string | null;
    polished_content: string | null;
    mood: 'great' | 'okay' | 'low' | null;
    created_at: string;
    updated_at: string;
}

export interface BrainDump {
    id: string;
    user_id: string;
    content: string;
    organized_content: string | null;
    tags: string[] | null;
    created_at: string;
}

export interface AIGuidanceChat {
    id: string;
    user_id: string;
    query: string;
    response: string;
    created_at: string;
}

export interface WeeklySummary {
    id: string;
    user_id: string;
    week_start: string;
    ai_summary: string;
    total_focus_minutes: number;
    total_tasks: number;
    journal_count: number;
    created_at: string;
}

export interface AIInsight {
    id: string;
    user_id: string;
    insight_date: string;
    insight: string;
    created_at: string;
}

// Legacy localStorage key
const LEGACY_JOURNAL_KEY = 'aligned_journal';
const MIGRATION_DONE_KEY = 'aligned_journal_migrated_to_supabase';

const dailyPrompts = [
    "What's one thing you're grateful for today?",
    "What did you accomplish that aligned with your identity?",
    "What challenge did you face and how did you handle it?",
    "What's one thing you learned about yourself today?",
    "How did you take care of your well-being today?",
    "What would you do differently if you could redo today?",
    "What are you looking forward to tomorrow?",
];

function getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
}

function getDailyPrompt(): string {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return dailyPrompts[dayOfYear % dailyPrompts.length];
}

function getWeekStart(): string {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
}

export function useJournalSupabase(userId?: string) {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [brainDumps, setBrainDumps] = useState<BrainDump[]>([]);
    const [aiChats, setAiChats] = useState<AIGuidanceChat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const dailyPrompt = getDailyPrompt();

    // Fetch all journal data
    const fetchData = useCallback(async () => {
        if (!userId) {
            setEntries([]);
            setBrainDumps([]);
            setAiChats([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch journal entries
            const { data: entriesData, error: entriesError } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', userId)
                .order('entry_date', { ascending: false });

            if (entriesError) throw entriesError;

            // Fetch brain dumps
            const { data: dumpsData, error: dumpsError } = await supabase
                .from('brain_dumps')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (dumpsError) throw dumpsError;

            // Fetch AI guidance chats
            const { data: chatsData, error: chatsError } = await supabase
                .from('ai_guidance_chats')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (chatsError) throw chatsError;

            // Migrate from localStorage if empty
            if (!entriesData || entriesData.length === 0) {
                await migrateFromLocalStorage(userId);
                // Re-fetch after migration
                const { data: newEntries } = await supabase
                    .from('journal_entries')
                    .select('*')
                    .eq('user_id', userId)
                    .order('entry_date', { ascending: false });

                const { data: newDumps } = await supabase
                    .from('brain_dumps')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                setEntries(newEntries || []);
                setBrainDumps(newDumps || []);
            } else {
                setEntries(entriesData);
                setBrainDumps(dumpsData || []);
            }

            setAiChats(chatsData || []);
        } catch (err) {
            console.error('Error fetching journal data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load journal');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Migrate from localStorage
    const migrateFromLocalStorage = async (uid: string): Promise<boolean> => {
        const migrationKey = `${MIGRATION_DONE_KEY}_${uid}`;
        if (localStorage.getItem(migrationKey)) return false;

        try {
            interface LegacyEntry {
                id: string;
                date: string;
                prompt: string;
                content: string;
                aiSummary?: string;
                polishedContent?: string;
                mood?: 'great' | 'okay' | 'low';
                createdAt: string;
            }
            interface LegacyDump {
                id: string;
                timestamp: string;
                content: string;
                organizedContent?: string;
                tags?: string[];
            }
            interface LegacyData {
                entries?: LegacyEntry[];
                brainDumps?: LegacyDump[];
            }

            const legacyData = getUserData<LegacyData>(LEGACY_JOURNAL_KEY, uid, { entries: [], brainDumps: [] });

            // Migrate journal entries
            if (legacyData.entries && legacyData.entries.length > 0) {
                const entriesToInsert = legacyData.entries.map(entry => ({
                    user_id: uid,
                    entry_date: entry.date,
                    prompt: entry.prompt,
                    content: entry.content,
                    ai_summary: entry.aiSummary || null,
                    polished_content: entry.polishedContent || null,
                    mood: entry.mood || null,
                }));

                await supabase.from('journal_entries').insert(entriesToInsert);
            }

            // Migrate brain dumps
            if (legacyData.brainDumps && legacyData.brainDumps.length > 0) {
                const dumpsToInsert = legacyData.brainDumps.map(dump => ({
                    user_id: uid,
                    content: dump.content,
                    organized_content: dump.organizedContent || null,
                    tags: dump.tags || null,
                }));

                await supabase.from('brain_dumps').insert(dumpsToInsert);
            }

            // Mark migration complete and clean up
            localStorage.setItem(migrationKey, 'true');
            removeUserData(LEGACY_JOURNAL_KEY, uid);
            console.log('Successfully migrated journal from localStorage to Supabase');
            return true;
        } catch (err) {
            console.error('Error migrating journal:', err);
        }
        return false;
    };

    // Get today's entry
    const getTodayEntry = useCallback((): JournalEntry | undefined => {
        const today = getTodayKey();
        return entries.find(e => e.entry_date === today);
    }, [entries]);

    // Get recent entries
    const getRecentEntries = useCallback((count: number = 5): JournalEntry[] => {
        return entries.slice(0, count);
    }, [entries]);

    // Save journal entry
    const saveEntry = useCallback(async (
        content: string,
        mood?: 'great' | 'okay' | 'low',
        generateAI: boolean = true
    ): Promise<JournalEntry | null> => {
        if (!userId) return null;

        const todayKey = getTodayKey();
        const existingEntry = entries.find(e => e.entry_date === todayKey);

        let aiSummary: string | null = null;
        let polishedContent: string | null = null;

        // Generate AI insights if enabled
        if (generateAI && content.length >= 10) {
            setIsGeneratingAI(true);
            try {
                const insights = await generateAIInsights(content, dailyPrompt);
                aiSummary = insights.summary || null;
                polishedContent = insights.polished || null;
            } finally {
                setIsGeneratingAI(false);
            }
        }

        try {
            if (existingEntry) {
                // Update existing entry
                const { data, error } = await supabase
                    .from('journal_entries')
                    .update({
                        content,
                        mood: mood || null,
                        ai_summary: aiSummary || existingEntry.ai_summary,
                        polished_content: polishedContent || existingEntry.polished_content,
                    })
                    .eq('id', existingEntry.id)
                    .select()
                    .single();

                if (error) throw error;

                setEntries(prev => prev.map(e => e.id === existingEntry.id ? data : e));
                return data;
            } else {
                // Insert new entry
                const { data, error } = await supabase
                    .from('journal_entries')
                    .insert({
                        user_id: userId,
                        entry_date: todayKey,
                        prompt: dailyPrompt,
                        content,
                        mood: mood || null,
                        ai_summary: aiSummary,
                        polished_content: polishedContent,
                    })
                    .select()
                    .single();

                if (error) throw error;

                setEntries(prev => [data, ...prev]);
                return data;
            }
        } catch (err) {
            console.error('Error saving entry:', err);
            setError(err instanceof Error ? err.message : 'Failed to save entry');
            return null;
        }
    }, [userId, entries, dailyPrompt]);

    // Save brain dump
    const saveBrainDump = useCallback(async (content: string): Promise<BrainDump | null> => {
        if (!userId) return null;

        try {
            const { data, error } = await supabase
                .from('brain_dumps')
                .insert({
                    user_id: userId,
                    content,
                })
                .select()
                .single();

            if (error) throw error;

            setBrainDumps(prev => [data, ...prev]);
            return data;
        } catch (err) {
            console.error('Error saving brain dump:', err);
            return null;
        }
    }, [userId]);

    // Organize brain dump with AI
    const organizeBrainDump = useCallback(async (dumpId: string): Promise<string> => {
        const dump = brainDumps.find(d => d.id === dumpId);
        if (!dump) return '';

        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!apiKey) return 'AI organization requires an API key.';

        try {
            const prompt = `Organize this brain dump into clear categories with action items:\n\n${dump.content}\n\nFormat: Use markdown with headers for categories and bullet points for items.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.5, maxOutputTokens: 500 },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                const organized = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

                // Update in database
                await supabase
                    .from('brain_dumps')
                    .update({ organized_content: organized })
                    .eq('id', dumpId);

                setBrainDumps(prev => prev.map(d =>
                    d.id === dumpId ? { ...d, organized_content: organized } : d
                ));

                return organized;
            }
        } catch (err) {
            console.error('Error organizing brain dump:', err);
        }
        return '';
    }, [brainDumps]);

    // Get recent brain dumps
    const getBrainDumps = useCallback((count: number = 5): BrainDump[] => {
        return brainDumps.slice(0, count);
    }, [brainDumps]);

    // Save AI guidance chat
    const saveAIGuidance = useCallback(async (query: string, response: string): Promise<AIGuidanceChat | null> => {
        if (!userId) return null;

        try {
            const { data, error } = await supabase
                .from('ai_guidance_chats')
                .insert({
                    user_id: userId,
                    query,
                    response,
                })
                .select()
                .single();

            if (error) throw error;

            setAiChats(prev => [data, ...prev]);
            return data;
        } catch (err) {
            console.error('Error saving AI guidance:', err);
            return null;
        }
    }, [userId]);

    // Get recent AI chats
    const getRecentAIChats = useCallback((count: number = 10): AIGuidanceChat[] => {
        return aiChats.slice(0, count);
    }, [aiChats]);

    // Get weekly summary from cache or generate new
    const getWeeklySummary = useCallback(async (generateFn: () => Promise<string>, stats: { focus: number; tasks: number; journal: number }): Promise<string> => {
        if (!userId) return '';

        const weekStart = getWeekStart();

        try {
            // Check cache first
            const { data: cached } = await supabase
                .from('weekly_summaries')
                .select('*')
                .eq('user_id', userId)
                .eq('week_start', weekStart)
                .single();

            if (cached) {
                return cached.ai_summary;
            }

            // Generate new summary
            const summary = await generateFn();

            // Cache it
            await supabase.from('weekly_summaries').insert({
                user_id: userId,
                week_start: weekStart,
                ai_summary: summary,
                total_focus_minutes: stats.focus,
                total_tasks: stats.tasks,
                journal_count: stats.journal,
            });

            return summary;
        } catch (err) {
            console.error('Error with weekly summary:', err);
            return await generateFn();
        }
    }, [userId]);

    // Get AI insight from cache or generate new
    const getAIInsight = useCallback(async (generateFn: () => Promise<string>): Promise<string> => {
        if (!userId) return '';

        const today = getTodayKey();

        try {
            // Check cache first
            const { data: cached } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', userId)
                .eq('insight_date', today)
                .single();

            if (cached) {
                return cached.insight;
            }

            // Generate new insight
            const insight = await generateFn();

            // Cache it
            await supabase.from('ai_insights').insert({
                user_id: userId,
                insight_date: today,
                insight,
            });

            return insight;
        } catch (err) {
            console.error('Error with AI insight:', err);
            return await generateFn();
        }
    }, [userId]);

    // Refresh AI insight (force regenerate)
    const refreshAIInsight = useCallback(async (generateFn: () => Promise<string>): Promise<string> => {
        if (!userId) return '';

        const today = getTodayKey();
        const insight = await generateFn();

        try {
            // Upsert the insight
            await supabase
                .from('ai_insights')
                .upsert({
                    user_id: userId,
                    insight_date: today,
                    insight,
                }, { onConflict: 'user_id,insight_date' });
        } catch (err) {
            console.error('Error updating AI insight:', err);
        }

        return insight;
    }, [userId]);

    // Get journal stats for the week
    const getWeeklyJournalStats = useCallback(() => {
        const weekStart = getWeekStart();
        const weekEntries = entries.filter(e => e.entry_date >= weekStart);

        const moodCounts = { great: 0, okay: 0, low: 0 };
        weekEntries.forEach(e => {
            if (e.mood) moodCounts[e.mood]++;
        });

        const dominantMood = Object.entries(moodCounts).reduce((a, b) => b[1] > a[1] ? b : a, ['', 0])[0] as 'great' | 'okay' | 'low' | '';

        return {
            entriesCount: weekEntries.length,
            moodCounts,
            dominantMood: dominantMood || null,
        };
    }, [entries]);

    // Load data on mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const todayEntry = getTodayEntry();

    return {
        // Data
        entries,
        brainDumps,
        aiChats,
        todayEntry,
        dailyPrompt,
        isLoading,
        error,
        isGeneratingAI,
        // Journal operations
        saveEntry,
        getRecentEntries,
        getTodayEntry,
        getWeeklyJournalStats,
        // Brain dump operations
        saveBrainDump,
        organizeBrainDump,
        getBrainDumps,
        // AI guidance operations
        saveAIGuidance,
        getRecentAIChats,
        // Weekly summary operations
        getWeeklySummary,
        // AI insights operations
        getAIInsight,
        refreshAIInsight,
        // Refresh
        refetch: fetchData,
    };
}

// Helper function to generate AI insights
async function generateAIInsights(content: string, prompt: string): Promise<{ summary: string; polished: string }> {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    if (!apiKey || content.length < 10) {
        return { summary: '', polished: '' };
    }

    try {
        const aiPrompt = `Analyze this journal entry and provide insights.

Prompt: "${prompt}"
Entry: "${content}"

Return a JSON object with:
- "summary": A brief, insightful observation about their mindset or progress (1-2 sentences)
- "polished": A more articulate version of their entry (optional, same length)

Return only valid JSON.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: aiPrompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
                }),
            }
        );

        if (response.ok) {
            const data = await response.json();
            let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

            // Clean JSON
            if (text.startsWith('```json')) text = text.slice(7);
            if (text.startsWith('```')) text = text.slice(3);
            if (text.endsWith('```')) text = text.slice(0, -3);
            text = text.trim();

            const parsed = JSON.parse(text);
            return {
                summary: parsed.summary || '',
                polished: parsed.polished || '',
            };
        }
    } catch (err) {
        console.error('Error generating AI insights:', err);
    }

    return { summary: '', polished: '' };
}
