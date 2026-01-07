import { AnimatedSection } from './AnimatedSection';
import { Lightbulb, Battery, Layers, Zap } from 'lucide-react';

const benefits = [
  {
    icon: Lightbulb,
    title: 'Clarity Over Chaos',
    description: 'Know exactly what to focus on each day. No more decision fatigue or scattered priorities.',
    gradient: 'from-primary to-purple-dark',
  },
  {
    icon: Battery,
    title: 'Consistency Without Burnout',
    description: 'Build sustainable habits that respect your energy. Progress through small wins, not exhausting sprints.',
    gradient: 'from-purple-dark to-violet',
  },
  {
    icon: Layers,
    title: 'Built for Real Life',
    description: 'Flexible enough to adapt when life happens. Your system bends without breaking.',
    gradient: 'from-violet to-primary',
  },
  {
    icon: Zap,
    title: 'One System, Not Multiple Apps',
    description: 'Stop juggling between tools. Everything you need for intentional living in one calm space.',
    gradient: 'from-primary to-violet',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-violet-light/20 dark:from-background dark:to-primary/5" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px] dark:bg-primary/10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
            <Zap size={14} className="text-primary" />
            Why AlignedOS
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Designed for how{' '}
            <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">life actually works</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We built AlignedOS for people who want to grow without grinding themselves down.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <AnimatedSection key={benefit.title} delay={index * 100}>
              <div className="flex gap-5 glass-card rounded-2xl p-6 lg:p-8 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group h-full dark:hover:border-primary/30 dark:hover:shadow-primary/20">
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:shadow-primary/40 transition-all`}>
                    <benefit.icon size={26} className="text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
