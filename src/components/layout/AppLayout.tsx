'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Play, History, Trophy, LogOut, User, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/practice', icon: BookOpen, label: 'Practice' },
        { href: '/interview/new', icon: Play, label: 'Interview' },
        { href: '/history', icon: History, label: 'History' },
        { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
    ];

    // Full-screen pages that DON'T get the sidebar (auth pages)
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (isAuthPage) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
                <div className="bg-mesh" />
                {children}
                <Toaster position="top-center" toastOptions={{
                    style: { background: 'var(--bg-card-solid)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', boxShadow: 'var(--shadow-lg)' },
                    success: { iconTheme: { primary: '#10B981', secondary: 'var(--text-primary)' } },
                    error: { iconTheme: { primary: '#EF4444', secondary: 'var(--text-primary)' } },
                }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', display: 'flex' }}>
            <div className="bg-mesh" />

            {/* ===================== DESKTOP SIDEBAR ===================== */}
            {!isMobile && (
                <aside style={{
                    width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
                    minHeight: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(7, 7, 13, 0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRight: '1px solid var(--border-subtle)',
                    transition: 'width var(--transition-base)',
                    overflow: 'hidden',
                }}>
                    {/* Logo */}
                    <div style={{
                        padding: collapsed ? '1.25rem 0.875rem' : '1.25rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        minHeight: '64px',
                    }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
                            <div style={{
                                width: '32px', height: '32px', minWidth: '32px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 700, color: '#07070D',
                            }}>
                                AI
                            </div>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    style={{
                                        fontFamily: 'var(--font-heading)', fontSize: '1.0625rem',
                                        fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Interview<span className="text-gradient" style={{ fontWeight: 700 }}>Pro</span>
                                </motion.span>
                            )}
                        </Link>
                    </div>

                    {/* Nav Items */}
                    <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                            return (
                                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        className={`sidebar-item ${isActive ? 'active' : ''}`}
                                        style={{
                                            justifyContent: collapsed ? 'center' : 'flex-start',
                                            padding: collapsed ? '0.75rem' : '0.625rem 0.875rem',
                                        }}
                                        whileHover={{ x: collapsed ? 0 : 2 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                className="sidebar-active-line"
                                                layoutId="sidebar-indicator"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <item.icon size={18} />
                                        {!collapsed && (
                                            <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom: User + Collapse */}
                    <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {user && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.625rem',
                                padding: collapsed ? '0.5rem' : '0.5rem 0.625rem',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', minWidth: '32px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'linear-gradient(135deg, var(--accent-cyan-dim), var(--accent-violet-dim))',
                                    border: '1px solid var(--border-medium)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden',
                                }}>
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={14} style={{ color: 'var(--text-muted)' }} />
                                    )}
                                </div>
                                {!collapsed && (
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {user.displayName || 'User'}
                                        </div>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {user.email}
                                        </div>
                                    </div>
                                )}
                                {!collapsed && (
                                    <button
                                        onClick={signOut}
                                        style={{
                                            padding: '0.375rem', color: 'var(--text-muted)', background: 'none',
                                            border: 'none', cursor: 'pointer',
                                            transition: 'all var(--transition-base)', borderRadius: 'var(--radius-sm)',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-dim)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                                    >
                                        <LogOut size={14} />
                                    </button>
                                )}
                            </div>
                        )}

                        {!user && !collapsed && (
                            <Link href="/login">
                                <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem' }}>Sign In</button>
                            </Link>
                        )}

                        {/* Collapse Toggle */}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-muted)',
                                transition: 'all var(--transition-base)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </button>
                    </div>
                </aside>
            )}

            {/* ===================== MAIN CONTENT ===================== */}
            <main style={{
                flex: 1,
                marginLeft: isMobile ? 0 : (collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'),
                minHeight: '100vh',
                position: 'relative',
                zIndex: 1,
                transition: 'margin-left var(--transition-base)',
                paddingBottom: isMobile ? '5rem' : '2rem',
            }}>
                {/* Mobile Top Bar */}
                {isMobile && (
                    <header style={{
                        position: 'sticky', top: 0, zIndex: 50,
                        background: 'rgba(7, 7, 13, 0.85)',
                        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                        borderBottom: '1px solid var(--border-subtle)',
                        padding: '0 1rem', height: '56px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                                background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.6875rem', fontWeight: 700, color: '#07070D',
                            }}>AI</div>
                            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Interview<span className="text-gradient" style={{ fontWeight: 700 }}>Pro</span>
                            </span>
                        </Link>
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: 'var(--radius-full)',
                                    background: 'linear-gradient(135deg, var(--accent-cyan-dim), var(--accent-violet-dim))',
                                    border: '1px solid var(--border-medium)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                                }}>
                                    {user.photoURL ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={14} style={{ color: 'var(--text-muted)' }} />}
                                </div>
                            </div>
                        ) : (
                            <Link href="/login"><button className="btn-primary" style={{ padding: '0.375rem 1rem', fontSize: '0.75rem' }}>Sign In</button></Link>
                        )}
                    </header>
                )}

                {/* Page Content — Full Width */}
                <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
                    {children}
                </div>
            </main>

            {/* ===================== MOBILE BOTTOM NAV ===================== */}
            {isMobile && (
                <nav style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
                    background: 'rgba(7, 7, 13, 0.9)',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    borderTop: '1px solid var(--border-subtle)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0.375rem 0 0.5rem' }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                            return (
                                <Link key={item.href} href={item.href} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                                    padding: '0.375rem 0.75rem',
                                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                    textDecoration: 'none', transition: 'color var(--transition-base)', position: 'relative',
                                }}>
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobile-nav-indicator"
                                            style={{
                                                position: 'absolute', top: '-0.375rem', left: '50%',
                                                width: '16px', height: '2px', borderRadius: 'var(--radius-full)',
                                                background: 'var(--accent-cyan)', transform: 'translateX(-50%)',
                                            }}
                                        />
                                    )}
                                    <item.icon size={20} />
                                    <span style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.02em' }}>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}

            <Toaster position="top-center" toastOptions={{
                style: { background: 'var(--bg-card-solid)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', boxShadow: 'var(--shadow-lg)' },
                success: { iconTheme: { primary: '#10B981', secondary: 'var(--text-primary)' } },
                error: { iconTheme: { primary: '#EF4444', secondary: 'var(--text-primary)' } },
            }} />
        </div>
    );
}
