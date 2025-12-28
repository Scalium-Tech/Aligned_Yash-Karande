import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';

interface DashboardLayoutProps {
    children: ReactNode;
    activeSection: string;
    onSectionChange: (section: string) => void;
    onLogout: () => void;
    userName?: string;
    sectionTitle?: string;
    sectionSubtitle?: string;
}

function getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function getFirstName(fullName?: string): string {
    if (!fullName) return 'there';
    const firstName = fullName.split(' ')[0];
    return firstName || 'there';
}

export function DashboardLayout({
    children,
    activeSection,
    onSectionChange,
    onLogout,
    userName,
    sectionTitle,
    sectionSubtitle,
}: DashboardLayoutProps) {
    const greeting = getTimeBasedGreeting();
    const firstName = getFirstName(userName);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
            {/* Sidebar */}
            <Sidebar
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                onLogout={onLogout}
            />

            {/* Main Content */}
            <main className="ml-[72px] md:ml-64 transition-all duration-300">
                {/* Header */}
                {sectionTitle && (
                    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 px-6 py-4">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={sectionTitle}
                            className="flex items-center justify-between"
                        >
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{sectionTitle}</h1>
                                {sectionSubtitle && (
                                    <p className="text-sm text-muted-foreground mt-1">{sectionSubtitle}</p>
                                )}
                            </div>
                            {activeSection === 'dashboard' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-right hidden sm:block"
                                >
                                    <p className="text-lg font-semibold text-foreground">
                                        {greeting}, <span className="text-primary">{firstName}</span>! 👋
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Ready to align your actions with your identity?
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    </header>
                )}

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
