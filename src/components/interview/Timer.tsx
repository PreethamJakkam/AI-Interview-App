'use client';

import { motion } from 'framer-motion';

interface TimerProps {
    timeRemaining: number;
    isCritical: boolean;
    formatTime: (seconds: number) => string;
    totalTime?: number;
}

export function Timer({ timeRemaining, isCritical, formatTime, totalTime = 300 }: TimerProps) {
    const progress = (timeRemaining / totalTime) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <motion.div
            style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            animate={isCritical ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: isCritical ? Infinity : 0, ease: 'easeInOut' }}
            className={isCritical ? 'timer-critical' : ''}
        >
            {/* SVG Circular Progress */}
            <svg
                width="80"
                height="80"
                style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
            >
                {/* Background Circle */}
                <circle
                    cx="40"
                    cy="40"
                    r="45"
                    fill="none"
                    strokeWidth="3"
                    style={{ stroke: 'var(--bg-elevated)' }}
                />
                {/* Progress Circle */}
                <circle
                    cx="40"
                    cy="40"
                    r="45"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{
                        stroke: isCritical ? 'var(--error)' : 'var(--accent-cyan)',
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset,
                        transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
                        filter: isCritical ? 'drop-shadow(0 0 6px var(--error))' : 'drop-shadow(0 0 4px rgba(6, 214, 160, 0.3))',
                    }}
                />
            </svg>

            {/* Time Display */}
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: isCritical ? 'var(--error)' : 'var(--text-primary)',
                letterSpacing: '-0.02em',
            }}>
                {formatTime(timeRemaining)}
            </div>
        </motion.div>
    );
}
