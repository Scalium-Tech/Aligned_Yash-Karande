import { motion } from 'framer-motion';
import { Target, Calendar } from 'lucide-react';

interface QuarterGoalProps {
  goal: string;
  quarter: string;
}

export function QuarterGoal({ goal, quarter }: QuarterGoalProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Quarter Focus</h3>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{quarter}</span>
        </div>
      </div>

      <p className="text-foreground/80 leading-relaxed">
        {goal || "Lay a strong foundation for your portfolio through consistent, focused effort."}
      </p>

      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-violet rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '25%' }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <span className="text-sm text-muted-foreground font-medium">Q1</span>
        </div>
      </div>
    </motion.div>
  );
}
