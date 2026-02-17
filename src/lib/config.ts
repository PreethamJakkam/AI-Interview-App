// Firebase Configuration
export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

// AI Configuration
export const aiConfig = {
    geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192,
    }
};

// App Configuration
export const appConfig = {
    appName: "AI Interview Pro",
    version: "2.0.0",

    // Interview settings
    questionsPerSession: 3,
    questionTimeLimit: 180, // seconds
    maxAnswerLength: 3000,

    // Roles available for interview
    roles: [
        { id: "frontend", name: "Frontend Developer", icon: "🎨", color: "from-blue-500 to-cyan-500" },
        { id: "backend", name: "Backend Developer", icon: "⚙️", color: "from-green-500 to-emerald-500" },
        { id: "fullstack", name: "Full Stack Developer", icon: "🔄", color: "from-purple-500 to-pink-500" },
        { id: "data-science", name: "Data Scientist", icon: "📊", color: "from-orange-500 to-red-500" },
        { id: "devops", name: "DevOps Engineer", icon: "🚀", color: "from-yellow-500 to-orange-500" },
        { id: "mobile", name: "Mobile Developer", icon: "📱", color: "from-pink-500 to-rose-500" },
        { id: "ml-engineer", name: "ML Engineer", icon: "🤖", color: "from-indigo-500 to-purple-500" },
        { id: "cloud", name: "Cloud Architect", icon: "☁️", color: "from-sky-500 to-blue-500" },
    ],

    // Experience levels
    experienceLevels: [
        { id: "beginner", name: "Beginner", description: "0-1 years", color: "text-blue-400" },
        { id: "intermediate", name: "Intermediate", description: "2-4 years", color: "text-yellow-400" },
        { id: "advanced", name: "Advanced", description: "5+ years", color: "text-green-400" },
    ],

    // Interview modes
    modes: [
        { id: "standard", name: "Standard", description: "Text-based answers", icon: "📝" },
        { id: "voice", name: "Voice Interview", description: "Live AI conversation", icon: "🎙️" },
        { id: "coding", name: "Coding", description: "Code challenges", icon: "💻" },
    ],

    // Quiz topics
    quizTopics: [
        { id: "java", name: "Java", icon: "☕", description: "Core Java, OOP, Collections" },
        { id: "dsa", name: "DSA", icon: "🧮", description: "Data Structures & Algorithms" },
        { id: "javascript", name: "JavaScript", icon: "🟨", description: "ES6+, DOM, Async" },
        { id: "python", name: "Python", icon: "🐍", description: "Core Python, Libraries" },
        { id: "react", name: "React", icon: "⚛️", description: "Hooks, State, Components" },
        { id: "sql", name: "SQL", icon: "🗃️", description: "Queries, Joins, Optimization" },
        { id: "dbms", name: "DBMS", icon: "📊", description: "Database Concepts" },
        { id: "os", name: "OS", icon: "🖥️", description: "Operating Systems" },
    ],

    // Coding roles
    codingRoles: [
        { id: "frontend", name: "Frontend", icon: "🎨", description: "HTML, CSS, JS, React" },
        { id: "backend", name: "Backend", icon: "⚙️", description: "APIs, Databases, Logic" },
        { id: "fullstack", name: "Fullstack", icon: "🔄", description: "End-to-end Development" },
        { id: "dsa", name: "DSA", icon: "🧮", description: "Problem Solving" },
    ],

    // Difficulty levels for practice modes
    difficulties: [
        { id: "beginner", name: "Beginner", description: "Basic concepts", icon: "🌱" },
        { id: "moderate", name: "Moderate", description: "Intermediate level", icon: "🌿" },
        { id: "advanced", name: "Advanced", description: "Expert challenges", icon: "🌳" },
    ],
};

// Leaderboard tiers
export const leaderboardTiers = [
    { name: "Diamond", minScore: 90, color: "from-cyan-400 to-blue-500", icon: "💎" },
    { name: "Platinum", minScore: 80, color: "from-gray-300 to-gray-400", icon: "🏆" },
    { name: "Gold", minScore: 70, color: "from-yellow-400 to-orange-500", icon: "🥇" },
    { name: "Silver", minScore: 60, color: "from-gray-400 to-gray-500", icon: "🥈" },
    { name: "Bronze", minScore: 50, color: "from-orange-600 to-orange-700", icon: "🥉" },
];

export const getTier = (score: number) => {
    return leaderboardTiers.find(tier => score >= tier.minScore) ||
        { name: "Unranked", minScore: 0, color: "from-gray-600 to-gray-700", icon: "📈" };
};
