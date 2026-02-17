'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Trophy, ArrowRight, Sparkles, Zap, Target, Mic, Code } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { appConfig } from '@/lib/config';

export default function HomePage() {
  const features = [
    { icon: <Target size={22} />, title: 'Resume Analysis', desc: 'AI extracts your skills and tailors questions to your experience', color: 'var(--accent-cyan)' },
    { icon: <Zap size={22} />, title: 'Smart Questions', desc: 'Role-specific questions powered by Google Gemini AI', color: 'var(--accent-violet)' },
    { icon: <Mic size={22} />, title: 'Voice Mode', desc: 'Practice speaking your answers naturally with voice input', color: '#EC4899' },
    { icon: <Code size={22} />, title: 'Code Editor', desc: 'Solve real coding challenges in a built-in Monaco editor', color: '#F59E0B' }
  ];

  const stats = [
    { value: '10K+', label: 'Sessions' },
    { value: '95%', label: 'Success Rate' },
    { value: '50+', label: 'Topics' },
    { value: '24/7', label: 'AI Ready' },
  ];

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <AppLayout>
      {/* ========== HERO — Full-width two-column ========== */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', minHeight: '70vh', padding: '3rem 0' }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 1rem', marginBottom: '1.5rem',
              background: 'var(--accent-cyan-dim)', border: '1px solid rgba(6, 214, 160, 0.15)',
              borderRadius: 'var(--radius-full)', fontSize: '0.7rem',
              color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500,
            }}
          >
            <Sparkles size={12} /> Powered by Google Gemini
          </motion.div>

          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
            fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem',
            color: 'var(--text-primary)', letterSpacing: '-0.03em',
          }}>
            Ace your next<br /><span className="text-gradient">tech interview</span>
          </h1>

          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '480px', lineHeight: 1.7 }}>
            Practice with AI-powered mock interviews. Get instant feedback, personalized questions, and land your dream job.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/interview/new">
              <motion.button className="btn-primary cta-glow" style={{ fontSize: '0.9rem', padding: '0.875rem 2rem' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Play size={18} /> Start Interview
              </motion.button>
            </Link>
            <Link href="/leaderboard">
              <motion.button className="btn-secondary" style={{ fontSize: '0.9rem', padding: '0.875rem 2rem' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Trophy size={18} /> Leaderboard
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Right — Stats Grid */}
        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i} variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{
                background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
                padding: '2rem 1.5rem', textAlign: 'center',
                transition: 'all var(--transition-base)',
              }}
            >
              <div className="stat-number" style={{ fontSize: '2rem', marginBottom: '0.375rem' }}>{stat.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-medium), transparent)', margin: '1rem 0' }} />

      {/* ========== FEATURES — Full-width 4-column grid ========== */}
      <section style={{ padding: '4rem 0' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Everything you need to <span className="text-gradient">succeed</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Built for engineers, by engineers</p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}
        >
          {features.map((f, i) => (
            <motion.div
              key={i} variants={fadeUp}
              whileHover={{ y: -6, borderColor: f.color, transition: { duration: 0.2 } }}
              style={{
                background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
                padding: '2rem 1.5rem', transition: 'all var(--transition-base)', cursor: 'default',
              }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem', background: `${f.color}12`, border: `1px solid ${f.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ========== ROLES — Full-width grid ========== */}
      <section style={{ padding: '3rem 0' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Practice for <span className="text-gradient">any role</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Role-specific interview questions tailored to your career path</p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.875rem' }}
        >
          {appConfig.roles.slice(0, 8).map((role, i) => (
            <motion.div key={role.id} variants={fadeUp} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <Link href={`/interview/new?role=${role.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
                  border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.625rem' }}>{role.icon}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{role.name}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ========== CTA — Full-width banner ========== */}
      <section style={{ padding: '3rem 0 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            background: 'var(--glass-bg-strong)', backdropFilter: 'blur(24px)',
            border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xl)',
            padding: '3.5rem', position: 'relative', overflow: 'hidden',
            display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '2rem',
          }}
        >
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6, 214, 160, 0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Ready to get started?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '460px' }}>
              No signup required. Jump right in and start practicing for your next tech interview.
            </p>
          </div>
          <Link href="/interview/new" style={{ position: 'relative', zIndex: 1 }}>
            <motion.button className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.875rem 2rem', whiteSpace: 'nowrap' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Start Free Practice <ArrowRight size={16} />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </AppLayout>
  );
}
