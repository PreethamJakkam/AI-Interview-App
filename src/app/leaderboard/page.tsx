'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, User } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { getLeaderboard } from '@/lib/firebase';
import { getTier } from '@/lib/config';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
    uid?: string;
    displayName: string | null;
    averageScore: number;
    totalInterviews: number;
    bestScore: number;
    rank: number;
}

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const data = await getLeaderboard(50);
                if (data.length > 0) {
                    setLeaderboard(data as LeaderboardEntry[]);
                } else {
                    setLeaderboard([
                        { displayName: 'Alex Johnson', averageScore: 92, totalInterviews: 25, bestScore: 98, rank: 1 },
                        { displayName: 'Sarah Chen', averageScore: 88, totalInterviews: 18, bestScore: 95, rank: 2 },
                        { displayName: 'Mike Williams', averageScore: 85, totalInterviews: 32, bestScore: 92, rank: 3 },
                        { displayName: 'Emily Davis', averageScore: 82, totalInterviews: 15, bestScore: 90, rank: 4 },
                        { displayName: 'Chris Lee', averageScore: 79, totalInterviews: 22, bestScore: 88, rank: 5 },
                        { displayName: 'Jordan Taylor', averageScore: 76, totalInterviews: 12, bestScore: 85, rank: 6 },
                        { displayName: 'Sam Martinez', averageScore: 74, totalInterviews: 28, bestScore: 84, rank: 7 },
                        { displayName: 'Riley Brown', averageScore: 71, totalInterviews: 9, bestScore: 82, rank: 8 },
                    ]);
                }
            } catch (error) {
                console.error(error);
                setLeaderboard([
                    { displayName: 'Alex Johnson', averageScore: 92, totalInterviews: 25, bestScore: 98, rank: 1 },
                    { displayName: 'Sarah Chen', averageScore: 88, totalInterviews: 18, bestScore: 95, rank: 2 },
                    { displayName: 'Mike Williams', averageScore: 85, totalInterviews: 32, bestScore: 92, rank: 3 },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        loadLeaderboard();
    }, []);

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.75rem',
        padding: '1.5rem'
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 0' }}>
                {/* Header */}
                <motion.div style={{ textAlign: 'center', marginBottom: '2.5rem' }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.25rem'
                    }}>
                        <Trophy size={24} style={{ color: 'var(--accent-amber)' }} />
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Leaderboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.375rem' }}>Top performers this month</p>
                </motion.div>

                {/* Top 3 Podium */}
                {!isLoading && leaderboard.length >= 3 && (
                    <motion.div
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    >
                        {/* 2nd Place */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: 'var(--bg-elevated)', border: '2px solid var(--border-subtle)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 0.5rem', fontSize: '1.5rem'
                            }}>🥈</div>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{leaderboard[1]?.displayName?.split(' ')[0]}</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.125rem' }}>{leaderboard[1]?.averageScore}</div>
                        </div>

                        {/* 1st Place */}
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'var(--accent-amber-dim)', border: '2px solid var(--accent-amber)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 0.5rem', fontSize: '2rem'
                            }}>🥇</div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{leaderboard[0]?.displayName?.split(' ')[0]}</div>
                            <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-amber)', fontWeight: 700, fontSize: '1.375rem' }}>{leaderboard[0]?.averageScore}</div>
                        </div>

                        {/* 3rd Place */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: 'var(--bg-elevated)', border: '2px solid var(--border-subtle)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 0.5rem', fontSize: '1.5rem'
                            }}>🥉</div>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{leaderboard[2]?.displayName?.split(' ')[0]}</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.125rem' }}>{leaderboard[2]?.averageScore}</div>
                        </div>
                    </motion.div>
                )}

                {/* Full List */}
                <div style={cardStyle}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {leaderboard.map((entry, i) => {
                                const tier = getTier(entry.averageScore);
                                const isCurrentUser = user && entry.uid === user.uid;

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.75rem', borderRadius: '0.5rem',
                                            background: isCurrentUser ? 'var(--accent-amber-dim)' : 'transparent',
                                            border: isCurrentUser ? '1px solid var(--accent-amber-glow)' : '1px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {/* Rank */}
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: entry.rank <= 3 ? 'var(--accent-amber-dim)' : 'var(--bg-elevated)',
                                            border: entry.rank <= 3 ? '1px solid var(--accent-amber-glow)' : '1px solid var(--border-subtle)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: entry.rank <= 3 ? '1rem' : '0.7rem', fontWeight: 600,
                                            color: entry.rank <= 3 ? 'var(--accent-amber)' : 'var(--text-muted)'
                                        }}>
                                            {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                                        </div>

                                        {/* Avatar */}
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <User size={14} style={{ color: 'var(--text-muted)' }} />
                                        </div>

                                        {/* Name */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                                {entry.displayName}
                                                {isCurrentUser && <span style={{ color: 'var(--accent-amber)', marginLeft: '0.5rem' }}>(You)</span>}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{entry.totalInterviews} interviews</div>
                                        </div>

                                        {/* Score */}
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{entry.averageScore}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{tier.icon} {tier.name}</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

