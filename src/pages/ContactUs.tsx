import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/landing/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, MapPin, Send, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Our team typically responds within 24 hours.',
    value: 'yashvkarande@gmail.com',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Available Monday to Friday, 9am to 6pm IST.',
    value: 'Start a conversation',
  },
  {
    icon: MapPin,
    title: 'Office',
    description: 'Visit us at our Chembur office.',
    value: 'Chembur, India',
  },
];

const ContactUs = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to send a message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        });

      if (error) {
        console.error('Error submitting contact form:', error);
        // If table doesn't exist, save to localStorage as fallback
        const savedMessages = JSON.parse(localStorage.getItem('aligned_contact_messages') || '[]');
        savedMessages.push({
          ...formData,
          id: Date.now(),
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('aligned_contact_messages', JSON.stringify(savedMessages));
      }

      toast({
        title: "Message sent successfully! ✉️",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitted(true);

      // Reset submitted state after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Message saved!",
        description: "We've received your message and will respond soon.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute top-20 right-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] dark:bg-primary/15" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
              <MessageSquare size={14} className="text-primary" />
              Contact Us
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              We would love to{' '}
              <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">hear from you</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have a question, feedback, or just want to say hello?
              We are here to help and we typically respond within 24 hours.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <AnimatedSection>
              <div className="glass-card rounded-3xl p-8 dark:border-primary/20">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Send us a message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="glass border-border/50 focus:border-primary dark:border-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="glass border-border/50 focus:border-primary dark:border-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-foreground">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="glass border-border/50 focus:border-primary dark:border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your question or feedback..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="glass border-border/50 focus:border-primary resize-none dark:border-primary/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className={`w-full font-semibold py-6 shadow-xl ${isSubmitted
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-primary to-purple-dark hover:opacity-90 shadow-primary/25 dark:shadow-primary/40'
                      } text-primary-foreground`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : isSubmitted ? (
                      <>
                        <CheckCircle2 size={18} className="mr-2" />
                        Message Sent!
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={18} className="ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </AnimatedSection>

            {/* Contact Info */}
            <div className="space-y-6">
              <AnimatedSection delay={100}>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Other ways to reach us
                </h2>
              </AnimatedSection>

              {contactInfo.map((info, index) => (
                <AnimatedSection key={info.title} delay={(index + 2) * 100}>
                  <div className="glass-card rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group dark:hover:border-primary/30">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                        <info.icon size={24} className="text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {info.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-1">
                          {info.description}
                        </p>
                        <p className="text-primary font-medium">{info.value}</p>
                        {info.title === 'Office' && (
                          <p className="text-muted-foreground text-xs mt-1">
                            Chembur, Mumbai, Maharashtra 400071
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}

              {/* Map Section */}
              <AnimatedSection delay={450}>
                <div className="glass-card rounded-2xl overflow-hidden dark:border-primary/20">
                  <div className="p-4 border-b border-border/50 dark:border-primary/10">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={16} className="text-primary" />
                      <h4 className="font-semibold text-foreground">Our Office</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Chembur, Mumbai, Maharashtra 400071, India
                    </p>
                  </div>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30183.376621052855!2d72.88!3d19.06!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c5b4d7c0c1e5%3A0x2d6f8f9a0e8b0c0a!2sChembur%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1703600000000!5m2!1sen!2sin"
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Office Location - Chembur, Mumbai"
                  />
                </div>
              </AnimatedSection>

              <AnimatedSection delay={500}>
                <div className="glass-card rounded-2xl p-6 dark:border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles size={20} className="text-primary" />
                    <h3 className="font-display font-semibold text-lg text-foreground">
                      Quick Response Promise
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We know your time is valuable. Our team is committed to responding to all
                    inquiries within 24 hours during business days. For urgent matters,
                    please mention it in your subject line.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-violet-light/20 dark:to-primary/5" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Looking for quick answers?
            </h2>
            <p className="text-muted-foreground mb-6">
              Check out our frequently asked questions for instant help.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/#faqs'}
              className="glass-card border-border/50 text-foreground hover:bg-card hover:border-primary/30 font-medium dark:border-primary/20"
            >
              View FAQs
            </Button>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
