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
                    Loading interview...
                </div>
            </AppLayout>
        );
    }

    const getDifficultyColor = (diff: string) => {
        if (diff === 'easy') return 'var(--success)';
        if (diff === 'medium') return 'var(--accent-amber)';
        return 'var(--error)';
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
                {/* Header - Progress & Timer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </p>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                            {Array.from({ length: totalQuestions }).map((_, i) => (
                                <div key={i} style={{
                                    width: '32px', height: '3px', borderRadius: '2px',
                                    background: i < currentQuestionIndex ? 'var(--accent-amber)' : i === currentQuestionIndex ? 'var(--text-primary)' : 'var(--bg-elevated)'
                                }} />
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

                {/* Question Card */}
                <motion.div
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        boxShadow: 'var(--shadow-md)',
                        marginBottom: '1.5rem'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={currentQuestionIndex}
                >
                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 600,
                            background: `${getDifficultyColor(currentQuestion.difficulty)}20`,
                            color: getDifficultyColor(currentQuestion.difficulty),
                            textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>{currentQuestion.difficulty}</span>
                        <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 500,
                            background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)'
                        }}>{currentQuestion.skill}</span>
                    </div>

                    {/* Question */}
                    <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.375rem',
                        fontWeight: 600,
                        marginBottom: '1rem',
                        lineHeight: 1.5,
                        color: 'var(--text-primary)'
                    }}>
                        {currentQuestion.question}
                    </h2>

                    {/* Expected Concepts */}
                    {currentQuestion.expectedConcepts?.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ fontWeight: 500 }}>Key concepts:</span>{' '}
                            {currentQuestion.expectedConcepts.join(', ')}
                        </div>
                    )}
                </motion.div>

                {/* Answer Section */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    {isCodeMode ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Code size={18} style={{ color: 'var(--accent-amber)' }} />
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Code Editor</span>
                                </div>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    style={{
                                        padding: '0.375rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem',
                                        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'
                                    }}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                </select>
                            </div>
                            <div style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                <MonacoEditor
                                    height="250px"
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
                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Your Answer</span>
                                {isVoiceMode && (
                                    <button
                                        onClick={voice.isListening ? voice.stopListening : voice.startListening}
                                        disabled={!voice.isSupported}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.5rem 1rem', borderRadius: '0.375rem',
                                            background: voice.isListening ? 'var(--error-dim)' : 'var(--accent-amber-dim)',
                                            border: voice.isListening ? '1px solid var(--error)' : '1px solid var(--accent-amber)',
                                            color: voice.isListening ? 'var(--error)' : 'var(--accent-amber)',
                                            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500
                                        }}
                                    >
                                        {voice.isListening ? <><MicOff size={16} /> Stop</> : <><Mic size={16} /> Speak</>}
                                    </button>
                                )}
                            </div>
                            <textarea
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                style={{
                                    width: '100%', height: '180px', padding: '1rem',
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                    borderRadius: '0.5rem', color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'none',
                                    fontFamily: 'var(--font-sans)'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting || !currentAnswer.trim()}
                    className="btn-primary"
                    style={{
                        width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1rem',
                        opacity: (isSubmitting || !currentAnswer.trim()) ? 0.5 : 1
                    }}
                >
                    {isSubmitting ? 'Evaluating...' : currentQuestionIndex === totalQuestions - 1 ? (
                        <><Send size={20} /> Finish Interview</>
                    ) : (
                        <><ChevronRight size={20} /> Next Question</>
                    )}
                </button>
            </div>
        </AppLayout>
    );
}

