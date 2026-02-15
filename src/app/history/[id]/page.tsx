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

    const cardStyle = {
        background: 'var(--bg-card)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-subtle)',
        borderRadius: '0.75rem',
        padding: '1.5rem'
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'quiz': return <BookOpen size={20} />;
            case 'coding': return <Code size={20} />;
            default: return <MessageSquare size={20} />;
        }
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Loading session details...</p>
                </div>
            </AppLayout>
        );
    }

    if (!session) {
        return (
            <AppLayout>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Session not found</p>
                    <button onClick={() => router.push('/history')} className="btn-primary" style={{ marginTop: '1rem' }}>
                        Back to History
                    </button>
                </div>
            </AppLayout>
        );
    }

    const formatDate = (timestamp: { seconds: number }) => {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
                {/* Header */}
                <motion.div
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <button
                        onClick={() => router.push('/history')}
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    <div>
                        <h1 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.375rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                        }}>
                            Session <span style={{ color: 'var(--accent-amber)' }}>Details</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {formatDate(session.createdAt)}
                        </p>
                    </div>
                </motion.div>

                {/* Overview Card */}
                <motion.div
                    style={{ ...cardStyle, marginBottom: '1.5rem' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '0.75rem',
                            background: 'var(--accent-amber-dim)',
                            border: '1px solid var(--accent-amber-glow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-amber)'
                        }}>
                            {getModeIcon(session.mode)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '0.125rem 0.5rem',
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase'
                                }}>
                                    {session.mode}
                                </span>
                                {session.difficulty && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '0.125rem 0.5rem',
                                        background: 'var(--accent-amber-dim)',
                                        border: '1px solid var(--accent-amber-glow)',
                                        borderRadius: '0.25rem',
                                        color: 'var(--accent-amber)',
                                        textTransform: 'capitalize'
                                    }}>
                                        {session.difficulty}
                                    </span>
                                )}
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)'
                            }}>
                                {session.topic || session.role || 'Practice Session'}
                            </h2>
                        </div>
                        <div style={{
                            textAlign: 'center',
                            padding: '0.75rem 1rem',
                            background: session.score >= 70 ? 'rgba(34, 197, 94, 0.1)' : session.score >= 50 ? 'var(--accent-amber-dim)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '0.75rem'
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: session.score >= 70 ? 'var(--success)' : session.score >= 50 ? 'var(--accent-amber)' : 'var(--error)'
                            }}>
                                {session.score}%
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Score</div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                        {session.totalTime && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {formatTime(session.totalTime)}
                                </span>
                            </div>
                        )}
                        {session.questions && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Target size={14} style={{ color: 'var(--text-muted)' }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {session.questions.length} questions
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Questions/Challenges Review */}
                <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
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
                                    key={q.id}
                                    style={cardStyle}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        {answer?.isCorrect ? (
                                            <CheckCircle size={18} style={{ color: 'var(--success)', marginTop: '2px' }} />
                                        ) : (
                                            <XCircle size={18} style={{ color: 'var(--error)', marginTop: '2px' }} />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                                {q.question}
                                            </p>
                                            {q.options && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                                    {q.options.map((opt, j) => {
                                                        const isSelected = answer?.selectedOption === j;
                                                        const isCorrect = q.correctAnswer === j;
                                                        return (
                                                            <div
                                                                key={j}
                                                                style={{
                                                                    fontSize: '0.8rem',
                                                                    padding: '0.375rem 0.625rem',
                                                                    borderRadius: '0.25rem',
                                                                    background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : isSelected ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-elevated)',
                                                                    border: `1px solid ${isCorrect ? 'var(--success)' : isSelected ? 'var(--error)' : 'var(--border-subtle)'}`,
                                                                    color: 'var(--text-secondary)'
                                                                }}
                                                            >
                                                                {String.fromCharCode(65 + j)}. {opt}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {q.explanation && (
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
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
                                key={sub.challengeId}
                                style={cardStyle}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Challenge {i + 1}</h4>
                                    <span style={{
                                        padding: '0.25rem 0.625rem',
                                        borderRadius: '0.375rem',
                                        background: sub.score >= 70 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: sub.score >= 70 ? 'var(--success)' : 'var(--error)',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}>
                                        {sub.score}%
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    {sub.passedTests}/{sub.totalTests} tests passed • {formatTime(sub.timeSpent)}
                                </div>
                                <pre style={{
                                    padding: '1rem',
                                    background: 'var(--bg-elevated)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--text-secondary)',
                                    overflow: 'auto',
                                    maxHeight: '200px'
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
                                key={evaluation.questionId}
                                style={cardStyle}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Question {i + 1}</h4>
                                    <span style={{
                                        fontWeight: 600,
                                        color: evaluation.score >= 7 ? 'var(--success)' : evaluation.score >= 5 ? 'var(--accent-amber)' : 'var(--error)'
                                    }}>
                                        {evaluation.score}/10
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    {evaluation.answer}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
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
