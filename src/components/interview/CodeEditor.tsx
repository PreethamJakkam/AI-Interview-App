'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] bg-dark-800 rounded-xl animate-pulse flex items-center justify-center">
            <span className="text-dark-400">Loading editor...</span>
        </div>
    )
});

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    height?: string;
    readOnly?: boolean;
}

export function CodeEditor({
    value,
    onChange,
    language = 'javascript',
    height = '400px',
    readOnly = false
}: CodeEditorProps) {
    const [selectedLanguage, setSelectedLanguage] = useState(language);

    const languages = [
        { id: 'javascript', name: 'JavaScript' },
        { id: 'typescript', name: 'TypeScript' },
        { id: 'python', name: 'Python' },
        { id: 'java', name: 'Java' },
        { id: 'cpp', name: 'C++' },
        { id: 'go', name: 'Go' },
        { id: 'rust', name: 'Rust' },
    ];

    return (
        <div className="flex flex-col gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-dark-400">Language:</span>
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-sm text-white
            focus:outline-none focus:border-primary-500"
                >
                    {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                </select>
            </div>

            {/* Editor */}
            <div className="rounded-xl overflow-hidden border border-dark-600">
                <MonacoEditor
                    height={height}
                    language={selectedLanguage}
                    value={value}
                    onChange={(val) => onChange(val || '')}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, monospace',
                        padding: { top: 16, bottom: 16 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly,
                        lineNumbers: 'on',
                        renderLineHighlight: 'line',
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                    }}
                />
            </div>
        </div>
    );
}
