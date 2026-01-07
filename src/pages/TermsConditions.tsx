import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/landing/AnimatedSection';
import { FileText } from 'lucide-react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] dark:bg-primary/15" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
              <FileText size={14} className="text-primary" />
              Terms & Conditions
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              Terms of Service
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
              <div className="glass-card rounded-3xl p-8 lg:p-12 dark:border-primary/20">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">Agreement to Terms</h2>
                  <p className="text-muted-foreground mb-6">
                    By accessing or using AlignedOS, you agree to be bound by these Terms and Conditions. 
                    If you disagree with any part of these terms, you may not access the service. These 
                    Terms apply to all visitors, users, and others who access or use our service.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Use of Service</h2>
                  <p className="text-muted-foreground mb-4">You agree to use Aligned only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                    <li>Use the service in any way that violates applicable laws or regulations</li>
                    <li>Attempt to gain unauthorized access to any part of the service</li>
                    <li>Use the service to transmit malicious code or harmful content</li>
                    <li>Impersonate any person or entity or misrepresent your affiliation</li>
                    <li>Interfere with or disrupt the service or servers connected to the service</li>
                    <li>Use automated systems to access the service without our permission</li>
                  </ul>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Account Registration</h2>
                  <p className="text-muted-foreground mb-6">
                    To use certain features of AlignedOSOS, you must register for an account. You agree to 
                    provide accurate, current, and complete information during registration and to update 
                    such information to keep it accurate. You are responsible for safeguarding your password 
                    and for all activities that occur under your account.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Subscription and Payments</h2>
                  <p className="text-muted-foreground mb-4">Some features of AlignedOSOS require a paid subscription:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                    <li><strong className="text-foreground">Billing:</strong> Subscriptions are billed in advance on a monthly basis.</li>
                    <li><strong className="text-foreground">Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.</li>
                    <li><strong className="text-foreground">Refunds:</strong> We offer a 7-day money-back guarantee for first-time subscribers.</li>
                    <li><strong className="text-foreground">Price Changes:</strong> We reserve the right to modify subscription prices with 30 days notice.</li>
                  </ul>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Intellectual Property</h2>
                  <p className="text-muted-foreground mb-6">
                    The service and its original content, features, and functionality are and will remain 
                    the exclusive property of AlignedOS and its licensors. The service is protected by copyright, 
                    trademark, and other laws. Our trademarks may not be used in connection with any product 
                    or service without our prior written consent.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">User Content</h2>
                  <p className="text-muted-foreground mb-6">
                    You retain ownership of any content you submit to the service. By submitting content, 
                    you grant us a non-exclusive, worldwide, royalty-free license to use, store, and process 
                    that content solely for the purpose of providing the service to you. We do not claim 
                    ownership of your personal data, goals, or reflections.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">AI-Generated Content</h2>
                  <p className="text-muted-foreground mb-6">
                    Aligned uses artificial intelligence to generate weekly plans and recommendations. 
                    While we strive for accuracy, AI-generated content is provided for informational purposes 
                    only. You are responsible for reviewing and adapting any suggestions to your specific 
                    circumstances. We are not liable for decisions made based on AI recommendations.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Limitation of Liability</h2>
                  <p className="text-muted-foreground mb-6">
                    To the maximum extent permitted by law, Aligned shall not be liable for any indirect, 
                    incidental, special, consequential, or punitive damages, or any loss of profits or revenues, 
                    whether incurred directly or indirectly, or any loss of data, use, goodwill, or other 
                    intangible losses resulting from your use of the service.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Disclaimer</h2>
                  <p className="text-muted-foreground mb-6">
                    The service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. 
                    We do not guarantee that the service will be uninterrupted, secure, or error-free. Aligned 
                    is a productivity tool and is not a substitute for professional mental health, medical, or 
                    financial advice.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Termination</h2>
                  <p className="text-muted-foreground mb-6">
                    We may terminate or suspend your account immediately, without prior notice, for any reason, 
                    including breach of these Terms. Upon termination, your right to use the service will cease 
                    immediately. You may also delete your account at any time through your account settings.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Governing Law</h2>
                  <p className="text-muted-foreground mb-6">
                    These Terms shall be governed by and construed in accordance with the laws of India, 
                    without regard to its conflict of law provisions. Any disputes arising from these Terms 
                    shall be resolved in the courts of Bangalore, Karnataka.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Changes to Terms</h2>
                  <p className="text-muted-foreground mb-6">
                    We reserve the right to modify these Terms at any time. We will provide notice of 
                    significant changes by posting the new Terms on this page and updating the "Last updated" 
                    date. Your continued use of the service after changes constitutes acceptance of the new Terms.
                  </p>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 mt-8">Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about these Terms, please contact us at{' '}
                    <a href="mailto:legal@aligned.app" className="text-primary hover:underline">
                      legal@aligned.app
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

export default TermsConditions;
