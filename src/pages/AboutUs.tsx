import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/landing/AnimatedSection';
import { Heart, Target, Users, Sparkles, Shield, CheckCircle2 } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Intentionality Over Hustle',
    description: 'We believe sustainable growth comes from aligned action, not endless grinding.',
  },
  {
    icon: Target,
    title: 'Clarity Over Complexity',
    description: 'Simple systems that work beat complicated tools that overwhelm.',
  },
  {
    icon: Users,
    title: 'People Over Metrics',
    description: 'Your wellbeing matters more than your streak count.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data belongs to you. We never sell it, ever.',
  },
];

const whyChooseUsFeatures = [
  'All-in-one productivity system — no more app-hopping',
  'AI-powered insights tailored to your goals and habits',
  'Focus on identity and values, not just tasks',
  'Zero streak pressure — be kind to yourself',
  'Beautiful, calming interface designed to reduce overwhelm',
  'Your data stays with you — privacy first, always',
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] dark:bg-primary/15" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
              <Sparkles size={14} className="text-primary" />
              About Us
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Building the future of{' '}
              <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">intentional living</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AlignedOS was born from a simple frustration: why do productivity tools make us feel
              more stressed, not less? I set out to build something different.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* My Story Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
                My Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Hi, I'm <strong className="text-foreground">Yash Karande</strong>, the founder of AlignedOS.
                  In 2025, I was juggling multiple productivity apps, habit trackers,
                  and planners. Despite all these tools, I felt more scattered than ever.
                </p>
                <p>
                  The problem wasn't a lack of tools — it was a lack of alignment. None of these
                  apps asked the fundamental question: <em>Who do you want to become?</em>
                </p>
                <p>
                  AlignedOS was created to fill this gap. I built a system that starts with your
                  identity and values, then helps you take consistent action without the burnout.
                </p>
                <p>
                  Today, I'm on a mission to help students, professionals, and creators build
                  meaningful lives — one calm, focused day at a time.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100} className="relative flex justify-center">
              <div className="relative">
                {/* Founder Image */}
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 ring-4 ring-primary/20">
                  <img
                    src="/founder-yash-karande.jpg"
                    alt="Yash Karande - Founder of Aligned"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary to-purple-dark rounded-2xl -z-10 blur-sm opacity-50" />
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-violet-light to-primary rounded-xl -z-10 blur-sm opacity-40" />
                {/* Name Badge */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 glass-card rounded-xl px-6 py-3 text-center shadow-lg">
                  <p className="font-display font-bold text-foreground">Yash Karande</p>
                  <p className="text-primary text-sm font-medium">Founder & Creator</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-light/20 to-background dark:via-primary/5" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
              My Guiding Principles
            </h2>
            <p className="text-lg text-muted-foreground">
              These principles guide everything I build.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <AnimatedSection key={value.title} delay={index * 100}>
                <div className="glass-card rounded-2xl p-6 h-full hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 dark:hover:border-primary/30">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                    <value.icon size={24} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Content */}
            <AnimatedSection>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium mb-6">
                <CheckCircle2 size={14} className="text-primary" />
                Why Choose Us
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                What Makes AlignedOS Different
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                This isn't just another productivity app. It's built by someone who understands
                the chaos of juggling goals, the guilt of missed streaks, and the need for a system
                that actually works with your life.
              </p>

              {/* Feature List */}
              <div className="space-y-4">
                {whyChooseUsFeatures.map((feature, index) => (
                  <AnimatedSection key={index} delay={index * 50}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>

            {/* Right - Founder Quote Card */}
            <AnimatedSection delay={100} className="flex justify-center lg:justify-end">
              <div className="relative max-w-md">
                <div className="bg-gradient-to-br from-primary to-purple-dark rounded-2xl p-8 text-white shadow-2xl shadow-primary/30">
                  {/* Quote marks */}
                  <div className="text-5xl font-serif opacity-50 mb-4">"</div>

                  <p className="text-lg leading-relaxed mb-6">
                    I built AlignedOS because I wish I had something like this when I was struggling
                    with scattered goals and endless to-do lists. Everyone deserves a calm, focused
                    system that helps them become who they want to be.
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30">
                      <img
                        src="/founder-yash-karande.jpg"
                        alt="Yash Karande"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">Yash Karande</p>
                      <p className="text-white/70 text-sm">Founder & Creator</p>
                    </div>
                  </div>
                </div>

                {/* Decorative blur behind card */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-dark rounded-2xl blur-2xl opacity-30 -z-10 translate-y-4" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
