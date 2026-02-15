'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: ReactNode;
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClass = 'inline-flex items-center justify-center gap-2 font-medium transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'text-gray-400 hover:text-white hover:bg-white/5'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base'
    };

    return (
        <button
            className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
            {children}
        </button>
    );
}

// Card
interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
}

export function Card({ children, className = '', hover, gradient }: CardProps) {
    return (
        <div className={`card ${hover ? 'cursor-pointer' : ''} ${gradient ? 'glass-card' : ''} ${className}`}>
            {children}
        </div>
    );
}

// Input
interface InputProps {
    label?: string;
    error?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}

export function Input({ label, error, value, onChange, placeholder, type = 'text' }: InputProps) {
    return (
        <div>
            {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white
          placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
    );
}

// Badge
interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
    const colors = {
        default: 'bg-white/10 text-gray-300',
        success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        error: 'bg-red-500/20 text-red-400 border-red-500/30',
        info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium border border-transparent ${colors[variant]} ${sizes[size]}`}>
            {children}
        </span>
    );
}

// Progress Bar
interface ProgressBarProps {
    value: number;
    showLabel?: boolean;
    size?: 'sm' | 'md';
}

export function ProgressBar({ value, showLabel = true, size = 'md' }: ProgressBarProps) {
    const heights = { sm: 'h-1.5', md: 'h-2.5' };

    return (
        <div>
            {showLabel && (
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(value)}%</span>
                </div>
            )}
            <div className={`progress-bar ${heights[size]}`}>
                <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
            </div>
        </div>
    );
}

// Spinner
export function Spinner({ size = 24 }: { size?: number }) {
    return <Loader2 size={size} className="animate-spin text-cyan-400" />;
}

// Skeleton
interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return <div className={`skeleton ${className}`} />;
}
