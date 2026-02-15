'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerReturn {
    timeRemaining: number;
    isRunning: boolean;
    isCritical: boolean;
    formattedTime: string;
    start: () => void;
    pause: () => void;
    reset: (newTime?: number) => void;
    formatTime: (seconds: number) => string;
}

export function useTimer(initialSeconds: number = 180): UseTimerReturn {
    const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const isCritical = timeRemaining <= 30 && timeRemaining > 0;

    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeRemaining]);

    const start = useCallback(() => {
        setIsRunning(true);
    }, []);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback((newTime?: number) => {
        setIsRunning(false);
        setTimeRemaining(newTime ?? initialSeconds);
    }, [initialSeconds]);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const formattedTime = formatTime(timeRemaining);

    return {
        timeRemaining,
        isRunning,
        isCritical,
        formattedTime,
        start,
        pause,
        reset,
        formatTime,
    };
}
