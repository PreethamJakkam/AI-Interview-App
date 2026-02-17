'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { appConfig } from '@/lib/config';
import { analyzeResume, estimateSkillConfidence, generateQuestions } from '@/lib/gemini';
import toast from 'react-hot-toast';

const SAMPLE_RESUME = `John Doe - Software Developer

SKILLS: JavaScript, TypeScript, Python, React, Node.js, Express, MongoDB, PostgreSQL, Docker, AWS, Git

EXPERIENCE:
• Senior Developer at Tech Corp (2021-Present) - Built microservices, led team of 4
• Developer at StartupXYZ (2019-2021) - Full-stack React/Python development

PROJECTS:
• E-commerce Platform - React, Node.js, MongoDB, Stripe
• AI Chatbot - Python, Flask, OpenAI API

EDUCATION: B.S. Computer Science, 2019`;

type Stage = 'input' | 'analysis' | 'role' | 'mode';

function NewInterviewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedRole = searchParams.get('role');

    const [stage, setStage] = useState<Stage>('input');
    const [inputType, setInputType] = useState<'resume' | 'topic'>('resume');
    const [resumeText, setResumeText] = useState('');
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [analysis, setAnalysis] = useState<{
        technicalSkills: string[];
        programmingLanguages: string[];
        toolsFrameworks: string[];
        experienceLevel: string;
        projects: { name: string; description: string; technologies: string[] }[];
    } | null>(null);
    const [skillConfidence, setSkillConfidence] = useState<Record<string, number>>({});
    const [selectedRole, setSelectedRole] = useState(preselectedRole || '');
    const [selectedMode, setSelectedMode] = useState('standard');

    useEffect(() => {
        if (preselectedRole) setSelectedRole(preselectedRole);
    }, [preselectedRole]);

    const handleAnalyze = async () => {
        if (inputType === 'resume' && resumeText.trim().length < 50) {
            toast.error('Please enter a valid resume');
            return;
        }
        if (inputType === 'topic' && topic.trim().length < 3) {
            toast.error('Please enter a topic');
            return;
        }

        setIsLoading(true);
        try {
            if (inputType === 'resume') {
                const result = await analyzeResume(resumeText);
                setAnalysis(result);
                const confidence = await estimateSkillConfidence(
                    { programmingLanguages: result.programmingLanguages, toolsFrameworks: result.toolsFrameworks },
                    result.projects
                );
                setSkillConfidence(confidence);
            } else {
                setAnalysis({
                    technicalSkills: [topic],
                    programmingLanguages: [],
                    toolsFrameworks: [topic],
                    experienceLevel: 'Intermediate',
                    projects: []
                });
                setSkillConfidence({ [topic]: 3 });
            }
            setStage('analysis');
            toast.success('Analysis complete!');
        } catch (error) {
            console.error(error);
            toast.error('Analysis failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartInterview = async () => {
        if (!selectedRole) {
            toast.error('Please select a role');
            return;
        }
        setIsLoading(true);
        try {
            const allSkills = [...(analysis?.programmingLanguages || []), ...(analysis?.toolsFrameworks || [])];
            const questions = await generateQuestions(allSkills, skillConfidence, analysis?.experienceLevel || 'Intermediate', selectedRole, selectedMode);
            sessionStorage.setItem('interviewData', JSON.stringify({ questions, analysis, skillConfidence, role: selectedRole, mode: selectedMode, topic: inputType === 'topic' ? topic : null }));

            // Route to voice-session for voice mode, standard session for other modes
            if (selectedMode === 'voice') {
                router.push('/interview/voice-session');
            } else {
                router.push('/interview/session');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate questions');
        } finally {
            setIsLoading(false);
        }
    };

    const getProgress = () => {
        switch (stage) { case 'input': return 25; case 'analysis': return 50; case 'role': return 75; case 'mode': return 100; }
    };

    const stages = ['Input', 'Analysis', 'Role', 'Start'];
    const stageKeys: Stage[] = ['input', 'analysis', 'role', 'mode'];
    const currentStageIndex = stageKeys.indexOf(stage);

    const cardStyle: React.CSSProperties = {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        transition: 'all var(--transition-base)',
    };

    const cardActiveStyle: React.CSSProperties = {
        ...cardStyle,
        borderColor: 'var(--accent-cyan)',
        background: 'var(--accent-cyan-dim)',
        boxShadow: 'var(--shadow-glow-sm)',
    };

    const backButtonStyle: React.CSSProperties = {
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        background: 'none', border: 'none', color: 'var(--text-muted)',
        cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.8rem',
        transition: 'color var(--transition-base)',
    };

    return (
        <AppLayout>
            <div className="page-enter" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', minHeight: '80vh' }}>
                {/* Left — Step Progress */}
                <div style={{ paddingTop: '0.5rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>Setup</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {stages.map((s, i) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', background: i === currentStageIndex ? 'var(--accent-cyan-dim)' : 'transparent', transition: 'all var(--transition-base)' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600, fontFamily: 'var(--font-mono)', background: i < currentStageIndex ? 'var(--accent-cyan)' : i === currentStageIndex ? 'var(--accent-cyan-dim)' : 'var(--bg-surface)', color: i < currentStageIndex ? '#07070D' : i === currentStageIndex ? 'var(--accent-cyan)' : 'var(--text-muted)', border: `1px solid ${i <= currentStageIndex ? 'rgba(6,214,160,0.3)' : 'var(--border-subtle)'}` }}>
                                    {i < currentStageIndex ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: '0.8125rem', fontWeight: i === currentStageIndex ? 600 : 400, color: i === currentStageIndex ? 'var(--accent-cyan)' : i < currentStageIndex ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{s}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                        <div className="progress-bar"><motion.div className="progress-fill" initial={{ width: '0%' }} animate={{ width: `${getProgress()}%` }} transition={{ duration: 0.5 }} /></div>
                    </div>
                </div>
                {/* Right — Content */}
                <div style={{ maxWidth: '640px' }}>

                    <AnimatePresence mode="wait">
                        {/* Stage 1: Input */}
                        {stage === 'input' && (
                            <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Start your interview</h1>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>Choose how to practice</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <motion.div
                                        onClick={() => setInputType('resume')}
                                        whileHover={{ y: -2 }}
                                        style={{ ...(inputType === 'resume' ? cardActiveStyle : cardStyle), cursor: 'pointer', textAlign: 'center' }}
                                    >
                                        <FileText size={24} style={{ color: inputType === 'resume' ? 'var(--accent-cyan)' : 'var(--text-muted)', margin: '0 auto 0.625rem' }} />
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>From Resume</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>AI extracts your skills</div>
                                    </motion.div>
                                    <motion.div
                                        onClick={() => setInputType('topic')}
                                        whileHover={{ y: -2 }}
                                        style={{ ...(inputType === 'topic' ? cardActiveStyle : cardStyle), cursor: 'pointer', textAlign: 'center' }}
                                    >
                                        <Sparkles size={24} style={{ color: inputType === 'topic' ? 'var(--accent-cyan)' : 'var(--text-muted)', margin: '0 auto 0.625rem' }} />
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>By Topic</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Practice specific skills</div>
                                    </motion.div>
                                </div>

                                {inputType === 'resume' ? (
                                    <div>
                                        <textarea
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                            placeholder="Paste your resume here..."
                                            style={{
                                                width: '100%', height: '200px', padding: '1rem',
                                                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'none',
                                                fontFamily: 'var(--font-sans)', transition: 'all var(--transition-base)',
                                            }}
                                        />
                                        <button onClick={() => setResumeText(SAMPLE_RESUME)} style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}>
                                            Use sample resume
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="e.g., React, Python, System Design..."
                                            style={{
                                                width: '100%', padding: '1rem',
                                                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.875rem',
                                                transition: 'all var(--transition-base)',
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                            {['React', 'Node.js', 'Python', 'SQL', 'System Design'].map((t) => (
                                                <button key={t} onClick={() => setTopic(t)} style={{
                                                    padding: '0.375rem 0.75rem', fontSize: '0.7rem',
                                                    background: topic === t ? 'var(--accent-cyan-dim)' : 'var(--bg-surface)',
                                                    border: `1px solid ${topic === t ? 'rgba(6,214,160,0.2)' : 'var(--border-subtle)'}`,
                                                    borderRadius: 'var(--radius-full)',
                                                    color: topic === t ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                                    cursor: 'pointer', transition: 'all var(--transition-base)',
                                                }}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <motion.button
                                    onClick={handleAnalyze} disabled={isLoading} className="btn-primary"
                                    style={{ width: '100%', marginTop: '1.75rem', padding: '1rem', fontSize: '0.875rem' }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    {isLoading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" />
                                            Analyzing...
                                        </span>
                                    ) : <><ChevronRight size={18} /> Continue</>}
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Stage 2: Analysis */}
                        {stage === 'analysis' && analysis && (
                            <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <button onClick={() => setStage('input')} style={backButtonStyle}>
                                    <ArrowLeft size={14} /> Back
                                </button>
                                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.75rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Analysis results</h1>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={cardStyle}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Experience</div>
                                        <div className="text-gradient" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>{analysis.experienceLevel}</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Skills Found</div>
                                        <div className="text-gradient" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>{analysis.programmingLanguages.length + analysis.toolsFrameworks.length}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
                                    {[...analysis.programmingLanguages, ...analysis.toolsFrameworks].slice(0, 10).map((skill) => (
                                        <span key={skill} className="badge badge-cyan">
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <motion.button
                                    onClick={() => setStage('role')} className="btn-primary"
                                    style={{ width: '100%', padding: '1rem', fontSize: '0.875rem' }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    <ChevronRight size={18} /> Select Role
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Stage 3: Role */}
                        {stage === 'role' && (
                            <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <button onClick={() => setStage('analysis')} style={backButtonStyle}>
                                    <ArrowLeft size={14} /> Back
                                </button>
                                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.75rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Select role</h1>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.75rem' }}>
                                    {appConfig.roles.map((role) => (
                                        <motion.div
                                            key={role.id}
                                            onClick={() => setSelectedRole(role.id)}
                                            whileHover={{ y: -2 }}
                                            style={{ ...(selectedRole === role.id ? cardActiveStyle : cardStyle), cursor: 'pointer', textAlign: 'center' }}
                                        >
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{role.icon}</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{role.name}</div>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.button
                                    onClick={() => setStage('mode')} disabled={!selectedRole} className="btn-primary"
                                    style={{ width: '100%', padding: '1rem', fontSize: '0.875rem', opacity: selectedRole ? 1 : 0.4 }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    <ChevronRight size={18} /> Choose Mode
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Stage 4: Mode */}
                        {stage === 'mode' && (
                            <motion.div key="mode" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <button onClick={() => setStage('role')} style={backButtonStyle}>
                                    <ArrowLeft size={14} /> Back
                                </button>
                                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.75rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Interview mode</h1>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem', marginBottom: '1.75rem' }}>
                                    {appConfig.modes.map((mode) => (
                                        <motion.div
                                            key={mode.id}
                                            onClick={() => setSelectedMode(mode.id)}
                                            whileHover={{ y: -2 }}
                                            style={{ ...(selectedMode === mode.id ? cardActiveStyle : cardStyle), cursor: 'pointer', textAlign: 'center', padding: '1.25rem 0.75rem' }}
                                        >
                                            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{mode.icon}</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-primary)' }}>{mode.name}</div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Summary Card */}
                                <div style={{ ...cardStyle, marginBottom: '1.75rem' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem', fontWeight: 500 }}>Session Summary</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Role:</span> <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{appConfig.roles.find(r => r.id === selectedRole)?.name}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Questions:</span> <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{appConfig.questionsPerSession}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Mode:</span> <span style={{ fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{selectedMode}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Time:</span> <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{appConfig.questionTimeLimit / 60} min/q</span></div>
                                    </div>
                                </div>

                                <motion.button
                                    onClick={handleStartInterview} disabled={isLoading} className="btn-primary cta-glow"
                                    style={{ width: '100%', padding: '1rem', fontSize: '0.875rem' }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    {isLoading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" />
                                            Preparing...
                                        </span>
                                    ) : <><Play size={18} /> Start Interview</>}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AppLayout>
    );
}

export default function NewInterviewPage() {
    return (
        <Suspense fallback={
            <AppLayout>
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem' }}>
                        <span className="ai-typing-dot" /><span className="ai-typing-dot" /><span className="ai-typing-dot" />
                    </div>
                </div>
            </AppLayout>
        }>
            <NewInterviewContent />
        </Suspense>
    );
}
