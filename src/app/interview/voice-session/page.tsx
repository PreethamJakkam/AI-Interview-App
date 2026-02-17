'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { VoiceInterviewPanel } from '@/components/interview/VoiceInterviewPanel';
import { useVoiceInterview } from '@/hooks/useVoiceInterview';
import { appConfig } from '@/lib/config';
import { saveInterviewSession, updateUserStats } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function VoiceSessionPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [interviewConfig, setInterviewConfig] = useState<{
        role: string;
        topic: string;
        analysis: any;
    } | null>(null);

    useEffect(() => {
        const data = sessionStorage.getItem('interviewData');
        if (!data) {
            router.push('/interview/new');
            return;
        }

        const parsed = JSON.parse(data);
        setInterviewConfig({
            role: parsed.role || 'fullstack',
            topic: parsed.topic || parsed.analysis?.toolsFrameworks?.[0] || 'General Programming',
            analysis: parsed.analysis,
        });
    }, [router]);

    const voiceInterview = useVoiceInterview({
        role: interviewConfig?.role || 'fullstack',
        topic: interviewConfig?.topic || 'General Programming',
        totalQuestions: appConfig.questionsPerSession,
    });

    const handleFinish = async () => {
        // Save results to session storage for the results page
        const results = {
            role: interviewConfig?.role,
            topic: interviewConfig?.topic,
            mode: 'voice',
            messages: voiceInterview.messages.map(m => ({
                role: m.role,
                content: m.content,
                type: m.type,
            })),
            scores: voiceInterview.scores,
            overallScore: voiceInterview.overallScore,
            answers: voiceInterview.messages
                .filter(m => m.role === 'user')
                .map((m, i) => ({
                    questionIndex: i,
                    answer: m.content,
                    timeSpent: 0,
                    evaluation: {
                        questionId: i,
                        answer: m.content,
                        score: voiceInterview.scores[i] || 6,
                        strengths: ['Answered via voice'],
                        weaknesses: [],
                        missingConcepts: [],
                        feedback: 'Voice interview response',
                        timeSpent: 0,
                    },
                })),
            questions: voiceInterview.messages
                .filter(m => m.role === 'ai' && (m.type === 'question' || m.type === 'greeting'))
                .map((m, i) => ({
                    question: m.content,
                    difficulty: 'medium',
                    skill: interviewConfig?.topic || 'General',
                    expectedConcepts: [],
                })),
            analysis: interviewConfig?.analysis,
        };

        sessionStorage.setItem('interviewResults', JSON.stringify(results));

        // Save to Firebase
        if (user) {
            try {
                const score = voiceInterview.overallScore ||
                    (voiceInterview.scores.length > 0
                        ? Math.round(voiceInterview.scores.reduce((a, b) => a + b, 0) / voiceInterview.scores.length * 10)
                        : 60);

                await saveInterviewSession({
                    odiserId: user.uid,
                    role: interviewConfig?.role || 'fullstack',
                    mode: 'voice',
                    questions: results.questions,
                    evaluations: results.answers.map(a => a.evaluation),
                    overallScore: score,
                    status: 'completed',
                    topic: interviewConfig?.topic,
                });

                await updateUserStats(user.uid, score);
                toast.success('Interview saved!');
            } catch (e) {
                console.error('Failed to save:', e);
            }
        }

        router.push('/interview/results');
    };

    if (!interviewConfig) {
        return (
            <AppLayout>
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginBottom: '1rem' }}>
                        <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" />
                    </div>
                    Loading voice interview...
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="page-enter">
                <VoiceInterviewPanel
                    messages={voiceInterview.messages}
                    currentPhase={voiceInterview.currentPhase}
                    isAISpeaking={voiceInterview.isAISpeaking}
                    isUserSpeaking={voiceInterview.isUserSpeaking}
                    currentQuestionIndex={voiceInterview.currentQuestionIndex}
                    totalQuestions={voiceInterview.totalQuestions}
                    scores={voiceInterview.scores}
                    overallScore={voiceInterview.overallScore}
                    interimTranscript={voiceInterview.interimTranscript}
                    error={voiceInterview.error}
                    isSupported={voiceInterview.isSupported}
                    onStart={voiceInterview.startInterview}
                    onStartListening={voiceInterview.startListening}
                    onStopListening={voiceInterview.stopListeningAndProcess}
                    onEndInterview={voiceInterview.endInterview}
                    onFinish={handleFinish}
                />
            </div>
        </AppLayout>
    );
}
