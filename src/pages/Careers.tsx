import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/landing/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, ArrowRight, Sparkles, Heart, Zap, Coffee } from 'lucide-react';

const openPositions = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Build beautiful, accessible interfaces that help people live more intentionally.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'Shape the future of calm productivity through thoughtful, human-centered design.',
  },
  {
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Build reliable, scalable systems that power millions of daily micro-steps.',
  },
  {
    title: 'Content Writer',
    department: 'Marketing',
    location: 'Remote (Worldwide)',
    type: 'Part-time',
    description: 'Create content that inspires intentional living and mindful productivity.',
  },
];

const benefits = [
  {
    icon: Heart,
    title: 'Health First',
    description: 'Comprehensive health insurance and mental wellness support.',
  },
  {
    icon: Coffee,
    title: 'Flexible Hours',
    description: 'Work when you are most productive. No 9-to-5 required.',
  },
  {
    icon: Zap,
    title: 'Learning Budget',
    description: 'Annual budget for courses, books, and conferences.',
  },
  {
    icon: MapPin,
    title: 'Remote First',
    description: 'Work from anywhere. We believe in async communication.',
  },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] dark:bg-primary/15" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
              <Briefcase size={14} className="text-primary" />
              Careers
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Join us in building{' '}
              <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">calm technology</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We are a small, remote team passionate about helping people live more intentionally. 
              If you believe technology should calm us, not stress us, we would love to hear from you.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Why Join Aligned?
            </h2>
            <p className="text-lg text-muted-foreground">
              We practice what we preach — intentional work, sustainable pace, and meaningful impact.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={benefit.title} delay={index * 100}>
                <div className="glass-card rounded-2xl p-6 h-full hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 dark:hover:border-primary/30">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                    <benefit.icon size={24} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-light/20 to-background dark:via-primary/5" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
              <Sparkles size={14} className="text-primary" />
              Open Positions
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Find Your Role
            </h2>
            <p className="text-lg text-muted-foreground">
              We are always looking for passionate people to join our mission.
            </p>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto space-y-4">
            {openPositions.map((position, index) => (
              <AnimatedSection key={position.title} delay={index * 100}>
                <div className="glass-card rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group dark:hover:border-primary/30">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
                          {position.title}
                        </h3>
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full dark:bg-primary/20">
                          {position.department}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        {position.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-primary" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-primary" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-purple-dark hover:opacity-90 text-primary-foreground font-medium shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all dark:shadow-primary/30">
                      Apply Now
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={500} className="text-center mt-12">
            <p className="text-muted-foreground">
              Do not see a role that fits?{' '}
              <a href="/contact" className="text-primary hover:underline font-medium">
                Send us a message
              </a>{' '}
              — we are always open to meeting great people.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
