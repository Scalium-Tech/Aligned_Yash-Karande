import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Smile, Meh, Frown, Zap, Battery, BatteryLow, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoodEnergyData {
    mood: 'great' | 'okay' | 'low' | null;
    energy: 'high' | 'medium' | 'low' | null;
    timestamp: string;
}

const STORAGE_KEY = 'aligned_mood_energy';

function getTodayKey() {
    return new Date().toISOString().split('T')[0];
}

function loadTodayCheckin(): MoodEnergyData | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
        const data = JSON.parse(stored);
        const todayKey = getTodayKey();
        return data[todayKey] || null;
    } catch {
        return null;
    }
}

function saveCheckin(data: MoodEnergyData) {
    const stored = localStorage.getItem(STORAGE_KEY);
    let allData: Record<string, MoodEnergyData> = {};

    try {
        if (stored) {
            allData = JSON.parse(stored);
        }
    } catch {
        allData = {};
    }

    allData[getTodayKey()] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

export function MoodEnergyCheckin() {
    const [mood, setMood] = useState<'great' | 'okay' | 'low' | null>(null);
    const [energy, setEnergy] = useState<'high' | 'medium' | 'low' | null>(null);
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const todayData = loadTodayCheckin();
        if (todayData) {
            setMood(todayData.mood);
            setEnergy(todayData.energy);
            setHasCheckedIn(true);
        }
    }, []);

    const handleSubmit = () => {
        if (mood && energy) {
            const data: MoodEnergyData = {
                mood,
                energy,
                timestamp: new Date().toISOString(),
            };
            saveCheckin(data);
            setHasCheckedIn(true);
            setShowConfirmation(true);
            setTimeout(() => setShowConfirmation(false), 2000);
        }
    };

    const moodOptions = [
        { value: 'great', icon: Smile, label: 'Great', color: 'text-emerald-500' },
        { value: 'okay', icon: Meh, label: 'Okay', color: 'text-amber-500' },
        { value: 'low', icon: Frown, label: 'Low', color: 'text-rose-500' },
    ] as const;

    const energyOptions = [
        { value: 'high', icon: Zap, label: 'High', color: 'text-emerald-500' },
        { value: 'medium', icon: Battery, label: 'Medium', color: 'text-amber-500' },
        { value: 'low', icon: BatteryLow, label: 'Low', color: 'text-rose-500' },
    ] as const;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full"
        >
            <div className="mb-4">
                <h3 className="font-semibold text-foreground">Daily Check-in</h3>
                <p className="text-xs text-muted-foreground">How are you feeling today?</p>
            </div>

            {showConfirmation ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 gap-3"
                >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-foreground font-medium">Check-in saved!</p>
                </motion.div>
            ) : (
                <>
                    {/* Mood Selection */}
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Mood</p>
                        <div className="flex gap-2">
                            {moodOptions.map((option) => {
                                const Icon = option.icon;
                                const isSelected = mood === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setMood(option.value)}
                                        className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${isSelected
                                                ? 'bg-primary/10 border-2 border-primary'
                                                : 'bg-secondary/30 border-2 border-transparent hover:bg-secondary/50'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 ${isSelected ? option.color : 'text-muted-foreground'}`} />
                                        <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Energy Selection */}
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Energy</p>
                        <div className="flex gap-2">
                            {energyOptions.map((option) => {
                                const Icon = option.icon;
                                const isSelected = energy === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setEnergy(option.value)}
                                        className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${isSelected
                                                ? 'bg-primary/10 border-2 border-primary'
                                                : 'bg-secondary/30 border-2 border-transparent hover:bg-secondary/50'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 ${isSelected ? option.color : 'text-muted-foreground'}`} />
                                        <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit Button */}
                    {!hasCheckedIn && (
                        <Button
                            onClick={handleSubmit}
                            disabled={!mood || !energy}
                            className="w-full bg-gradient-to-r from-primary to-violet hover:opacity-90 text-primary-foreground disabled:opacity-50"
                        >
                            Save Check-in
                        </Button>
                    )}

                    {hasCheckedIn && !showConfirmation && (
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                ✓ Checked in today
                            </p>
                            <button
                                onClick={() => setHasCheckedIn(false)}
                                className="text-xs text-primary hover:underline mt-1"
                            >
                                Update
                            </button>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}
