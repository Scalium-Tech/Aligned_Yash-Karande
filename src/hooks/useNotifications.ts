import { useState, useEffect, useCallback } from 'react';
import { getUserStorageKey } from '@/lib/userStorage';

export type NotificationType = 'habit' | 'focus' | 'checkin' | 'goal' | 'custom';

export interface ScheduledNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    scheduledTime: string; // HH:mm format
    enabled: boolean;
    days: number[]; // 0-6 for Sun-Sat
    lastTriggered?: string;
}

interface NotificationData {
    permission: NotificationPermission;
    notifications: ScheduledNotification[];
}

const NOTIFICATIONS_KEY = 'aligned_notifications';

const defaultNotifications: ScheduledNotification[] = [
    {
        id: 'morning-checkin',
        type: 'checkin',
        title: '🌅 Good Morning!',
        body: 'Time for your daily check-in. How are you feeling today?',
        scheduledTime: '08:00',
        enabled: true,
        days: [1, 2, 3, 4, 5], // Mon-Fri
    },
    {
        id: 'focus-reminder',
        type: 'focus',
        title: '🎯 Focus Time',
        body: 'Ready for a focused work session? Your goals are waiting.',
        scheduledTime: '10:00',
        enabled: true,
        days: [1, 2, 3, 4, 5],
    },
    {
        id: 'afternoon-break',
        type: 'habit',
        title: '☕ Take a Break',
        body: 'You have been working hard. Time for a 5-minute break.',
        scheduledTime: '15:00',
        enabled: true,
        days: [1, 2, 3, 4, 5],
    },
    {
        id: 'evening-reflection',
        type: 'checkin',
        title: '📝 Evening Reflection',
        body: 'How was your day? Take a moment to journal your thoughts.',
        scheduledTime: '20:00',
        enabled: true,
        days: [0, 1, 2, 3, 4, 5, 6],
    },
];

function loadNotificationData(userId?: string): NotificationData {
    const key = getUserStorageKey(NOTIFICATIONS_KEY, userId);
    const stored = localStorage.getItem(key);
    const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';

    if (!stored) {
        return { permission, notifications: defaultNotifications };
    }
    try {
        const data = JSON.parse(stored);
        return { permission, notifications: data.notifications || defaultNotifications };
    } catch {
        return { permission, notifications: defaultNotifications };
    }
}

function saveNotificationData(notifications: ScheduledNotification[], userId?: string): void {
    const key = getUserStorageKey(NOTIFICATIONS_KEY, userId);
    localStorage.setItem(key, JSON.stringify({ notifications }));
}

export function useNotifications(userId?: string) {
    const [data, setData] = useState<NotificationData>(() => loadNotificationData(userId));
    const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

    // Reload data when userId changes
    useEffect(() => {
        const newData = loadNotificationData(userId);
        setData(newData);
    }, [userId]);

    // Request notification permission
    const requestPermission = useCallback(async () => {
        if (typeof Notification === 'undefined') {
            console.log('Notifications not supported');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            setData(prev => ({ ...prev, permission: 'granted' }));
            return 'granted';
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            setData(prev => ({ ...prev, permission }));
            return permission;
        }

        return Notification.permission;
    }, []);

    // Send a notification
    const sendNotification = useCallback((title: string, body: string, icon?: string) => {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
            return;
        }

        const notification = new Notification(title, {
            body,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'aligned-notification',
            requireInteraction: false,
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }, []);

    // Check if any notifications should trigger
    const checkScheduledNotifications = useCallback(() => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDay = now.getDay();
        const todayKey = now.toISOString().split('T')[0];

        data.notifications.forEach(notification => {
            if (!notification.enabled) return;
            if (!notification.days.includes(currentDay)) return;
            if (notification.scheduledTime !== currentTime) return;
            if (notification.lastTriggered === todayKey) return;

            // Trigger notification
            sendNotification(notification.title, notification.body);

            // Update lastTriggered
            setData(prev => ({
                ...prev,
                notifications: prev.notifications.map(n =>
                    n.id === notification.id ? { ...n, lastTriggered: todayKey } : n
                ),
            }));
        });
    }, [data.notifications, sendNotification]);

    // Start checking for scheduled notifications
    useEffect(() => {
        if (data.permission === 'granted') {
            // Check every minute
            const interval = setInterval(checkScheduledNotifications, 60000);
            setCheckInterval(interval);

            // Also check immediately
            checkScheduledNotifications();

            return () => clearInterval(interval);
        }
    }, [data.permission, checkScheduledNotifications]);

    // Save changes to localStorage
    useEffect(() => {
        saveNotificationData(data.notifications, userId);
    }, [data.notifications, userId]);

    // Add a new notification
    const addNotification = useCallback((notification: Omit<ScheduledNotification, 'id'>) => {
        const newNotification: ScheduledNotification = {
            ...notification,
            id: `custom-${Date.now()}`,
        };
        setData(prev => ({
            ...prev,
            notifications: [...prev.notifications, newNotification],
        }));
        return newNotification;
    }, []);

    // Update a notification
    const updateNotification = useCallback((id: string, updates: Partial<ScheduledNotification>) => {
        setData(prev => ({
            ...prev,
            notifications: prev.notifications.map(n =>
                n.id === id ? { ...n, ...updates } : n
            ),
        }));
    }, []);

    // Delete a notification
    const deleteNotification = useCallback((id: string) => {
        setData(prev => ({
            ...prev,
            notifications: prev.notifications.filter(n => n.id !== id),
        }));
    }, []);

    // Toggle notification enabled status
    const toggleNotification = useCallback((id: string) => {
        setData(prev => ({
            ...prev,
            notifications: prev.notifications.map(n =>
                n.id === id ? { ...n, enabled: !n.enabled } : n
            ),
        }));
    }, []);

    // Send a test notification
    const sendTestNotification = useCallback(() => {
        sendNotification(
            '🔔 Test Notification',
            'Your notifications are working! You will receive reminders based on your schedule.'
        );
    }, [sendNotification]);

    return {
        permission: data.permission,
        notifications: data.notifications,
        requestPermission,
        sendNotification,
        addNotification,
        updateNotification,
        deleteNotification,
        toggleNotification,
        sendTestNotification,
    };
}
