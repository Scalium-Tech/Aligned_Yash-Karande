import { AnimatedSection } from './AnimatedSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Is AlignedOS really free?',
    answer: 'Yes! The free plan includes everything you need to get started with identity-based planning, daily tasks, and basic reflections. You can use it forever without paying.',
  },
  {
    question: "What's included in the free plan?",
    answer: 'The free plan includes identity-based goal setting, daily task management, basic reflection prompts, manual weekly planning, and a mobile-friendly interface. It\'s designed to be genuinely useful, not a teaser.',
  },
  {
    question: 'When should I upgrade to Pro?',
    answer: "Consider Pro when you want AI-powered weekly planning, advanced analytics to understand your patterns, custom reflection templates, and focus session timers. It's designed for people who are serious about growth.",
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. There are no contracts or commitments. You can upgrade, downgrade, or cancel your subscription at any time with just a few clicks.',
  },
  {
    question: 'Is my data safe?',
    answer: 'Your privacy is our priority. We use industry-standard encryption, never sell your data, and give you full control over your information. You can export or delete your data anytime.',
  },
];

export function FAQsSection() {
  return (
    <section id="faqs" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background dark:from-muted/10" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] dark:bg-primary/10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
            <HelpCircle size={14} className="text-primary" />
            FAQs
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Frequently asked{' '}
            <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about AlignedOS.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={100} className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card rounded-2xl px-6 data-[state=open]:shadow-xl data-[state=open]:shadow-primary/10 transition-all border-none dark:data-[state=open]:shadow-primary/20 dark:data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5 hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
}
