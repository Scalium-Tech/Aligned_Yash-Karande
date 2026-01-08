import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
    message?: string;
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}

// Wrapper component for lazy-loaded routes
export function LazyRoute({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<PageLoader />}>
            {children}
        </Suspense>
    );
}

// Smaller section loader for inline use
export function SectionLoader({ message = "Loading..." }: PageLoaderProps) {
    return (
        <div className="rounded-2xl bg-card border border-border/50 p-8 flex items-center justify-center">
            <div className="text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}
