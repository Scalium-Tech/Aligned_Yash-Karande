import { useState } from 'react';
import { AnimatedSection } from './AnimatedSection';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { initiatePayment, clearPendingPayment } from '@/lib/razorpay';
import { useAuth } from '@/contexts/AuthContext';

const freePlan = {
  name: 'Free',
  price: '₹0',
  period: 'forever',
  description: 'Everything you need to get started',
  features: [
    'Identity-based goal setting',
    'Basic reflection prompts',
  ],
  cta: 'Start Free',
};

const proPlan = {
  name: 'Pro',
  monthlyPrice: '₹1',
  yearlyPrice: '₹10',
  description: 'For serious growth-seekers',
  features: [
    'AI-powered weekly planning',
    'Daily habits tracking',
    'Yearly → quarterly goal breakdown',
    'Advanced insights & analytics',
    'Custom reflection templates',
    'Focus session timers',
    'Priority support',
  ],
  cta: 'Upgrade to Pro',
};

export function PricingSection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProPayment = () => {
    setIsProcessing(true);
    const planType = isYearly ? 'yearly' : 'monthly';

    initiatePayment(
      planType,
      async (paymentId, plan) => {
        // Payment successful
        toast({
          title: 'Payment Successful!',
          description: `Your ${plan} Pro plan has been activated.`,
        });

        // If user is logged in, update their profile directly
        if (user) {
          const { supabase } = await import('@/lib/supabase');
          await supabase
            .from('profiles')
            .update({
              is_pro: true,
              plan_type: planType,
              razorpay_payment_id: paymentId,
              payment_date: new Date().toISOString(),
            })
            .eq('id', user.id);

          // Refresh profile to get updated data
          await refreshProfile();

          setIsProcessing(false);
          navigate('/dashboard');
        } else {
          // New user - redirect to signup
          setIsProcessing(false);
          navigate('/signup');
        }
      },
      (error) => {
        // Payment failed or cancelled
        if (error !== 'Payment cancelled') {
          toast({
            variant: 'destructive',
            title: 'Payment Failed',
            description: error,
          });
        }
        setIsProcessing(false);
      },
      // Pass user info for Razorpay prefill
      user ? { name: profile?.full_name, email: user.email } : undefined
    );
  };

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
          <p className="text-lg text-muted-foreground mb-8">
            Start free. Upgrade when you're ready for more powerful features.
          </p>

          {/* Monthly/Yearly Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isYearly ? 'bg-gradient-to-r from-primary to-purple-dark' : 'bg-muted'
                }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isYearly ? 'translate-x-8' : 'translate-x-1'
                  }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                Save ₹2
              </span>
            )}
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto items-start">
          {/* Free Plan */}
          <AnimatedSection delay={0}>
            <div className="relative h-full rounded-3xl p-6 lg:p-8 transition-all duration-500 glass-card hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 dark:hover:shadow-primary/20 dark:hover:border-primary/30">
              <div className="text-center mb-8">
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                  {freePlan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="font-display text-5xl font-bold text-foreground">
                    {freePlan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">{freePlan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{freePlan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {freePlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-primary/20 dark:bg-primary/30">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => {
                  clearPendingPayment(); // Clear any stale Pro payment data
                  navigate('/signup');
                }}
                className="w-full py-6 font-semibold glass-card border-border/50 text-foreground hover:bg-card hover:border-primary/30 dark:hover:border-primary/40"
                variant="outline"
              >
                {freePlan.cta}
              </Button>
            </div>
          </AnimatedSection>

          {/* Pro Plan */}
          <AnimatedSection delay={100}>
            <div className="relative h-full rounded-3xl p-6 lg:p-8 transition-all duration-500 glass-card shadow-2xl shadow-primary/20 scale-105 border-primary/30 dark:shadow-primary/30 dark:border-primary/40">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-primary to-purple-dark text-primary-foreground text-xs font-semibold rounded-full shadow-lg shadow-primary/30 dark:shadow-primary/50">
                  <Sparkles size={12} />
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                  {proPlan.name}
                </h3>

                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="font-display text-5xl font-bold bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">
                    {isYearly ? proPlan.yearlyPrice : proPlan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {isYearly ? '/year' : '/month'}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">{proPlan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {proPlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-primary to-purple-dark shadow-sm shadow-primary/30">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleProPayment}
                disabled={isProcessing}
                className="w-full py-6 font-semibold bg-gradient-to-r from-primary to-purple-dark hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-primary/40"
              >
                {isProcessing ? 'Processing...' : proPlan.cta}
              </Button>
            </div>
          </AnimatedSection>
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
