'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui';
import type { InterviewQuestion } from '@/types';

interface QuestionCardProps {
    question: InterviewQuestion;
    questionNumber: number;
    totalQuestions: number;
}

export function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'success';
            case 'hard': return 'error';
            default: return 'warning';
        }
    };

    return (
        <motion.div
            className="glass-dark rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-dark-400">
                        Question {questionNumber} of {totalQuestions}
                    </span>
                    <Badge variant={getDifficultyColor(question.difficulty) as 'success' | 'warning' | 'error'}>
                        {question.difficulty.toUpperCase()}
                    </Badge>
                </div>
                <Badge variant="info">{question.skillTested}</Badge>
            </div>

            {/* Question Text */}
            <h3 className="text-xl font-semibold text-white leading-relaxed mb-4">
                {question.question}
            </h3>

            {/* Expected Concepts Hint */}
            <div className="flex flex-wrap gap-2">
                <span className="text-sm text-dark-400">Topics:</span>
                {question.expectedConcepts.map((concept, i) => (
                    <span key={i} className="text-sm text-primary-400">
                        {concept}{i < question.expectedConcepts.length - 1 ? ',' : ''}
                    </span>
                ))}
            </div>

            {/* Code Template (for coding questions) */}
            {question.codeTemplate && (
                <div className="mt-4 p-4 bg-dark-900 rounded-lg">
                    <pre className="text-sm text-dark-300 font-mono">{question.codeTemplate}</pre>
                </div>
            )}
        </motion.div>
    );
}
