import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import { useToast } from '../context/ToastContext';
import { useSchemes, getBookmarkedSchemeIds, toggleBookmarkSchemeId, evaluateEligibility } from '../hooks/useSchemes';
import { createSTTListener, isSTTSupported } from '../services/speechService';
import {
  Search,
  Mic,
  MicOff,
  Landmark,
  FileText,
  MessageSquare,
  ChevronRight,
  Clock,
  Sparkles,
  XCircle,
} from 'lucide-react';

export default function SearchPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const navigate = useNavigate();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [recentSearches, setRecentSearches] = useState(['PM-KISAN', 'Solar Pump Subsidy', 'Drip Irrigation', 'Crop Insurance']);
  const [isListening, setIsListening] = useState(false);

  // STT listener setup
  useEffect(() => {
    let stt;
    if (isListening && isSTTSupported()) {
      stt = createSTTListener({
        lang: 'hi-IN',
        onResult: (transcript) => {
          setQuery(transcript);
        },
        onError: (err) => {
          toast.error('Voice search failed.');
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });
      stt.start();
    }
    return () => {
      if (stt) stt.stop();
    };
  }, [isListening, toast]);

  const toggleVoice = () => {
    if (!isSTTSupported()) {
      toast.warning('Web Speech API not supported.');
      return;
    }
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      toast.info('Listening for search query...');
    }
  };

  const handleSearchSubmit = (searchVal) => {
    const val = searchVal || query;
    if (!val.trim()) return;
    if (!recentSearches.includes(val.trim())) {
      setRecentSearches((prev) => [val.trim(), ...prev.slice(0, 5)]);
    }
  };

  // Perform full-text search across schemes and documents
  const searchResults = useMemo(() => {
    if (!query.trim()) return { schemes: [], documents: [], chatItems: [] };
    const q = query.toLowerCase();

    const schemes = SCHEMES_DATA.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );

    const documents = SCHEMES_DATA.flatMap((s) =>
      s.requiredDocs
        .filter((d) => d.toLowerCase().includes(q))
        .map((d) => ({ docName: d, schemeTitle: s.title, schemeId: s.id }))
    );

    const chatItems = [
      { id: 'c1', question: `How to claim benefit for ${query}?`, answer: `You can check your eligibility or apply online for matching schemes.` },
    ];

    return { schemes, documents, chatItems };
  }, [query]);

  const totalResults =
    searchResults.schemes.length + searchResults.documents.length + (query ? searchResults.chatItems.length : 0);

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header Search Box */}
        <header
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '28px',
          }}
        >
          <h1 style={{ fontSize: 'var(--font-size-2xl)', margin: '0 0 16px 0', color: 'var(--color-primary)' }}>
            Global Agricultural Search & Portal Discovery
          </h1>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                placeholder="Search across schemes, document requirements, loan terms, and AI FAQs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
                leftIcon={Search}
              />
            </div>

            <button
              type="button"
              onClick={toggleVoice}
              style={{
                height: '46px',
                padding: '0 16px',
                borderRadius: 'var(--radius-md)',
                border: isListening ? '2px solid var(--color-error)' : '1px solid var(--color-border)',
                backgroundColor: isListening ? 'var(--color-error-bg)' : 'var(--color-surface)',
                color: isListening ? 'var(--color-error)' : 'var(--color-primary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              <span style={{ fontSize: 'var(--font-size-xs)' }}>{isListening ? 'Listening...' : 'Voice'}</span>
            </button>
          </div>

          {/* Recent Searches Chips */}
          {recentSearches.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>
                Recent Searches:
              </span>
              {recentSearches.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    handleSearchSubmit(item);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setRecentSearches([])}
                style={{ background: 'transparent', border: 'none', fontSize: '11px', color: 'var(--color-error)', cursor: 'pointer' }}
              >
                Clear History
              </button>
            </div>
          )}
        </header>

        {/* Filter Tabs & Results */}
        {query.trim() !== '' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              {['All', 'Schemes', 'Documents', 'Advisory & FAQs'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    backgroundColor: activeTab === tab ? 'var(--color-primary-light)' : 'transparent',
                    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-xs)',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Found <strong>{totalResults}</strong> results matching "{query}"
            </span>

            {/* Scheme Results */}
            {(activeTab === 'All' || activeTab === 'Schemes') && searchResults.schemes.length > 0 && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                  <Landmark size={18} /> Scheme Matches ({searchResults.schemes.length})
                </h3>
                {searchResults.schemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    onClick={() => navigate(`/schemes/${scheme.id}`)}
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 'bold' }}>{scheme.category}</div>
                      <h4 style={{ fontSize: 'var(--font-size-md)', margin: '2px 0' }}>{scheme.title}</h4>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                        {scheme.benefit}
                      </p>
                    </div>
                    <ChevronRight size={20} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                ))}
              </section>
            )}

            {/* Document Results */}
            {(activeTab === 'All' || activeTab === 'Documents') && searchResults.documents.length > 0 && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)' }}>
                  <FileText size={18} /> Matching Document Rules ({searchResults.documents.length})
                </h3>
                {searchResults.documents.map((doc, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/schemes/${doc.schemeId}`)}
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>{doc.docName}</span>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        Required for: {doc.schemeTitle}
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
