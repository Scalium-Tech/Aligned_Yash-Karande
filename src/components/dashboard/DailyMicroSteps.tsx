import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles, Heart, Zap, Coffee } from 'lucide-react';
import { useState } from 'react';

interface MicroStep {
  id: string;
  text: string;
  type: 'goal' | 'habit' | 'health' | 'rest';
  completed: boolean;
}

interface DailyMicroStepsProps {
  steps: MicroStep[];
  onToggle?: (id: string) => void;
}

const typeIcons = {
  goal: Zap,
  habit: Sparkles,
  health: Heart,
  rest: Coffee,
};

const typeColors = {
  goal: 'text-primary',
  habit: 'text-violet',
  health: 'text-emerald-500',
  rest: 'text-amber-500',
};

export function DailyMicroSteps({ steps: initialSteps, onToggle }: DailyMicroStepsProps) {
  const [steps, setSteps] = useState<MicroStep[]>(initialSteps || [
    { id: '1', text: 'Work on one portfolio piece for 30 minutes', type: 'goal', completed: false },
    { id: '2', text: 'Take a 10-minute walk outside', type: 'habit', completed: false },
    { id: '3', text: 'Drink a full glass of water', type: 'health', completed: false },
    { id: '4', text: 'Take a mindful break if needed', type: 'rest', completed: false },
  ]);

  const handleToggle = (id: string) => {
    setSteps(prev => 
      prev.map(step => 
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    );
    onToggle?.(id);
  };

  const completedCount = steps.filter(s => s.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground">Today's Gentle Steps</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount} of {steps.length}
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = typeIcons[step.type];
          return (
            <motion.button
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => handleToggle(step.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 text-left group
                ${step.completed 
                  ? 'bg-primary/5 border border-primary/20' 
                  : 'bg-secondary/30 border border-transparent hover:bg-secondary/50'
                }`}
            >
              <div className={`shrink-0 transition-colors ${typeColors[step.type]}`}>
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                )}
              </div>
              <span className={`flex-1 transition-all ${
                step.completed 
                  ? 'text-muted-foreground line-through' 
                  : 'text-foreground'
              }`}>
                {step.text}
              </span>
              <Icon className={`w-4 h-4 shrink-0 ${typeColors[step.type]} opacity-50`} />
            </motion.button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-muted-foreground/80 italic text-center">
        Complete what feels right. There's no pressure here.
      </p>
    </motion.div>
  );
}
