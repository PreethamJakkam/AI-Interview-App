'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Code, MessageSquare, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout';

export default function PracticeModesPage() {
    const modes = [
        {
            id: 'quiz',
            title: 'Quiz Mode',
            description: 'Test your knowledge with MCQ-based assessments',
            icon: BookOpen,
            features: ['Topic selection', 'Difficulty levels', 'Instant scoring', 'Detailed review'],
            href: '/practice/quiz'
        },
        {
            id: 'coding',
            title: 'Coding Test',
            description: 'Solve coding challenges with auto-evaluation',
            icon: Code,
            features: ['Role-based problems', 'Test cases', 'Partial scoring', 'Code review'],
            href: '/practice/coding'
        },
        {
            id: 'interview',
            title: 'AI Interview',
            description: 'Simulate real interview experience with AI',
            icon: MessageSquare,
            features: ['Dynamic questions', 'Voice input', 'AI feedback', 'Detailed analysis'],
            href: '/interview/new'
        }
    ];

    const cardStyle = {
        background: 'var(--bg-card)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-subtle)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        transition: 'all 0.2s'
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
                {/* Header */}
                <motion.div
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        Practice <span style={{ color: 'var(--accent-amber)' }}>modes</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Choose how you want to sharpen your skills
                    </p>
                </motion.div>

                {/* Mode Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {modes.map((mode, i) => (
                        <motion.div
                            key={mode.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={mode.href}>
                                <div style={{ ...cardStyle, cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '0.75rem',
                                            background: 'var(--accent-amber-dim)',
                                            border: '1px solid var(--accent-amber-glow)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <mode.icon size={24} style={{ color: 'var(--accent-amber)' }} />
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                                <h2 style={{
                                                    fontFamily: 'var(--font-serif)',
                                                    fontSize: '1.125rem',
                                                    fontWeight: 600,
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    {mode.title}
                                                </h2>
                                                <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                                {mode.description}
                                            </p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {mode.features.map((feature, j) => (
                                                    <span
                                                        key={j}
                                                        style={{
                                                            fontSize: '0.7rem',
                                                            padding: '0.25rem 0.5rem',
                                                            background: 'var(--bg-elevated)',
                                                            border: '1px solid var(--border-subtle)',
                                                            borderRadius: '0.25rem',
                                                            color: 'var(--text-secondary)'
                                                        }}
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
