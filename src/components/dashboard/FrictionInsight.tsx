import { motion } from 'framer-motion';
import { Lightbulb, Shield } from 'lucide-react';

interface FrictionInsightProps {
  insight: string;
}

export function FrictionInsight({ insight }: FrictionInsightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">Friction Awareness</h3>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-foreground/80 leading-relaxed">
            {insight || "When energy feels low, doing fewer things with intention is still progress. Be gentle with yourself."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
