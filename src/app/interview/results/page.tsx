'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, RotateCcw, CheckCircle, Lightbulb, BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { generateFeedback, generateImprovementPlan } from '@/lib/gemini';
import { saveInterviewSession, updateUserStats } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function InterviewResultsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [results, setResults] = useState<any>(null);
    const [feedback, setFeedback] = useState<any>(null);
    const [improvementPlan, setImprovementPlan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'plan'>('overview');

    useEffect(() => {
        const loadResults = async () => {
            const data = sessionStorage.getItem('interviewResults');
            if (!data) {
                router.push('/interview/new');
                return;
            }

            const parsed = JSON.parse(data);
            setResults(parsed);

            try {
                const evaluations = parsed.answers.map((a: any) => a.evaluation);
                const missingConcepts = evaluations.flatMap((e: any) => e?.missingConcepts || []);
                const weakAreas = evaluations.flatMap((e: any) => e?.weaknesses || []);

                const [feedbackData, planData] = await Promise.all([
                    generateFeedback(evaluations, parsed.role),
                    generateImprovementPlan(missingConcepts, weakAreas, parsed.role)
                ]);

                setFeedback(feedbackData);
                setImprovementPlan(planData);

                if (user) {
                    await saveInterviewSession({
                        odiserId: user.uid,
                        role: parsed.role,
                        mode: parsed.mode,
                        questions: parsed.questions,
                        evaluations: parsed.answers.map((a: any) => a.evaluation),
                        overallScore: feedbackData.overallScore,
                        status: 'completed'
                    });
                    await updateUserStats(user.uid, feedbackData.overallScore);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        loadResults();
    }, []);

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--accent-amber)';
        return 'var(--error)';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excellent!';
        if (score >= 80) return 'Great job!';
        if (score >= 70) return 'Good work';
        if (score >= 60) return 'Keep practicing';
        return 'Needs improvement';
    };

    if (isLoading || !results) {
        return (
            <AppLayout>
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1.5rem',
                            background: 'var(--accent-amber-dim)', border: '2px solid var(--accent-amber)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Trophy size={32} style={{ color: 'var(--accent-amber)' }} />
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.375rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            color: 'var(--text-primary)'
                        }}>Analyzing your answers...</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Generating personalized feedback</p>
                    </motion.div>
                </div>
            </AppLayout>
        );
    }

    const score = feedback?.overallScore || 75;

    return (
        <AppLayout>
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 0' }}>
                {/* Score Header */}
                <motion.div
                    style={{ textAlign: 'center', marginBottom: '2.5rem' }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1.25rem',
                        background: `conic-gradient(${getScoreColor(score)} ${score}%, var(--bg-elevated) 0)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px'
                    }}>
                        <div style={{
                            width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-primary)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '2.5rem',
                                fontWeight: 700,
                                color: getScoreColor(score)
                            }}>{score}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>/ 100</span>
                        </div>
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        marginBottom: '0.375rem',
                        color: 'var(--text-primary)'
                    }}>{getScoreLabel(score)}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{results.role} Interview Complete</p>
                </motion.div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                    {(['overview', 'questions', 'plan'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 500,
                                background: activeTab === tab ? 'var(--accent-amber-dim)' : 'var(--bg-elevated)',
                                border: activeTab === tab ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                                color: activeTab === tab ? 'var(--accent-amber)' : 'var(--text-muted)',
                                cursor: 'pointer', textTransform: 'capitalize', letterSpacing: '0.02em'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && feedback && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Summary */}
                        <div style={cardStyle}>
                            <h3 style={{
                                fontFamily: 'var(--font-serif)',
                                fontWeight: 600,
                                marginBottom: '1rem',
                                color: 'var(--text-primary)'
                            }}>Summary</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{feedback.summary}</p>
                        </div>

                        {/* Strengths & Improvements */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                    <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Strengths</span>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {(feedback.strengths || ['Clear explanations', 'Good examples']).slice(0, 3).map((s: string, i: number) => (
                                        <li key={i} style={{
                                            fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem',
                                            paddingLeft: '0.75rem', borderLeft: '2px solid var(--success)'
                                        }}>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                    <Lightbulb size={18} style={{ color: 'var(--accent-amber)' }} />
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Improve</span>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {(feedback.improvements || ['Add more depth', 'Include examples']).slice(0, 3).map((s: string, i: number) => (
                                        <li key={i} style={{
                                            fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem',
                                            paddingLeft: '0.75rem', borderLeft: '2px solid var(--accent-amber)'
                                        }}>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Questions Tab */}
                {activeTab === 'questions' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {results.answers.map((answer: any, i: number) => {
                            const q = results.questions[i];
                            const qScore = answer.evaluation?.score || 70;
                            return (
                                <div key={i} style={{ ...cardStyle, marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <span style={{
                                            fontSize: '0.65rem', color: 'var(--text-muted)',
                                            textTransform: 'uppercase', letterSpacing: '0.05em'
                                        }}>Question {i + 1}</span>
                                        <span style={{
                                            padding: '0.25rem 0.625rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 600,
                                            background: `${getScoreColor(qScore)}20`, color: getScoreColor(qScore)
                                        }}>{qScore}/100</span>
                                    </div>
                                    <p style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontWeight: 500,
                                        marginBottom: '0.75rem',
                                        fontSize: '0.95rem',
                                        color: 'var(--text-primary)'
                                    }}>{q?.question}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        {answer.evaluation?.feedback || 'Good attempt. Consider adding more specific details.'}
                                    </p>
                                </div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Plan Tab */}
                {activeTab === 'plan' && improvementPlan && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                <BookOpen size={18} style={{ color: 'var(--accent-amber)' }} />
                                <span style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)'
                                }}>Your Improvement Plan</span>
                            </div>

                            {(improvementPlan.priorityTopics || []).map((item: any, i: number) => (
                                <div key={i} style={{
                                    padding: '0.875rem 1rem', borderRadius: '0.5rem', marginBottom: '0.5rem',
                                    background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber-glow)'
                                }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {i + 1}. {typeof item === 'string' ? item : item.topic}
                                    </div>
                                    {typeof item !== 'string' && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            {item.importance} priority · {item.estimatedTime}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <Link href="/interview/new">
                        <button className="btn-secondary" style={{ width: '100%', padding: '1rem' }}>
                            <RotateCcw size={18} /> Practice Again
                        </button>
                    </Link>
                    <Link href="/leaderboard">
                        <button className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                            <Trophy size={18} /> Leaderboard
                        </button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

