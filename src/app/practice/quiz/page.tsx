'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { appConfig } from '@/lib/config';
import { generateQuizQuestions } from '@/lib/gemini';
import { savePracticeSession } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { QuizQuestion, QuizAnswer } from '@/types';
import toast from 'react-hot-toast';

type Stage = 'topic' | 'difficulty' | 'quiz' | 'results';

export default function QuizModePage() {
    const router = useRouter();
    const { user } = useAuth();

    const [stage, setStage] = useState<Stage>('topic');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [isCustomTopicMode, setIsCustomTopicMode] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<QuizAnswer[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [showExplanation, setShowExplanation] = useState(false);

    const QUESTION_TIME = 60;

    useEffect(() => {
        if (stage !== 'quiz' || showExplanation) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { handleAnswer(-1); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [stage, currentIndex, showExplanation]);

    const startQuiz = async () => {
        const topicToUse = isCustomTopicMode ? customTopic.trim() : selectedTopic;
        if (!topicToUse || !selectedDifficulty) {
            toast.error(isCustomTopicMode ? 'Please enter a topic and select difficulty' : 'Please select topic and difficulty');
            return;
        }
        setIsLoading(true);
        try {
            const generatedQuestions = await generateQuizQuestions(topicToUse, selectedDifficulty, 10);
            setQuestions(generatedQuestions);
            setStage('quiz');
            setTimeLeft(QUESTION_TIME);
            setQuestionStartTime(Date.now());
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate questions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswer = useCallback((optionIndex: number) => {
        if (showExplanation) return;
        const currentQuestion = questions[currentIndex];
        const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
        const isCorrect = optionIndex === currentQuestion.correctAnswer;
        setSelectedOption(optionIndex);
        setShowExplanation(true);
        const answer: QuizAnswer = { questionId: currentQuestion.id, selectedOption: optionIndex, isCorrect, timeSpent };
        setAnswers(prev => [...prev, answer]);
    }, [currentIndex, questions, questionStartTime, showExplanation]);

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
            setTimeLeft(QUESTION_TIME);
            setQuestionStartTime(Date.now());
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        const correctCount = answers.filter(a => a.isCorrect).length;
        const score = Math.round((correctCount / questions.length) * 100);
        const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
        const topicUsed = isCustomTopicMode ? customTopic.trim() : selectedTopic;
        setStage('results');
        if (user) {
            try {
                await savePracticeSession({
                    odiserId: user.uid, mode: 'quiz', topic: topicUsed,
                    difficulty: selectedDifficulty, score, questions, answers, totalTime, status: 'completed'
                });
                toast.success('Session saved to history!');
            } catch (error) {
                console.error('Failed to save session:', error);
                toast.error('Could not save session to history');
            }
        }
    };

    const restartQuiz = () => {
        setStage('topic'); setSelectedTopic(''); setCustomTopic(''); setIsCustomTopicMode(false);
        setSelectedDifficulty(''); setQuestions([]); setCurrentIndex(0);
        setAnswers([]); setSelectedOption(null); setShowExplanation(false);
    };

    const glassCard: React.CSSProperties = {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        transition: 'all var(--transition-base)',
    };

    const correctCount = answers.filter(a => a.isCorrect).length;
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    const getScoreColor = (s: number) => {
        if (s >= 70) return 'var(--success)';
        if (s >= 50) return 'var(--warning)';
        return 'var(--error)';
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2.5rem 0' }}>
                {/* Header */}
                <motion.div
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                >
                    <button
                        onClick={() => stage === 'topic' ? router.push('/practice') : setStage('topic')}
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
                            Quiz <span className="text-gradient">mode</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {stage === 'topic' && 'Select a topic'}
                            {stage === 'difficulty' && 'Choose difficulty'}
                            {stage === 'quiz' && `Question ${currentIndex + 1} of ${questions.length}`}
                            {stage === 'results' && 'Quiz complete'}
                        </p>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* Topic Selection */}
                    {stage === 'topic' && (
                        <motion.div key="topic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                {appConfig.quizTopics.map((topic) => (
                                    <motion.div
                                        key={topic.id}
                                        onClick={() => { setIsCustomTopicMode(false); setSelectedTopic(topic.id); setStage('difficulty'); }}
                                        style={{ ...glassCard, cursor: 'pointer', textAlign: 'center' }}
                                        whileHover={{ scale: 1.02, borderColor: 'var(--border-medium)' }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{topic.icon}</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{topic.name}</div>
                                        <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>{topic.description}</div>
                                    </motion.div>
                                ))}

                                {/* Custom Topic Card */}
                                <motion.div
                                    onClick={() => setIsCustomTopicMode(true)}
                                    style={{
                                        ...glassCard, cursor: 'pointer', textAlign: 'center', gridColumn: 'span 2',
                                        borderColor: isCustomTopicMode ? 'rgba(6,214,160,0.3)' : 'var(--glass-border)',
                                        background: isCustomTopicMode ? 'var(--accent-cyan-dim)' : 'var(--glass-bg)',
                                    }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Custom Topic</div>
                                    <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Enter any topic you want to practice</div>
                                </motion.div>
                            </div>

                            {isCustomTopicMode && (
                                <div style={{ marginTop: '1rem' }}>
                                    <input
                                        type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)}
                                        placeholder="Enter your topic (e.g., Docker, MongoDB, GraphQL...)"
                                        style={{
                                            width: '100%', padding: '1rem', background: 'var(--bg-elevated)',
                                            border: '1px solid var(--accent-cyan)', borderRadius: 'var(--radius-md)',
                                            color: 'var(--text-primary)', fontSize: '0.8125rem',
                                        }}
                                        autoFocus
                                    />
                                    <motion.button
                                        onClick={() => customTopic.trim() && setStage('difficulty')}
                                        disabled={!customTopic.trim()}
                                        className="btn-primary"
                                        style={{ width: '100%', marginTop: '1rem', padding: '1rem', justifyContent: 'center', opacity: customTopic.trim() ? 1 : 0.4, fontSize: '0.8125rem' }}
                                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                    >
                                        Continue with &quot;{customTopic || '...'}&quot;
                                        <ChevronRight size={16} />
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Difficulty Selection */}
                    {stage === 'difficulty' && (
                        <motion.div key="difficulty" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {appConfig.difficulties.map((diff) => (
                                    <motion.div
                                        key={diff.id}
                                        onClick={() => setSelectedDifficulty(diff.id)}
                                        style={{
                                            ...glassCard, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                                            borderColor: selectedDifficulty === diff.id ? 'rgba(6,214,160,0.3)' : 'var(--glass-border)',
                                            background: selectedDifficulty === diff.id ? 'var(--accent-cyan-dim)' : 'var(--glass-bg)',
                                        }}
                                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>{diff.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{diff.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{diff.description}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <motion.button
                                onClick={startQuiz}
                                disabled={!selectedDifficulty || isLoading}
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', justifyContent: 'center', fontSize: '0.8125rem' }}
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            >
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" /> Generating...
                                    </span>
                                ) : <>Start Quiz <ChevronRight size={16} /></>}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Quiz */}
                    {stage === 'quiz' && questions.length > 0 && (
                        <motion.div key={`quiz-${currentIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            {/* Timer Bar */}
                            <div style={{
                                ...glassCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: '1rem', padding: '0.75rem 1rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={14} style={{ color: timeLeft <= 10 ? 'var(--error)' : 'var(--accent-cyan)' }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem', color: timeLeft <= 10 ? 'var(--error)' : 'var(--text-primary)' }}>
                                        {timeLeft}s
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {correctCount}/{answers.length} correct
                                </div>
                            </div>

                            {/* Question */}
                            <div style={{ ...glassCard, marginBottom: '1rem', background: 'var(--glass-bg-strong)' }}>
                                <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                                    {questions[currentIndex].question}
                                </p>
                            </div>

                            {/* Options */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                {questions[currentIndex].options.map((option, i) => {
                                    const isSelected = selectedOption === i;
                                    const isCorrect = i === questions[currentIndex].correctAnswer;
                                    const showResult = showExplanation;

                                    let borderColor = 'var(--glass-border)';
                                    let bgColor = 'var(--glass-bg)';

                                    if (showResult) {
                                        if (isCorrect) { borderColor = 'var(--success)'; bgColor = 'rgba(34, 197, 94, 0.08)'; }
                                        else if (isSelected && !isCorrect) { borderColor = 'var(--error)'; bgColor = 'rgba(239, 68, 68, 0.08)'; }
                                    } else if (isSelected) { borderColor = 'rgba(6,214,160,0.4)'; bgColor = 'var(--accent-cyan-dim)'; }

                                    return (
                                        <motion.div
                                            key={i}
                                            onClick={() => !showExplanation && handleAnswer(i)}
                                            style={{
                                                background: bgColor, backdropFilter: 'blur(8px)',
                                                border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-lg)',
                                                cursor: showExplanation ? 'default' : 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '1rem 1.25rem', transition: 'all var(--transition-base)',
                                            }}
                                            whileHover={!showExplanation ? { scale: 1.01 } : {}}
                                            whileTap={!showExplanation ? { scale: 0.99 } : {}}
                                        >
                                            <span style={{
                                                width: '24px', height: '24px', borderRadius: '50%',
                                                background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)',
                                            }}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{option}</span>
                                            {showResult && isCorrect && <CheckCircle size={16} style={{ color: 'var(--success)' }} />}
                                            {showResult && isSelected && !isCorrect && <XCircle size={16} style={{ color: 'var(--error)' }} />}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            {showExplanation && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ ...glassCard, marginTop: '1rem', background: 'var(--bg-elevated)' }}
                                >
                                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginBottom: '0.375rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                        Explanation
                                    </div>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        {questions[currentIndex].explanation}
                                    </p>
                                    <motion.button
                                        onClick={nextQuestion} className="btn-primary"
                                        style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', fontSize: '0.8125rem' }}
                                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                    >
                                        {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                                        <ChevronRight size={14} />
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Results */}
                    {stage === 'results' && (
                        <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            {/* Score Card */}
                            <div style={{ ...glassCard, textAlign: 'center', marginBottom: '1.5rem', background: 'var(--glass-bg-strong)' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    background: `conic-gradient(${getScoreColor(score)} ${score}%, var(--bg-elevated) 0)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1rem', padding: '4px',
                                    boxShadow: `0 0 20px ${getScoreColor(score)}20`,
                                }}>
                                    <div style={{
                                        width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span style={{
                                            fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700,
                                            color: getScoreColor(score),
                                        }}>{score}%</span>
                                    </div>
                                </div>
                                <h2 style={{
                                    fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
                                    color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em',
                                }}>
                                    {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : score >= 40 ? 'Keep practicing!' : 'Need more practice'}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                    You got {correctCount} out of {questions.length} questions correct
                                </p>
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={glassCard}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '0.25rem' }}>Topic</div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                                        {isCustomTopicMode ? customTopic : appConfig.quizTopics.find(t => t.id === selectedTopic)?.name}
                                    </div>
                                </div>
                                <div style={glassCard}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '0.25rem' }}>Difficulty</div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize', fontSize: '0.8125rem' }}>{selectedDifficulty}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <motion.button onClick={restartQuiz} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem' }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                    <RotateCcw size={14} /> Try Again
                                </motion.button>
                                <motion.button onClick={() => router.push('/practice')} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem' }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                    Back to Modes
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
