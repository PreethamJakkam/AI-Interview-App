'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Mic, MicOff, Send, Code } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { Timer } from '@/components/interview';
import { useTimer, useVoiceInput } from '@/hooks';
import { evaluateAnswer } from '@/lib/gemini';
import { appConfig } from '@/lib/config';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Question {
    question: string;
    difficulty: string;
    skill: string;
    expectedConcepts: string[];
    codeTemplate?: string;
    sampleAnswer?: string;
}

interface Answer {
    questionIndex: number;
    answer: string;
    timeSpent: number;
    evaluation?: any;
}

export default function InterviewSessionPage() {
    const router = useRouter();
    const [interviewData, setInterviewData] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');

    const timer = useTimer(appConfig.questionTimeLimit);
    const voice = useVoiceInput();

    useEffect(() => {
        const data = sessionStorage.getItem('interviewData');
        if (!data) {
            router.push('/interview/new');
            return;
        }
        setInterviewData(JSON.parse(data));
        timer.start();
    }, []);

    useEffect(() => {
        if (voice.transcript) {
            setCurrentAnswer(prev => prev + ' ' + voice.transcript);
        }
    }, [voice.transcript]);

    useEffect(() => {
        if (timer.timeRemaining === 0) {
            handleSubmitAnswer();
        }
    }, [timer.timeRemaining]);

    const currentQuestion: Question | null = interviewData?.questions?.[currentQuestionIndex];
    const totalQuestions = interviewData?.questions?.length || 0;
    const isCodeMode = interviewData?.mode === 'coding';
    const isVoiceMode = interviewData?.mode === 'voice';

    const handleSubmitAnswer = async () => {
        if (!currentAnswer.trim() && !isSubmitting) {
            toast.error('Please provide an answer');
            return;
        }

        setIsSubmitting(true);
        timer.pause();

        try {
            const evaluation = await evaluateAnswer(
                currentQuestion?.question || '',
                currentAnswer,
                currentQuestion?.expectedConcepts || [],
                isCodeMode
            );

            const newAnswer: Answer = {
                questionIndex: currentQuestionIndex,
                answer: currentAnswer,
                timeSpent: appConfig.questionTimeLimit - timer.timeRemaining,
                evaluation
            };

            const updatedAnswers = [...answers, newAnswer];
            setAnswers(updatedAnswers);

            if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setCurrentAnswer('');
                timer.reset();
                timer.start();
                toast.success(`Question ${currentQuestionIndex + 1} submitted!`);
            } else {
                sessionStorage.setItem('interviewResults', JSON.stringify({
                    ...interviewData,
                    answers: updatedAnswers
                }));
                router.push('/interview/results');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to evaluate answer');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!interviewData || !currentQuestion) {
        return (
            <AppLayout>
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginBottom: '1rem' }}>
                        <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" />
                    </div>
                    Loading interview...
                </div>
            </AppLayout>
        );
    }

    const getDifficultyColor = (diff: string) => {
        if (diff === 'easy') return 'var(--success)';
        if (diff === 'medium') return 'var(--warning)';
        return 'var(--error)';
    };

    return (
        <AppLayout>
            <div className="page-enter">
                {/* Header — Progress & Timer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <p style={{
                            fontSize: '0.7rem', color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            marginBottom: '0.625rem', fontWeight: 500
                        }}>
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </p>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                            {Array.from({ length: totalQuestions }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    style={{
                                        width: '36px', height: '3px',
                                        borderRadius: 'var(--radius-full)',
                                        background: i < currentQuestionIndex
                                            ? 'var(--accent-cyan)'
                                            : i === currentQuestionIndex
                                                ? 'var(--text-primary)'
                                                : 'var(--bg-elevated)',
                                        transition: 'background var(--transition-base)',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <Timer
                        timeRemaining={timer.timeRemaining}
                        isCritical={timer.isCritical}
                        formatTime={timer.formatTime}
                        totalTime={appConfig.questionTimeLimit}
                    />
                </div>

                {/* Two-Column Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                    {/* LEFT — Question Card */}
                    <motion.div
                        style={{
                            background: 'var(--glass-bg-strong)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '2rem',
                            boxShadow: 'var(--shadow-md)',
                        }}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={currentQuestionIndex}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {/* Tags */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
                                fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.04em',
                                background: `${getDifficultyColor(currentQuestion.difficulty)}15`,
                                border: `1px solid ${getDifficultyColor(currentQuestion.difficulty)}30`,
                                color: getDifficultyColor(currentQuestion.difficulty),
                                textTransform: 'uppercase',
                            }}>{currentQuestion.difficulty}</span>
                            <span className="badge badge-cyan">{currentQuestion.skill}</span>
                        </div>

                        {/* Question */}
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.3125rem',
                            fontWeight: 600,
                            marginBottom: '1rem',
                            lineHeight: 1.55,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.01em',
                        }}>
                            {currentQuestion.question}
                        </h2>

                        {/* Expected Concepts */}
                        {currentQuestion.expectedConcepts?.length > 0 && (
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Key concepts:</span>{' '}
                                {currentQuestion.expectedConcepts.join(', ')}
                            </div>
                        )}
                    </motion.div>

                    {/* RIGHT — Answer + Submit */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            background: 'var(--glass-bg)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '1.5rem',
                            boxShadow: 'var(--shadow-sm)',
                        }}>
                            {isCodeMode ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Code size={16} style={{ color: 'var(--accent-cyan)' }} />
                                            <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Code Editor</span>
                                        </div>
                                        <select
                                            value={selectedLanguage}
                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                            style={{
                                                padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.75rem', background: 'var(--bg-elevated)',
                                                border: '1px solid var(--border-subtle)', color: 'var(--text-primary)',
                                            }}
                                        >
                                            <option value="javascript">JavaScript</option>
                                            <option value="python">Python</option>
                                            <option value="java">Java</option>
                                            <option value="cpp">C++</option>
                                        </select>
                                    </div>
                                    <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                        <MonacoEditor
                                            height="300px"
                                            language={selectedLanguage}
                                            value={currentAnswer || currentQuestion.codeTemplate || ''}
                                            onChange={(value) => setCurrentAnswer(value || '')}
                                            theme="vs-dark"
                                            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 }, fontFamily: 'var(--font-mono)' }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Your Answer</span>
                                        {isVoiceMode && (
                                            <motion.button
                                                onClick={voice.isListening ? voice.stopListening : voice.startListening}
                                                disabled={!voice.isSupported}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={voice.isListening ? 'voice-recording' : ''}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
                                                    background: voice.isListening ? 'var(--error-dim)' : 'var(--accent-cyan-dim)',
                                                    border: voice.isListening ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(6,214,160,0.2)',
                                                    color: voice.isListening ? 'var(--error)' : 'var(--accent-cyan)',
                                                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
                                                    transition: 'all var(--transition-base)',
                                                }}
                                            >
                                                {voice.isListening ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Speak</>}
                                            </motion.button>
                                        )}
                                    </div>
                                    <textarea
                                        value={currentAnswer}
                                        onChange={(e) => setCurrentAnswer(e.target.value)}
                                        placeholder="Type your answer here..."
                                        style={{
                                            width: '100%', height: '240px', padding: '1rem',
                                            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                                            fontSize: '0.875rem', resize: 'none', fontFamily: 'var(--font-sans)',
                                            transition: 'all var(--transition-base)',
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            onClick={handleSubmitAnswer}
                            disabled={isSubmitting || !currentAnswer.trim()}
                            className="btn-primary"
                            style={{
                                width: '100%', padding: '1rem', fontSize: '0.875rem',
                                opacity: (isSubmitting || !currentAnswer.trim()) ? 0.4 : 1
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            {isSubmitting ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" />
                                    Evaluating...
                                </span>
                            ) : currentQuestionIndex === totalQuestions - 1 ? (
                                <><Send size={18} /> Finish Interview</>
                            ) : (
                                <><ChevronRight size={18} /> Next Question</>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
