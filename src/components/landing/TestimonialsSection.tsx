import { useEffect, useState, useCallback } from 'react';
import { AnimatedSection } from './AnimatedSection';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFeedback } from '@/hooks/useFeedback';
import { motion, AnimatePresence } from 'framer-motion';

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
  {
    quote: "It was an amazing experience using this website. It plans my goals and shows the weekly planning, which helps me to improve my daily routine.",
    name: 'Yash',
    role: 'Student',
    avatar: 'Y',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const { fetchApprovedTestimonials, testimonials: dbTestimonials } = useFeedback();
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>(staticTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchApprovedTestimonials();
  }, []);

  useEffect(() => {
    if (dbTestimonials.length > 0) {
      const formattedDbTestimonials: Testimonial[] = dbTestimonials.map((t) => ({
        quote: t.feedback,
        name: t.name,
        role: t.role,
        avatar: t.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
        rating: t.rating,
      }));
      setAllTestimonials([...staticTestimonials, ...formattedDbTestimonials]);
    }
  }, [dbTestimonials]);

  // Calculate items per view based on screen (we'll show 3 on desktop, 1 on mobile)
  const itemsPerView = 3;
  const totalSlides = Math.ceil(allTestimonials.length / itemsPerView);

  // Auto-slide effect
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  // Get current testimonials to display
  const getCurrentTestimonials = () => {
    const start = currentIndex * itemsPerView;
    return allTestimonials.slice(start, start + itemsPerView);
  };

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

        {/* Carousel Container */}
        <div
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 w-10 h-10 rounded-full glass-card flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"
                aria-label="Previous testimonials"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 w-10 h-10 rounded-full glass-card flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"
                aria-label="Next testimonials"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Testimonials Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-3 gap-6 lg:gap-8"
            >
              {getCurrentTestimonials().map((testimonial, index) => (
                <div
                  key={`${testimonial.name}-${currentIndex}-${index}`}
                  className="h-full glass-card rounded-3xl p-6 lg:p-8 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group dark:hover:border-primary/30 dark:hover:shadow-primary/20"
                >
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
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Dot Indicators */}
          {totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                      ? 'bg-primary w-8'
                      : 'bg-primary/30 hover:bg-primary/50'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Auto-slide indicator */}
          {totalSlides > 1 && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              {isPaused ? 'Paused' : 'Auto-sliding'} • Hover to pause
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
