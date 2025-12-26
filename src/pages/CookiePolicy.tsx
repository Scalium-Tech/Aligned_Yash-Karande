import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/landing/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Cookie, Check, X } from 'lucide-react';

const cookieTypes = [
  {
    name: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions made by you, such as setting your privacy preferences, logging in, or filling in forms.',
    required: true,
    examples: ['Session management', 'Security tokens', 'Load balancing'],
  },
  {
    name: 'Performance Cookies',
    description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular.',
    required: false,
    examples: ['Page view analytics', 'Error tracking', 'Speed monitoring'],
  },
  {
    name: 'Functional Cookies',
    description: 'These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.',
    required: false,
    examples: ['Language preferences', 'Theme settings', 'User preferences'],
  },
  {
    name: 'Marketing Cookies',
    description: 'These cookies may be set through our site by our advertising partners. They may be used to build a profile of your interests and show you relevant ads on other sites.',
    required: false,
    examples: ['Targeted advertising', 'Social media sharing', 'Retargeting'],
  },
];

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute top-20 right-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] dark:bg-primary/15" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
              <Cookie size={14} className="text-primary" />
              Cookie Policy
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              How We Use Cookies
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: December 24, 2024
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="glass-card rounded-3xl p-8 lg:p-12 dark:border-primary/20 mb-8">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">What Are Cookies?</h2>
                  <p className="text-muted-foreground mb-6">
                    Cookies are small text files that are stored on your device when you visit a website. 
                    They are widely used to make websites work more efficiently and to provide information 
                    to website owners. Cookies help us remember your preferences, understand how you use 
                    our service, and improve your experience.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Our Cookie Philosophy</h2>
                  <p className="text-muted-foreground mb-6">
                    At Aligned, we believe in transparency and minimal data collection. We only use cookies 
                    that are necessary for the functioning of our service or that genuinely improve your 
                    experience. We never sell your data, and we give you control over non-essential cookies.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">How We Use Cookies</h2>
                  <p className="text-muted-foreground mb-4">We use cookies for the following purposes:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                    <li><strong className="text-foreground">Authentication:</strong> To keep you logged in and secure your session.</li>
                    <li><strong className="text-foreground">Preferences:</strong> To remember your settings like theme (light/dark mode).</li>
                    <li><strong className="text-foreground">Analytics:</strong> To understand how our service is used and improve it.</li>
                    <li><strong className="text-foreground">Security:</strong> To protect against fraud and unauthorized access.</li>
                  </ul>
                </div>
              </div>
            </AnimatedSection>

            {/* Cookie Types */}
            <AnimatedSection delay={100}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
                Types of Cookies We Use
              </h2>
              <div className="space-y-4">
                {cookieTypes.map((cookie, index) => (
                  <div key={cookie.name} className="glass-card rounded-2xl p-6 dark:border-primary/20">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cookie.required ? 'bg-gradient-to-br from-primary to-teal-dark' : 'bg-muted'}`}>
                          <Cookie size={20} className={cookie.required ? 'text-primary-foreground' : 'text-muted-foreground'} />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-lg text-foreground">
                            {cookie.name}
                          </h3>
                          {cookie.required && (
                            <span className="text-xs text-primary font-medium">Always active</span>
                          )}
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cookie.required ? 'bg-primary/20' : 'bg-muted'}`}>
                        {cookie.required ? (
                          <Check size={16} className="text-primary" />
                        ) : (
                          <X size={16} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">
                      {cookie.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cookie.examples.map((example) => (
                        <span key={example} className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="glass-card rounded-3xl p-8 lg:p-12 dark:border-primary/20 mt-8">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">Third-Party Cookies</h2>
                  <p className="text-muted-foreground mb-6">
                    In some cases, we use cookies from trusted third parties. These include analytics 
                    providers who help us understand how our service is used. We carefully select our 
                    partners and ensure they meet our privacy standards.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Managing Your Cookies</h2>
                  <p className="text-muted-foreground mb-4">You have several options to control cookies:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                    <li><strong className="text-foreground">Browser Settings:</strong> Most browsers allow you to refuse cookies or delete existing ones.</li>
                    <li><strong className="text-foreground">Our Cookie Banner:</strong> You can manage your preferences when you first visit our site.</li>
                    <li><strong className="text-foreground">Account Settings:</strong> Logged-in users can adjust cookie preferences in their settings.</li>
                  </ul>
                  <p className="text-muted-foreground mb-6">
                    Please note that disabling certain cookies may affect the functionality of our service. 
                    Essential cookies cannot be disabled as they are necessary for the website to function.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Cookie Retention</h2>
                  <p className="text-muted-foreground mb-6">
                    Different cookies have different lifespans. Session cookies are deleted when you close 
                    your browser, while persistent cookies remain until they expire or you delete them. 
                    Most of our cookies expire within 30 days, except for preference cookies which may 
                    last up to one year.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Updates to This Policy</h2>
                  <p className="text-muted-foreground mb-6">
                    We may update this Cookie Policy from time to time. Any changes will be posted on 
                    this page with an updated revision date. We encourage you to review this policy 
                    periodically to stay informed about how we use cookies.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have questions about our use of cookies, please contact us at{' '}
                    <a href="mailto:privacy@aligned.app" className="text-primary hover:underline">
                      privacy@aligned.app
                    </a>{' '}
                    or visit our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
