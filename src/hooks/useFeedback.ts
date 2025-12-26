import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FeedbackData {
    name: string;
    role: string;
    feedback: string;
    rating: number;
}

interface Testimonial {
    id: string;
    name: string;
    role: string;
    feedback: string;
    rating: number;
    created_at: string;
}

export function useFeedback() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    const submitFeedback = async (data: FeedbackData) => {
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('feedback')
                .insert({
                    name: data.name,
                    role: data.role,
                    feedback: data.feedback,
                    rating: data.rating,
                });

            if (error) throw error;

            toast.success('Thank you for your feedback!', {
                description: 'Your testimonial has been submitted successfully.',
            });
            return { success: true };
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Failed to submit feedback', {
                description: 'Please try again later.',
            });
            return { success: false, error };
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchApprovedTestimonials = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .eq('approved', true)
                .order('created_at', { ascending: false })
                .limit(6);

            if (error) throw error;

            setTestimonials(data || []);
            return data || [];
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return {
        submitFeedback,
        fetchApprovedTestimonials,
        testimonials,
        isSubmitting,
        isLoading,
    };
}
