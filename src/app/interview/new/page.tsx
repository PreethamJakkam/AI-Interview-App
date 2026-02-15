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
            router.push('/interview/session');
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

    const cardStyle = {
        background: 'var(--bg-card)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-subtle)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        transition: 'all 0.2s'
    };

    const cardActiveStyle = {
        ...cardStyle,
        borderColor: 'var(--accent-amber)',
        background: 'var(--accent-amber-dim)'
    };

    const backButtonStyle = {
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        background: 'none', border: 'none', color: 'var(--text-muted)',
        cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.875rem'
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 0' }}>
                {/* Progress Bar */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span style={{ color: stage === 'input' ? 'var(--accent-amber)' : 'inherit' }}>Input</span>
                        <span style={{ color: stage === 'analysis' ? 'var(--accent-amber)' : 'inherit' }}>Analysis</span>
                        <span style={{ color: stage === 'role' ? 'var(--accent-amber)' : 'inherit' }}>Role</span>
                        <span style={{ color: stage === 'mode' ? 'var(--accent-amber)' : 'inherit' }}>Start</span>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: '0.25rem', height: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${getProgress()}%`, height: '100%', background: 'var(--accent-amber)', transition: 'width 0.3s' }} />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Stage 1: Input */}
                    {stage === 'input' && (
                        <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Start your interview</h1>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Choose how to practice</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div onClick={() => setInputType('resume')} style={{ ...(inputType === 'resume' ? cardActiveStyle : cardStyle), cursor: 'pointer', textAlign: 'center' }}>
                                    <FileText size={24} style={{ color: inputType === 'resume' ? 'var(--accent-amber)' : 'var(--text-muted)', margin: '0 auto 0.5rem' }} />
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>From Resume</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>AI extracts your skills</div>
                                </div>
                                <div onClick={() => setInputType('topic')} style={{ ...(inputType === 'topic' ? cardActiveStyle : cardStyle), cursor: 'pointer', textAlign: 'center' }}>
                                    <Sparkles size={24} style={{ color: inputType === 'topic' ? 'var(--accent-amber)' : 'var(--text-muted)', margin: '0 auto 0.5rem' }} />
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>By Topic</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Practice specific skills</div>
                                </div>
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
                                            borderRadius: '0.5rem', color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'none',
                                            fontFamily: 'var(--font-sans)'
                                        }}
                                    />
                                    <button onClick={() => setResumeText(SAMPLE_RESUME)} style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-amber)', cursor: 'pointer', fontSize: '0.8rem' }}>
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
                                            borderRadius: '0.5rem', color: 'var(--text-primary)', fontSize: '0.875rem'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                        {['React', 'Node.js', 'Python', 'SQL', 'System Design'].map((t) => (
                                            <button key={t} onClick={() => setTopic(t)} style={{
                                                padding: '0.375rem 0.75rem', fontSize: '0.75rem',
                                                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                                borderRadius: '0.25rem', color: 'var(--text-secondary)', cursor: 'pointer'
                                            }}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '0.95rem' }}>
                                {isLoading ? 'Analyzing...' : <><ChevronRight size={20} /> Continue</>}
                            </button>
                        </motion.div>
                    )}

                    {/* Stage 2: Analysis */}
                    {stage === 'analysis' && analysis && (
                        <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <button onClick={() => setStage('input')} style={backButtonStyle}>
                                <ArrowLeft size={16} /> Back
                            </button>
                            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Analysis results</h1>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={cardStyle}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Experience</div>
                                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-amber)' }}>{analysis.experienceLevel}</div>
                                </div>
                                <div style={cardStyle}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Skills Found</div>
                                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{analysis.programmingLanguages.length + analysis.toolsFrameworks.length}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {[...analysis.programmingLanguages, ...analysis.toolsFrameworks].slice(0, 10).map((skill) => (
                                    <span key={skill} style={{
                                        padding: '0.375rem 0.75rem', fontSize: '0.75rem',
                                        background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber-glow)',
                                        borderRadius: '0.25rem', color: 'var(--accent-amber)'
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <button onClick={() => setStage('role')} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '0.95rem' }}>
                                <ChevronRight size={20} /> Select Role
                            </button>
                        </motion.div>
                    )}

                    {/* Stage 3: Role */}
                    {stage === 'role' && (
                        <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <button onClick={() => setStage('analysis')} style={backButtonStyle}>
                                <ArrowLeft size={16} /> Back
                            </button>
                            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Select role</h1>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {appConfig.roles.map((role) => (
                                    <div key={role.id} onClick={() => setSelectedRole(role.id)} style={{ ...(selectedRole === role.id ? cardActiveStyle : cardStyle), cursor: 'pointer', textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{role.icon}</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{role.name}</div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => setStage('mode')} disabled={!selectedRole} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '0.95rem', opacity: selectedRole ? 1 : 0.5 }}>
                                <ChevronRight size={20} /> Choose Mode
                            </button>
                        </motion.div>
                    )}

                    {/* Stage 4: Mode */}
                    {stage === 'mode' && (
                        <motion.div key="mode" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <button onClick={() => setStage('role')} style={backButtonStyle}>
                                <ArrowLeft size={16} /> Back
                            </button>
                            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Interview mode</h1>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {appConfig.modes.map((mode) => (
                                    <div key={mode.id} onClick={() => setSelectedMode(mode.id)} style={{ ...(selectedMode === mode.id ? cardActiveStyle : cardStyle), cursor: 'pointer', textAlign: 'center', padding: '1.25rem 0.75rem' }}>
                                        <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{mode.icon}</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{mode.name}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Role:</span> <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{appConfig.roles.find(r => r.id === selectedRole)?.name}</span></div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Questions:</span> <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{appConfig.questionsPerSession}</span></div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Mode:</span> <span style={{ fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{selectedMode}</span></div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Time:</span> <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{appConfig.questionTimeLimit / 60} min/q</span></div>
                                </div>
                            </div>

                            <button onClick={handleStartInterview} disabled={isLoading} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '0.95rem' }}>
                                {isLoading ? 'Preparing...' : <><Play size={20} /> Start Interview</>}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}

export default function NewInterviewPage() {
    return (
        <Suspense fallback={
            <AppLayout>
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading...</div>
            </AppLayout>
        }>
            <NewInterviewContent />
        </Suspense>
    );
}
