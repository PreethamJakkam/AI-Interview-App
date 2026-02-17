'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Trophy, RotateCcw, CheckCircle, Lightbulb, BookOpen, Target, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { generateFeedback, generateImprovementPlan } from '@/lib/gemini';
import { saveInterviewSession, updateUserStats } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

function AnimatedScore({ target, color }: { target: number; color: string }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target]);

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (count / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
            <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="45" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
                <motion.circle
                    cx="80" cy="80" r="45" fill="none" stroke={color} strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                    style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <motion.span
                    className="score-highlight"
                    style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700, color, letterSpacing: '-0.03em' }}
                >
                    {count}
                </motion.span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>score</span>
            </div>
        </div>
    );
}

export default function InterviewResultsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [results, setResults] = useState<any>(null);
    const [feedback, setFeedback] = useState<any>(null);
    const [improvementPlan, setImprovementPlan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'plan'>('overview');
    const [expandedQ, setExpandedQ] = useState<number | null>(null);

    useEffect(() => {
        const loadResults = async () => {
            const data = sessionStorage.getItem('interviewResults');
            if (!data) { router.push('/interview/new'); return; }
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

    const scoreColor = (s: number) => s >= 80 ? 'var(--success)' : s >= 60 ? 'var(--warning)' : 'var(--error)';
    const scoreLabel = (s: number) => s >= 90 ? 'Excellent!' : s >= 80 ? 'Great job!' : s >= 70 ? 'Good work' : s >= 60 ? 'Keep practicing' : 'Needs improvement';

    if (isLoading || !results) {
        return (
            <AppLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
                        <div className="ai-active-glow" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem', background: 'linear-gradient(135deg, var(--accent-cyan-dim), var(--accent-violet-dim))', border: '2px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trophy size={32} style={{ color: 'var(--accent-cyan)' }} />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            Analyzing your answers...
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>AI is generating personalized feedback</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginTop: '1.5rem' }}>
                            <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" />
                        </div>
                    </motion.div>
                </div>
            </AppLayout>
        );
    }

    const score = feedback?.overallScore || 0;

    const tabs = [
        { key: 'overview' as const, label: 'Overview', icon: <Target size={14} /> },
        { key: 'questions' as const, label: 'Questions', icon: <BookOpen size={14} /> },
        { key: 'plan' as const, label: 'Improvement', icon: <TrendingUp size={14} /> },
    ];

    return (
        <AppLayout>
            <div className="page-enter">
                {/* Top: Score + Summary in two columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* Score Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                        style={{
                            background: 'var(--glass-bg-strong)', backdropFilter: 'blur(16px)',
                            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)',
                            padding: '2rem', textAlign: 'center',
                        }}
                    >
                        <AnimatedScore target={score} color={scoreColor(score)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                            style={{ marginTop: '1rem' }}
                        >
                            <div className="micro-bounce" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: scoreColor(score), marginBottom: '0.25rem' }}>
                                {scoreLabel(score)}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{results.role} Interview</div>
                        </motion.div>
                    </motion.div>

                    {/* Summary + Actions */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                            Interview <span className="text-gradient">Results</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '500px' }}>
                            {feedback?.summary || 'Your personalized feedback and improvement plan are ready.'}
                        </p>

                        {/* Strength/Weakness pills */}
                        {feedback?.strengths && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {feedback.strengths.slice(0, 3).map((s: string, i: number) => (
                                    <span key={i} style={{
                                        padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
                                        background: 'var(--success-dim)', border: '1px solid rgba(16, 185, 129, 0.2)',
                                        color: 'var(--success)', fontSize: '0.7rem', fontWeight: 500,
                                    }}>{s}</span>
                                ))}
                                {feedback.weaknesses?.slice(0, 2).map((w: string, i: number) => (
                                    <span key={`w-${i}`} style={{
                                        padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
                                        background: 'var(--warning-dim)', border: '1px solid rgba(245, 158, 11, 0.2)',
                                        color: 'var(--warning)', fontSize: '0.7rem', fontWeight: 500,
                                    }}>{w}</span>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Link href="/interview/new">
                                <motion.button className="btn-primary" style={{ fontSize: '0.8125rem' }} whileTap={{ scale: 0.97 }}>
                                    <RotateCcw size={14} /> Try Again
                                </motion.button>
                            </Link>
                            <Link href="/history">
                                <motion.button className="btn-secondary" style={{ fontSize: '0.8125rem' }} whileTap={{ scale: 0.97 }}>
                                    <BookOpen size={14} /> View History
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
                                border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                                background: activeTab === tab.key ? 'var(--accent-cyan)' : 'transparent',
                                color: activeTab === tab.key ? '#07070D' : 'var(--text-muted)',
                                transition: 'all var(--transition-base)',
                            }}
                        >
                            {tab.icon} {tab.label}
                        </motion.button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && feedback && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                {/* Strengths */}
                                <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Strengths</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        {(feedback.strengths || []).map((s: string, i: number) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                                <span style={{ color: 'var(--success)', marginTop: '0.125rem' }}>•</span> {s}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Areas to Improve */}
                                <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <Lightbulb size={16} style={{ color: 'var(--warning)' }} />
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Areas to Improve</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        {(feedback.weaknesses || feedback.improvements || []).map((w: string, i: number) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                                <span style={{ color: 'var(--warning)', marginTop: '0.125rem' }}>•</span> {w}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'questions' && results && (
                        <motion.div key="questions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {results.questions.map((q: any, i: number) => {
                                    const answer = results.answers[i];
                                    const eval_ = answer?.evaluation;
                                    const isExpanded = expandedQ === i;
                                    const qScore = eval_?.score || 0;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
                                        >
                                            <div
                                                onClick={() => setExpandedQ(isExpanded ? null : i)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer', transition: 'background var(--transition-fast)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '24px' }}>Q{i + 1}</div>
                                                <div style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>{q.text || q.question || q}</div>
                                                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: scoreColor(qScore), fontSize: '0.875rem', minWidth: '40px', textAlign: 'right' }}>{qScore}%</div>
                                                <div style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform var(--transition-base)' }}>
                                                    <ChevronDown size={14} />
                                                </div>
                                            </div>
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                        <div style={{ padding: '0 1.25rem 1.25rem 3.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                            {answer?.answer && (
                                                                <div>
                                                                    <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>Your Answer</div>
                                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>{answer.answer}</div>
                                                                </div>
                                                            )}
                                                            {eval_?.feedback && (
                                                                <div>
                                                                    <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>AI Feedback</div>
                                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{eval_.feedback}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'plan' && improvementPlan && (
                        <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                {(improvementPlan.steps || improvementPlan.plan || []).map((step: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-full)', background: 'var(--accent-cyan-dim)', border: '1px solid rgba(6, 214, 160, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                                                {i + 1}
                                            </div>
                                            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                                {typeof step === 'string' ? step : step.title || step.topic || `Step ${i + 1}`}
                                            </h3>
                                        </div>
                                        {typeof step !== 'string' && step.description && (
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.description}</p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
