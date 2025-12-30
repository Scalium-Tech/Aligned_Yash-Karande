import { useParams, Link, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/landing/AnimatedSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User, Calendar, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import { blogPosts } from '@/data/blogPostsData';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] dark:bg-primary/15" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="max-w-3xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full dark:bg-primary/20">
                {post.category}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock size={14} />
                {post.readTime}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-border/50 dark:border-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                  <img
                    src="/founder-yash-karande.jpg"
                    alt={post.author}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">{post.author}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar size={12} />
                    {post.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Share:</span>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary">
                  <Twitter size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary">
                  <Linkedin size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary">
                  <Facebook size={16} />
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="max-w-3xl mx-auto">
            <article className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-display prose-headings:text-foreground prose-headings:font-bold
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:text-muted-foreground prose-ol:text-muted-foreground
              prose-li:marker:text-primary
              prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic
              prose-hr:border-border/50 dark:prose-hr:border-primary/20
            ">
              <div dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
            </article>
          </AnimatedSection>
        </div>
      </section>

      {/* Author Bio */}
      <section className="py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-light/20 to-background dark:via-primary/5" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="max-w-3xl mx-auto">
            <div className="glass-card rounded-2xl p-6 lg:p-8 dark:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20 flex-shrink-0">
                  <img
                    src="/founder-yash-karande.jpg"
                    alt={post.author}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-1">
                    About {post.author}
                  </h3>
                  <p className="text-muted-foreground">
                    {post.authorBio}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="max-w-5xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                Related Articles
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost, index) => (
                  <AnimatedSection key={relatedPost.id} delay={index * 100}>
                    <Link to={`/blog/${relatedPost.slug}`}>
                      <article className="group glass-card rounded-2xl p-6 h-full hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 dark:hover:border-primary/30">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full dark:bg-primary/20">
                            {relatedPost.category}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={12} />
                            {relatedPost.readTime}
                          </span>
                        </div>

                        <h3 className="font-display font-semibold text-lg text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                          {relatedPost.title}
                        </h3>

                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </article>
                    </Link>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <div className="glass-card rounded-3xl p-8 lg:p-12 dark:border-primary/20">
              <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Ready to start your intentional living journey?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join thousands who are using Aligned to align their daily actions with their deeper purpose.
              </p>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-primary to-purple-dark hover:opacity-90 text-primary-foreground font-medium px-8 py-6 text-lg shadow-lg shadow-primary/20">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Simple markdown-like content formatter
function formatContent(content: string): string {
  return content
    .split('\n')
    .map(line => {
      // Headers
      if (line.startsWith('## ')) {
        return `<h2>${line.slice(3)}</h2>`;
      }
      if (line.startsWith('### ')) {
        return `<h3>${line.slice(4)}</h3>`;
      }
      // Horizontal rule
      if (line.startsWith('---')) {
        return '<hr />';
      }
      // Bold text
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Italic text
      line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
      // List items
      if (line.startsWith('- ')) {
        return `<li>${line.slice(2)}</li>`;
      }
      if (line.match(/^\d+\. /)) {
        return `<li>${line.replace(/^\d+\. /, '')}</li>`;
      }
      // Paragraphs
      if (line.trim()) {
        return `<p>${line}</p>`;
      }
      return '';
    })
    .join('\n');
}

export default BlogPost;
