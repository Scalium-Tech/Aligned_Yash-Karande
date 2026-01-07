import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/landing/AnimatedSection';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] dark:bg-primary/15" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
              <Shield size={14} className="text-primary" />
              Privacy Policy
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              Your Privacy Matters
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: December 24, 2025
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="glass-card rounded-3xl p-8 lg:p-12 dark:border-primary/20">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">Introduction</h2>
                  <p className="text-muted-foreground mb-6">
                    At AlignedOS, we take your privacy seriously. This Privacy Policy explains how we collect, 
                    use, disclose, and safeguard your information when you use our application and services. 
                    Please read this policy carefully to understand our practices regarding your personal data.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Information We Collect</h2>
                  <p className="text-muted-foreground mb-4">We collect information that you provide directly to us, including:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                    <li><strong className="text-foreground">Account Information:</strong> Name, email address, and password when you create an account.</li>
                    <li><strong className="text-foreground">Profile Data:</strong> Identity statements, goals, and preferences you choose to share.</li>
                    <li><strong className="text-foreground">Usage Data:</strong> Tasks, reflections, and progress data you enter into the app.</li>
                    <li><strong className="text-foreground">Communication Data:</strong> Messages you send to our support team.</li>
                  </ul>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Generate AI-powered weekly plans and personalized recommendations</li>
                    <li>Send you updates, security alerts, and support messages</li>
                    <li>Analyze usage patterns to improve user experience</li>
                    <li>Protect against fraud and unauthorized access</li>
                  </ul>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Data Storage and Security</h2>
                  <p className="text-muted-foreground mb-6">
                    Your data is stored securely using industry-standard encryption. We use SSL/TLS encryption 
                    for data in transit and AES-256 encryption for data at rest. Our servers are hosted in 
                    secure data centers with 24/7 monitoring and regular security audits.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Data Sharing</h2>
                  <p className="text-muted-foreground mb-4">We do not sell your personal data. We may share your information only in the following circumstances:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                    <li><strong className="text-foreground">Service Providers:</strong> With trusted third parties who assist in operating our services.</li>
                    <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to protect our rights.</li>
                    <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                  </ul>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Your Rights</h2>
                  <p className="text-muted-foreground mb-4">You have the right to:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                    <li>Access and download your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Request data portability</li>
                  </ul>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Data Retention</h2>
                  <p className="text-muted-foreground mb-6">
                    We retain your personal data for as long as your account is active or as needed to provide 
                    you services. If you delete your account, we will delete your data within 30 days, except 
                    where we are required to retain it for legal purposes.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Children's Privacy</h2>
                  <p className="text-muted-foreground mb-6">
                    Our services are not intended for children under 13 years of age. We do not knowingly 
                    collect personal information from children under 13. If we learn we have collected such 
                    information, we will delete it promptly.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Changes to This Policy</h2>
                  <p className="text-muted-foreground mb-6">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by 
                    posting the new policy on this page and updating the "Last updated" date. We encourage you 
                    to review this policy periodically.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about this Privacy Policy, please contact us at{' '}
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

export default PrivacyPolicy;
