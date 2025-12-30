import { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/landing/AnimatedSection';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, ArrowRight, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPosts, categories } from '@/data/blogPostsData';

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter posts based on active category
  const filteredPosts = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === activeCategory);

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] dark:bg-primary/15" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
              <BookOpen size={14} className="text-primary" />
              Blog
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Insights for{' '}
              <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">intentional living</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore ideas on productivity, mindfulness, and personal growth.
              Learn how to build a life aligned with your values.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-border/50 dark:border-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === activeCategory
                  ? 'bg-gradient-to-r from-primary to-purple-dark text-primary-foreground shadow-lg shadow-primary/20'
                  : 'glass-card text-muted-foreground hover:text-foreground hover:border-primary/30'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              Featured Articles
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {featuredPosts.map((post, index) => (
              <AnimatedSection key={post.id} delay={index * 100}>
                <Link to={`/blog/${post.slug}`}>
                  <article className="group glass-card rounded-3xl p-6 lg:p-8 h-full hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 dark:hover:border-primary/30">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full dark:bg-primary/20">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl lg:text-2xl text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50 dark:border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20">
                          <img
                            src="/founder-yash-karande.jpg"
                            alt={post.author}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{post.author}</p>
                          <p className="text-xs text-muted-foreground">{post.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 group-hover:translate-x-1 transition-all">
                        Read More
                        <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  </article>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-light/20 to-background dark:via-primary/5" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Latest Articles
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post, index) => (
              <AnimatedSection key={post.id} delay={index * 100}>
                <Link to={`/blog/${post.slug}`}>
                  <article className="group glass-card rounded-2xl p-6 h-full hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 dark:hover:border-primary/30">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full dark:bg-primary/20">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="font-display font-semibold text-lg text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50 dark:border-primary/10">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-primary/20">
                          <img
                            src="/founder-yash-karande.jpg"
                            alt={post.author}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <span>{post.author}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <span>{post.date}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 group-hover:translate-x-1 transition-all">
                        Read More
                        <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  </article>
                </Link>
              </AnimatedSection>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
