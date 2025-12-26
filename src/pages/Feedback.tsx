import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, MessageSquareHeart, ArrowLeft, Loader2 } from 'lucide-react';
import { useFeedback } from '@/hooks/useFeedback';
import { cn } from '@/lib/utils';

export default function Feedback() {
    const navigate = useNavigate();
    const { submitFeedback, isSubmitting } = useFeedback();
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        feedback: '',
        rating: 5,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await submitFeedback(formData);
        if (result.success) {
            setFormData({ name: '', role: '', feedback: '', rating: 5 });
            // Navigate to homepage after short delay
            setTimeout(() => navigate('/'), 2000);
        }
    };

    const handleRatingClick = (rating: number) => {
        setFormData((prev) => ({ ...prev, rating }));
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>

                    <div className="max-w-2xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-dark mb-6 shadow-lg shadow-primary/30">
                                <MessageSquareHeart className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                                Share Your Feedback
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto">
                                We'd love to hear about your experience with Aligned. Your feedback helps us improve!
                            </p>
                        </div>

                        {/* Feedback Form */}
                        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-6">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-foreground font-medium">
                                    Your Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            {/* Role Field */}
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-foreground font-medium">
                                    Your Role / Occupation
                                </Label>
                                <Input
                                    id="role"
                                    type="text"
                                    placeholder="e.g. Student, Designer, Engineer..."
                                    value={formData.role}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            {/* Rating Field */}
                            <div className="space-y-2">
                                <Label className="text-foreground font-medium">Your Rating</Label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingClick(star)}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={32}
                                                className={cn(
                                                    'transition-colors',
                                                    star <= formData.rating
                                                        ? 'text-yellow-500 fill-yellow-500'
                                                        : 'text-muted-foreground/30'
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback Field */}
                            <div className="space-y-2">
                                <Label htmlFor="feedback" className="text-foreground font-medium">
                                    Your Feedback
                                </Label>
                                <Textarea
                                    id="feedback"
                                    placeholder="Tell us about your experience with Aligned..."
                                    value={formData.feedback}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, feedback: e.target.value }))}
                                    required
                                    rows={5}
                                    className="bg-background/50 resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-primary to-purple-dark hover:opacity-90 text-white font-medium py-6 text-lg shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Feedback'
                                )}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Your feedback may be featured in our testimonials section.
                            </p>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
