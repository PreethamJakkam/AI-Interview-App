import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    Auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile
} from 'firebase/auth';
import {
    getFirestore,
    Firestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    addDoc
} from 'firebase/firestore';
import { firebaseConfig } from './config';

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== 'undefined' && !getApps().length && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}

export { auth, db };

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Auth Functions
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await createUserDocument(result.user);
    return result.user;
};

export const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
};

export const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await createUserDocument(result.user);
        return result.user;
    } catch (error: any) {
        // If popup fails (COOP policy, blocked popups, etc.), fall back to redirect
        if (
            error?.code === 'auth/popup-blocked' ||
            error?.code === 'auth/popup-closed-by-user' ||
            error?.message?.includes('INTERNAL ASSERTION FAILED') ||
            error?.code === 'auth/cancelled-popup-request'
        ) {
            console.warn('Popup sign-in failed, falling back to redirect.', error?.code || error?.message);
            await signInWithRedirect(auth, googleProvider);
            return null; // Redirect will reload the page
        }
        throw error;
    }
};

// Handle redirect result on page load (for redirect-based auth fallback)
export const handleRedirectResult = async () => {
    if (!auth) return null;
    try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
            await createUserDocument(result.user);
            return result.user;
        }
        return null;
    } catch (error) {
        console.error('handleRedirectResult error:', error);
        return null;
    }
};

export const logOut = async () => {
    if (!auth) throw new Error('Firebase not initialized');
    await signOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
    if (!auth) return () => { };
    return onAuthStateChanged(auth, callback);
};

// Firestore Functions
export const createUserDocument = async (user: FirebaseUser) => {
    if (!db) return;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: Timestamp.now(),
            totalInterviews: 0,
            averageScore: 0,
            bestScore: 0,
        });
    }
};

export const getUserData = async (uid: string) => {
    if (!db) return null;
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
};

export const updateUserStats = async (
    uid: string,
    newScore: number,
    incrementInterviews: boolean = true
) => {
    if (!db) return;
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        const totalInterviews = incrementInterviews ? (data.totalInterviews || 0) + 1 : data.totalInterviews;
        const currentTotal = (data.averageScore || 0) * (data.totalInterviews || 0);
        const newAverage = (currentTotal + newScore) / totalInterviews;
        const bestScore = Math.max(data.bestScore || 0, newScore);

        await updateDoc(userRef, {
            totalInterviews,
            averageScore: Math.round(newAverage * 10) / 10,
            bestScore
        });
    }
};

// Interview Session Functions
export const saveInterviewSession = async (session: {
    odiserId: string;
    role: string;
    mode: string;
    questions: unknown[];
    evaluations: unknown[];
    overallScore: number;
    status: string;
    topic?: string;
}) => {
    if (!db) return null;
    const sessionsRef = collection(db, 'interviews');
    const docRef = await addDoc(sessionsRef, {
        ...session,
        createdAt: Timestamp.now(),
        completedAt: Timestamp.now()
    });
    return docRef.id;
};

export const getUserInterviews = async (uid: string, limitCount: number = 20) => {
    if (!db) return [];
    try {
        const q = query(
            collection(db, 'interviews'),
            where('odiserId', '==', uid),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
        // Fallback: query without orderBy if composite index is missing
        console.warn('getUserInterviews: Composite index may be missing, falling back to unordered query.', error?.message);
        try {
            const q = query(
                collection(db, 'interviews'),
                where('odiserId', '==', uid),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort client-side
            results.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            return results;
        } catch (fallbackError) {
            console.error('getUserInterviews fallback also failed:', fallbackError);
            return [];
        }
    }
};

// Leaderboard Functions
export const getLeaderboard = async (limitCount: number = 50) => {
    if (!db) return [];
    const q = query(
        collection(db, 'users'),
        orderBy('averageScore', 'desc'),
        limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc, index) => ({
        ...doc.data(),
        rank: index + 1
    }));
};

// Practice Session Functions
export const savePracticeSession = async (session: {
    odiserId: string;
    mode: 'quiz' | 'coding' | 'interview';
    topic?: string;
    role?: string;
    difficulty?: string;
    score: number;
    questions?: unknown[];
    answers?: unknown[];
    submissions?: unknown[];
    evaluations?: unknown[];
    totalTime?: number;
    status: string;
    [key: string]: unknown;
}) => {
    if (!db) {
        console.error('savePracticeSession: Firebase not initialized (db is null)');
        throw new Error('Firebase not initialized');
    }
    const sessionsRef = collection(db, 'practice_sessions');
    const docRef = await addDoc(sessionsRef, {
        ...session,
        createdAt: Timestamp.now(),
        completedAt: Timestamp.now()
    });
    console.log('Practice session saved with ID:', docRef.id);
    return docRef.id;
};

export const getPracticeHistory = async (
    uid: string,
    modeFilter?: 'quiz' | 'coding' | 'interview',
    limitCount: number = 30
) => {
    if (!db) return [];
    try {
        let q;
        if (modeFilter) {
            q = query(
                collection(db, 'practice_sessions'),
                where('odiserId', '==', uid),
                where('mode', '==', modeFilter),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        } else {
            q = query(
                collection(db, 'practice_sessions'),
                where('odiserId', '==', uid),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
        // Fallback: query without orderBy if composite index is missing
        console.warn('getPracticeHistory: Composite index may be missing, falling back.', error?.message);
        try {
            let q;
            if (modeFilter) {
                q = query(
                    collection(db, 'practice_sessions'),
                    where('odiserId', '==', uid),
                    where('mode', '==', modeFilter),
                    limit(limitCount)
                );
            } else {
                q = query(
                    collection(db, 'practice_sessions'),
                    where('odiserId', '==', uid),
                    limit(limitCount)
                );
            }
            const snapshot = await getDocs(q);
            const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort client-side
            results.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            return results;
        } catch (fallbackError) {
            console.error('getPracticeHistory fallback also failed:', fallbackError);
            return [];
        }
    }
};

export const getSessionById = async (sessionId: string) => {
    if (!db) return null;
    const docRef = doc(db, 'practice_sessions', sessionId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export default { auth, db };

