'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { generateVoiceInterviewResponse } from '@/lib/gemini';
import type { VoiceConversationMessage, VoiceInterviewPhase } from '@/types';

interface UseVoiceInterviewConfig {
    role: string;
    topic: string;
    totalQuestions: number;
}

interface UseVoiceInterviewReturn {
    messages: VoiceConversationMessage[];
    currentPhase: VoiceInterviewPhase;
    isAISpeaking: boolean;
    isUserSpeaking: boolean;
    currentQuestionIndex: number;
    totalQuestions: number;
    scores: number[];
    overallScore: number | null;
    startInterview: () => Promise<void>;
    startListening: () => void;
    stopListeningAndProcess: () => void;
    endInterview: () => Promise<void>;
    error: string | null;
    isSupported: boolean;
    interimTranscript: string;
}

// TTS helper
function speakText(text: string): Promise<void> {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            resolve();
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        // Try to pick a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
            v => v.name.includes('Google') && v.lang.startsWith('en')
        ) || voices.find(
            v => v.lang.startsWith('en') && !v.name.includes('whisper')
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
    });
}

export function useVoiceInterview(config: UseVoiceInterviewConfig): UseVoiceInterviewReturn {
    const [messages, setMessages] = useState<VoiceConversationMessage[]>([]);
    const [currentPhase, setCurrentPhase] = useState<VoiceInterviewPhase>('idle');
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [scores, setScores] = useState<number[]>([]);
    const [overallScore, setOverallScore] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');

    const recognitionRef = useRef<any>(null);
    const fullTranscriptRef = useRef('');

    // Check browser support
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const hasTTS = 'speechSynthesis' in window;
            setIsSupported(!!SpeechRecognitionAPI && hasTTS);

            if (SpeechRecognitionAPI) {
                const recognition = new SpeechRecognitionAPI();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    let interim = '';
                    let final = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            final += transcript + ' ';
                        } else {
                            interim += transcript;
                        }
                    }

                    if (final) {
                        fullTranscriptRef.current += final;
                    }
                    setInterimTranscript(fullTranscriptRef.current + interim);
                };

                recognition.onerror = (event: any) => {
                    if (event.error !== 'aborted') {
                        setError(`Speech recognition error: ${event.error}`);
                    }
                    setIsUserSpeaking(false);
                };

                recognition.onend = () => {
                    setIsUserSpeaking(false);
                };

                recognitionRef.current = recognition;
            }

            // Load voices
            if (hasTTS) {
                window.speechSynthesis.getVoices();
                window.speechSynthesis.onvoiceschanged = () => {
                    window.speechSynthesis.getVoices();
                };
            }
        }
    }, []);

    const addMessage = useCallback((role: 'ai' | 'user', content: string, type: VoiceConversationMessage['type']) => {
        const msg: VoiceConversationMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            role,
            content,
            timestamp: new Date(),
            type
        };
        setMessages(prev => [...prev, msg]);
        return msg;
    }, []);

    const aiSpeak = useCallback(async (text: string) => {
        setIsAISpeaking(true);
        try {
            await speakText(text);
        } catch (e) {
            console.error('TTS error:', e);
        } finally {
            setIsAISpeaking(false);
        }
    }, []);

    const startInterview = useCallback(async () => {
        setCurrentPhase('greeting');
        setError(null);

        try {
            const aiResponse = await generateVoiceInterviewResponse(
                [],
                config.role,
                config.topic,
                0,
                config.totalQuestions,
                'greeting'
            );

            addMessage('ai', aiResponse.response, 'greeting');
            await aiSpeak(aiResponse.response);
            setCurrentPhase('listening');
        } catch (e) {
            console.error('Start interview error:', e);
            setError('Failed to start interview. Please try again.');
            setCurrentPhase('idle');
        }
    }, [config, addMessage, aiSpeak]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || isAISpeaking) return;

        setError(null);
        fullTranscriptRef.current = '';
        setInterimTranscript('');

        try {
            recognitionRef.current.start();
            setIsUserSpeaking(true);
            setCurrentPhase('listening');
        } catch (e) {
            console.error('Recognition start error:', e);
            setError('Could not start microphone. Check permissions.');
        }
    }, [isAISpeaking]);

    const stopListeningAndProcess = useCallback(async () => {
        if (!recognitionRef.current) return;

        try {
            recognitionRef.current.stop();
        } catch {
            // ignore
        }
        setIsUserSpeaking(false);

        const userAnswer = fullTranscriptRef.current.trim() || interimTranscript.trim();
        if (!userAnswer) {
            setError('No speech detected. Please try again.');
            return;
        }

        // Add user message
        addMessage('user', userAnswer, 'answer');
        setInterimTranscript('');
        fullTranscriptRef.current = '';

        // Build conversation history
        const history = [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user' as const, content: userAnswer }
        ];

        const nextQuestionIndex = currentQuestionIndex + 1;
        const isLastQuestion = nextQuestionIndex >= config.totalQuestions;

        if (isLastQuestion) {
            // Get final evaluation
            setCurrentPhase('evaluating');
            try {
                const evalResponse = await generateVoiceInterviewResponse(
                    history,
                    config.role,
                    config.topic,
                    currentQuestionIndex,
                    config.totalQuestions,
                    'evaluating'
                );

                if (evalResponse.score !== undefined && evalResponse.score !== null) {
                    setOverallScore(evalResponse.score);
                }

                addMessage('ai', evalResponse.response, 'closing');
                await aiSpeak(evalResponse.response);
                setCurrentPhase('finished');
            } catch {
                setError('Failed to generate evaluation.');
                setCurrentPhase('finished');
            }
        } else {
            // Get next question
            setCurrentPhase('processing');
            try {
                const aiResponse = await generateVoiceInterviewResponse(
                    history,
                    config.role,
                    config.topic,
                    nextQuestionIndex,
                    config.totalQuestions,
                    'questioning'
                );

                if (aiResponse.score !== undefined && aiResponse.score !== null) {
                    setScores(prev => [...prev, aiResponse.score!]);
                }

                setCurrentQuestionIndex(nextQuestionIndex);
                addMessage('ai', aiResponse.response, 'question');
                await aiSpeak(aiResponse.response);
                setCurrentPhase('listening');
            } catch {
                setError('Failed to get next question.');
                setCurrentPhase('listening');
            }
        }
    }, [messages, currentQuestionIndex, config, addMessage, aiSpeak, interimTranscript]);

    const endInterview = useCallback(async () => {
        // Cancel any ongoing speech
        if (typeof window !== 'undefined') {
            window.speechSynthesis?.cancel();
        }

        try {
            recognitionRef.current?.stop();
        } catch {
            // ignore
        }

        setIsAISpeaking(false);
        setIsUserSpeaking(false);

        if (currentPhase !== 'finished') {
            // Build final history
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            setCurrentPhase('evaluating');
            try {
                const evalResponse = await generateVoiceInterviewResponse(
                    history,
                    config.role,
                    config.topic,
                    currentQuestionIndex,
                    config.totalQuestions,
                    'evaluating'
                );

                if (evalResponse.score !== undefined && evalResponse.score !== null) {
                    setOverallScore(evalResponse.score);
                }

                addMessage('ai', evalResponse.response, 'closing');
                await aiSpeak(evalResponse.response);
            } catch {
                // Silently handle
            }
        }

        setCurrentPhase('finished');
    }, [currentPhase, messages, currentQuestionIndex, config, addMessage, aiSpeak]);

    return {
        messages,
        currentPhase,
        isAISpeaking,
        isUserSpeaking,
        currentQuestionIndex,
        totalQuestions: config.totalQuestions,
        scores,
        overallScore,
        startInterview,
        startListening,
        stopListeningAndProcess,
        endInterview,
        error,
        isSupported,
        interimTranscript,
    };
}
