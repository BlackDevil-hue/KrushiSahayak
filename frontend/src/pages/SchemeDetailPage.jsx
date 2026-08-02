import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import ExternalLinkModal from '../components/ExternalLinkModal';
import { useToast } from '../context/ToastContext';
import { useSchemes, getBookmarkedSchemeIds, toggleBookmarkSchemeId, evaluateEligibility } from '../hooks/useSchemes';
import { speakText, stopSpeech, isSpeaking, isTTSSupported } from '../services/speechService';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Volume2,
  VolumeX,
  FileCheck,
  CheckCircle,
  Clock,
  ShieldCheck,
  FileText,
  PhoneCall,
  HelpCircle,
  Building2,
  Sparkles,
} from 'lucide-react';

export default function SchemeDetailPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const schemeId = id || searchParams.get('id') || 'pm-kisan';
  const scheme = SCHEMES_DATA.find((s) => s.id === schemeId) || SCHEMES_DATA[0];

  const [bookmarks, setBookmarks] = useState(() => getBookmarkedSchemeIds());
  const [isReading, setIsReading] = useState(false);

  const [externalModal, setExternalModal] = useState({
    isOpen: false,
    targetUrl: '',
    portalName: '',
    description: '',
  });

  const isSaved = bookmarks.includes(scheme.id);

  const handleBookmarkToggle = () => {
    const updated = toggleBookmarkSchemeId(scheme.id);
    setBookmarks(updated);
    if (updated.includes(scheme.id)) {
      toast.success('Added to saved bookmarks.');
    } else {
      toast.info('Removed from saved bookmarks.');
    }
  };

  const handleReadAloud = () => {
    if (!isTTSSupported()) {
      toast.warning('Text-to-Speech is not supported in your browser.');
      return;
    }

    if (isReading) {
      stopSpeech();
      setIsReading(false);
      toast.info('Speech paused.');
    } else {
      const fullText = `${scheme.title}. ${scheme.description}. Key benefit: ${scheme.benefit}. Required documents include: ${scheme.requiredDocs.join(', ')}.`;
      setIsReading(true);
      speakText(fullText, {
        lang: 'hi-IN',
        onEnd: () => setIsReading(false),
        onError: () => {
          setIsReading(false);
          toast.error('Failed to play text-to-speech.');
        },
      });
      toast.info('Reading scheme details aloud...');
    }
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const openApplyModal = () => {
    const targetUrl = scheme.applicationUrl || scheme.officialUrl || 'https://pmkisan.gov.in';
    const portalName = scheme.name || scheme.title || 'Official Government Portal';
    setExternalModal({
      isOpen: true,
      targetUrl,
      portalName,
      description: `You are leaving KrishiSahayak to visit the official government site (${portalName}) to complete your scheme application.`,
    });
  };

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Back Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            variant="text"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/schemes')}
          >
            Back to Schemes
          </Button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={isReading ? VolumeX : Volume2}
              onClick={handleReadAloud}
            >
              {isReading ? 'Stop Reading' : 'Listen Aloud (TTS)'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={isSaved ? BookmarkCheck : Bookmark}
              onClick={handleBookmarkToggle}
            >
              {isSaved ? 'Saved' : 'Save Scheme'}
            </Button>
          </div>
        </div>

        {/* Hero Card */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              {scheme.category}
            </span>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                fontSize: '12px',
              }}
            >
              {scheme.state}
            </span>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor:
                  scheme.deadlineStatus === 'Ending Soon'
                    ? 'var(--color-warning-bg)'
                    : 'var(--color-surface-variant)',
                color:
                  scheme.deadlineStatus === 'Ending Soon'
                    ? 'var(--color-warning)'
                    : 'var(--color-text-secondary)',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Deadline: {scheme.deadline} ({scheme.deadlineStatus})
            </span>
          </div>

          <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-primary)', margin: '8px 0 12px 0' }}>
            {scheme.title}
          </h1>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--color-primary)',
              margin: '16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <ShieldCheck size={28} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>
                Primary Financial Benefit
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {scheme.benefit}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 'var(--font-size-base)', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
            {scheme.description}
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <Button
              variant="primary"
              size="md"
              icon={ExternalLink}
              iconPosition="right"
              onClick={openApplyModal}
            >
              Apply on Official Website
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={Sparkles}
              onClick={() => navigate(`/eligibility?schemeId=${scheme.id}`)}
            >
              Check My Eligibility
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={FileCheck}
              onClick={() => navigate(`/checklist?schemeId=${scheme.id}`)}
            >
              Generate Document Checklist
            </Button>
          </div>
        </section>

        {/* Deep Information Breakdown Grid */}
        <div className="grid-2 gap-md">
          {/* Key Scheme Benefits */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
              Key Features & Benefits
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {scheme.benefitsList.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: 'var(--font-size-sm)' }}>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      marginTop: '8px',
                      flexShrink: 0,
                    }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Eligibility Rules */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--color-primary)' }} />
              Eligibility Criteria
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {scheme.eligibilityDescription.map((rule, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: 'var(--font-size-sm)' }}>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-accent)',
                      marginTop: '8px',
                      flexShrink: 0,
                    }}
                  />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Required Documents & Portal Contact Info */}
        <div className="grid-2 gap-md">
          {/* Required Documents */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FileText size={20} style={{ color: 'var(--color-warning)' }} />
              Required Verification Documents
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {scheme.requiredDocs.map((doc, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{doc}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Required</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Portal Contact */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Building2 size={20} style={{ color: 'var(--color-info)' }} />
                Official Portal Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Portal Name:</span>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>{scheme.portalName}</div>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Official Link:</span>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                    {scheme.officialUrl}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Helpline Phone / Support:</span>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PhoneCall size={14} style={{ color: 'var(--color-success)' }} />
                    {scheme.contactHelpline}
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={ExternalLink}
              onClick={openApplyModal}
            >
              Open External Portal
            </Button>
          </div>
        </div>

        {/* Modal for External Redirect Warning */}
        <ExternalLinkModal
          isOpen={externalModal.isOpen}
          onClose={() => setExternalModal((prev) => ({ ...prev, isOpen: false }))}
          targetUrl={externalModal.targetUrl}
          portalName={externalModal.portalName}
          description={externalModal.description}
        />
      </div>
    </Layout>
  );
}
