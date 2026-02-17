'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Chrome, Sparkles, Play, Trophy, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const { signIn, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signIn(email, password);
            toast.success('Welcome back!');
            router.push('/');
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = async () => {
        try {
            await signInWithGoogle();
            toast.success('Welcome!');
            router.push('/');
        } catch (error: any) {
            toast.error(error.message || 'Google sign in failed');
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.875rem',
    };

    const highlights = [
        { icon: <Play size={16} />, text: 'AI-powered mock interviews' },
        { icon: <Trophy size={16} />, text: 'Track your progress' },
        { icon: <Clock size={16} />, text: 'Practice anytime, anywhere' },
    ];

    return (
        <AppLayout>
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh',
                position: 'relative', zIndex: 1,
            }}>
                {/* ========== LEFT — Branded Panel ========== */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                    style={{
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        padding: '4rem 3rem', position: 'relative', overflow: 'hidden',
                    }}
                >
                    {/* Gradient glow behind */}
                    <div style={{
                        position: 'absolute', top: '20%', left: '-20%', width: '500px', height: '500px',
                        borderRadius: '50%', background: 'radial-gradient(circle, rgba(6, 214, 160, 0.08) 0%, transparent 70%)',
                        pointerEvents: 'none', filter: 'blur(60px)',
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.375rem 1rem', marginBottom: '2rem',
                            background: 'var(--accent-cyan-dim)', border: '1px solid rgba(6, 214, 160, 0.15)',
                            borderRadius: 'var(--radius-full)', fontSize: '0.7rem',
                            color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500,
                        }}>
                            <Sparkles size={12} /> AI Interview Pro
                        </div>

                        <h1 style={{
                            fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 3vw, 2.75rem)',
                            fontWeight: 700, lineHeight: 1.15, marginBottom: '1.25rem',
                            color: 'var(--text-primary)', letterSpacing: '-0.03em',
                        }}>
                            Welcome<br />back<span className="text-gradient">.</span>
                        </h1>

                        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6, maxWidth: '360px' }}>
                            Continue your interview prep journey. Your progress is waiting for you.
                        </p>

                        {/* Feature highlights */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {highlights.map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}
                                >
                                    <div style={{ color: 'var(--accent-cyan)' }}>{h.icon}</div>
                                    {h.text}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ========== RIGHT — Form Card ========== */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 3rem',
                    }}
                >
                    <div style={{
                        width: '100%', maxWidth: '400px',
                        background: 'var(--glass-bg-strong)', backdropFilter: 'blur(24px)',
                        border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xl)',
                        padding: '2.5rem',
                    }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
                            Sign in
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '2rem' }}>
                            Enter your credentials to continue
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required style={inputStyle} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
                            </div>
                            <motion.button
                                type="submit" disabled={isLoading} className="btn-primary"
                                style={{ width: '100%', padding: '0.875rem', fontSize: '0.875rem', marginTop: '0.25rem' }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" /> Signing in...
                                    </span>
                                ) : <><LogIn size={16} /> Sign In</>}
                            </motion.button>
                        </form>

                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0',
                            color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                            or
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                        </div>

                        <motion.button
                            onClick={handleGoogle} className="btn-secondary"
                            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.8125rem' }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <Chrome size={16} /> Continue with Google
                        </motion.button>

                        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 500 }}>
                                Create one
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
