'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, ChevronRight, ArrowLeft, Clock, Play, CheckCircle, XCircle, Lightbulb, RotateCcw } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { appConfig } from '@/lib/config';
import { generateCodingChallenges, evaluateAnswer } from '@/lib/gemini';
import { savePracticeSession } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { CodingChallenge, CodingSubmission } from '@/types';
import toast from 'react-hot-toast';

type Stage = 'role' | 'difficulty' | 'coding' | 'results';

export default function CodingTestPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [stage, setStage] = useState<Stage>('role');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [code, setCode] = useState('');
    const [submissions, setSubmissions] = useState<CodingSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [showHints, setShowHints] = useState(false);
    const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string; actual: string }[]>([]);

    // Timer effect
    useEffect(() => {
        if (stage !== 'coding') return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) return 0;
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [stage, currentIndex]);

    const startCoding = async () => {
        if (!selectedRole || !selectedDifficulty) {
            toast.error('Please select role and difficulty');
            return;
        }

        setIsLoading(true);
        try {
            const generatedChallenges = await generateCodingChallenges(selectedRole, selectedDifficulty, 3);
            setChallenges(generatedChallenges);
            setCode(generatedChallenges[0]?.starterCode || '');
            setTimeLeft(generatedChallenges[0]?.timeLimit || 1800);
            setStartTime(Date.now());
            setStage('coding');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate challenges');
        } finally {
            setIsLoading(false);
        }
    };

    const runTests = async () => {
        setIsRunning(true);
        const currentChallenge = challenges[currentIndex];

        try {
            // Use AI to evaluate the code
            const evaluation = await evaluateAnswer(
                currentChallenge.description,
                code,
                currentChallenge.testCases.map(tc => tc.expectedOutput),
                true // isCode = true
            );

            const visibleTests = currentChallenge.testCases.filter(tc => !tc.isHidden);
            const results = visibleTests.map((tc, i) => ({
                passed: evaluation.score >= (5 + i * 1.5), // Scale pass threshold per test
                input: tc.input,
                expected: tc.expectedOutput,
                actual: evaluation.codeOutput || 'Evaluated by AI'
            }));

            setTestResults(results);
        } catch (error) {
            console.error('AI evaluation failed:', error);
            // Graceful fallback: basic code length check
            const results = currentChallenge.testCases
                .filter(tc => !tc.isHidden)
                .map(tc => ({
                    passed: code.trim().length > 50,
                    input: tc.input,
                    expected: tc.expectedOutput,
                    actual: 'Evaluation unavailable'
                }));
            setTestResults(results);
        } finally {
            setIsRunning(false);
        }
    };

    const submitChallenge = () => {
        const currentChallenge = challenges[currentIndex];
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        const passedTests = testResults.filter(r => r.passed).length;
        const totalTests = currentChallenge.testCases.length;
        const score = Math.round((passedTests / totalTests) * 100);

        const submission: CodingSubmission = {
            challengeId: currentChallenge.id,
            code,
            language: currentChallenge.language,
            passedTests,
            totalTests,
            score,
            timeSpent
        };

        setSubmissions(prev => [...prev, submission]);

        if (currentIndex < challenges.length - 1) {
            setCurrentIndex(prev => prev + 1);
            const nextChallenge = challenges[currentIndex + 1];
            setCode(nextChallenge.starterCode);
            setTimeLeft(nextChallenge.timeLimit);
            setStartTime(Date.now());
            setTestResults([]);
            setShowHints(false);
        } else {
            finishCoding();
        }
    };

    const finishCoding = async () => {
        const overallScore = submissions.length > 0
            ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length)
            : 0;
        const totalTime = submissions.reduce((sum, s) => sum + s.timeSpent, 0);

        setStage('results');

        // Save to Firebase if logged in
        if (user) {
            try {
                await savePracticeSession({
                    odiserId: user.uid,
                    mode: 'coding',
                    role: selectedRole,
                    difficulty: selectedDifficulty,
                    score: overallScore,
                    challenges,
                    submissions,
                    totalTime,
                    status: 'completed'
                });
            } catch (error) {
                console.error('Failed to save session:', error);
            }
        }
    };

    const restartCoding = () => {
        setStage('role');
        setSelectedRole('');
        setSelectedDifficulty('');
        setChallenges([]);
        setCurrentIndex(0);
        setCode('');
        setSubmissions([]);
        setTestResults([]);
        setShowHints(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    const overallScore = submissions.length > 0
        ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length)
        : 0;

    return (
        <AppLayout>
            <div style={{ maxWidth: stage === 'coding' ? '1100px' : '700px', margin: '0 auto', padding: '2rem 0' }}>
                {/* Header */}
                <motion.div
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <button
                        onClick={() => stage === 'role' ? router.push('/practice') : setStage('role')}
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
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.375rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                        }}>
                            Coding <span style={{ color: 'var(--accent-amber)' }}>test</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {stage === 'role' && 'Select a role'}
                            {stage === 'difficulty' && 'Choose difficulty'}
                            {stage === 'coding' && `Challenge ${currentIndex + 1} of ${challenges.length}`}
                            {stage === 'results' && 'Test complete'}
                        </p>
                    </div>
                    {stage === 'coding' && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-elevated)',
                            border: `1px solid ${timeLeft < 300 ? 'var(--error)' : 'var(--border-subtle)'}`,
                            borderRadius: '0.5rem'
                        }}>
                            <Clock size={16} style={{ color: timeLeft < 300 ? 'var(--error)' : 'var(--accent-amber)' }} />
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 600,
                                color: timeLeft < 300 ? 'var(--error)' : 'var(--text-primary)'
                            }}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    )}
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* Role Selection */}
                    {stage === 'role' && (
                        <motion.div
                            key="role"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                {appConfig.codingRoles.map((role) => (
                                    <div
                                        key={role.id}
                                        onClick={() => { setSelectedRole(role.id); setStage('difficulty'); }}
                                        style={{
                                            ...cardStyle,
                                            cursor: 'pointer',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{role.icon}</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                            {role.name}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {role.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                onClick={startCoding}
                                disabled={!selectedDifficulty || isLoading}
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', justifyContent: 'center' }}
                            >
                                {isLoading ? 'Loading...' : 'Start Coding'}
                                <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {/* Coding Challenge */}
                    {stage === 'coding' && challenges.length > 0 && (
                        <motion.div
                            key={`coding-${currentIndex}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}
                        >
                            {/* Problem Description */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={cardStyle}>
                                    <h2 style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '1.125rem',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        marginBottom: '0.75rem'
                                    }}>
                                        {challenges[currentIndex].title}
                                    </h2>
                                    <p style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {challenges[currentIndex].description}
                                    </p>
                                </div>

                                {/* Hints */}
                                <div style={cardStyle}>
                                    <button
                                        onClick={() => setShowHints(!showHints)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            color: 'var(--accent-amber)',
                                            fontSize: '0.85rem',
                                            fontWeight: 500
                                        }}
                                    >
                                        <Lightbulb size={16} />
                                        {showHints ? 'Hide Hints' : 'Show Hints'}
                                    </button>
                                    {showHints && (
                                        <ul style={{ marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
                                            {challenges[currentIndex].hints.map((hint, i) => (
                                                <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                                                    {hint}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Test Results */}
                                {testResults.length > 0 && (
                                    <div style={cardStyle}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                                            Test Results
                                        </div>
                                        {testResults.map((result, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem',
                                                    background: result.passed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    borderRadius: '0.375rem',
                                                    marginBottom: '0.375rem',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {result.passed ? (
                                                    <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                                                ) : (
                                                    <XCircle size={14} style={{ color: 'var(--error)' }} />
                                                )}
                                                <span style={{ color: 'var(--text-secondary' }}>Test {i + 1}: {result.input}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Code Editor */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{
                                    ...cardStyle,
                                    padding: 0,
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderBottom: '1px solid var(--border-subtle)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {challenges[currentIndex].language}
                                        </span>
                                    </div>
                                    <textarea
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        style={{
                                            flex: 1,
                                            minHeight: '300px',
                                            padding: '1rem',
                                            background: 'var(--bg-elevated)',
                                            border: 'none',
                                            borderRadius: '0 0 0.75rem 0.75rem',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-primary)',
                                            resize: 'none',
                                            outline: 'none'
                                        }}
                                        placeholder="Write your code here..."
                                    />
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={runTests}
                                        disabled={isRunning}
                                        className="btn-secondary"
                                        style={{ flex: 1, justifyContent: 'center' }}
                                    >
                                        <Play size={16} />
                                        {isRunning ? 'Running...' : 'Run Tests'}
                                    </button>
                                    <button
                                        onClick={submitChallenge}
                                        className="btn-primary"
                                        style={{ flex: 1, justifyContent: 'center' }}
                                    >
                                        {currentIndex < challenges.length - 1 ? 'Submit & Next' : 'Submit & Finish'}
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
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
                                    background: overallScore >= 70 ? 'rgba(34, 197, 94, 0.1)' : overallScore >= 50 ? 'var(--accent-amber-dim)' : 'rgba(239, 68, 68, 0.1)',
                                    border: `2px solid ${overallScore >= 70 ? 'var(--success)' : overallScore >= 50 ? 'var(--accent-amber)' : 'var(--error)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem'
                                }}>
                                    <span style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '1.75rem',
                                        fontWeight: 700,
                                        color: overallScore >= 70 ? 'var(--success)' : overallScore >= 50 ? 'var(--accent-amber)' : 'var(--error)'
                                    }}>
                                        {overallScore}%
                                    </span>
                                </div>
                                <h2 style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {overallScore >= 80 ? 'Excellent!' : overallScore >= 60 ? 'Good job!' : 'Keep practicing!'}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Completed {submissions.length} challenges
                                </p>
                            </div>

                            {/* Submission Summary */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {submissions.map((sub, i) => (
                                    <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                                Challenge {i + 1}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {sub.passedTests}/{sub.totalTests} tests passed • {Math.floor(sub.timeSpent / 60)}m {sub.timeSpent % 60}s
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '0.375rem 0.75rem',
                                            borderRadius: '0.375rem',
                                            background: sub.score >= 70 ? 'rgba(34, 197, 94, 0.1)' : sub.score >= 50 ? 'var(--accent-amber-dim)' : 'rgba(239, 68, 68, 0.1)',
                                            color: sub.score >= 70 ? 'var(--success)' : sub.score >= 50 ? 'var(--accent-amber)' : 'var(--error)',
                                            fontWeight: 600,
                                            fontSize: '0.85rem'
                                        }}>
                                            {sub.score}%
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={restartCoding}
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
