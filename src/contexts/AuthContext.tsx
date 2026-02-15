'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, getUserData, logOut } from '@/lib/firebase';

interface AuthContextType {
    user: FirebaseUser | null;
    userData: {
        displayName: string | null;
        email: string | null;
        photoURL: string | null;
        totalInterviews: number;
        averageScore: number;
        bestScore: number;
    } | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<AuthContextType['userData']>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                const data = await getUserData(firebaseUser.uid);
                setUserData(data ? {
                    displayName: data.displayName || firebaseUser.displayName,
                    email: data.email || firebaseUser.email,
                    photoURL: data.photoURL || firebaseUser.photoURL,
                    totalInterviews: data.totalInterviews || 0,
                    averageScore: data.averageScore || 0,
                    bestScore: data.bestScore || 0,
                } : null);
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const handleSignOut = async () => {
        await logOut();
        setUser(null);
        setUserData(null);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, signOut: handleSignOut }}>
            {children}
        </AuthContext.Provider>
    );
}
