'use client';

import { motion } from 'framer-motion';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
    isListening: boolean;
    isSupported: boolean;
    error: string | null;
    onStart: () => void;
    onStop: () => void;
}

export function VoiceInput({ isListening, isSupported, error, onStart, onStop }: VoiceInputProps) {
    if (!isSupported) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl text-sm">
                <AlertCircle size={16} />
                Voice input not supported in this browser
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <motion.button
                onClick={isListening ? onStop : onStart}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
          ${isListening
                        ? 'bg-red-500 text-white voice-recording'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
                    }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {isListening ? (
                    <>
                        <MicOff size={18} />
                        Stop Recording
                    </>
                ) : (
                    <>
                        <Mic size={18} />
                        Voice Input
                    </>
                )}
            </motion.button>

            {isListening && (
                <motion.div
                    className="flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-red-500 rounded-full"
                            animate={{ height: [12, 24, 12] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                    ))}
                </motion.div>
            )}

            {error && (
                <span className="text-sm text-red-400">{error}</span>
            )}
        </div>
    );
}
