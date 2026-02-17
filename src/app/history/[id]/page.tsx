'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Target, CheckCircle, XCircle, Code, BookOpen, MessageSquare } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { getSessionById } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface SessionData {
    id: string;
    mode: 'quiz' | 'coding' | 'interview';
    topic?: string;
    role?: string;
    difficulty?: string;
    score: number;
    questions?: Array<{
        id: number;
        question: string;
        options?: string[];
        correctAnswer?: number;
        explanation?: string;
    }>;
    answers?: Array<{
        questionId: number;
        selectedOption?: number;
        isCorrect?: boolean;
        answer?: string;
        timeSpent: number;
    }>;
    submissions?: Array<{
        challengeId: number;
        code: string;
        passedTests: number;
        totalTests: number;
        score: number;
        timeSpent: number;
    }>;
    evaluations?: Array<{
        questionId: number;
        answer: string;
        score: number;
        feedback: string;
        strengths: string[];
        weaknesses: string[];
    }>;
    totalTime?: number;
    createdAt: { seconds: number };
    status: string;
}

export default function HistoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [session, setSession] = useState<SessionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            if (!params.id) return;
            try {
                const data = await getSessionById(params.id as string);
                setSession(data as SessionData);
            } catch (error) {
                console.error('Failed to load session:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadSession();
    }, [params.id]);

    const glassCard: React.CSSProperties = {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        transition: 'all var(--transition-base)',
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'quiz': return <BookOpen size={20} />;
            case 'coding': return <Code size={20} />;
            default: return <MessageSquare size={20} />;
        }
    };

    const getScoreColor = (s: number) => {
        if (s >= 70) return 'var(--success)';
        if (s >= 50) return 'var(--warning)';
        return 'var(--error)';
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
                        <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading session details...</p>
                </div>
            </AppLayout>
        );
    }

    if (!session) {
        return (
            <AppLayout>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 0', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Session not found</p>
                    <button onClick={() => router.push('/history')} className="btn-primary">Back to History</button>
                </div>
            </AppLayout>
        );
    }

    const formatDate = (timestamp: { seconds: number }) => {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 0' }}>
                {/* Header */}
                <motion.div
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                >
                    <button
                        onClick={() => router.push('/history')}
                        style={{
                            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)', padding: '0.5rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    <div>
                        <h1 style={{
                            fontFamily: 'var(--font-heading)', fontSize: '1.375rem', fontWeight: 700,
                            color: 'var(--text-primary)', letterSpacing: '-0.02em',
                        }}>
                            Session <span className="text-gradient">Details</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(session.createdAt)}</p>
                    </div>
                </motion.div>

                {/* Overview Card */}
                <motion.div
                    style={{ ...glassCard, marginBottom: '1.5rem', background: 'var(--glass-bg-strong)' }}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                            background: 'linear-gradient(135deg, var(--accent-cyan-dim), var(--accent-violet-dim))',
                            border: '1px solid var(--border-medium)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--accent-cyan)',
                        }}>
                            {getModeIcon(session.mode)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                                <span style={{
                                    fontSize: '0.625rem', padding: '0.15rem 0.5rem',
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-full)', color: 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500,
                                }}>
                                    {session.mode}
                                </span>
                                {session.difficulty && (
                                    <span style={{
                                        fontSize: '0.625rem', padding: '0.15rem 0.5rem',
                                        background: 'var(--accent-cyan-dim)', border: '1px solid rgba(6,214,160,0.15)',
                                        borderRadius: 'var(--radius-full)', color: 'var(--accent-cyan)',
                                        textTransform: 'capitalize', fontWeight: 500,
                                    }}>
                                        {session.difficulty}
                                    </span>
                                )}
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading)', fontSize: '1.0625rem', fontWeight: 600,
                                color: 'var(--text-primary)', letterSpacing: '-0.01em',
                            }}>
                                {session.topic || session.role || 'Practice Session'}
                            </h2>
                        </div>
                        <div style={{
                            textAlign: 'center', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)',
                            background: `${getScoreColor(session.score)}0C`,
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700,
                                color: getScoreColor(session.score),
                            }}>
                                {session.score}%
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Score</div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                        {session.totalTime && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                                <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{formatTime(session.totalTime)}</span>
                            </div>
                        )}
                        {session.questions && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <Target size={13} style={{ color: 'var(--text-muted)' }} />
                                <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{session.questions.length} questions</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Section Title */}
                <h3 style={{
                    fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 600,
                    color: 'var(--text-primary)', marginBottom: '1rem',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                    Review
                </h3>

                {/* Quiz Review */}
                {session.mode === 'quiz' && session.questions && session.answers && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {session.questions.map((q, i) => {
                            const answer = session.answers?.find(a => a.questionId === q.id);
                            return (
                                <motion.div
                                    key={q.id} style={glassCard}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        {answer?.isCorrect ? (
                                            <CheckCircle size={16} style={{ color: 'var(--success)', marginTop: '2px' }} />
                                        ) : (
                                            <XCircle size={16} style={{ color: 'var(--error)', marginTop: '2px' }} />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                                                {q.question}
                                            </p>
                                            {q.options && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                                    {q.options.map((opt, j) => {
                                                        const isSelected = answer?.selectedOption === j;
                                                        const isCorrect = q.correctAnswer === j;
                                                        return (
                                                            <div key={j} style={{
                                                                fontSize: '0.775rem', padding: '0.375rem 0.625rem',
                                                                borderRadius: 'var(--radius-md)',
                                                                background: isCorrect ? 'rgba(34, 197, 94, 0.08)' : isSelected ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-elevated)',
                                                                border: `1px solid ${isCorrect ? 'var(--success)' : isSelected ? 'var(--error)' : 'var(--border-subtle)'}`,
                                                                color: 'var(--text-secondary)',
                                                            }}>
                                                                {String.fromCharCode(65 + j)}. {opt}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {q.explanation && (
                                                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                                                    {q.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Coding Review */}
                {session.mode === 'coding' && session.submissions && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {session.submissions.map((sub, i) => (
                            <motion.div
                                key={sub.challengeId} style={glassCard}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>Challenge {i + 1}</h4>
                                    <span style={{
                                        padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)',
                                        background: `${getScoreColor(sub.score)}12`, border: `1px solid ${getScoreColor(sub.score)}25`,
                                        color: getScoreColor(sub.score), fontSize: '0.775rem', fontWeight: 600,
                                    }}>
                                        {sub.score}%
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    {sub.passedTests}/{sub.totalTests} tests passed · {formatTime(sub.timeSpent)}
                                </div>
                                <pre style={{
                                    padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                                    fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
                                    overflow: 'auto', maxHeight: '200px', border: '1px solid var(--border-subtle)',
                                }}>
                                    {sub.code}
                                </pre>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Interview Review */}
                {session.mode === 'interview' && session.evaluations && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {session.evaluations.map((evaluation, i) => (
                            <motion.div
                                key={evaluation.questionId} style={glassCard}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>Question {i + 1}</h4>
                                    <span style={{
                                        fontWeight: 600, fontSize: '0.8125rem',
                                        color: evaluation.score >= 7 ? 'var(--success)' : evaluation.score >= 5 ? 'var(--warning)' : 'var(--error)'
                                    }}>
                                        {evaluation.score}/10
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                                    {evaluation.answer}
                                </p>
                                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                                    {evaluation.feedback}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
