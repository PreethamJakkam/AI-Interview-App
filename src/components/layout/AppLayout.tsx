'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Play, History, Trophy, LogOut, User, Menu, X, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/practice', icon: BookOpen, label: 'Practice' },
        { href: '/interview/new', icon: Play, label: 'Interview' },
        { href: '/history', icon: History, label: 'History' },
        { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                background: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border-subtle)',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
                        {/* Logo */}
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                            <span style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.02em'
                            }}>
                                Interview<span style={{ color: 'var(--accent-amber)' }}>AI</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav style={{ display: 'flex', gap: '0.5rem' }} className="hidden md:flex">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            textDecoration: 'none',
                                            color: isActive ? 'var(--accent-amber)' : 'var(--text-secondary)',
                                            borderBottom: isActive ? '2px solid var(--accent-amber)' : '2px solid transparent',
                                            transition: 'all 0.2s',
                                            marginBottom: '-1px'
                                        }}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {user ? (
                                <>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border-medium)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={18} style={{ color: 'var(--text-muted)' }} />
                                        )}
                                    </div>
                                    <button
                                        onClick={signOut}
                                        style={{
                                            padding: '0.5rem',
                                            color: 'var(--text-muted)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </>
                            ) : (
                                <Link href="/login">
                                    <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                                        Sign In
                                    </button>
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                style={{
                                    padding: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Nav - Bottom Bar */}
            <nav className="md:hidden" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: 'var(--bg-primary)',
                borderTop: '1px solid var(--border-subtle)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.5rem 1rem',
                                    color: isActive ? 'var(--accent-amber)' : 'var(--text-muted)',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s'
                                }}
                            >
                                <item.icon size={20} />
                                <span style={{ fontSize: '0.625rem', fontWeight: 500 }}>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ paddingBottom: '5rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {children}
                </div>
            </main>

            {/* Toast Notifications */}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0.5rem',
                        fontFamily: 'var(--font-sans)',
                        boxShadow: 'var(--shadow-md)',
                    },
                    success: {
                        iconTheme: { primary: '#4A7C59', secondary: 'var(--text-primary)' },
                    },
                    error: {
                        iconTheme: { primary: '#C84630', secondary: 'var(--text-primary)' },
                    },
                }}
            />
        </div>
    );
}

