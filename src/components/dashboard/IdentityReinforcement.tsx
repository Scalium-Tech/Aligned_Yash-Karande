import { motion } from 'framer-motion';
import { Heart, Quote } from 'lucide-react';

interface IdentityReinforcementProps {
  message: string;
}

export function IdentityReinforcement({ message }: IdentityReinforcementProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative rounded-2xl bg-gradient-to-br from-primary/5 via-violet/5 to-transparent border border-primary/10 p-6 overflow-hidden"
    >
      {/* Decorative quote mark */}
      <Quote className="absolute top-4 right-4 w-12 h-12 text-primary/10 rotate-180" />
      
      <div className="relative flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-violet/20 flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">Daily Reminder</p>
          <p className="text-foreground font-medium text-lg leading-relaxed">
            {message || "Showing up gently today is exactly how the person you're becoming builds trust."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
