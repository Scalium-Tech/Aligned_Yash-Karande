import { Heart, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const footerLinks = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQs', href: '/#faqs' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Share Feedback', href: '/feedback' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  connect: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yash-karande-b3544a2a1/' },
    { label: 'Twitter', href: 'https://x.com/YashK57440' },
    { label: 'Instagram', href: '#' },
    { label: 'Discord', href: '#' },
  ],
};

export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleProductLinkClick = (href: string) => {
    if (href.startsWith('/#')) {
      const anchor = href.substring(1); // Get '#features' from '/#features'
      if (location.pathname === '/') {
        // Already on home page, just scroll
        const element = document.querySelector(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to home page with anchor
        navigate('/');
        // Wait for navigation then scroll
        setTimeout(() => {
          const element = document.querySelector(anchor);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-border/50 dark:border-primary/10">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30 dark:to-primary/5" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow dark:shadow-primary/30">
                <span className="text-primary-foreground font-display font-bold text-xl">A</span>
              </div>
              <span className="font-display font-semibold text-xl text-foreground">Aligned</span>
            </a>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs leading-relaxed">
              Stay consistent by aligning who you are with what you do.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles size={12} className="text-primary" />
              <span>Built for intentional living</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-5">Product</h4>
            <ul className="space-y-3.5">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleProductLinkClick(link.href)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-5">Company</h4>
            <ul className="space-y-3.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-5">Legal</h4>
            <ul className="space-y-3.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-5">Connect</h4>
            <ul className="space-y-3.5">
              {footerLinks.connect.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 dark:border-primary/10 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aligned. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Made with <Heart size={14} className="text-primary fill-primary animate-pulse" /> for intentional people
          </p>
        </div>
      </div>
    </footer>
  );
}
