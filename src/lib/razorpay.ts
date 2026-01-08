// Razorpay Payment Utility

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image?: string;
    order_id?: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

interface RazorpayInstance {
    open: () => void;
    close: () => void;
}

export interface PaymentResult {
    success: boolean;
    paymentId?: string;
    error?: string;
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const PLAN_PRICES = {
    monthly: {
        amount: 100, // ₹1 in paise
        display: '₹1',
        description: 'Pro Monthly Plan',
    },
    yearly: {
        amount: 1000, // ₹10 in paise
        display: '₹10',
        description: 'Pro Yearly Plan',
    },
};

export function initiatePayment(
    planType: 'monthly' | 'yearly',
    onSuccess: (paymentId: string, planType: string) => void,
    onFailure: (error: string) => void,
    userInfo?: { name?: string; email?: string }
): void {
    // Validate Razorpay key is configured
    if (!RAZORPAY_KEY_ID) {
        console.error('Razorpay key not configured. Please set VITE_RAZORPAY_KEY_ID in your .env file.');
        onFailure('Payment system not configured. Please contact support.');
        return;
    }

    const plan = PLAN_PRICES[planType];

    const options: RazorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: plan.amount,
        currency: 'INR',
        name: 'AlignedOS',
        description: plan.description,
        image: '/logo.png',
        handler: function (response: RazorpayResponse) {
            // Payment successful
            const paymentId = response.razorpay_payment_id;

            // Store payment info in localStorage for signup flow
            localStorage.setItem('pendingPayment', JSON.stringify({
                paymentId,
                planType,
                amount: plan.amount,
                timestamp: new Date().toISOString(),
            }));

            onSuccess(paymentId, planType);
        },
        prefill: {
            name: userInfo?.name || '',
            email: userInfo?.email || '',
            contact: '',
        },
        theme: {
            color: '#8B5CF6', // Primary purple color
        },
        modal: {
            ondismiss: function () {
                onFailure('Payment cancelled');
            },
        },
    };

    try {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
    } catch (error) {
        onFailure('Failed to initialize payment. Please try again.');
    }
}

// Get pending payment info (if exists)
export function getPendingPayment(): { paymentId: string; planType: string; amount: number } | null {
    const stored = localStorage.getItem('pendingPayment');
    if (stored) {
        return JSON.parse(stored);
    }
    return null;
}

// Clear pending payment info
export function clearPendingPayment(): void {
    localStorage.removeItem('pendingPayment');
}
