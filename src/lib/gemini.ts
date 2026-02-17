import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiConfig, appConfig } from './config';
import type {
    ResumeAnalysis,
    SkillConfidence,
    InterviewQuestion,
    AnswerEvaluation,
    InterviewFeedback,
    ImprovementPlan,
    QuizQuestion,
    CodingChallenge
} from '@/types';

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

if (typeof window !== 'undefined' && aiConfig.geminiApiKey) {
    genAI = new GoogleGenerativeAI(aiConfig.geminiApiKey);
    model = genAI.getGenerativeModel({
        model: aiConfig.model,
        generationConfig: aiConfig.generationConfig
    });
}

export const isAIAvailable = () => !!model;

// Parse AI response JSON
const parseJSON = <T>(text: string): T => {
    let clean = text.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    else if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    return JSON.parse(clean.trim());
};

// Retry wrapper with exponential backoff for 429 rate limit errors
const callAI = async (prompt: string, maxRetries: number = 2): Promise<string | null> => {
    if (!model) return null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            const is429 = error?.message?.includes('429') || error?.status === 429;
            if (is429 && attempt < maxRetries) {
                const delay = (attempt + 1) * 2000; // 2s, 4s
                console.warn(`[AI] Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(r => setTimeout(r, delay));
            } else {
                console.error('[AI] Error:', error?.message || error);
                return null;
            }
        }
    }
    return null;
};

// Resume Analysis
export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysis> => {
    const prompt = `You are an expert resume analyzer. Analyze this resume and extract:

Resume:
${resumeText}

Return STRICTLY as JSON:
{
  "technicalSkills": ["skill1", "skill2"],
  "programmingLanguages": ["lang1", "lang2"],
  "toolsFrameworks": ["tool1", "tool2"],
  "projects": [{"name": "Project", "description": "Brief desc", "technologies": ["tech"]}],
  "experienceLevel": "Beginner|Intermediate|Advanced",
  "keyStrengths": ["strength1"],
  "yearsOfExperience": 2
}

Be accurate. Don't hallucinate information not in the resume.`;

    const text = await callAI(prompt);
    if (text) {
        try { return parseJSON<ResumeAnalysis>(text); } catch { }
    }
    return getMockResumeAnalysis(resumeText);
};

// Skill Confidence Estimation
export const estimateSkillConfidence = async (
    skills: { programmingLanguages: string[]; toolsFrameworks: string[] },
    projects: { name: string; description: string; technologies: string[] }[]
): Promise<SkillConfidence> => {
    const allSkills = [...skills.programmingLanguages, ...skills.toolsFrameworks];

    const prompt = `Rate confidence (1-5) for each skill based on project usage:
Skills: ${JSON.stringify(allSkills)}
Projects: ${JSON.stringify(projects)}
Return JSON: {"skillName": confidenceLevel, ...}`;

    const text = await callAI(prompt);
    if (text) {
        try { return parseJSON<SkillConfidence>(text); } catch { }
    }

    // Mock confidence
    const confidence: SkillConfidence = {};
    allSkills.forEach((skill, i) => {
        confidence[skill] = Math.min(5, Math.max(2, 3 + (i % 3) - 1));
    });
    return confidence;
};

// Question Generation
export const generateQuestions = async (
    skills: string[],
    confidence: SkillConfidence,
    experienceLevel: string,
    role: string,
    mode: string = 'standard'
): Promise<InterviewQuestion[]> => {
    const prompt = `You are a senior technical interviewer for ${role} position.

Candidate Skills: ${JSON.stringify(skills)}
Skill Confidence: ${JSON.stringify(confidence)}
Experience: ${experienceLevel}
Interview Mode: ${mode}

Generate ${appConfig.questionsPerSession} ${mode === 'coding' ? 'coding challenges' : 'technical questions'}.

Requirements:
- Match difficulty to experience and confidence
- Cover different skill areas
- Use real interview-style questions
- ${mode === 'coding' ? 'Include code templates and expected approaches' : ''}

Return JSON array:
[{
  "id": 1,
  "question": "Question text",
  "skillTested": "skill",
  "difficulty": "easy|medium|hard",
  "expectedConcepts": ["concept1"],
  "timeLimit": ${appConfig.questionTimeLimit},
  "type": "${mode === 'coding' ? 'coding' : 'conceptual'}",
  ${mode === 'coding' ? '"codeTemplate": "// Write your solution here\\n"' : ''}
}]`;

    const text = await callAI(prompt);
    if (text) {
        try { return parseJSON<InterviewQuestion[]>(text); } catch { }
    }
    return getMockQuestions(skills, experienceLevel, role, mode);
};

// Answer Evaluation
export const evaluateAnswer = async (
    question: string,
    answer: string,
    expectedConcepts: string[],
    isCode: boolean = false
): Promise<AnswerEvaluation> => {
    const prompt = `Evaluate this ${isCode ? 'code solution' : 'technical answer'}:

Question: ${question}
Expected Concepts: ${JSON.stringify(expectedConcepts)}
Answer: ${answer}

Criteria:
1. Technical correctness (40%)
2. Concept coverage (30%)
3. Clarity & structure (20%)
4. ${isCode ? 'Code quality & efficiency' : 'Depth of explanation'} (10%)

Return JSON:
{
  "questionId": 0,
  "answer": "${answer.substring(0, 50)}...",
  "score": 7,
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "missingConcepts": ["concept"],
  "feedback": "Constructive feedback",
  "timeSpent": 0
  ${isCode ? ',"codeOutput": "expected output"' : ''}
}`;

    const text = await callAI(prompt);
    if (text) {
        try { return parseJSON<AnswerEvaluation>(text); } catch { }
    }
    return getMockEvaluation(answer);
};

// Feedback Generation
export const generateFeedback = async (
    evaluations: AnswerEvaluation[],
    role: string
): Promise<InterviewFeedback> => {
    const prompt = `Generate interview feedback for ${role} position:

Evaluations: ${JSON.stringify(evaluations)}

Return JSON:
{
  "overallScore": 75,
  "summary": "Overall performance summary in 2-3 sentences",
  "performanceRating": "Excellent|Good|Average|Needs Improvement",
  "strengths": ["strength1"],
  "improvements": ["area1"],
  "studyTopics": ["topic1"],
  "recommendedResources": [{"title": "Resource", "type": "documentation|tutorial|course|practice"}]
}`;

    const text = await callAI(prompt);
    if (text) {
        try { return parseJSON<InterviewFeedback>(text); } catch { }
    }
    return getMockFeedback(evaluations);
};

// Improvement Plan Generation
export const generateImprovementPlan = async (
    missingConcepts: string[],
    weakAreas: string[],
    role: string
): Promise<ImprovementPlan> => {
    const prompt = `Create improvement plan for ${role}:

Missing Concepts: ${JSON.stringify(missingConcepts)}
Weak Areas: ${JSON.stringify(weakAreas)}

Return JSON:
{
  "priorityTopics": [{
    "topic": "Topic",
    "importance": "high|medium|low",
    "resources": ["Resource 1"],
    "projectIdea": "Project suggestion",
    "estimatedTime": "2 weeks"
  }],
  "nextSteps": ["Step 1"],
  "recommendedCertifications": ["Cert 1"],
  "weeklyGoals": [{"week": 1, "goals": ["Goal 1"], "milestone": "Milestone"}]
}`;

    const text = await callAI(prompt);
    if (text) {
        try { return parseJSON<ImprovementPlan>(text); } catch { }
    }
    return getMockImprovementPlan(missingConcepts, weakAreas);
};

// Quiz Question Generation
export const generateQuizQuestions = async (
    topic: string,
    difficulty: string,
    questionCount: number = 5
): Promise<QuizQuestion[]> => {
    const prompt = `Generate ${questionCount} multiple choice questions about ${topic} at ${difficulty} level.

Return JSON array with this structure:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer",
    "topic": "${topic}",
    "difficulty": "${difficulty}"
  }
]

Requirements:
- Questions should test understanding, not just memorization
- All 4 options should be plausible
- correctAnswer is the index (0-3) of the correct option
- Include a brief but clear explanation
- Vary difficulty within the ${difficulty} level`;

    console.log('[Quiz] Topic:', topic, '| AI Available:', !!model);

    const text = await callAI(prompt);
    if (text) {
        try {
            const questions = parseJSON<QuizQuestion[]>(text);
            console.log('[Quiz] AI generated', questions.length, 'questions');
            return questions;
        } catch (parseError) {
            console.error('[Quiz] Failed to parse AI response:', parseError);
            console.error('[Quiz] Raw response:', text.substring(0, 200));
        }
    } else {
        console.warn('[Quiz] AI returned no response');
    }
    console.warn('[Quiz] Using mock questions');
    return getMockQuizQuestions(topic, difficulty, questionCount);
};

// Coding Challenge Generation
export const generateCodingChallenges = async (
    role: string,
    difficulty: string,
    challengeCount: number = 3
): Promise<CodingChallenge[]> => {
    const prompt = `Generate ${challengeCount} coding challenges for a ${role} developer at ${difficulty} level.

Return JSON array with this structure:
[
  {
    "id": 1,
    "title": "Challenge Title",
    "description": "Detailed problem description with examples",
    "difficulty": "${difficulty}",
    "role": "${role}",
    "starterCode": "function solution(input) {\\n  // Your code here\\n}",
    "language": "javascript",
    "testCases": [
      { "id": 1, "input": "example input", "expectedOutput": "expected output", "isHidden": false },
      { "id": 2, "input": "hidden input", "expectedOutput": "hidden output", "isHidden": true }
    ],
    "timeLimit": 1800,
    "hints": ["Hint 1", "Hint 2"]
  }
]

Requirements:
- Problems should be appropriate for ${role} role
- Include 3-5 test cases per challenge (mix of visible and hidden)
- Provide helpful hints
- timeLimit in seconds (15-30 minutes typically)`;

    const text = await callAI(prompt);
    if (text) {
        try { return parseJSON<CodingChallenge[]>(text); } catch { }
    }
    return getMockCodingChallenges(role, difficulty, challengeCount);
};

// Voice-to-Voice Interview Conversation
export const generateVoiceInterviewResponse = async (
    conversationHistory: { role: 'ai' | 'user'; content: string }[],
    role: string,
    topic: string,
    currentQuestionIndex: number,
    totalQuestions: number,
    phase: 'greeting' | 'questioning' | 'evaluating'
): Promise<{ response: string; score?: number; isLastQuestion: boolean }> => {
    const historyText = conversationHistory
        .map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
        .join('\n');

    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

    let phaseInstruction = '';
    if (phase === 'greeting') {
        phaseInstruction = `This is the START of the interview. Greet the candidate warmly, introduce yourself as their AI interviewer, and ask your FIRST technical question about ${topic}. Keep the greeting brief (1-2 sentences) then ask the question.`;
    } else if (phase === 'evaluating') {
        phaseInstruction = `The interview is OVER. Give a brief final evaluation of the candidate's performance across all questions. Mention 1-2 strengths and 1 area for improvement. Keep it encouraging and under 4 sentences. Also include an overall score from 0-100 in your JSON response.`;
    } else {
        phaseInstruction = isLastQuestion
            ? `This is the LAST question (${currentQuestionIndex + 1}/${totalQuestions}). Briefly acknowledge their previous answer (1 sentence of feedback, give a score 0-10), then ask your final question.`
            : `This is question ${currentQuestionIndex + 1} of ${totalQuestions}. Briefly acknowledge their previous answer (1 sentence of feedback, give a score 0-10), then ask the next question.`;
    }

    const prompt = `You are a friendly but professional technical interviewer conducting a SPOKEN voice interview for a ${role} position on the topic of ${topic}.

IMPORTANT SPEAKING RULES:
- Keep responses SHORT (2-4 sentences max) — this will be spoken aloud
- Use natural, conversational language (not formal written style)
- Don't use bullet points, markdown, or special formatting
- Don't use words that are hard to pronounce or abbreviations
- Sound encouraging and professional

${phaseInstruction}

Conversation so far:
${historyText || '(Interview just started)'}

Return STRICTLY as JSON:
{
  "response": "Your spoken response here",
  "score": ${phase === 'questioning' ? 'score_for_previous_answer_0_to_10_or_null_if_first_question' : phase === 'evaluating' ? 'overall_score_0_to_100' : 'null'},
  "isLastQuestion": ${isLastQuestion}
}`;

    const text = await callAI(prompt);
    if (text) {
        try {
            const parsed = parseJSON<{ response: string; score?: number; isLastQuestion: boolean }>(text);
            return parsed;
        } catch { }
    }

    // Mock fallback
    if (phase === 'greeting') {
        return {
            response: `Hey! Welcome to your ${role} interview. I'll be asking you ${totalQuestions} questions about ${topic} today. Let's start with the first one: Can you explain the core concepts of ${topic} and why they matter?`,
            isLastQuestion: false
        };
    } else if (phase === 'evaluating') {
        return {
            response: `Great job completing the interview! You showed solid understanding of ${topic}. Keep practicing edge cases and system design thinking. Overall, I'd give you a strong performance rating.`,
            score: 72,
            isLastQuestion: true
        };
    } else {
        return {
            response: `Good answer! ${isLastQuestion ? 'For your final question' : 'Moving on'}: How would you handle a real-world scenario involving ${topic} at scale?`,
            score: 7,
            isLastQuestion
        };
    }
};

// ============ MOCK RESPONSES ============

function getMockQuizQuestions(topic: string, difficulty: string, count: number): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const topicQuestions: Record<string, { q: string; opts: string[]; correct: number; exp: string }[]> = {
        java: [
            { q: "What is the default value of an int variable in Java?", opts: ["0", "null", "undefined", "1"], correct: 0, exp: "Primitive int defaults to 0 in Java." },
            { q: "Which keyword is used to inherit a class in Java?", opts: ["implements", "extends", "inherits", "super"], correct: 1, exp: "The 'extends' keyword is used for class inheritance." },
            { q: "What is the size of int data type in Java?", opts: ["16 bits", "32 bits", "64 bits", "8 bits"], correct: 1, exp: "int is 32 bits (4 bytes) in Java." },
        ],
        javascript: [
            { q: "Which method adds an element to the end of an array?", opts: ["push()", "pop()", "shift()", "unshift()"], correct: 0, exp: "push() adds elements to the end of an array." },
            { q: "What does '===' check in JavaScript?", opts: ["Value only", "Type only", "Value and type", "Reference"], correct: 2, exp: "=== checks both value and type equality." },
            { q: "What is a closure in JavaScript?", opts: ["A syntax error", "A function with access to outer scope", "A loop structure", "A data type"], correct: 1, exp: "A closure is a function that has access to variables from its outer scope." },
        ],
        html: [
            { q: "What does HTML stand for?", opts: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correct: 0, exp: "HTML stands for Hyper Text Markup Language." },
            { q: "Which HTML tag is used for the largest heading?", opts: ["<h6>", "<heading>", "<h1>", "<head>"], correct: 2, exp: "<h1> defines the largest heading in HTML." },
            { q: "Which attribute specifies an alternate text for an image?", opts: ["title", "src", "alt", "href"], correct: 2, exp: "The 'alt' attribute provides alternative text for images." },
        ],
        css: [
            { q: "Which CSS property controls text size?", opts: ["text-size", "font-style", "font-size", "text-style"], correct: 2, exp: "font-size is used to control the size of text." },
            { q: "What does CSS stand for?", opts: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correct: 1, exp: "CSS stands for Cascading Style Sheets." },
            { q: "Which property is used to change the background color?", opts: ["bgcolor", "color", "background-color", "background"], correct: 2, exp: "background-color sets the background color of an element." },
        ],
        python: [
            { q: "Which keyword is used to define a function in Python?", opts: ["function", "func", "def", "define"], correct: 2, exp: "The 'def' keyword is used to define functions in Python." },
            { q: "What is the output of print(type([]))?", opts: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"], correct: 0, exp: "[] creates a list in Python, so type([]) returns <class 'list'>." },
            { q: "Which method adds an item to a list in Python?", opts: ["push()", "add()", "append()", "insert()"], correct: 2, exp: "append() adds an item to the end of a list." },
        ],
        react: [
            { q: "What is used to pass data to a component in React?", opts: ["state", "props", "refs", "context"], correct: 1, exp: "Props (properties) are used to pass data from parent to child components." },
            { q: "Which hook is used for side effects in React?", opts: ["useState", "useEffect", "useContext", "useRef"], correct: 1, exp: "useEffect is used to perform side effects like data fetching." },
            { q: "What does JSX stand for?", opts: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"], correct: 0, exp: "JSX stands for JavaScript XML, allowing HTML-like syntax in JavaScript." },
        ],
        dsa: [
            { q: "What is the time complexity of binary search?", opts: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1, exp: "Binary search divides the search space in half each time." },
            { q: "Which data structure uses LIFO?", opts: ["Queue", "Stack", "Array", "Tree"], correct: 1, exp: "Stack follows Last In First Out (LIFO) principle." },
            { q: "What is the worst-case complexity of QuickSort?", opts: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], correct: 2, exp: "QuickSort has O(n²) worst case when pivot selection is poor." },
        ],
    };

    const key = topic.toLowerCase().trim();
    const defaultQuestions = topicQuestions[key] || topicQuestions.javascript;
    for (let i = 0; i < Math.min(count, defaultQuestions.length); i++) {
        const q = defaultQuestions[i];
        questions.push({
            id: i + 1,
            question: q.q,
            options: q.opts,
            correctAnswer: q.correct,
            explanation: q.exp,
            topic,
            difficulty: difficulty as 'beginner' | 'moderate' | 'advanced'
        });
    }
    return questions;
}

function getMockCodingChallenges(role: string, difficulty: string, count: number): CodingChallenge[] {
    return [{
        id: 1,
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nExample: nums = [2,7,11,15], target = 9 → Output: [0,1]",
        difficulty: difficulty as 'beginner' | 'moderate' | 'advanced',
        role,
        starterCode: "function twoSum(nums, target) {\n  // Your code here\n}",
        language: "javascript",
        testCases: [
            { id: 1, input: "[2,7,11,15], 9", expectedOutput: "[0,1]", isHidden: false },
            { id: 2, input: "[3,2,4], 6", expectedOutput: "[1,2]", isHidden: false },
            { id: 3, input: "[3,3], 6", expectedOutput: "[0,1]", isHidden: true },
        ],
        timeLimit: 1800,
        hints: ["Consider using a hash map", "Think about what complement you need for each number"]
    }];
}

function getMockResumeAnalysis(text: string): ResumeAnalysis {
    const lower = text.toLowerCase();
    const languages: string[] = [];
    const frameworks: string[] = [];

    ['javascript', 'typescript', 'python', 'java', 'c++', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin']
        .forEach(l => { if (lower.includes(l)) languages.push(l.charAt(0).toUpperCase() + l.slice(1)); });

    ['react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'docker', 'kubernetes', 'aws', 'firebase', 'mongodb', 'postgresql', 'graphql', 'next.js', 'tailwind']
        .forEach(f => { if (lower.includes(f)) frameworks.push(f.charAt(0).toUpperCase() + f.slice(1)); });

    let experienceLevel: "Beginner" | "Intermediate" | "Advanced" = 'Beginner';
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('5+ years') || lower.includes('7 years'))
        experienceLevel = 'Advanced';
    else if (lower.includes('2 years') || lower.includes('3 years') || lower.includes('mid'))
        experienceLevel = 'Intermediate';

    return {
        technicalSkills: [...languages, ...frameworks].slice(0, 10),
        programmingLanguages: languages.length > 0 ? languages : ['JavaScript', 'Python'],
        toolsFrameworks: frameworks.length > 0 ? frameworks : ['React', 'Node.js'],
        projects: [
            { name: 'Web Application', description: 'Full-stack development project', technologies: languages.slice(0, 2) },
            { name: 'API Development', description: 'RESTful API implementation', technologies: ['REST API', 'Node.js'] }
        ],
        experienceLevel,
        keyStrengths: ['Problem solving', 'Technical implementation', 'Code quality'],
        yearsOfExperience: experienceLevel === 'Advanced' ? 5 : experienceLevel === 'Intermediate' ? 2 : 1
    };
}

function getMockQuestions(skills: string[], experienceLevel: string, role: string, mode: string): InterviewQuestion[] {
    const questionBanks: Record<string, { q: string; concepts: string[] }[]> = {
        'JavaScript': [
            { q: "Explain closures in JavaScript with a practical example.", concepts: ['closures', 'scope', 'memory'] },
            { q: "What is the event loop and how does it work?", concepts: ['event loop', 'call stack', 'callback queue'] },
            { q: "Compare 'let', 'const', and 'var'. When would you use each?", concepts: ['scope', 'hoisting', 'mutability'] }
        ],
        'React': [
            { q: "How would you optimize a slow React application?", concepts: ['memoization', 'lazy loading', 'virtualization'] },
            { q: "Explain the difference between useState and useReducer.", concepts: ['hooks', 'state management', 'reducers'] },
            { q: "What are React Server Components and when should you use them?", concepts: ['RSC', 'server rendering', 'hydration'] }
        ],
        'Python': [
            { q: "Explain Python's GIL and its implications for multithreading.", concepts: ['GIL', 'threading', 'concurrency'] },
            { q: "How would you implement a decorator for caching?", concepts: ['decorators', 'caching', 'higher-order functions'] }
        ],
        'default': [
            { q: "Describe a challenging bug you fixed. What was your approach?", concepts: ['debugging', 'problem-solving'] },
            { q: "How do you ensure code quality in your projects?", concepts: ['testing', 'code review', 'CI/CD'] },
            { q: "Explain microservices architecture and its trade-offs.", concepts: ['microservices', 'scalability', 'distributed systems'] }
        ]
    };

    const questions: InterviewQuestion[] = [];
    for (let i = 0; i < appConfig.questionsPerSession; i++) {
        const skill = skills[i % skills.length] || 'default';
        const bank = questionBanks[skill] || questionBanks['default'];
        const item = bank[i % bank.length];

        let difficulty: "easy" | "medium" | "hard" = 'medium';
        if (experienceLevel === 'Beginner') difficulty = i < 2 ? 'easy' : 'medium';
        if (experienceLevel === 'Advanced') difficulty = i < 2 ? 'medium' : 'hard';

        questions.push({
            id: i + 1,
            question: item.q,
            skillTested: skill === 'default' ? 'General' : skill,
            difficulty,
            expectedConcepts: item.concepts,
            timeLimit: appConfig.questionTimeLimit,
            type: mode === 'coding' ? 'coding' : 'conceptual',
            codeTemplate: mode === 'coding' ? '// Write your solution here\n\n' : undefined
        });
    }
    return questions;
}

function getMockEvaluation(answer: string): AnswerEvaluation {
    const words = answer.split(' ').length;
    let score = Math.min(10, Math.max(3, Math.floor(words / 8) + 4));
    if (answer.length < 50) score = Math.min(score, 4);
    if (answer.length > 200) score = Math.min(10, score + 1);

    return {
        questionId: 0,
        answer: answer.substring(0, 100),
        score,
        strengths: score >= 7 ? ['Good concept understanding', 'Clear explanation'] : ['Attempted answer'],
        weaknesses: score < 7 ? ['Could provide more detail', 'Missing key concepts'] : ['Minor improvements possible'],
        missingConcepts: score < 7 ? ['Consider edge cases'] : [],
        feedback: score >= 7 ? 'Great answer demonstrating solid understanding.' : 'Good start, but could go deeper.',
        timeSpent: Math.floor(Math.random() * 120) + 60
    };
}

function getMockFeedback(evaluations: AnswerEvaluation[]): InterviewFeedback {
    const avg = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
    const score = Math.round(avg * 10);

    let rating: "Excellent" | "Good" | "Average" | "Needs Improvement" = 'Average';
    if (score >= 80) rating = 'Excellent';
    else if (score >= 65) rating = 'Good';
    else if (score < 50) rating = 'Needs Improvement';

    return {
        overallScore: score,
        summary: `You scored ${score}/100. ${rating === 'Excellent' ? 'Outstanding performance!' : rating === 'Good' ? 'Good showing with room to grow.' : 'Several areas need improvement.'}`,
        performanceRating: rating,
        strengths: evaluations.flatMap(e => e.strengths).slice(0, 3),
        improvements: evaluations.flatMap(e => e.weaknesses).slice(0, 3),
        studyTopics: evaluations.flatMap(e => e.missingConcepts).slice(0, 4),
        recommendedResources: [
            { title: 'MDN Web Docs', type: 'documentation' },
            { title: 'LeetCode Practice', type: 'practice' }
        ]
    };
}

function getMockImprovementPlan(missing: string[], weak: string[]): ImprovementPlan {
    const topics = [...new Set([...missing, ...weak])].slice(0, 4);

    return {
        priorityTopics: topics.map((topic, i) => ({
            topic,
            importance: i < 2 ? 'high' as const : 'medium' as const,
            resources: [`Official ${topic} docs`, `YouTube: ${topic} tutorial`, 'LeetCode/HackerRank'],
            projectIdea: `Build a project using ${topic}`,
            estimatedTime: i < 2 ? '2 weeks' : '1 week'
        })),
        nextSteps: [
            'Review missed concepts from interview',
            'Practice 30 min daily on coding problems',
            'Build a portfolio project',
            'Mock interviews with peers'
        ],
        recommendedCertifications: ['AWS Cloud Practitioner', 'Google Cloud Associate'],
        weeklyGoals: [
            { week: 1, goals: ['Study first priority topic', 'Complete 5 practice problems'], milestone: 'Conceptual foundation' },
            { week: 2, goals: ['Build small project', 'Review second topic'], milestone: 'Practical application' }
        ]
    };
}

export default {
    isAIAvailable,
    analyzeResume,
    estimateSkillConfidence,
    generateQuestions,
    evaluateAnswer,
    generateFeedback,
    generateImprovementPlan,
    generateVoiceInterviewResponse
};
