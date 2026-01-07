import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/landing/AnimatedSection';
import { RotateCcw, Shield, Clock, CheckCircle2, XCircle, AlertTriangle, Mail, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] dark:bg-primary/15" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <AnimatedSection className="text-center max-w-3xl mx-auto">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-sm font-medium mb-6">
                            <RotateCcw size={14} className="text-primary" />
                            Cancellations & Refunds
                        </span>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                            Cancellation &{' '}
                            <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent">Refund Policy</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Transparent policies for a hassle-free experience
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
                                {/* Money Back Guarantee Banner */}
                                <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-primary/10 border border-emerald-500/20">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                                            <Shield size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                                                7-Day Money-Back Guarantee
                                            </h3>
                                            <p className="text-muted-foreground">
                                                We're confident you'll love AlignedOS! Try any paid plan risk-free. If you're not completely
                                                satisfied within the first 7 days, we'll refund your payment in full - no questions asked.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Cancellation Policy */}
                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <XCircle size={24} className="text-primary" />
                                        <h2 className="font-display text-2xl font-bold text-foreground">Cancellation Policy</h2>
                                    </div>
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>
                                            You have the freedom to cancel your subscription at any time. Here's what you need to know:
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                </div>
                                                <span><strong className="text-foreground">Cancel anytime:</strong> You can cancel your subscription from your dashboard settings at any time.</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                </div>
                                                <span><strong className="text-foreground">Access until period ends:</strong> Your access continues until the end of your current billing period.</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                </div>
                                                <span><strong className="text-foreground">No cancellation fees:</strong> We don't charge any fees for cancelling your subscription.</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                </div>
                                                <span><strong className="text-foreground">Data retention:</strong> Your data is retained for 30 days after cancellation, allowing you to reactivate if you change your mind.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Refund Eligibility */}
                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <CheckCircle2 size={24} className="text-primary" />
                                        <h2 className="font-display text-2xl font-bold text-foreground">Refund Eligibility</h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                        {/* Eligible */}
                                        <div className="p-5 rounded-xl glass border border-emerald-500/30 dark:border-emerald-500/20">
                                            <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                                <CheckCircle2 size={18} />
                                                Eligible for Refund
                                            </h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                                    <span>Requested within 7 days of first-time subscription</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                                    <span>Technical issues preventing service access</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                                    <span>Duplicate/erroneous charges</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                                    <span>Service not delivered as described</span>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Not Eligible */}
                                        <div className="p-5 rounded-xl glass border border-red-500/30 dark:border-red-500/20">
                                            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                                                <XCircle size={18} />
                                                Not Eligible for Refund
                                            </h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">✗</span>
                                                    <span>Requests made after 7-day period</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">✗</span>
                                                    <span>Previous refund already granted on account</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">✗</span>
                                                    <span>Violation of Terms of Service</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">✗</span>
                                                    <span>Change of mind after extensive service use</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Refund Process */}
                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Clock size={24} className="text-primary" />
                                        <h2 className="font-display text-2xl font-bold text-foreground">Refund Process</h2>
                                    </div>
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>To request a refund, please follow these steps:</p>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4 p-4 rounded-xl glass border border-border/50 dark:border-primary/20">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                                                    1
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">Submit Request</h4>
                                                    <p className="text-sm">Email us at <a href="mailto:yashvkarande@gmail.com" className="text-primary hover:underline">yashvkarande@gmail.com</a> with "Refund Request" in the subject line.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4 p-4 rounded-xl glass border border-border/50 dark:border-primary/20">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                                                    2
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">Provide Details</h4>
                                                    <p className="text-sm">Include your registered email address, transaction ID, and reason for refund.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4 p-4 rounded-xl glass border border-border/50 dark:border-primary/20">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                                                    3
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">Review & Processing</h4>
                                                    <p className="text-sm">Our team will review your request within 2-3 business days and notify you of the outcome.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4 p-4 rounded-xl glass border border-border/50 dark:border-primary/20">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                                                    4
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">Refund Issued</h4>
                                                    <p className="text-sm">Approved refunds are processed within 5-7 business days to your original payment method.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Refund Timeline */}
                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Clock size={24} className="text-primary" />
                                        <h2 className="font-display text-2xl font-bold text-foreground">Refund Timeline</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border/50 dark:border-primary/20">
                                                    <th className="text-left py-3 px-4 text-foreground font-semibold">Payment Method</th>
                                                    <th className="text-left py-3 px-4 text-foreground font-semibold">Processing Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-muted-foreground">
                                                <tr className="border-b border-border/30 dark:border-primary/10">
                                                    <td className="py-3 px-4">UPI / Net Banking</td>
                                                    <td className="py-3 px-4">5-7 business days</td>
                                                </tr>
                                                <tr className="border-b border-border/30 dark:border-primary/10">
                                                    <td className="py-3 px-4">Credit/Debit Card</td>
                                                    <td className="py-3 px-4">5-10 business days</td>
                                                </tr>
                                                <tr className="border-b border-border/30 dark:border-primary/10">
                                                    <td className="py-3 px-4">Wallet (Paytm, PhonePe, etc.)</td>
                                                    <td className="py-3 px-4">24-72 hours</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-3 px-4">International Cards</td>
                                                    <td className="py-3 px-4">7-14 business days</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Important Notes */}
                                <div className="mb-10 p-6 rounded-2xl glass border border-amber-500/30 dark:border-amber-500/20">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                                            <AlertTriangle size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                                                Important Notes
                                            </h3>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li>• Refunds are credited to the original payment method only</li>
                                                <li>• Partial refunds may be issued for mid-cycle cancellations at our discretion</li>
                                                <li>• Promotional or discounted subscriptions may have different refund terms</li>
                                                <li>• We reserve the right to deny refund requests that violate our policies</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="p-6 rounded-2xl glass border border-border/50 dark:border-primary/20">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-dark flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                                            <HelpCircle size={24} className="text-primary-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                                                Need Help?
                                            </h3>
                                            <p className="text-muted-foreground mb-4">
                                                Our support team is here to assist you with any questions about cancellations or refunds.
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

export default RefundPolicy;
