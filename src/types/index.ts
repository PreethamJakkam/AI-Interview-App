// User types
export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt: Date;
    totalInterviews: number;
    averageScore: number;
    bestScore: number;
}

// Resume Analysis types
export interface ResumeAnalysis {
    technicalSkills: string[];
    programmingLanguages: string[];
    toolsFrameworks: string[];
    projects: Project[];
    experienceLevel: "Beginner" | "Intermediate" | "Advanced";
    keyStrengths: string[];
    yearsOfExperience: number;
}

export interface Project {
    name: string;
    description: string;
    technologies: string[];
}

export interface SkillConfidence {
    [skill: string]: number; // 1-5
}

// Interview types
export interface InterviewSession {
    id: string;
    odiserId: string;
    role: string;
    mode: "standard" | "voice" | "coding";
    createdAt: Date;
    completedAt?: Date;
    questions: InterviewQuestion[];
    evaluations: AnswerEvaluation[];
    overallScore: number;
    status: "in_progress" | "completed" | "abandoned";
    resumeAnalysis?: ResumeAnalysis;
    topic?: string;
}

export interface InterviewQuestion {
    id: number;
    question: string;
    skillTested: string;
    difficulty: "easy" | "medium" | "hard";
    expectedConcepts: string[];
    timeLimit: number; // seconds
    type: "conceptual" | "practical" | "coding";
    codeTemplate?: string;
}

export interface AnswerEvaluation {
    questionId: number;
    answer: string;
    score: number; // 0-10
    strengths: string[];
    weaknesses: string[];
    missingConcepts: string[];
    feedback: string;
    timeSpent: number; // seconds
    codeOutput?: string;
}

// Feedback types
export interface InterviewFeedback {
    overallScore: number;
    summary: string;
    performanceRating: "Excellent" | "Good" | "Average" | "Needs Improvement";
    strengths: string[];
    improvements: string[];
    studyTopics: string[];
    recommendedResources: Resource[];
}

export interface Resource {
    title: string;
    url?: string;
    type: "documentation" | "tutorial" | "course" | "practice";
}

// Improvement Plan types
export interface ImprovementPlan {
    priorityTopics: PriorityTopic[];
    nextSteps: string[];
    recommendedCertifications: string[];
    weeklyGoals: WeeklyGoal[];
}

export interface PriorityTopic {
    topic: string;
    importance: "high" | "medium" | "low";
    resources: string[];
    projectIdea: string;
    estimatedTime: string;
}

export interface WeeklyGoal {
    week: number;
    goals: string[];
    milestone: string;
}

// Leaderboard types
export interface LeaderboardEntry {
    odiserId: string;
    displayName: string;
    photoURL?: string;
    averageScore: number;
    totalInterviews: number;
    bestScore: number;
    rank: number;
    tier: string;
}

// Voice Recognition types
export interface VoiceState {
    isListening: boolean;
    transcript: string;
    error: string | null;
    isSupported: boolean;
}

// Timer types
export interface TimerState {
    timeRemaining: number;
    isRunning: boolean;
    isCritical: boolean; // < 30 seconds
}

// ============ PRACTICE MODE TYPES ============

// Common types
export type PracticeMode = 'quiz' | 'coding' | 'interview';
export type Difficulty = 'beginner' | 'moderate' | 'advanced';

// Quiz Mode types
export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number; // index of correct option
    explanation: string;
    topic: string;
    difficulty: Difficulty;
}

export interface QuizAnswer {
    questionId: number;
    selectedOption: number;
    isCorrect: boolean;
    timeSpent: number; // seconds
}

export interface QuizSession {
    id: string;
    odiserId: string;
    mode: 'quiz';
    topic: string;
    difficulty: Difficulty;
    questions: QuizQuestion[];
    answers: QuizAnswer[];
    score: number; // percentage
    correctCount: number;
    totalQuestions: number;
    totalTime: number; // seconds
    createdAt: Date;
    completedAt: Date;
    status: 'completed' | 'abandoned';
}

// Coding Test Mode types
export interface TestCase {
    id: number;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface CodingChallenge {
    id: number;
    title: string;
    description: string;
    difficulty: Difficulty;
    role: string;
    starterCode: string;
    language: string;
    testCases: TestCase[];
    timeLimit: number; // seconds
    hints: string[];
}

export interface CodingSubmission {
    challengeId: number;
    code: string;
    language: string;
    passedTests: number;
    totalTests: number;
    score: number; // percentage based on passed tests
    timeSpent: number;
    output?: string;
    error?: string;
}

export interface CodingSession {
    id: string;
    odiserId: string;
    mode: 'coding';
    role: string;
    difficulty: Difficulty;
    challenges: CodingChallenge[];
    submissions: CodingSubmission[];
    overallScore: number;
    totalTime: number;
    createdAt: Date;
    completedAt: Date;
    status: 'completed' | 'abandoned';
}

// Union type for all practice sessions (for history)
export type PracticeSession = QuizSession | CodingSession | (InterviewSession & { mode: 'interview' });

// Practice history item (for listing)
export interface PracticeHistoryItem {
    id: string;
    odiserId: string;
    mode: PracticeMode;
    topic?: string;
    role?: string;
    difficulty?: Difficulty;
    score: number;
    createdAt: Date;
    completedAt: Date;
    status: string;
}
