import { AnimatedSection } from './AnimatedSection';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Everything you need to get started',
    features: [
      'Identity-based goal setting',
      'Daily task management',
      'Basic reflection prompts',
      'Weekly planning (manual)',
      'Mobile-friendly interface',
    ],
    cta: 'Start Free',
    highlighted: false,
    available: true,
  },
  {
    name: 'Pro',
    price: '₹299',
    period: '/month',
    description: 'For serious growth-seekers',
    features: [
      'Everything in Free',
      'AI-powered weekly planning',
      'Advanced analytics & insights',
      'Custom reflection templates',
      'Focus session timers',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
    available: true,
  },
  {
    name: 'Premium',
    price: '₹799',
    period: '/month',
    description: 'Complete life alignment',
    features: [
      'Everything in Pro',
      'AI life coach (coming soon)',
      'Group accountability',
      'Habit stacking features',
      'API access',
      'White-glove onboarding',
    ],
    cta: 'Coming Soon',
    highlighted: false,
    available: false,
  },
];

export function PricingSection() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background dark:from-muted/10" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-violet/10 rounded-full blur-[150px] dark:bg-primary/10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
            <Zap size={14} className="text-primary" />
            Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Simple, <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">transparent</span> pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free. Upgrade when you're ready for more powerful features.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <AnimatedSection key={plan.name} delay={index * 100}>
              <div
                className={`relative h-full rounded-3xl p-6 lg:p-8 transition-all duration-500 ${plan.highlighted
                    ? 'glass-card shadow-2xl shadow-primary/20 scale-105 border-primary/30 dark:shadow-primary/30 dark:border-primary/40'
                    : 'glass-card hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 dark:hover:shadow-primary/20 dark:hover:border-primary/30'
                  } ${!plan.available ? 'opacity-70' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-primary to-purple-dark text-primary-foreground text-xs font-semibold rounded-full shadow-lg shadow-primary/30 dark:shadow-primary/50">
                      <Sparkles size={12} />
                      Most Popular
                    </span>
                  </div>
                )}

                {!plan.available && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className={`font-display text-5xl font-bold ${plan.highlighted ? 'bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent' : 'text-foreground'}`}>
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.highlighted ? 'bg-gradient-to-br from-primary to-purple-dark shadow-sm shadow-primary/30' : 'bg-primary/20 dark:bg-primary/30'}`}>
                        <Check size={12} className={plan.highlighted ? 'text-primary-foreground' : 'text-primary'} />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => plan.available && navigate('/signup')}
                  className={`w-full py-6 font-semibold ${plan.highlighted
                      ? 'bg-gradient-to-r from-primary to-purple-dark hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-primary/40'
                      : plan.available
                        ? 'glass-card border-border/50 text-foreground hover:bg-card hover:border-primary/30 dark:hover:border-primary/40'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  disabled={!plan.available}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={400} className="flex flex-wrap justify-center gap-8 mt-16 text-sm text-muted-foreground">
          {['No ads', 'No data selling', 'Cancel anytime', 'Student-friendly pricing'].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <Check size={12} className="text-primary" />
              </div>
              {item}
            </span>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
