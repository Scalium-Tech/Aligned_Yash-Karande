import { useEffect, useCallback, useRef } from 'react';

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

/**
 * Global notification scheduler component
 * Runs at app level to check for scheduled notifications every minute
 */
export function NotificationScheduler() {
    const lastCheckRef = useRef<string>('');

    const sendNotification = useCallback((title: string, body: string) => {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
            return;
        }

        try {
            const notification = new Notification(title, {
                body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `aligned-${Date.now()}`,
                requireInteraction: false,
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // Auto close after 10 seconds
            setTimeout(() => notification.close(), 10000);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }, []);

    const checkScheduledNotifications = useCallback(() => {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
            return;
        }

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

                // Trigger the notification
                sendNotification(notification.title, notification.body);
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
    }, [sendNotification]);

    useEffect(() => {
        // Check immediately on mount
        checkScheduledNotifications();

        // Set up interval to check every 30 seconds (more reliable than every minute)
        const interval = setInterval(checkScheduledNotifications, 30000);

        return () => clearInterval(interval);
    }, [checkScheduledNotifications]);

    // This component doesn't render anything
    return null;
}
