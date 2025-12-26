import { motion } from 'framer-motion';
import { Clock, Focus } from 'lucide-react';

interface FocusBlockProps {
  duration: string;
  suggestion: string;
}

export function FocusBlock({ duration, suggestion }: FocusBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border/30 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Focus className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Focus Block</h3>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{duration || "30-45 min"}</span>
        </div>
        <span className="text-sm text-muted-foreground">recommended</span>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">
        {suggestion || "Based on your typical capacity, this duration works well for deep work without draining you."}
      </p>
    </motion.div>
  );
}
