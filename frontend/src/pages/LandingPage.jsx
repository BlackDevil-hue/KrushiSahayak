import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import {
  Sprout,
  Landmark,
  Bot,
  Sparkles,
  Languages,
  CheckCircle2,
  FileText,
  FileCheck,
  Mic,
  Bell,
  ExternalLink,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';

export default function LandingPage() {

  const navigate = useNavigate();

  const features = [
    {
      title: 'Government Scheme Repository',
      subtitle: 'Central database of all agricultural schemes with benefits, eligibility, and deadlines.',
      icon: Landmark,
      color: '#2E7D32',
      badge: 'Official Repository',
      path: '/schemes',
    },
    {
      title: 'AI Multilingual Chatbot',
      subtitle: 'Ask scheme questions in natural language (RAG & LLM driven).',
      icon: Bot,
      color: '#0288D1',
      badge: 'RAG Powered',
      path: '/chat',
    },
    {
      title: 'AI Scheme Explanation',
      subtitle: 'Simplifies complex government policy documents into easy farmer-friendly guidance.',
      icon: Sparkles,
      color: '#7B1FA2',
      badge: 'Simple Explanations',
      path: '/schemes',
    },
    {
      title: 'Automatic Eligibility Checker',
      subtitle: 'Calculates instant scheme eligibility scores based on state, land, crop, and income.',
      icon: CheckCircle2,
      color: '#388E3C',
      badge: 'Auto Evaluator',
      path: '/eligibility',
    },
    {
      title: 'AI PDF Explainer & Summarizer',
      subtitle: 'Upload government scheme PDFs to extract key summaries, benefits, and dates.',
      icon: FileText,
      color: '#D81B60',
      badge: 'PDF Summarizer',
      path: '/explainer',
    },
    {
      title: 'Document Checklist Generator',
      subtitle: 'Generates exact document requirements for PM-KISAN, KCC, PMFBY, and subventions.',
      icon: FileCheck,
      color: '#F57C00',
      badge: 'Doc Generator',
      path: '/checklist',
    },
    {
      title: 'Multilingual Voice Assistant',
      subtitle: 'Speech-to-Text & Text-to-Speech support in Hindi, Marathi, English, Gujarati, and regional languages.',
      icon: Mic,
      color: '#1976D2',
      badge: 'STT & TTS',
      path: '/chat',
    },
    {
      title: 'Official Portal Application Links',
      subtitle: 'Direct application links to official government portals (pmkisan.gov.in, pmfby.gov.in).',
      icon: ExternalLink,
      color: '#00796B',
      badge: 'Official Links',
      path: '/schemes',
    },
  ];

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '32px' }}>
        {/* Hero Banner */}
        <section
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.7)), url('/assets/farm_hero.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 'var(--radius-lg)',
            padding: '56px 20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                backgroundColor: 'var(--color-primary)',
                color: '#FFF',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: '16px',
              }}
            >
              <Sparkles size={14} /> Empowering Indian Farmers with Smart AI
            </div>

            <h1
              style={{
                fontSize: 'clamp(28px, 5vw, 44px)',
                fontWeight: 'var(--font-weight-bold)',
                color: '#FFFFFF',
                lineHeight: 1.2,
                marginBottom: '16px',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              Transform Your Farming with <span style={{ color: 'var(--color-accent-light)' }}>KrishiSahayak</span>
            </h1>

            <p
              style={{
                fontSize: 'var(--font-size-lg)',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '32px',
                maxWidth: '680px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Discover agricultural schemes, check eligibility automatically, chat with our multilingual AI assistant, and extract insights from official policy documents.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/register')}
              >
                Register Profile & Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={PhoneCall}
                onClick={() => navigate('/login')}
              >
                Login with Phone / OTP
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: '8px' }}>
              Government Agricultural Scheme Assistance Platform
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Built strictly according to government scheme requirements to empower Indian farmers with intelligent digital guidance.
            </p>
          </div>

          <div className="grid-2 gap-lg">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Card
                  key={idx}
                  hoverable
                  elevation="shadow-sm"
                  padding="lg"
                  onClick={() => navigate(feat.path)}
                  actions={
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-surface-variant)',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: feat.color,
                      }}
                    >
                      {feat.badge}
                    </span>
                  }
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: `${feat.color}15`,
                        color: feat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={26} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '6px' }}>{feat.title}</h3>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {feat.subtitle}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA Banner */}
        <section
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Sprout size={48} style={{ color: 'var(--color-accent)' }} />
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: '#FFF' }}>Ready to Boost Your Farm Productivity?</h2>
          <p style={{ color: 'var(--color-primary-light)', maxWidth: '600px', fontSize: 'var(--font-size-base)' }}>
            Join thousands of progressive farmers across India. Register your farmer profile in less than 2 minutes.
          </p>
          <Button variant="accent" size="lg" onClick={() => navigate('/register')}>
            Create Farmer Account
          </Button>
        </section>
      </div>
    </Layout>
  );
}
