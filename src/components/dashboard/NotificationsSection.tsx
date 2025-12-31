import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, BellOff, Plus, Trash2, Clock, Calendar,
    CheckCircle2, AlertCircle, Sun, Moon, Target, Coffee, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, NotificationType, ScheduledNotification } from '@/hooks/useNotifications';
import { useNotificationAlert } from '@/components/NotificationScheduler';
import { toast } from 'sonner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
    habit: <Coffee className="w-4 h-4" />,
    focus: <Target className="w-4 h-4" />,
    checkin: <Sun className="w-4 h-4" />,
    goal: <CheckCircle2 className="w-4 h-4" />,
    custom: <Bell className="w-4 h-4" />,
};

const TYPE_COLORS: Record<NotificationType, string> = {
    habit: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    focus: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    checkin: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    goal: 'bg-violet/10 text-violet border-violet/20',
    custom: 'bg-primary/10 text-primary border-primary/20',
};

export function NotificationsSection() {
    const {
        permission,
        notifications,
        requestPermission,
        toggleNotification,
        deleteNotification,
        addNotification,
        sendTestNotification,
    } = useNotifications();

    // Get the in-app alert function
    let showAlert: ((title: string, body: string) => void) | null = null;
    try {
        const alertContext = useNotificationAlert();
        showAlert = alertContext.showAlert;
    } catch {
        // NotificationAlert context not available, will use browser notification only
    }

    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newBody, setNewBody] = useState('');
    const [newHour, setNewHour] = useState('09');
    const [newMinute, setNewMinute] = useState('00');
    const [newAmPm, setNewAmPm] = useState<'AM' | 'PM'>('AM');
    const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [newType, setNewType] = useState<NotificationType>('custom');

    const handleRequestPermission = async () => {
        const result = await requestPermission();
        if (result === 'granted') {
            // Show in-app modal instead of just browser notification
            if (showAlert) {
                showAlert('🔔 Notifications Enabled!', 'You will now receive reminders based on your schedule.');
            } else {
                sendTestNotification();
            }
            toast.success('Notifications enabled!', {
                description: 'You will now receive reminders based on your schedule.',
            });
        } else if (result === 'denied') {
            toast.error('Notifications blocked', {
                description: 'Please enable notifications in your browser settings.',
            });
        }
    };

    const handleTestNotification = () => {
        // Show in-app modal first
        if (showAlert) {
            showAlert('🔔 Test Notification', 'Your notifications are working! You will receive reminders based on your schedule.');
        }
        // Also send browser notification as fallback
        sendTestNotification();
    };


    const handleAddNotification = () => {
        if (!newTitle.trim()) return;

        // Convert 12-hour format to 24-hour format for storage
        let hour24 = parseInt(newHour);
        if (newAmPm === 'PM' && hour24 !== 12) {
            hour24 += 12;
        } else if (newAmPm === 'AM' && hour24 === 12) {
            hour24 = 0;
        }
        const scheduledTime = `${hour24.toString().padStart(2, '0')}:${newMinute}`;

        addNotification({
            type: newType,
            title: newTitle,
            body: newBody,
            scheduledTime,
            enabled: true,
            days: newDays,
        });

        setNewTitle('');
        setNewBody('');
        setNewHour('09');
        setNewMinute('00');
        setNewAmPm('AM');
        setNewDays([1, 2, 3, 4, 5]);
        setShowAdd(false);
    };

    const toggleDay = (day: number) => {
        setNewDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    return (
        <div className="space-y-6">
            {/* Permission Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${permission === 'granted' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                            }`}>
                            {permission === 'granted' ? (
                                <Bell className="w-6 h-6 text-emerald-500" />
                            ) : (
                                <BellOff className="w-6 h-6 text-amber-500" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Notification Permission</h3>
                            <p className="text-sm text-muted-foreground">
                                {permission === 'granted'
                                    ? 'Notifications are enabled! You will receive reminders.'
                                    : permission === 'denied'
                                        ? 'Notifications are blocked. Please enable in browser settings.'
                                        : 'Enable notifications to receive helpful reminders.'}
                            </p>
                        </div>
                    </div>
                    {permission !== 'granted' && permission !== 'denied' && (
                        <Button onClick={handleRequestPermission} className="bg-gradient-to-r from-primary to-violet">
                            <Bell className="w-4 h-4 mr-2" />
                            Enable
                        </Button>
                    )}
                    {permission === 'granted' && (
                        <Button onClick={handleTestNotification} variant="outline" size="sm">
                            Test
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Scheduled Notifications */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-foreground">Scheduled Reminders</h3>
                        <p className="text-sm text-muted-foreground">Get reminded at the right times</p>
                    </div>
                    <Button onClick={() => setShowAdd(true)} size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                    </Button>
                </div>

                {/* Add New Form */}
                <AnimatePresence>
                    {showAdd && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-4 rounded-xl bg-secondary/30 border border-border/50"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-foreground">New Reminder</h4>
                                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Type selector */}
                                <div className="flex gap-2">
                                    {(['checkin', 'focus', 'habit', 'goal', 'custom'] as NotificationType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewType(type)}
                                            className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border transition-all ${newType === type ? TYPE_COLORS[type] : 'bg-secondary/50 text-muted-foreground border-transparent'
                                                }`}
                                        >
                                            {TYPE_ICONS[type]}
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                {/* Title */}
                                <input
                                    type="text"
                                    placeholder="Reminder title"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground"
                                />

                                {/* Body */}
                                <input
                                    type="text"
                                    placeholder="Reminder message"
                                    value={newBody}
                                    onChange={e => setNewBody(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground"
                                />

                                {/* Time - 12 hour format with AM/PM */}
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <select
                                        value={newHour}
                                        onChange={e => setNewHour(e.target.value)}
                                        className="px-2 py-2 rounded-lg bg-background border border-border text-foreground"
                                    >
                                        {['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'].map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                    <span className="text-foreground">:</span>
                                    <select
                                        value={newMinute}
                                        onChange={e => setNewMinute(e.target.value)}
                                        className="px-2 py-2 rounded-lg bg-background border border-border text-foreground"
                                    >
                                        {['00', '15', '30', '45'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <div className="flex rounded-lg overflow-hidden border border-border">
                                        <button
                                            type="button"
                                            onClick={() => setNewAmPm('AM')}
                                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${newAmPm === 'AM'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-background text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            AM
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewAmPm('PM')}
                                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${newAmPm === 'PM'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-background text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            PM
                                        </button>
                                    </div>
                                </div>

                                {/* Days */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    {DAYS.map((day, index) => (
                                        <button
                                            key={day}
                                            onClick={() => toggleDay(index)}
                                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${newDays.includes(index)
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary/50 text-muted-foreground'
                                                }`}
                                        >
                                            {day.charAt(0)}
                                        </button>
                                    ))}
                                </div>

                                <Button onClick={handleAddNotification} disabled={!newTitle.trim()} className="w-full">
                                    Add Reminder
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notification List */}
                <div className="space-y-3">
                    {notifications.map((notification, index) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl border transition-all ${notification.enabled
                                ? 'bg-secondary/30 border-border/50'
                                : 'bg-secondary/10 border-border/20 opacity-60'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[notification.type]}`}>
                                        {TYPE_ICONS[notification.type]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {notification.scheduledTime}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {notification.days.map(d => DAYS[d].charAt(0)).join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleNotification(notification.id)}
                                        className={`w-10 h-6 rounded-full transition-all relative ${notification.enabled ? 'bg-primary' : 'bg-secondary'
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notification.enabled ? 'right-1' : 'left-1'
                                            }`} />
                                    </button>
                                    {notification.id.startsWith('custom') && (
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-gradient-to-br from-primary/10 to-violet/10 border border-primary/20 p-6"
            >
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-foreground">Tips for effective reminders</p>
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                            <li>• Set a morning check-in to start your day with intention</li>
                            <li>• Schedule focus reminders during your peak productivity hours</li>
                            <li>• Add break reminders to prevent burnout</li>
                            <li>• Evening reflection helps track your progress</li>
                            <li>• Keep the browser tab open or set as PWA for notifications to work</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
