'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Code, MessageSquare, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout';

export default function PracticePage() {
    const modes = [
        {
            icon: <BookOpen size={28} />,
            title: 'Quiz Mode',
            desc: 'Test your knowledge with AI-generated multiple choice questions across dozens of topics.',
            href: '/practice/quiz',
            color: 'var(--accent-cyan)',
            features: ['AI-generated questions', 'Multiple topics', 'Timed challenges', 'Score tracking'],
        },
        {
            icon: <Code size={28} />,
            title: 'Coding Test',
            desc: 'Solve real coding challenges with test cases. Practice data structures, algorithms, and more.',
            href: '/practice/coding',
            color: 'var(--accent-violet)',
            features: ['Built-in editor', 'Test cases', 'AI evaluation', 'Multiple languages'],
        },
        {
            icon: <MessageSquare size={28} />,
            title: 'AI Interview',
            desc: 'Full mock interview experience with AI-powered questions, voice support, and instant feedback.',
            href: '/interview/new',
            color: '#EC4899',
            features: ['Voice & text input', 'Resume analysis', 'Personalized feedback', 'Score breakdown'],
        },
    ];

    return (
        <AppLayout>
            <div className="page-enter">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.375rem 1rem', marginBottom: '1rem',
                        background: 'var(--accent-cyan-dim)', border: '1px solid rgba(6, 214, 160, 0.15)',
                        borderRadius: 'var(--radius-full)', fontSize: '0.7rem',
                        color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500,
                    }}>
                        <Sparkles size={12} /> Choose your mode
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
                        Practice <span className="text-gradient">modes</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '500px' }}>
                        Choose how you want to practice. Each mode is powered by AI to give you a personalized experience.
                    </p>
                </motion.div>

                {/* Mode Cards — Full-width 3-column grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                    {modes.map((mode, i) => (
                        <motion.div
                            key={mode.href}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        >
                            <Link href={mode.href} style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ y: -6, borderColor: mode.color, transition: { duration: 0.2 } }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
                                        border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)',
                                        padding: '2rem', cursor: 'pointer',
                                        transition: 'all var(--transition-base)',
                                        display: 'flex', flexDirection: 'column', height: '100%',
                                    }}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: 'var(--radius-lg)',
                                        background: `${mode.color}12`, border: `1px solid ${mode.color}20`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: mode.color, marginBottom: '1.5rem',
                                    }}>
                                        {mode.icon}
                                    </div>

                                    <h3 style={{
                                        fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700,
                                        color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em',
                                    }}>
                                        {mode.title}
                                    </h3>

                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                                        {mode.desc}
                                    </p>

                                    {/* Feature list */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                        {mode.features.map((f, j) => (
                                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                <CheckCircle size={12} style={{ color: mode.color }} />
                                                {f}
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        color: mode.color, fontWeight: 600, fontSize: '0.8125rem',
                                    }}>
                                        Start Practicing <ArrowRight size={14} />
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
