import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Palette, Bell, Shield, Database, Trash2,
    Download, Moon, Sun, Monitor, Save, RefreshCw,
    LogOut, AlertTriangle, CheckCircle2, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';

export function SettingsSection() {
    const { theme, setTheme } = useTheme();
    const { user, profile, signOut } = useAuth();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAccountDeleteConfirm, setShowAccountDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done'>('idle');
    const [clearStatus, setClearStatus] = useState<'idle' | 'clearing' | 'done'>('idle');
    const [deleteAccountStatus, setDeleteAccountStatus] = useState<'idle' | 'deleting' | 'done'>('idle');

    // Export all data
    const handleExportData = () => {
        setExportStatus('exporting');

        const data = {
            exportDate: new Date().toISOString(),
            analytics: localStorage.getItem('aligned_analytics'),
            journal: localStorage.getItem('aligned_journal'),
            goals: localStorage.getItem('aligned_goals'),
            focusSessions: localStorage.getItem('aligned_focus_sessions'),
            focusTasks: localStorage.getItem('aligned_focus_tasks'),
            notifications: localStorage.getItem('aligned_notifications'),
            moodEnergy: localStorage.getItem('aligned_mood_energy'),
            customWeeklyPlan: localStorage.getItem('aligned_custom_weekly_plan'),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aligned-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        setTimeout(() => setExportStatus('done'), 500);
        setTimeout(() => setExportStatus('idle'), 2000);
    };

    // Clear all local data
    const handleClearData = () => {
        setClearStatus('clearing');

        const keysToRemove = [
            'aligned_analytics',
            'aligned_journal',
            'aligned_goals',
            'aligned_focus_sessions',
            'aligned_focus_tasks',
            'aligned_notifications',
            'aligned_mood_energy',
            'aligned_custom_weekly_plan',
            'aligned_quarterly_completions',
            'aligned_habits',
            'aligned_habits_personalized',
            'aligned_onboarding'
        ];

        keysToRemove.forEach(key => localStorage.removeItem(key));

        setTimeout(() => {
            setClearStatus('done');
            setShowDeleteConfirm(false);
        }, 500);
        setTimeout(() => setClearStatus('idle'), 2000);
    };

    const handleDeleteAccount = async () => {
        if (deleteInput !== 'delete') return;

        setDeleteAccountStatus('deleting');

        // Comprehensive clean up
        handleClearData();

        setTimeout(async () => {
            setDeleteAccountStatus('done');
            await signOut();
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Profile</h3>
                        <p className="text-sm text-muted-foreground">Your account information</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium text-foreground">{profile?.full_name || 'Not set'}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium text-foreground">{user?.email || 'Not set'}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                        <div>
                            <p className="text-sm text-muted-foreground">Member since</p>
                            <p className="font-medium text-foreground">
                                {user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'Unknown'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Subscription Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile?.is_pro ? 'bg-gradient-to-br from-primary to-purple-dark' : 'bg-muted'}`}>
                        <Crown className={`w-5 h-5 ${profile?.is_pro ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Subscription</h3>
                        <p className="text-sm text-muted-foreground">Your current plan</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                        <div>
                            <p className="text-sm text-muted-foreground">Plan</p>
                            <p className="font-medium text-foreground flex items-center gap-2">
                                {profile?.is_pro ? (
                                    <>
                                        <span className="bg-gradient-to-r from-primary to-purple-dark bg-clip-text text-transparent font-bold">Pro</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                                            {profile.plan_type || 'monthly'}
                                        </span>
                                    </>
                                ) : (
                                    <span>Free</span>
                                )}
                            </p>
                        </div>
                    </div>
                    {profile?.is_pro && profile?.payment_date && (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                            <div>
                                <p className="text-sm text-muted-foreground">Payment Date</p>
                                <p className="font-medium text-foreground">
                                    {new Date(profile.payment_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Appearance Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center">
                        <Palette className="w-5 h-5 text-violet" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Appearance</h3>
                        <p className="text-sm text-muted-foreground">Customize how AlignedOS looks</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-xl border-2 transition-all ${theme === 'light'
                            ? 'border-primary bg-primary/5'
                            : 'border-border/50 hover:border-primary/50'
                            }`}
                    >
                        <Sun className={`w-6 h-6 mx-auto mb-2 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className={`text-sm font-medium ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`}>
                            Light
                        </p>
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-xl border-2 transition-all ${theme === 'dark'
                            ? 'border-primary bg-primary/5'
                            : 'border-border/50 hover:border-primary/50'
                            }`}
                    >
                        <Moon className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`}>
                            Dark
                        </p>
                    </button>
                    <button
                        onClick={() => setTheme('system')}
                        className={`p-4 rounded-xl border-2 transition-all ${theme === 'system'
                            ? 'border-primary bg-primary/5'
                            : 'border-border/50 hover:border-primary/50'
                            }`}
                    >
                        <Monitor className={`w-6 h-6 mx-auto mb-2 ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className={`text-sm font-medium ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`}>
                            System
                        </p>
                    </button>
                </div>
            </motion.div>

            {/* Data Management */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Database className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Data Management</h3>
                        <p className="text-sm text-muted-foreground">Export or clear your local data</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                        <div>
                            <p className="font-medium text-foreground">Export Data</p>
                            <p className="text-sm text-muted-foreground">Download all your data as JSON</p>
                        </div>
                        <Button
                            onClick={handleExportData}
                            variant="outline"
                            disabled={exportStatus !== 'idle'}
                        >
                            {exportStatus === 'exporting' ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : exportStatus === 'done' ? (
                                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            {exportStatus === 'done' ? 'Downloaded!' : 'Export'}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                        <div>
                            <p className="font-medium text-foreground">Clear Local Data</p>
                            <p className="text-sm text-muted-foreground">Remove all stored data from this browser</p>
                        </div>
                        <Button
                            onClick={() => setShowDeleteConfirm(true)}
                            variant="destructive"
                            size="sm"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30"
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-foreground">Are you sure?</p>
                                <p className="text-sm text-muted-foreground mb-3">
                                    This will permanently delete all your local data including journal entries,
                                    focus sessions, goals, and analytics. This cannot be undone.
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleClearData}
                                        variant="destructive"
                                        size="sm"
                                        disabled={clearStatus !== 'idle'}
                                    >
                                        {clearStatus === 'clearing' ? (
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        ) : clearStatus === 'done' ? (
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                        ) : (
                                            <Trash2 className="w-4 h-4 mr-2" />
                                        )}
                                        {clearStatus === 'done' ? 'Cleared!' : 'Yes, Clear All Data'}
                                    </Button>
                                    <Button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Account Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Account</h3>
                        <p className="text-sm text-muted-foreground">Manage your account</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={() => signOut()}
                        variant="outline"
                        className="w-full justify-start"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>

                    <div className="pt-4 mt-4 border-t border-border/50">
                        <Button
                            onClick={() => setShowAccountDeleteConfirm(true)}
                            variant="ghost"
                            className="w-full justify-start text-destructive hover:bg-destructive/5 hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                        </Button>
                    </div>

                    {showAccountDeleteConfirm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 mt-3"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">Dangerous Action</p>
                                    <p className="text-sm text-muted-foreground">
                                        This will permanently remove your profile and clear all your data.
                                        To confirm, please type <span className="font-bold text-destructive">delete</span> below.
                                    </p>
                                </div>
                            </div>

                            <input
                                type="text"
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                placeholder='Type "delete" to confirm'
                                className="w-full p-2.5 rounded-lg bg-background border border-border/50 text-sm mb-4 focus:ring-2 focus:ring-destructive/20 outline-none"
                            />

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleDeleteAccount}
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={deleteInput !== 'delete' || deleteAccountStatus !== 'idle'}
                                >
                                    {deleteAccountStatus === 'deleting' ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 mr-2" />
                                    )}
                                    Confirm Deletion
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowAccountDeleteConfirm(false);
                                        setDeleteInput('');
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* App Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center py-4"
            >
                <p className="text-sm text-muted-foreground">
                    AlignedOS • Your Personal OS
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                    Version 1.0.0 • Built with ❤️
                </p>
            </motion.div>
        </div>
    );
}
