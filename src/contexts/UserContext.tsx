import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserContextType {
    userId: string | undefined;
}

const UserContext = createContext<UserContextType>({ userId: undefined });

export function UserProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    return (
        <UserContext.Provider value={{ userId: user?.id }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserId() {
    const context = useContext(UserContext);
    return context.userId;
}
