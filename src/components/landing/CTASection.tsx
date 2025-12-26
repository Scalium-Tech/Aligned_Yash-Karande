import { AnimatedSection } from './AnimatedSection';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section id="cta" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse dark:bg-primary/15" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet/20 rounded-full blur-[150px] animate-pulse dark:bg-primary/10" style={{ animationDelay: '1s' }} />

      {/* Subtle pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] dark:bg-[linear-gradient(to_right,hsl(var(--primary)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.08)_1px,transparent_1px)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-full text-sm font-medium mb-8 shadow-lg dark:border-primary/20">
            <Sparkles size={16} className="text-primary" />
            <span className="text-foreground">Start your journey today</span>
            <Star size={14} className="text-primary fill-primary" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 leading-[1.1]">
            Start aligning your actions with{' '}
            <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">who you want to become</span>
          </h2>

          <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of intentional people building meaningful lives — one calm,
            focused day at a time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-primary to-purple-dark hover:opacity-90 text-primary-foreground font-semibold px-12 py-7 text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all group dark:shadow-primary/50"
            >
              Start Free
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-8 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              No credit card required
            </span>
            <span className="w-1 h-1 rounded-full bg-border dark:bg-primary/30" />
            <span>Free forever plan available</span>
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
