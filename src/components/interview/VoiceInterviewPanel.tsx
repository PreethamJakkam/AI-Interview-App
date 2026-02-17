'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react';
import type { VoiceInterviewPhase } from '@/types';

interface VoiceInterviewPanelProps {
    messages: { id: string; role: 'ai' | 'user'; content: string; type: string }[];
    currentPhase: VoiceInterviewPhase;
    isAISpeaking: boolean;
    isUserSpeaking: boolean;
    currentQuestionIndex: number;
    totalQuestions: number;
    scores: number[];
    overallScore: number | null;
    interimTranscript: string;
    error: string | null;
    isSupported: boolean;
    onStart: () => void;
    onStartListening: () => void;
    onStopListening: () => void;
    onEndInterview: () => void;
    onFinish: () => void;
}

export function VoiceInterviewPanel({
    messages,
    currentPhase,
    isAISpeaking,
    isUserSpeaking,
    currentQuestionIndex,
    totalQuestions,
    scores,
    overallScore,
    interimTranscript,
    error,
    isSupported,
    onStart,
    onStartListening,
    onStopListening,
    onEndInterview,
    onFinish,
}: VoiceInterviewPanelProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, interimTranscript]);

    const getPhaseLabel = () => {
        switch (currentPhase) {
            case 'idle': return 'Ready to start';
            case 'greeting': return 'AI is greeting you...';
            case 'questioning': return 'AI is thinking...';
            case 'listening': return 'Your turn — speak now';
            case 'processing': return 'Processing your answer...';
            case 'evaluating': return 'Generating evaluation...';
            case 'finished': return 'Interview complete!';
            default: return '';
        }
    };

    const getPhaseColor = () => {
        switch (currentPhase) {
            case 'listening': return 'var(--accent-cyan)';
            case 'processing': case 'questioning': case 'evaluating': case 'greeting': return 'var(--accent-violet)';
            case 'finished': return 'var(--success)';
            default: return 'var(--text-muted)';
        }
    };

    // Idle state — start button
    if (currentPhase === 'idle') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '2rem' }}>
                {!isSupported && (
                    <div style={{
                        padding: '1rem 1.5rem', background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-lg)',
                        color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', maxWidth: '400px'
                    }}>
                        Voice features require Chrome browser with microphone access.
                    </div>
                )}

                {/* AI Avatar */}
                <div className="voice-ai-avatar" style={{
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(6,214,160,0.2), rgba(139,92,246,0.2))',
                    border: '2px solid rgba(6,214,160,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem',
                }}>
                    🎙️
                </div>

                <div style={{ textAlign: 'center' }}>
                    <h2 style={{
                        fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700,
                        color: 'var(--text-primary)', marginBottom: '0.5rem'
                    }}>Voice Interview</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '360px' }}>
                        The AI will speak questions aloud and you&apos;ll answer with your voice. Just like a real interview.
                    </p>
                </div>

                <motion.button
                    onClick={onStart}
                    disabled={!isSupported}
                    className="btn-primary cta-glow"
                    style={{
                        padding: '1rem 3rem', fontSize: '1rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        opacity: isSupported ? 1 : 0.4,
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <Phone size={20} /> Start Voice Interview
                </motion.button>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: '75vh', gap: '1rem' }}>
            {/* Top Bar — Status + Progress */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem 1.5rem',
                background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <motion.div
                        animate={isAISpeaking || currentPhase === 'processing' || currentPhase === 'evaluating'
                            ? { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }
                            : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: getPhaseColor(),
                        }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: getPhaseColor() }}>
                        {getPhaseLabel()}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Progress dots */}
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                        {Array.from({ length: totalQuestions }).map((_, i) => (
                            <div key={i} style={{
                                width: '28px', height: '3px', borderRadius: 'var(--radius-full)',
                                background: i < currentQuestionIndex
                                    ? 'var(--accent-cyan)'
                                    : i === currentQuestionIndex
                                        ? 'var(--text-primary)'
                                        : 'var(--bg-elevated)',
                                transition: 'background 0.3s',
                            }} />
                        ))}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Q{Math.min(currentQuestionIndex + 1, totalQuestions)}/{totalQuestions}
                    </span>
                </div>
            </div>

            {/* Main Area — Conversation */}
            <div style={{
                display: 'flex', flexDirection: 'column', gap: '1rem',
                overflowY: 'auto', padding: '1rem 0.5rem',
                maxHeight: '50vh',
            }}>
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <div style={{
                                maxWidth: '75%',
                                padding: '1rem 1.25rem',
                                borderRadius: msg.role === 'user'
                                    ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)'
                                    : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
                                background: msg.role === 'user'
                                    ? 'var(--accent-cyan-dim)'
                                    : 'var(--glass-bg-strong)',
                                border: `1px solid ${msg.role === 'user'
                                    ? 'rgba(6,214,160,0.2)'
                                    : 'var(--border-medium)'}`,
                                fontSize: '0.875rem',
                                lineHeight: 1.6,
                                color: 'var(--text-primary)',
                            }}>
                                <div style={{
                                    fontSize: '0.65rem', fontWeight: 600,
                                    color: msg.role === 'user' ? 'var(--accent-cyan)' : 'var(--accent-violet)',
                                    marginBottom: '0.375rem',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                }}>
                                    {msg.role === 'ai' ? <><Volume2 size={12} /> AI Interviewer</> : '🎤 You'}
                                </div>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Interim transcript (while speaking) */}
                {isUserSpeaking && interimTranscript && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'flex', justifyContent: 'flex-end' }}
                    >
                        <div style={{
                            maxWidth: '75%', padding: '1rem 1.25rem',
                            borderRadius: 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)',
                            background: 'rgba(6,214,160,0.05)',
                            border: '1px dashed rgba(6,214,160,0.2)',
                            fontSize: '0.875rem', color: 'var(--text-muted)',
                            fontStyle: 'italic', lineHeight: 1.6,
                        }}>
                            {interimTranscript}
                            <span className="ai-typing-dot" style={{ marginLeft: '4px' }} />
                        </div>
                    </motion.div>
                )}

                {/* AI thinking indicator */}
                {(currentPhase === 'processing' || currentPhase === 'evaluating' || currentPhase === 'greeting' || currentPhase === 'questioning') && !isAISpeaking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'flex', justifyContent: 'flex-start' }}
                    >
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
                            background: 'var(--glass-bg-strong)',
                            border: '1px solid var(--border-medium)',
                            display: 'flex', gap: '0.375rem', alignItems: 'center',
                        }}>
                            <span className="ai-typing-dot" />
                            <span className="ai-typing-dot" />
                            <span className="ai-typing-dot" />
                        </div>
                    </motion.div>
                )}

                {/* AI speaking indicator */}
                {isAISpeaking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <div className="voice-wave-container" style={{
                            display: 'flex', alignItems: 'center', gap: '3px',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(139,92,246,0.1)',
                            border: '1px solid rgba(139,92,246,0.2)',
                        }}>
                            {[0, 1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    style={{
                                        width: '3px', borderRadius: '3px',
                                        background: 'var(--accent-violet)',
                                    }}
                                    animate={{ height: [8, 20, 8] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                                />
                            ))}
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-violet)', marginLeft: '0.5rem', fontWeight: 500 }}>
                                Speaking...
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '0.75rem 1rem', fontSize: '0.8rem',
                        color: '#ef4444', background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Bar — Controls */}
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem',
                padding: '1.25rem',
                background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)',
            }}>
                {currentPhase === 'finished' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                        {overallScore !== null && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: `conic-gradient(var(--accent-cyan) ${overallScore * 3.6}deg, var(--bg-elevated) 0deg)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <div style={{
                                        width: '52px', height: '52px', borderRadius: '50%',
                                        background: 'var(--bg-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-heading)', fontSize: '1.1rem',
                                        fontWeight: 700, color: 'var(--accent-cyan)',
                                    }}>
                                        {overallScore}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overall Score</div>
                                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {overallScore >= 80 ? 'Excellent!' : overallScore >= 60 ? 'Good job!' : 'Keep practicing!'}
                                    </div>
                                </div>
                            </div>
                        )}
                        <motion.button
                            onClick={onFinish}
                            className="btn-primary"
                            style={{ padding: '0.875rem 2.5rem', fontSize: '0.875rem' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            View Results
                        </motion.button>
                    </div>
                ) : (
                    <>
                        {/* End call button */}
                        <motion.button
                            onClick={onEndInterview}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                                color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                            title="End Interview"
                        >
                            <PhoneOff size={20} />
                        </motion.button>

                        {/* Mic button */}
                        <motion.button
                            onClick={isUserSpeaking ? onStopListening : onStartListening}
                            disabled={isAISpeaking || currentPhase === 'processing' || currentPhase === 'evaluating' || currentPhase === 'greeting'}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={isUserSpeaking ? 'voice-recording' : ''}
                            style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: isUserSpeaking
                                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                    : currentPhase === 'listening'
                                        ? 'linear-gradient(135deg, rgba(6,214,160,0.9), rgba(6,214,160,0.7))'
                                        : 'var(--bg-elevated)',
                                border: isUserSpeaking
                                    ? '2px solid rgba(239,68,68,0.5)'
                                    : currentPhase === 'listening'
                                        ? '2px solid rgba(6,214,160,0.5)'
                                        : '2px solid var(--border-subtle)',
                                color: isUserSpeaking || currentPhase === 'listening' ? '#fff' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: (isAISpeaking || currentPhase === 'processing') ? 'not-allowed' : 'pointer',
                                opacity: (isAISpeaking || currentPhase === 'processing' || currentPhase === 'evaluating' || currentPhase === 'greeting') ? 0.4 : 1,
                                transition: 'all 0.3s ease',
                                boxShadow: isUserSpeaking
                                    ? '0 0 20px rgba(239,68,68,0.4)'
                                    : currentPhase === 'listening'
                                        ? '0 0 20px rgba(6,214,160,0.3)'
                                        : 'none',
                            }}
                            title={isUserSpeaking ? 'Stop & Submit' : 'Start Speaking'}
                        >
                            {isUserSpeaking ? <MicOff size={28} /> : <Mic size={28} />}
                        </motion.button>

                        {/* Spacer for symmetry */}
                        <div style={{ width: '48px' }} />
                    </>
                )}
            </div>
        </div>
    );
}
