import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';

interface IdentityCardProps {
  identityReflection: string;
  userName: string;
}

export function IdentityCard({ identityReflection, userName }: IdentityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-violet/5 to-background p-8 border border-primary/20"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet flex items-center justify-center shadow-lg shadow-primary/25">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Your Identity</p>
            <h2 className="text-lg font-semibold text-foreground">{userName}</h2>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-1 shrink-0" />
          <p className="text-foreground/90 text-lg leading-relaxed font-medium">
            {identityReflection || "You're becoming a steady, intentional person who values progress without burning out."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
