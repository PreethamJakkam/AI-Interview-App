'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Trophy, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { appConfig } from '@/lib/config';

export default function HomePage() {
  const features = [
    { icon: '📄', title: 'Resume Analysis', desc: 'AI extracts your skills' },
    { icon: '🎯', title: 'Smart Questions', desc: 'Tailored to you' },
    { icon: '🎤', title: 'Voice Mode', desc: 'Speak your answers' },
    { icon: '💻', title: 'Code Editor', desc: 'Solve challenges' }
  ];

  const stats = [
    { value: '10K+', label: 'Sessions' },
    { value: '95%', label: 'Success' },
    { value: '50+', label: 'Topics' }
  ];

  return (
    <AppLayout>
      {/* Hero */}
      <section style={{ padding: '4rem 0 5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 0.875rem', marginBottom: '1.75rem',
            background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber-glow)',
            borderRadius: '0.25rem', fontSize: '0.7rem', color: 'var(--accent-amber)',
            textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-amber)' }} />
            Powered by Google Gemini
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.25rem, 7vw, 3.25rem)',
            fontWeight: 600,
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Ace your next<br />
            <span style={{ color: 'var(--accent-amber)' }}>tech interview</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            maxWidth: '480px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            Practice with AI-powered mock interviews. Get instant feedback and land your dream job.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/interview/new">
              <button className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.875rem 1.75rem' }}>
                <Play size={18} />
                Start Interview
              </button>
            </Link>
            <Link href="/leaderboard">
              <button className="btn-secondary" style={{ fontSize: '0.9rem', padding: '0.875rem 1.75rem' }}>
                <Trophy size={18} />
                Leaderboard
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ padding: '2rem 0 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                fontWeight: 600,
                color: 'var(--accent-amber)',
                marginBottom: '0.25rem'
              }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '3rem 0' }}>
        <h2 style={{
          textAlign: 'center',
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '2rem',
          color: 'var(--text-primary)'
        }}>
          Everything you need to <span style={{ color: 'var(--accent-amber)' }}>succeed</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '0.5rem', margin: '0 auto 1rem',
                background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section style={{ padding: '3rem 0' }}>
        <h2 style={{
          textAlign: 'center',
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          color: 'var(--text-primary)'
        }}>
          Practice for <span style={{ color: 'var(--accent-amber)' }}>any role</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.85rem' }}>
          Role-specific interview questions
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem'
        }}>
          {appConfig.roles.slice(0, 8).map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/interview/new?role=${role.id}`}>
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{role.icon}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>{role.name}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '3rem 0 4rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 1.25rem',
            background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Trophy size={24} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            color: 'var(--text-primary)'
          }}>
            Ready to get started?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            No signup required. Start practicing now.
          </p>
          <Link href="/interview/new">
            <button className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.875rem 1.75rem' }}>
              Start Free Practice
              <ArrowRight size={16} />
            </button>
          </Link>
        </motion.div>
      </section>
    </AppLayout>
  );
}

