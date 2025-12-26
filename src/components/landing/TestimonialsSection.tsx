import { useEffect, useState } from 'react';
import { AnimatedSection } from './AnimatedSection';
import { Quote, Star } from 'lucide-react';
import { useFeedback } from '@/hooks/useFeedback';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

const staticTestimonials: Testimonial[] = [
  {
    quote: "Aligned helped me finally understand why I kept falling off track. It's not about doing more — it's about doing what matters to who I want to become.",
    name: 'Priya Sharma',
    role: 'Computer Science Student',
    avatar: 'PS',
    rating: 5,
  },
  {
    quote: "I've tried every productivity app out there. This is the first one that doesn't make me feel guilty. It actually feels calming to use.",
    name: 'Arjun Mehta',
    role: 'Product Manager',
    avatar: 'AM',
    rating: 5,
  },
  {
    quote: "The AI weekly planning saved me hours. It knows my patterns better than I do and creates realistic plans that I actually follow.",
    name: 'Sarah Chen',
    role: 'Freelance Designer',
    avatar: 'SC',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const { fetchApprovedTestimonials, testimonials: dbTestimonials, isLoading } = useFeedback();
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>(staticTestimonials);

  useEffect(() => {
    fetchApprovedTestimonials();
  }, []);

  useEffect(() => {
    if (dbTestimonials.length > 0) {
      // Convert database testimonials to the display format
      const formattedDbTestimonials: Testimonial[] = dbTestimonials.map((t) => ({
        quote: t.feedback,
        name: t.name,
        role: t.role,
        avatar: t.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
        rating: t.rating,
      }));
      // Combine static and database testimonials (show static first, then database ones)
      setAllTestimonials([...staticTestimonials, ...formattedDbTestimonials]);
    }
  }, [dbTestimonials]);

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-light/20 to-background dark:via-primary/5" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] dark:bg-primary/10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
            <Star size={14} className="text-primary fill-primary" />
            Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Loved by <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">intentional</span> people
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from students, professionals, and creators who've found their alignment.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {allTestimonials.slice(0, 6).map((testimonial, index) => (
            <AnimatedSection key={`${testimonial.name}-${index}`} delay={index * 100}>
              <div className="h-full glass-card rounded-3xl p-6 lg:p-8 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group dark:hover:border-primary/30 dark:hover:shadow-primary/20">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>

                <Quote size={32} className="text-primary/20 mb-4 group-hover:text-primary/40 transition-colors dark:text-primary/30 dark:group-hover:text-primary/50" />

                <blockquote className="text-foreground leading-relaxed mb-6 text-[15px]">
                  "{testimonial.quote}"
                </blockquote>

                <div className="flex items-center gap-4 pt-4 border-t border-border/50 dark:border-primary/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center text-primary-foreground font-semibold shadow-lg shadow-primary/20 dark:shadow-primary/40">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

