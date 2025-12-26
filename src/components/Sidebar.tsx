import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Target,
    BookOpen,
    BarChart3,
    Timer,
    Bell,
    Settings,
    ChevronLeft,
    ChevronRight,
    Flame,
    Sparkles,
    LogOut,
    Heart
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
    onLogout: () => void;
    userName?: string;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Daily Habits', icon: Heart },
    { id: 'goals', label: 'Goals & Challenges', icon: Target },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'focus', label: 'Focus Sessions', icon: Timer },
];

const bottomItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeSection, onSectionChange, onLogout, userName }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { analytics, identityScore } = useAnalytics();

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 256 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-screen bg-card border-r border-border/50 flex flex-col fixed left-0 top-0 z-40"
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <span className="text-primary-foreground font-bold text-lg">A</span>
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-semibold text-xl text-foreground overflow-hidden whitespace-nowrap"
                            >
                                Aligned
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-7 h-7 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSectionChange(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                                }`}
                        >
                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="text-sm font-medium overflow-hidden whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}

                <div className="my-4 border-t border-border/30" />

                {bottomItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSectionChange(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                                }`}
                        >
                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="text-sm font-medium overflow-hidden whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}
            </nav>

            {/* Stats & Actions */}
            <div className="p-3 border-t border-border/50 space-y-3">
                {/* Quick Stats */}
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-orange-500/10">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm text-foreground">{analytics.currentStreak} day streak</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-foreground">{identityScore}% aligned</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Collapsed Stats */}
                {isCollapsed && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center" title={`${analytics.currentStreak} day streak`}>
                            <Flame className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center" title={`${identityScore}% aligned`}>
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                )}

                {/* Theme Toggle & Logout */}
                <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} items-center gap-2`}>
                    <ThemeToggle />
                    <button
                        onClick={onLogout}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors ${isCollapsed ? 'w-10 justify-center' : 'flex-1'}`}
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                        {!isCollapsed && <span className="text-sm">Logout</span>}
                    </button>
                </div>
            </div>
        </motion.aside>
    );
}
