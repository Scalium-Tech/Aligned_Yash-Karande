import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NOTIFICATIONS_KEY = 'aligned_notifications';

interface ScheduledNotification {
    id: string;
    type: string;
    title: string;
    body: string;
    scheduledTime: string;
    enabled: boolean;
    days: number[];
    lastTriggered?: string;
}

interface ActiveAlert {
    id: string;
    title: string;
    body: string;
    timestamp: Date;
}

// Context for in-app notifications
interface NotificationContextType {
    showAlert: (title: string, body: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotificationAlert() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationAlert must be used within NotificationScheduler');
    }
    return context;
}

/**
 * Global notification scheduler component
 * Runs at app level to check for scheduled notifications every minute
 * Shows in-app popup alerts with OK button
 */
export function NotificationScheduler() {
    const lastCheckRef = useRef<string>('');
    const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Show in-app alert
    const showAlert = useCallback((title: string, body: string) => {
        const alert: ActiveAlert = {
            id: `alert-${Date.now()}`,
            title,
            body,
            timestamp: new Date(),
        };
        setActiveAlert(alert);
        setIsVisible(true);

        // Play notification sound (optional - uses a simple beep)
        try {
            const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch {
            // Audio not available, continue silently
        }
    }, []);

    // Dismiss alert
    const dismissAlert = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => setActiveAlert(null), 300);
    }, []);

    // Also send browser notification as fallback
    const sendBrowserNotification = useCallback((title: string, body: string) => {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
            return;
        }

        try {
            const notification = new Notification(title, {
                body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `aligned-${Date.now()}`,
                requireInteraction: true,
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } catch (error) {
            console.error('Error sending browser notification:', error);
        }
    }, []);

    const checkScheduledNotifications = useCallback(() => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDay = now.getDay();
        const todayKey = now.toISOString().split('T')[0];

        // Prevent checking more than once per minute
        const checkKey = `${todayKey}-${currentTime}`;
        if (lastCheckRef.current === checkKey) {
            return;
        }
        lastCheckRef.current = checkKey;

        // Load notifications from localStorage
        const stored = localStorage.getItem(NOTIFICATIONS_KEY);
        if (!stored) return;

        try {
            const data = JSON.parse(stored);
            const notifications: ScheduledNotification[] = data.notifications || [];
            let hasUpdates = false;

            const updatedNotifications = notifications.map(notification => {
                if (!notification.enabled) return notification;
                if (!notification.days.includes(currentDay)) return notification;
                if (notification.scheduledTime !== currentTime) return notification;
                if (notification.lastTriggered === todayKey) return notification;

                // Trigger both in-app alert and browser notification
                showAlert(notification.title, notification.body);
                sendBrowserNotification(notification.title, notification.body);
                hasUpdates = true;

                return { ...notification, lastTriggered: todayKey };
            });

            // Save updated lastTriggered timestamps
            if (hasUpdates) {
                localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify({ notifications: updatedNotifications }));
            }
        } catch (error) {
            console.error('Error checking scheduled notifications:', error);
        }
    }, [showAlert, sendBrowserNotification]);

    useEffect(() => {
        // Check immediately on mount
        checkScheduledNotifications();

        // Set up interval to check every 30 seconds
        const interval = setInterval(checkScheduledNotifications, 30000);

        return () => clearInterval(interval);
    }, [checkScheduledNotifications]);

    // Auto-dismiss after 30 seconds if user doesn't interact
    useEffect(() => {
        if (activeAlert && isVisible) {
            const timeout = setTimeout(dismissAlert, 30000);
            return () => clearTimeout(timeout);
        }
    }, [activeAlert, isVisible, dismissAlert]);

    return (
        <NotificationContext.Provider value={{ showAlert }}>
            <AnimatePresence>
                {activeAlert && isVisible && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
                            onClick={dismissAlert}
                        />

                        {/* Alert Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-[90%] max-w-md"
                        >
                            <div className="bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
                                {/* Header with gradient */}
                                <div className="bg-gradient-to-r from-primary to-violet p-6 text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                                        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center"
                                    >
                                        <motion.div
                                            animate={{
                                                rotate: [0, -10, 10, -10, 0],
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1,
                                                repeatDelay: 2
                                            }}
                                        >
                                            <Bell className="w-8 h-8 text-white" />
                                        </motion.div>
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {activeAlert.title}
                                    </h3>
                                </div>

                                {/* Body */}
                                <div className="p-6">
                                    <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                                        {activeAlert.body}
                                    </p>

                                    <Button
                                        onClick={dismissAlert}
                                        className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-violet hover:opacity-90 shadow-lg shadow-primary/25"
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        OK
                                    </Button>

                                    <p className="text-xs text-muted-foreground text-center mt-4">
                                        {activeAlert.timestamp.toLocaleTimeString()} • Click OK to dismiss
                                    </p>
                                </div>

                                {/* Close button */}
                                <button
                                    onClick={dismissAlert}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
}
