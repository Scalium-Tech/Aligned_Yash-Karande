import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/landing/AnimatedSection';
import { Package, Clock, Globe, Shield, Mail, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShippingPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] dark:bg-primary/15" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <AnimatedSection className="text-center max-w-3xl mx-auto">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
                            <Package size={14} className="text-primary" />
                            Shipping & Delivery
                        </span>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                            Shipping{' '}
                            <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">Policy</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Everything you need to know about our digital product delivery
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <AnimatedSection>
                            <div className="glass-card rounded-3xl p-8 lg:p-12 dark:border-primary/20">
                                {/* Digital Product Notice */}
                                <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-dark/10 border border-primary/20">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                                            <Globe size={24} className="text-primary-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                                                100% Digital Product
                                            </h3>
                                            <p className="text-muted-foreground">
                                                Aligned is a fully digital SaaS (Software as a Service) platform. As such, there are no physical goods
                                                to ship. All our services are delivered electronically through our web application.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Instant Access Section */}
                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Clock size={24} className="text-primary" />
                                        <h2 className="font-display text-2xl font-bold text-foreground">Instant Access</h2>
                                    </div>
                                    <p className="text-muted-foreground mb-4">
                                        Upon successful subscription or purchase, you will receive:
                                    </p>
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                            <span><strong className="text-foreground">Immediate activation</strong> of your subscription plan</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                            <span><strong className="text-foreground">Instant access</strong> to all premium features included in your plan</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                            <span><strong className="text-foreground">Email confirmation</strong> with your subscription details and receipt</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                            <span><strong className="text-foreground">Dashboard access</strong> where you can manage your account and features</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Service Delivery Section */}
                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield size={24} className="text-primary" />
                                        <h2 className="font-display text-2xl font-bold text-foreground">Service Delivery</h2>
                                    </div>
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>
                                            Our services are delivered through our secure web platform accessible at{' '}
                                            <a href="https://aligned-yash-karande.vercel.app" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                                aligned-yash-karande.vercel.app
                                            </a>
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                            <div className="p-4 rounded-xl glass border border-border/50 dark:border-primary/20">
                                                <h4 className="font-semibold text-foreground mb-2">🌐 Global Availability</h4>
                                                <p className="text-sm">Access Aligned from anywhere in the world, 24/7, through any modern web browser.</p>
                                            </div>
                                            <div className="p-4 rounded-xl glass border border-border/50 dark:border-primary/20">
                                                <h4 className="font-semibold text-foreground mb-2">📱 Cross-Platform</h4>
                                                <p className="text-sm">Works seamlessly on desktop, tablet, and mobile devices.</p>
                                            </div>
                                            <div className="p-4 rounded-xl glass border border-border/50 dark:border-primary/20">
                                                <h4 className="font-semibold text-foreground mb-2">🔒 Secure Access</h4>
                                                <p className="text-sm">All data is encrypted and securely transmitted via HTTPS.</p>
                                            </div>
                                            <div className="p-4 rounded-xl glass border border-border/50 dark:border-primary/20">
                                                <h4 className="font-semibold text-foreground mb-2">⚡ No Downloads</h4>
                                                <p className="text-sm">No software installation required. Simply log in and start using.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* No Physical Shipping Section */}
                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Package size={24} className="text-primary" />
                                        <h2 className="font-display text-2xl font-bold text-foreground">No Physical Shipping</h2>
                                    </div>
                                    <p className="text-muted-foreground mb-4">
                                        Since Aligned is a digital service:
                                    </p>
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            </div>
                                            <span>No shipping charges apply to any of our subscription plans</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            </div>
                                            <span>No delivery address is required for service activation</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            </div>
                                            <span>No waiting time for physical delivery - enjoy instant access</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            </div>
                                            <span>No shipping-related delays or issues</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Contact Section */}
                                <div className="p-6 rounded-2xl glass border border-border/50 dark:border-primary/20">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                                            <HelpCircle size={24} className="text-primary-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                                                Have Questions?
                                            </h3>
                                            <p className="text-muted-foreground mb-4">
                                                If you have any questions about accessing our services or need assistance, our support team is here to help.
                                            </p>
                                            <div className="flex flex-wrap gap-4">
                                                <Link
                                                    to="/contact"
                                                    className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                                                >
                                                    <Mail size={16} />
                                                    Contact Support
                                                </Link>
                                                <span className="text-muted-foreground">•</span>
                                                <a
                                                    href="mailto:yashvkarande@gmail.com"
                                                    className="text-primary hover:underline font-medium"
                                                >
                                                    yashvkarande@gmail.com
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Last Updated */}
                                <div className="mt-10 pt-6 border-t border-border/50 dark:border-primary/10 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Last updated: December 31, 2025
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

export default ShippingPolicy;
