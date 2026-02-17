'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, getUserData, logOut, signInWithEmail, signInWithGoogle as firebaseSignInWithGoogle, signUpWithEmail, handleRedirectResult } from '@/lib/firebase';

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
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<AuthContextType['userData']>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Process any pending redirect auth result
        handleRedirectResult().catch(() => { });

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

    const handleSignIn = async (email: string, password: string) => {
        await signInWithEmail(email, password);
    };

    const handleSignUp = async (email: string, password: string, displayName: string) => {
        await signUpWithEmail(email, password, displayName);
    };

    const handleSignInWithGoogle = async () => {
        await firebaseSignInWithGoogle();
    };

    const handleSignOut = async () => {
        await logOut();
        setUser(null);
        setUserData(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            signIn: handleSignIn,
            signUp: handleSignUp,
            signInWithGoogle: handleSignInWithGoogle,
            signOut: handleSignOut
        }}>
            {children}
        </AuthContext.Provider>
    );
}
