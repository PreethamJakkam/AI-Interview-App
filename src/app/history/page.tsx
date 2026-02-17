'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { History, Calendar, ArrowRight, BookOpen, Code, MessageSquare, TrendingUp, Target, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { getPracticeHistory, getUserInterviews } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface HistoryRecord {
    id: string;
    role?: string;
    topic?: string;
    mode: string;
    score: number;
    completedAt: Date;
    createdAt?: { seconds: number };
}

type FilterType = 'all' | 'quiz' | 'coding' | 'interview';

export default function HistoryPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<HistoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const loadHistory = async () => {
            if (!user) { setIsLoading(false); return; }
            setIsLoading(true);
            try {
                const practiceData = await getPracticeHistory(user.uid, filter === 'all' ? undefined : filter as 'quiz' | 'coding' | 'interview', 30);
                const interviewData = filter === 'all' || filter === 'interview' ? await getUserInterviews(user.uid, 20) : [];
                const allSessions = [
                    ...practiceData.map((s: any) => ({ ...s, mode: s.mode || 'interview' })),
                    ...interviewData.map((s: any) => ({ ...s, mode: 'interview' }))
                ].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setSessions(allSessions as HistoryRecord[]);
            } catch (error) {
                console.error('Failed to load history:', error);
                toast.error('Failed to load history');
            } finally {
                setIsLoading(false);
            }
        };
        loadHistory();
    }, [user, filter]);

    const modeIcon = (mode: string) => {
        if (mode === 'quiz') return <BookOpen size={16} />;
        if (mode === 'coding') return <Code size={16} />;
        return <MessageSquare size={16} />;
    };

    const modeColor = (mode: string) => {
        if (mode === 'quiz') return 'var(--accent-cyan)';
        if (mode === 'coding') return 'var(--accent-violet)';
        return '#EC4899';
    };

    const scoreColor = (score: number) => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--warning)';
        return 'var(--error)';
    };

    const filters: { key: FilterType; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'interview', label: 'Interviews' },
        { key: 'quiz', label: 'Quizzes' },
        { key: 'coding', label: 'Coding' },
    ];

    // Stats
    const avgScore = sessions.length > 0 ? Math.round(sessions.reduce((a, b) => a + b.score, 0) / sessions.length) : 0;
    const bestScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.score)) : 0;

    return (
        <AppLayout>
            <div className="page-enter">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
                        Session <span className="text-gradient">History</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Review your past practice sessions and track progress</p>
                </motion.div>

                {/* Stats Row — Full Width */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}
                >
                    {[
                        { label: 'Total Sessions', value: sessions.length, icon: <History size={18} />, color: 'var(--accent-cyan)' },
                        { label: 'Avg Score', value: `${avgScore}%`, icon: <Target size={18} />, color: 'var(--accent-violet)' },
                        { label: 'Best Score', value: `${bestScore}%`, icon: <TrendingUp size={18} />, color: 'var(--success)' },
                        { label: 'This Month', value: sessions.filter(s => { const d = s.createdAt?.seconds ? new Date(s.createdAt.seconds * 1000) : new Date(); return d.getMonth() === new Date().getMonth(); }).length, icon: <Calendar size={18} />, color: '#EC4899' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                            style={{
                                background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
                                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
                                padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                            }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: `${stat.color}12`, border: `1px solid ${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{stat.value}</div>
                                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                    {filters.map((f) => (
                        <motion.button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)',
                                border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                                background: filter === f.key ? 'var(--accent-cyan)' : 'var(--bg-surface)',
                                color: filter === f.key ? '#07070D' : 'var(--text-muted)',
                                transition: 'all var(--transition-base)',
                            }}
                        >
                            {f.label}
                        </motion.button>
                    ))}
                </div>

                {/* Session List — Full Width Table */}
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', gap: '0.375rem' }}>
                        <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" />
                    </div>
                ) : sessions.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                        <Clock size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>No sessions yet</p>
                        <Link href="/practice"><button className="btn-primary" style={{ fontSize: '0.8125rem' }}>Start Practicing</button></Link>
                    </motion.div>
                ) : (
                    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '48px 1fr 120px 80px 80px 40px',
                            padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)',
                            fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
                        }}>
                            <span>Type</span><span>Session</span><span>Date</span><span style={{ textAlign: 'center' }}>Score</span><span style={{ textAlign: 'center' }}>Status</span><span></span>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {sessions.map((session, i) => {
                                const date = session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000) : new Date();
                                const isExpanded = expandedId === session.id;
                                return (
                                    <motion.div
                                        key={session.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: i * 0.03 }}
                                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                                    >
                                        <div
                                            onClick={() => setExpandedId(isExpanded ? null : session.id)}
                                            style={{
                                                display: 'grid', gridTemplateColumns: '48px 1fr 120px 80px 80px 40px',
                                                padding: '0.875rem 1.25rem', alignItems: 'center', cursor: 'pointer',
                                                transition: 'background var(--transition-fast)',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ color: modeColor(session.mode) }}>{modeIcon(session.mode)}</div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                                                    {session.role || session.topic || session.mode}
                                                </div>
                                                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{session.mode}</div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div style={{ textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', color: scoreColor(session.score) }}>
                                                {session.score}%
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.6rem', fontWeight: 500,
                                                    background: session.score >= 70 ? 'var(--success-dim)' : 'var(--warning-dim)',
                                                    color: session.score >= 70 ? 'var(--success)' : 'var(--warning)',
                                                }}>
                                                    {session.score >= 70 ? 'Pass' : 'Review'}
                                                </span>
                                            </div>
                                            <div style={{ color: 'var(--text-muted)', transition: 'transform var(--transition-base)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                                                <ChevronDown size={14} />
                                            </div>
                                        </div>

                                        {/* Expandable Details */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div style={{ padding: '0 1.25rem 1rem 4.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                            Score: <strong style={{ color: scoreColor(session.score) }}>{session.score}%</strong>
                                                        </div>
                                                        <Link href={`/history/${session.id}`} style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                                                            View Details <ArrowRight size={12} />
                                                        </Link>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
