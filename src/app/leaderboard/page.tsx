'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, User, Crown, Medal, Award, TrendingUp } from 'lucide-react';
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
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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

    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    const podiumIcons = [
        <Crown key="1" size={22} />,
        <Medal key="2" size={20} />,
        <Award key="3" size={18} />,
    ];
    const podiumColors = ['var(--accent-cyan)', 'var(--accent-violet)', '#EC4899'];

    return (
        <AppLayout>
            <div className="page-enter">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
                        Leader<span className="text-gradient">board</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Top performers this month</p>
                </motion.div>

                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', gap: '0.375rem' }}>
                        <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                        {/* ========== LEFT — Podium Cards ========== */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {top3.map((entry, i) => {
                                const tier = getTier(entry.averageScore);
                                return (
                                    <motion.div
                                        key={entry.rank}
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        style={{
                                            background: 'var(--glass-bg-strong)', backdropFilter: 'blur(16px)',
                                            border: `1px solid ${i === 0 ? 'rgba(6, 214, 160, 0.2)' : 'var(--glass-border)'}`,
                                            borderRadius: 'var(--radius-lg)', padding: '1.5rem',
                                            position: 'relative', overflow: 'hidden',
                                            animation: i === 0 ? 'float-subtle 4s ease-in-out infinite' : 'none',
                                        }}
                                    >
                                        {/* Glow bar at top */}
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                                            background: `linear-gradient(90deg, transparent, ${podiumColors[i]}, transparent)`,
                                        }} />

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: 'var(--radius-full)',
                                                background: `${podiumColors[i]}15`, border: `1px solid ${podiumColors[i]}30`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: podiumColors[i],
                                                boxShadow: i === 0 ? `0 0 20px ${podiumColors[i]}20` : 'none',
                                            }}>
                                                {podiumIcons[i]}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '0.125rem' }}>
                                                    {entry.displayName}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    {tier.name} · {entry.totalInterviews} sessions
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700,
                                                    color: podiumColors[i], letterSpacing: '-0.02em',
                                                }}>
                                                    {entry.averageScore}
                                                </div>
                                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>avg</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* ========== RIGHT — Full Rankings Table ========== */}
                        <div style={{
                            background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
                            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                        }}>
                            {/* Table Header */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '50px 1fr 100px 100px 80px',
                                padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)',
                                fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
                            }}>
                                <span>Rank</span>
                                <span>Player</span>
                                <span style={{ textAlign: 'center' }}>Avg Score</span>
                                <span style={{ textAlign: 'center' }}>Best</span>
                                <span style={{ textAlign: 'center' }}>Sessions</span>
                            </div>

                            {/* Rows */}
                            {rest.map((entry, i) => {
                                const isCurrentUser = user && entry.uid === user.uid;
                                const isHovered = hoveredRow === i;
                                const tier = getTier(entry.averageScore);
                                return (
                                    <motion.div
                                        key={entry.rank}
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.04 }}
                                        onMouseEnter={() => setHoveredRow(i)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        style={{
                                            display: 'grid', gridTemplateColumns: '50px 1fr 100px 100px 80px',
                                            padding: isHovered ? '1rem 1.25rem' : '0.75rem 1.25rem',
                                            borderBottom: '1px solid var(--border-subtle)',
                                            background: isCurrentUser ? 'var(--accent-cyan-dim)' : isHovered ? 'var(--bg-hover)' : 'transparent',
                                            transition: 'all var(--transition-base)',
                                            cursor: 'default',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                            #{entry.rank}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
                                                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <User size={14} style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: isCurrentUser ? 'var(--accent-cyan)' : 'var(--text-primary)', fontSize: '0.8125rem' }}>
                                                    {entry.displayName}{isCurrentUser ? ' (You)' : ''}
                                                </div>
                                                {isHovered && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                        style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}
                                                    >
                                                        {tier.name}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                            {entry.averageScore}
                                        </div>
                                        <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--accent-cyan)' }}>
                                            {entry.bestScore}
                                        </div>
                                        <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                            {entry.totalInterviews}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
