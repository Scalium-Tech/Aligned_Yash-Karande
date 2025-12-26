import { AnimatedSection } from './AnimatedSection';
import { User, Brain, ListChecks, Target, Heart } from 'lucide-react';

const features = [
  {
    icon: User,
    title: 'Identity-Based Planning',
    description: 'Start with who you want to become. Your goals and tasks flow naturally from your core identity.',
    color: 'from-primary to-purple-dark',
  },
  {
    icon: Brain,
    title: 'AI Weekly Planning',
    description: 'Let AI create your weekly plan based on your identity, goals, and real-life constraints.',
    color: 'from-purple-dark to-violet',
  },
  {
    icon: ListChecks,
    title: 'Daily Micro-Steps',
    description: 'Break down big goals into small, achievable daily actions that compound over time.',
    color: 'from-violet to-primary',
  },
  {
    icon: Target,
    title: 'Focus + Reflection Loop',
    description: 'Stay present with focus sessions and grow through daily reflections that build self-awareness.',
    color: 'from-primary to-violet',
  },
  {
    icon: Heart,
    title: 'Health & Non-Negotiables',
    description: 'Protect your energy with built-in wellness tracking and habits that keep you grounded.',
    color: 'from-purple-dark to-primary',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-light/20 to-background dark:via-primary/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] dark:bg-primary/10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">stay aligned</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete system designed to help you move from intention to action, 
            without the overwhelm.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={feature.title} delay={index * 100}>
              <div className="group h-full glass-card rounded-2xl p-6 lg:p-8 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer dark:hover:border-primary/30 dark:hover:shadow-primary/20">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:shadow-primary/40 transition-all`}>
                  <feature.icon size={26} className="text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
