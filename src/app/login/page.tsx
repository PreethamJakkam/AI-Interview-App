'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await signInWithEmail(email, password);
            toast.success('Welcome back!');
            router.push('/');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            toast.success('Welcome!');
            router.push('/');
        } catch (error: any) {
            toast.error(error.message || 'Google login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: '400px', margin: '0 auto', padding: '4rem 0' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Header */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '2.25rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Welcome back
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Sign in to continue your practice
                        </p>
                    </div>

                    {/* Form Card */}
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        {/* Google Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                borderRadius: '0.5rem',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-medium)',
                                color: 'var(--text-primary)',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                marginBottom: '1.5rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailLogin}>
                            <div style={{ marginBottom: '1rem', position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 2.75rem',
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 2.75rem',
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary"
                                style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem' }}
                            >
                                {isLoading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Don't have an account?{' '}
                        <Link href="/signup" style={{ color: 'var(--accent-amber)', textDecoration: 'none', fontWeight: 500 }}>
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </div>
        </AppLayout>
    );
}

