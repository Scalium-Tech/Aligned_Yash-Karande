import { AnimatedSection } from './AnimatedSection';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Goal, Calendar, ListTodo, RefreshCw } from 'lucide-react';

const steps = [
  {
    icon: User,
    number: '01',
    title: 'Define Your Identity',
    description: 'Start by clarifying who you want to become. Your identity becomes the foundation for everything.',
  },
  {
    icon: Goal,
    number: '02',
    title: 'Set Aligned Goals',
    description: 'Create goals that flow naturally from your identity — meaningful and personally motivating.',
  },
  {
    icon: Calendar,
    number: '03',
    title: 'Get Your AI Weekly Plan',
    description: 'Let AI structure your week around your goals, energy levels, and real-life commitments.',
  },
  {
    icon: ListTodo,
    number: '04',
    title: 'Complete Daily Micro-Steps',
    description: 'Focus on small, achievable actions each day. Progress compounds without overwhelm.',
  },
  {
    icon: RefreshCw,
    number: '05',
    title: 'Reflect & Adjust',
    description: 'End each day with a quick reflection. Learn what works and continuously improve.',
  },
];

export function HowItWorksSection() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background dark:from-muted/10" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-violet/10 rounded-full blur-[150px] dark:bg-primary/10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            From intention to action in{' '}
            <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">5 simple steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A calm, structured approach that takes you from clarity to consistent action.
          </p>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-violet to-primary hidden sm:block lg:-translate-x-px opacity-30 dark:opacity-50" />

            <div className="space-y-6 lg:space-y-0">
              {steps.map((step, index) => (
                <AnimatedSection
                  key={step.number}
                  delay={index * 100}
                  className="relative"
                >
                  <div
                    className={`flex flex-col lg:flex-row items-start lg:items-center gap-6 ${
                      index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Content */}
                    <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:text-left lg:pl-12'}`}>
                      <div
                        className={`glass-card rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group dark:hover:border-primary/30 dark:hover:shadow-primary/20 ${
                          index % 2 === 0 ? 'lg:ml-auto' : 'lg:mr-auto'
                        } lg:max-w-sm`}
                      >
                        <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:shadow-primary/40 transition-all">
                            <step.icon size={20} className="text-primary-foreground" />
                          </div>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full dark:bg-primary/20">{step.number}</span>
                        </div>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="absolute left-8 lg:left-1/2 w-4 h-4 bg-gradient-to-br from-primary to-purple-dark rounded-full -translate-x-1/2 border-4 border-background shadow-lg shadow-primary/30 hidden sm:block dark:shadow-primary/50" style={{ top: '2rem' }} />

                    {/* Spacer for alternating layout */}
                    <div className="flex-1 hidden lg:block" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>

        <AnimatedSection delay={600} className="text-center mt-16">
          <Button
            size="lg"
            onClick={() => scrollToSection('#cta')}
            className="bg-gradient-to-r from-primary to-purple-dark hover:opacity-90 text-primary-foreground font-semibold px-8 shadow-xl shadow-primary/25 group dark:shadow-primary/40"
          >
            Build Your Alignment
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
