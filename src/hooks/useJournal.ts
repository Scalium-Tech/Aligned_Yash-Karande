import { useState, useEffect, useCallback } from 'react';
import { getUserStorageKey } from '@/lib/userStorage';

interface JournalEntry {
    id: string;
    date: string;
    prompt: string;
    content: string;
    aiSummary?: string;
    polishedContent?: string;
    mood?: 'great' | 'okay' | 'low';
    createdAt: string;
}

interface BrainDumpEntry {
    id: string;
    timestamp: string;
    content: string;
    organizedContent?: string;
    tags?: string[];
}

interface JournalData {
    entries: JournalEntry[];
    brainDumps: BrainDumpEntry[];
}

const JOURNAL_KEY = 'aligned_journal';

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

function loadJournal(userId?: string): JournalData {
    const key = getUserStorageKey(JOURNAL_KEY, userId);
    const stored = localStorage.getItem(key);
    if (!stored) {
        return { entries: [], brainDumps: [] };
    }
    try {
        const data = JSON.parse(stored);
        // Ensure brainDumps array exists for backward compatibility
        return { entries: data.entries || [], brainDumps: data.brainDumps || [] };
    } catch {
        return { entries: [], brainDumps: [] };
    }
}

function saveJournal(data: JournalData, userId?: string): void {
    const key = getUserStorageKey(JOURNAL_KEY, userId);
    localStorage.setItem(key, JSON.stringify(data));
}

async function generateAIInsights(content: string, prompt: string): Promise<{ summary: string; polished: string }> {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    if (!apiKey) {
        console.log('No API key found for AI insights');
        return { summary: '', polished: '' };
    }

    if (content.length < 10) {
        console.log('Content too short for AI insights');
        return { summary: '', polished: '' };
    }

    try {
        const aiPrompt = `You are a supportive personal growth coach and insightful therapist. The user responded to this journal prompt: "${prompt}"

Their response: "${content}"

Provide a comprehensive, thoughtful analysis with the following structure:

1. **Key Themes**: Identify 2-3 main themes or emotions in their response
2. **Reflection**: A warm, empathetic 3-4 sentence reflection that validates their feelings and offers perspective
3. **Actionable Insight**: One specific, practical suggestion they could try based on their reflection
4. **Affirmation**: A short, powerful affirmation sentence they can take with them

Also generate a "polished" version of their response that enhances clarity and emotional articulation while preserving their authentic voice.

Return ONLY a valid JSON object (no markdown):
{"summary": "**Key Themes:** [themes]\\n\\n**Reflection:** [your thoughtful reflection]\\n\\n**Actionable Insight:** [practical suggestion]\\n\\n**Affirmation:** [empowering statement]", "polished": "The improved version..."}`;

        console.log('Generating AI insights for journal entry...');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: aiPrompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
                }),
            }
        );

        if (!response.ok) {
            console.error('AI API response not ok:', response.status, response.statusText);
            return { summary: '', polished: '' };
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        console.log('Raw AI response:', text.substring(0, 200));

        // Clean up JSON response
        if (text.startsWith('```json')) text = text.slice(7);
        if (text.startsWith('```')) text = text.slice(3);
        if (text.endsWith('```')) text = text.slice(0, -3);
        text = text.trim();

        try {
            const result = JSON.parse(text);
            console.log('AI insights generated successfully');
            return {
                summary: result.summary || '',
                polished: result.polished || ''
            };
        } catch (parseError) {
            console.error('Error parsing AI response as JSON:', parseError);
            // Fallback: Try to extract summary from plain text
            if (text.length > 10) {
                return {
                    summary: text.length > 200 ? text.substring(0, 200) + '...' : text,
                    polished: ''
                };
            }
            return { summary: '', polished: '' };
        }
    } catch (error) {
        console.error('Error generating AI insights:', error);
        return { summary: '', polished: '' };
    }
}

export function useJournal(userId?: string) {
    const [journal, setJournal] = useState<JournalData>(() => loadJournal(userId));
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Reload data when userId changes
    useEffect(() => {
        const newData = loadJournal(userId);
        setJournal(newData);
    }, [userId]);

    const todayEntry = journal.entries.find(e => e.date === getTodayKey());
    const dailyPrompt = getDailyPrompt();

    const saveEntry = useCallback(async (content: string, mood?: 'great' | 'okay' | 'low', shouldGenerateAI: boolean = true) => {
        const todayKey = getTodayKey();
        const existingIndex = journal.entries.findIndex(e => e.date === todayKey);

        let summary = '';
        let polished = '';

        // Only generate AI insights if Pro user (shouldGenerateAI = true)
        if (shouldGenerateAI) {
            setIsGeneratingAI(true);
            const result = await generateAIInsights(content, dailyPrompt);
            summary = result.summary;
            polished = result.polished;
            setIsGeneratingAI(false);
        }

        const entry: JournalEntry = {
            id: existingIndex >= 0 ? journal.entries[existingIndex].id : `entry-${Date.now()}`,
            date: todayKey,
            prompt: dailyPrompt,
            content, // Preserve original user input
            aiSummary: summary,
            polishedContent: polished,
            mood,
            createdAt: existingIndex >= 0 ? journal.entries[existingIndex].createdAt : new Date().toISOString(),
        };

        const updated = { ...journal };
        if (existingIndex >= 0) {
            updated.entries[existingIndex] = entry;
        } else {
            updated.entries.unshift(entry);
        }

        saveJournal(updated, userId);
        setJournal(updated);
        return entry;
    }, [journal, dailyPrompt, userId]);

    const getRecentEntries = useCallback((limit: number = 7) => {
        return journal.entries.slice(0, limit);
    }, [journal]);

    const getWeeklySummary = useCallback(() => {
        const last7Days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const weekEntries = journal.entries.filter(e => last7Days.includes(e.date));
        const moodCounts = { great: 0, okay: 0, low: 0 };

        weekEntries.forEach(e => {
            if (e.mood) moodCounts[e.mood]++;
        });

        return {
            entriesCount: weekEntries.length,
            moodCounts,
            dominantMood: Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as 'great' | 'okay' | 'low' | undefined,
        };
    }, [journal]);

    // Brain Dump functions
    const saveBrainDump = useCallback((content: string) => {
        const entry: BrainDumpEntry = {
            id: `braindump-${Date.now()}`,
            timestamp: new Date().toISOString(),
            content,
        };

        const updated = { ...journal };
        updated.brainDumps = [entry, ...(updated.brainDumps || [])];
        saveJournal(updated, userId);
        setJournal(updated);
        return entry;
    }, [journal, userId]);

    const getBrainDumps = useCallback((limit: number = 10) => {
        return (journal.brainDumps || []).slice(0, limit);
    }, [journal]);

    const organizeBrainDump = useCallback(async (dumpId: string): Promise<string> => {
        const dump = journal.brainDumps?.find(d => d.id === dumpId);
        if (!dump) return '';

        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

        // Fallback organization
        const generateFallback = () => {
            const lines = dump.content.split(/[.\n]+/).filter(l => l.trim());
            const tasks = lines.filter(l => l.toLowerCase().includes('need') || l.toLowerCase().includes('must') || l.toLowerCase().includes('should') || l.toLowerCase().includes('call') || l.toLowerCase().includes('buy'));
            const ideas = lines.filter(l => l.toLowerCase().includes('idea') || l.toLowerCase().includes('maybe') || l.toLowerCase().includes('could'));
            const rest = lines.filter(l => !tasks.includes(l) && !ideas.includes(l));

            let result = '';
            if (tasks.length > 0) result += `**📋 Tasks:**\n${tasks.map(t => `• ${t.trim()}`).join('\n')}\n\n`;
            if (ideas.length > 0) result += `**💡 Ideas:**\n${ideas.map(i => `• ${i.trim()}`).join('\n')}\n\n`;
            if (rest.length > 0) result += `**💭 Thoughts:**\n${rest.map(r => `• ${r.trim()}`).join('\n')}`;

            return result || '**💭 Thoughts:**\n• ' + dump.content;
        };

        if (!apiKey) {
            const organized = generateFallback();
            // Update the dump with organized content
            const updated = { ...journal };
            const dumpIndex = updated.brainDumps?.findIndex(d => d.id === dumpId) ?? -1;
            if (dumpIndex >= 0 && updated.brainDumps) {
                updated.brainDumps[dumpIndex] = { ...updated.brainDumps[dumpIndex], organizedContent: organized };
                saveJournal(updated, userId);
                setJournal(updated);
            }
            return organized;
        }

        try {
            const prompt = `You are an AI assistant helping organize a brain dump. The user has written their unstructured thoughts. Organize them into clear categories.

Brain dump content:
"${dump.content}"

Organize this into the following categories (only include categories that have content):
- **📋 Tasks:** Action items, things to do
- **💡 Ideas:** Creative thoughts, possibilities, maybes
- **💭 Reflections:** Feelings, observations, musings
- **⚡ Priorities:** Urgent or important items

Format each item as a bullet point. Keep the user's original meaning. Return ONLY the organized content with the category headers.`;

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

            let organized = '';
            if (response.ok) {
                const data = await response.json();
                organized = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || generateFallback();
            } else {
                organized = generateFallback();
            }

            // Update the dump with organized content
            const updated = { ...journal };
            const dumpIndex = updated.brainDumps?.findIndex(d => d.id === dumpId) ?? -1;
            if (dumpIndex >= 0 && updated.brainDumps) {
                updated.brainDumps[dumpIndex] = { ...updated.brainDumps[dumpIndex], organizedContent: organized };
                saveJournal(updated, userId);
                setJournal(updated);
            }
            return organized;
        } catch (error) {
            console.error('Error organizing brain dump:', error);
            return generateFallback();
        }
    }, [journal, userId]);

    return {
        journal,
        todayEntry,
        dailyPrompt,
        saveEntry,
        getRecentEntries,
        getWeeklySummary,
        isGeneratingAI,
        // Brain Dump exports
        saveBrainDump,
        getBrainDumps,
        organizeBrainDump,
    };
}
