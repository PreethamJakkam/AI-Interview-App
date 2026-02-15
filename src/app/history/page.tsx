'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { History, Play, Calendar, ArrowRight, BookOpen, Code, MessageSquare } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { getPracticeHistory, getUserInterviews } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

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

    useEffect(() => {
        const loadHistory = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Load from both practice_sessions and interviews collections
                const practiceData = await getPracticeHistory(
                    user.uid,
                    filter === 'all' ? undefined : filter as 'quiz' | 'coding' | 'interview',
                    30
                );
                const interviewData = filter === 'all' || filter === 'interview'
                    ? await getUserInterviews(user.uid, 20)
                    : [];

                // Merge and sort by date
                const allSessions = [
                    ...practiceData.map((s: any) => ({ ...s, mode: s.mode || 'interview' })),
                    ...interviewData.map((s: any) => ({ ...s, mode: 'interview' }))
                ].sort((a, b) => {
                    const dateA = a.createdAt?.seconds || 0;
                    const dateB = b.createdAt?.seconds || 0;
                    return dateB - dateA;
                });

                setSessions(allSessions as HistoryRecord[]);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [user, filter]);

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.75rem',
        padding: '1.5rem'
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--accent-amber)';
        return 'var(--error)';
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'quiz': return <BookOpen size={14} />;
            case 'coding': return <Code size={14} />;
            default: return <MessageSquare size={14} />;
        }
    };

    const formatDate = (date: Date | { seconds: number } | any) => {
        if (!date) return 'Recently';
        if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const filterTabs: { id: FilterType; label: string; icon: React.ReactNode }[] = [
        { id: 'all', label: 'All', icon: <History size={14} /> },
        { id: 'quiz', label: 'Quiz', icon: <BookOpen size={14} /> },
        { id: 'coding', label: 'Coding', icon: <Code size={14} /> },
        { id: 'interview', label: 'Interview', icon: <MessageSquare size={14} /> },
    ];

    const filteredSessions = filter === 'all' ? sessions : sessions.filter(s => s.mode === filter);

    return (
        <AppLayout>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 0' }}>
                {/* Header */}
                <motion.div
                    style={{ textAlign: 'center', marginBottom: '1.5rem' }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.25rem'
                    }}>
                        <History size={24} style={{ color: 'var(--accent-amber)' }} />
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Practice <span style={{ color: 'var(--accent-amber)' }}>history</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.375rem' }}>Track your progress over time</p>
                </motion.div>

                {/* Filter Tabs */}
                {user && (
                    <div style={{
                        display: 'flex',
                        gap: '0.375rem',
                        marginBottom: '1.5rem',
                        padding: '0.25rem',
                        background: 'var(--bg-card)',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        {filterTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.375rem',
                                    padding: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: filter === tab.id ? 'var(--accent-amber)' : 'transparent',
                                    color: filter === tab.id ? 'var(--bg-primary)' : 'var(--text-muted)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {!user ? (
                    <div style={cardStyle}>
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <History size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Sign in to view history</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                Your interview sessions will be saved when logged in
                            </p>
                            <Link href="/login">
                                <button className="btn-primary">Sign In</button>
                            </Link>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>Loading history...</div>
                ) : filteredSessions.length === 0 ? (
                    <div style={cardStyle}>
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <Play size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No sessions yet</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                Start your first practice session
                            </p>
                            <Link href="/practice">
                                <button className="btn-primary">
                                    <Play size={18} /> Start Practicing
                                </button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Stats Summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={cardStyle}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
                                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{filteredSessions.length}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best</div>
                                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 600, color: 'var(--success)' }}>
                                    {Math.max(...filteredSessions.map((s: HistoryRecord) => s.score || 0))}
                                </div>
                            </div>
                            <div style={cardStyle}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average</div>
                                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 600, color: 'var(--accent-amber)' }}>
                                    {Math.round(filteredSessions.reduce((a: number, s: HistoryRecord) => a + (s.score || 0), 0) / filteredSessions.length)}
                                </div>
                            </div>
                        </div>

                        {/* Session List */}
                        <div style={cardStyle}>
                            {filteredSessions.map((session: HistoryRecord, i: number) => (
                                <Link key={session.id || i} href={`/history/${session.id}`} style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem',
                                            padding: '0.75rem', borderRadius: '0.5rem',
                                            borderBottom: i < filteredSessions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                            marginBottom: i < filteredSessions.length - 1 ? '0.5rem' : 0,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {/* Score Badge */}
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '0.5rem',
                                            background: `${getScoreColor(session.score)}15`,
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: getScoreColor(session.score) }}>
                                                {session.score}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                                                {session.topic || session.role || 'Practice Session'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Calendar size={11} />
                                                    {formatDate(session.createdAt || session.completedAt)}
                                                </span>
                                                <span style={{
                                                    padding: '0.125rem 0.5rem', borderRadius: '0.25rem',
                                                    background: 'var(--bg-elevated)', textTransform: 'capitalize',
                                                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                                                }}>
                                                    {getModeIcon(session.mode)}
                                                    {session.mode}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

