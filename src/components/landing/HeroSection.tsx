import { Button } from '@/components/ui/button';
import { AnimatedSection } from './AnimatedSection';
import { ArrowRight, Play, Sparkles, Users, Shield, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse dark:bg-primary/15" />
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-violet/20 rounded-full blur-[100px] animate-pulse dark:bg-primary/10" style={{ animationDelay: '1s' }} />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] dark:bg-[linear-gradient(to_right,hsl(var(--primary)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.1)_1px,transparent_1px)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="max-w-xl">
            <AnimatedSection delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm font-medium mb-6 shadow-sm">
                <Sparkles size={16} className="text-primary" />
                <span className="text-foreground">Built for intentional living</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
                Stay consistent by aligning{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">who you are</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-dark rounded-full opacity-30 dark:opacity-50" />
                </span>{' '}
                with what you do.
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                No burnout. No streak pressure. Just one calm system that helps you plan, 
                act, and reflect — all built around your identity and values.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button
                  size="lg"
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-primary to-purple-dark hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all group dark:shadow-primary/40"
                >
                  Start Free
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection('#how-it-works')}
                  className="glass-card border-border/50 hover:bg-card text-foreground font-medium px-8 py-6 text-base group dark:hover:border-primary/30"
                >
                  <Play size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                  See How It Works
                </Button>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <span>Built for students & professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-primary" />
                  <span>No ads. No streak pressure.</span>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* App Mockup */}
          <AnimatedSection delay={200} animation="slide-right" className="relative lg:pl-8">
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet/20 rounded-[3rem] blur-3xl scale-90 dark:from-primary/30 dark:to-primary/10" />
              
              {/* Phone mockup */}
              <div className="relative mx-auto w-72 sm:w-80 animate-float">
                <div className="glass-strong rounded-[2.5rem] p-3 shadow-2xl shadow-primary/10 dark:shadow-primary/20">
                  <div className="bg-gradient-to-br from-background to-muted/50 rounded-[2rem] overflow-hidden dark:from-card dark:to-muted/30">
                    {/* Status bar */}
                    <div className="flex justify-between items-center px-6 py-3 text-xs text-muted-foreground">
                      <span className="font-medium">9:41</span>
                      <div className="flex gap-1.5">
                        <div className="w-4 h-2.5 bg-foreground/20 rounded-sm" />
                        <div className="w-4 h-2.5 bg-foreground/20 rounded-sm" />
                        <div className="w-6 h-3 bg-primary/50 rounded-sm" />
                      </div>
                    </div>

                    {/* App content */}
                    <div className="px-5 pb-8 pt-2">
                      <div className="text-center mb-6">
                        <p className="text-xs text-muted-foreground mb-1">Good morning</p>
                        <h3 className="font-display font-semibold text-foreground text-lg">Today's Focus</h3>
                      </div>

                      {/* Identity card */}
                      <div className="glass-card rounded-2xl p-4 mb-4 shimmer dark:border-primary/20">
                        <p className="text-xs text-muted-foreground mb-2">I am becoming</p>
                        <p className="font-medium text-foreground text-sm leading-relaxed">A focused learner who prioritizes deep work</p>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 glass-card rounded-xl p-3.5 hover-lift cursor-pointer dark:border-primary/10">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center shadow-sm shadow-primary/30">
                            <CheckCircle2 size={12} className="text-primary-foreground" />
                          </div>
                          <span className="text-sm text-foreground font-medium">Morning meditation</span>
                        </div>
                        <div className="flex items-center gap-3 glass-card rounded-xl p-3.5 hover-lift cursor-pointer dark:border-primary/10">
                          <div className="w-5 h-5 rounded-full border-2 border-primary/50" />
                          <span className="text-sm text-muted-foreground">2 hours deep work</span>
                        </div>
                        <div className="flex items-center gap-3 glass-card rounded-xl p-3.5 hover-lift cursor-pointer dark:border-primary/10">
                          <div className="w-5 h-5 rounded-full border-2 border-border dark:border-primary/20" />
                          <span className="text-sm text-muted-foreground">Evening reflection</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -right-4 top-20 glass-card rounded-xl p-3.5 shadow-xl hover-lift dark:border-primary/20 dark:shadow-primary/30" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-violet-light flex items-center justify-center dark:from-primary/30 dark:to-primary/10">
                      <Sparkles size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">AI Weekly Plan</p>
                      <p className="text-[10px] text-muted-foreground">Ready for you</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-4 bottom-32 glass-card rounded-xl p-3.5 shadow-xl hover-lift dark:border-primary/20 dark:shadow-primary/30" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center shadow-sm shadow-primary/30">
                      <span className="text-xs font-bold text-primary-foreground">85%</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Weekly Progress</p>
                      <p className="text-[10px] text-primary font-medium">You're on track!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
