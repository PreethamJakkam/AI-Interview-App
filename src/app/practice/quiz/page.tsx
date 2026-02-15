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

    const QUESTION_TIME = 60; // seconds per question

    // Timer effect
    useEffect(() => {
        if (stage !== 'quiz' || showExplanation) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleAnswer(-1); // Time's up, mark as wrong
                    return 0;
                }
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

        const answer: QuizAnswer = {
            questionId: currentQuestion.id,
            selectedOption: optionIndex,
            isCorrect,
            timeSpent
        };

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

        // Save to Firebase if logged in
        if (user) {
            try {
                await savePracticeSession({
                    odiserId: user.uid,
                    mode: 'quiz',
                    topic: topicUsed,
                    difficulty: selectedDifficulty,
                    score,
                    questions,
                    answers,
                    totalTime,
                    status: 'completed'
                });
            } catch (error) {
                console.error('Failed to save session:', error);
            }
        }
    };

    const restartQuiz = () => {
        setStage('topic');
        setSelectedTopic('');
        setCustomTopic('');
        setIsCustomTopicMode(false);
        setSelectedDifficulty('');
        setQuestions([]);
        setCurrentIndex(0);
        setAnswers([]);
        setSelectedOption(null);
        setShowExplanation(false);
    };

    const cardStyle = {
        background: 'var(--bg-card)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-subtle)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        transition: 'all 0.2s'
    };

    const correctCount = answers.filter(a => a.isCorrect).length;
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    return (
        <AppLayout>
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 0' }}>
                {/* Header */}
                <motion.div
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <button
                        onClick={() => stage === 'topic' ? router.push('/practice') : setStage('topic')}
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
                            Quiz <span style={{ color: 'var(--accent-amber)' }}>mode</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
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
                        <motion.div
                            key="topic"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                {appConfig.quizTopics.map((topic) => (
                                    <div
                                        key={topic.id}
                                        onClick={() => { setIsCustomTopicMode(false); setSelectedTopic(topic.id); setStage('difficulty'); }}
                                        style={{
                                            ...cardStyle,
                                            cursor: 'pointer',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{topic.icon}</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                            {topic.name}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {topic.description}
                                        </div>
                                    </div>
                                ))}

                                {/* Custom Topic Card */}
                                <div
                                    onClick={() => setIsCustomTopicMode(true)}
                                    style={{
                                        ...cardStyle,
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        borderColor: isCustomTopicMode ? 'var(--accent-amber)' : 'var(--border-subtle)',
                                        background: isCustomTopicMode ? 'var(--accent-amber-dim)' : 'var(--bg-card)',
                                        gridColumn: 'span 2'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                        Custom Topic
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        Enter any topic you want to practice
                                    </div>
                                </div>
                            </div>

                            {/* Custom Topic Input */}
                            {isCustomTopicMode && (
                                <div style={{ marginTop: '1rem' }}>
                                    <input
                                        type="text"
                                        value={customTopic}
                                        onChange={(e) => setCustomTopic(e.target.value)}
                                        placeholder="Enter your topic (e.g., Docker, MongoDB, GraphQL...)"
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--accent-amber)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem'
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => customTopic.trim() && setStage('difficulty')}
                                        disabled={!customTopic.trim()}
                                        className="btn-primary"
                                        style={{ width: '100%', marginTop: '1rem', padding: '1rem', justifyContent: 'center', opacity: customTopic.trim() ? 1 : 0.5 }}
                                    >
                                        Continue with "{customTopic || '...'}"
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Difficulty Selection */}
                    {stage === 'difficulty' && (
                        <motion.div
                            key="difficulty"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {appConfig.difficulties.map((diff) => (
                                    <div
                                        key={diff.id}
                                        onClick={() => setSelectedDifficulty(diff.id)}
                                        style={{
                                            ...cardStyle,
                                            cursor: 'pointer',
                                            borderColor: selectedDifficulty === diff.id ? 'var(--accent-amber)' : 'var(--border-subtle)',
                                            background: selectedDifficulty === diff.id ? 'var(--accent-amber-dim)' : 'var(--bg-card)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>{diff.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{diff.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{diff.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={startQuiz}
                                disabled={!selectedDifficulty || isLoading}
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', justifyContent: 'center' }}
                            >
                                {isLoading ? 'Loading...' : 'Start Quiz'}
                                <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {/* Quiz */}
                    {stage === 'quiz' && questions.length > 0 && (
                        <motion.div
                            key={`quiz-${currentIndex}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            {/* Timer */}
                            <div style={{
                                ...cardStyle,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                                padding: '0.75rem 1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={16} style={{ color: timeLeft <= 10 ? 'var(--error)' : 'var(--accent-amber)' }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: timeLeft <= 10 ? 'var(--error)' : 'var(--text-primary)' }}>
                                        {timeLeft}s
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {correctCount}/{answers.length} correct
                                </div>
                            </div>

                            {/* Question */}
                            <div style={{ ...cardStyle, marginBottom: '1rem' }}>
                                <p style={{
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    color: 'var(--text-primary)',
                                    lineHeight: 1.6
                                }}>
                                    {questions[currentIndex].question}
                                </p>
                            </div>

                            {/* Options */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                {questions[currentIndex].options.map((option, i) => {
                                    const isSelected = selectedOption === i;
                                    const isCorrect = i === questions[currentIndex].correctAnswer;
                                    const showResult = showExplanation;

                                    let borderColor = 'var(--border-subtle)';
                                    let bgColor = 'var(--bg-card)';

                                    if (showResult) {
                                        if (isCorrect) {
                                            borderColor = 'var(--success)';
                                            bgColor = 'rgba(34, 197, 94, 0.1)';
                                        } else if (isSelected && !isCorrect) {
                                            borderColor = 'var(--error)';
                                            bgColor = 'rgba(239, 68, 68, 0.1)';
                                        }
                                    } else if (isSelected) {
                                        borderColor = 'var(--accent-amber)';
                                        bgColor = 'var(--accent-amber-dim)';
                                    }

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => !showExplanation && handleAnswer(i)}
                                            style={{
                                                ...cardStyle,
                                                cursor: showExplanation ? 'default' : 'pointer',
                                                borderColor,
                                                background: bgColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '1rem 1.25rem'
                                            }}
                                        >
                                            <span style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: 'var(--bg-elevated)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: 'var(--text-muted)'
                                            }}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                                {option}
                                            </span>
                                            {showResult && isCorrect && <CheckCircle size={18} style={{ color: 'var(--success)' }} />}
                                            {showResult && isSelected && !isCorrect && <XCircle size={18} style={{ color: 'var(--error)' }} />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            {showExplanation && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ ...cardStyle, marginTop: '1rem', background: 'var(--bg-elevated)' }}
                                >
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginBottom: '0.375rem', fontWeight: 600 }}>
                                        Explanation
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        {questions[currentIndex].explanation}
                                    </p>
                                    <button
                                        onClick={nextQuestion}
                                        className="btn-primary"
                                        style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
                                    >
                                        {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                                        <ChevronRight size={16} />
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Results */}
                    {stage === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            {/* Score Card */}
                            <div style={{ ...cardStyle, textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: score >= 70 ? 'rgba(34, 197, 94, 0.1)' : score >= 50 ? 'var(--accent-amber-dim)' : 'rgba(239, 68, 68, 0.1)',
                                    border: `2px solid ${score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--accent-amber)' : 'var(--error)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem'
                                }}>
                                    <span style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '1.75rem',
                                        fontWeight: 700,
                                        color: score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--accent-amber)' : 'var(--error)'
                                    }}>
                                        {score}%
                                    </span>
                                </div>
                                <h2 style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : score >= 40 ? 'Keep practicing!' : 'Need more practice'}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    You got {correctCount} out of {questions.length} questions correct
                                </p>
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={cardStyle}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Topic</div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {isCustomTopicMode ? customTopic : appConfig.quizTopics.find(t => t.id === selectedTopic)?.name}
                                    </div>
                                </div>
                                <div style={cardStyle}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Difficulty</div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                        {selectedDifficulty}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={restartQuiz}
                                    className="btn-secondary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    <RotateCcw size={16} />
                                    Try Again
                                </button>
                                <button
                                    onClick={() => router.push('/practice')}
                                    className="btn-primary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    Back to Modes
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
