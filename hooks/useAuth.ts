import { useState, useEffect } from 'react';
import { User } from '@/lib/types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setUser(JSON.parse(stored));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hasRole = (roles: string[]) => {
        return user && roles.includes(user.role);
    };

    return { user, hasRole, loading: !user && typeof window !== 'undefined' && localStorage.getItem('user') };
}

