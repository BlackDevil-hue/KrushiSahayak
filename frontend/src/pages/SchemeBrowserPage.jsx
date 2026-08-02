import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { useToast } from '../context/ToastContext';
import { useSchemes, getBookmarkedSchemeIds, toggleBookmarkSchemeId, evaluateEligibility } from '../hooks/useSchemes';
import { createSTTListener, isSTTSupported } from '../services/speechService';
import {
  Search,
  Mic,
  MicOff,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function SchemeBrowserPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const navigate = useNavigate();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDeadlineStatus, setSelectedDeadlineStatus] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [bookmarks, setBookmarks] = useState(() => getBookmarkedSchemeIds());
  const [isListening, setIsListening] = useState(false);

  // Web Speech STT Setup
  useEffect(() => {
    let stt;
    if (isListening && isSTTSupported()) {
      stt = createSTTListener({
        lang: 'hi-IN',
        onResult: (transcript) => {
          setSearchTerm(transcript);
        },
        onError: (err) => {
          toast.error('Voice search failed or permission denied.');
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

  const toggleVoiceSearch = () => {
    if (!isSTTSupported()) {
      toast.warning('Web Speech API is not supported in your browser.');
      return;
    }
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      toast.info('Listening... Speak your query (Hindi/English).');
    }
  };

  const handleBookmarkToggle = (e, schemeId) => {
    e.stopPropagation();
    const updated = toggleBookmarkSchemeId(schemeId);
    setBookmarks(updated);
    if (updated.includes(schemeId)) {
      toast.success('Scheme saved to bookmarks!');
    } else {
      toast.info('Scheme removed from bookmarks.');
    }
  };

  // Unique categories & states for filter options
  const categories = useMemo(() => {
    const set = new Set(SCHEMES_DATA.map((s) => s.category));
    return ['All', ...Array.from(set)];
  }, []);

  const states = useMemo(() => {
    const set = new Set(SCHEMES_DATA.map((s) => s.state));
    return ['All', 'All India', ...Array.from(set)];
  }, []);

  // Filter & Sort Logic
  const filteredSchemes = useMemo(() => {
    return SCHEMES_DATA.filter((scheme) => {
      const matchesSearch =
        scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
      const matchesState =
        selectedState === 'All' ||
        scheme.state === selectedState ||
        scheme.state === 'All India';

      const matchesDeadline =
        selectedDeadlineStatus === 'All' || scheme.deadlineStatus === selectedDeadlineStatus;

      return matchesSearch && matchesCategory && matchesState && matchesDeadline;
    }).sort((a, b) => {
      if (sortBy === 'amount-desc') {
        return b.amountValue - a.amountValue;
      }
      if (sortBy === 'deadline-asc') {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortBy === 'name-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0; // relevance
    });
  }, [searchTerm, selectedCategory, selectedState, selectedDeadlineStatus, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage) || 1;
  const paginatedSchemes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSchemes.slice(start, start + itemsPerPage);
  }, [filteredSchemes, currentPage]);

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Section */}
        <header
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', margin: 0, color: 'var(--color-primary)' }}>
                Government Agriculture Schemes Browser
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                Discover central and state government subsidies, crop insurance, and financial support.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                icon={Bookmark}
                onClick={() => navigate('/bookmarks')}
              >
                Saved Schemes ({bookmarks.length})
              </Button>
            </div>
          </div>

          {/* Search & Voice Integration */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Input
                type="text"
                placeholder="Search schemes by name, keyword, or crop (e.g. PM-KISAN, Solar Pump, Organic)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={Search}
              />
            </div>
            <button
              type="button"
              onClick={toggleVoiceSearch}
              title={isListening ? 'Stop voice search' : 'Start voice search'}
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
                transition: 'all var(--transition-fast)',
              }}
            >
              {isListening ? <MicOff size={20} className="pulse-animation" /> : <Mic size={20} />}
              <span style={{ fontSize: 'var(--font-size-xs)' }}>{isListening ? 'Listening...' : 'Voice'}</span>
            </button>
          </div>

          {/* Filter Bar Controls */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div>
              <Select
                label="Category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                options={categories.map((c) => ({ value: c, label: c }))}
              />
            </div>
            <div>
              <Select
                label="State"
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setCurrentPage(1);
                }}
                options={states.map((s) => ({ value: s, label: s }))}
              />
            </div>
            <div>
              <Select
                label="Status"
                value={selectedDeadlineStatus}
                onChange={(e) => {
                  setSelectedDeadlineStatus(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Active', label: 'Active Schemes' },
                  { value: 'Ending Soon', label: 'Ending Soon' },
                  { value: 'Expired', label: 'Expired' },
                ]}
              />
            </div>
            <div>
              <Select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'relevance', label: 'Relevance' },
                  { value: 'amount-desc', label: 'Benefit: High to Low' },
                  { value: 'deadline-asc', label: 'Deadline: Nearest First' },
                  { value: 'name-asc', label: 'Name: A to Z' },
                ]}
              />
            </div>
          </div>
        </header>

        {/* Scheme Grid Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Showing <strong>{filteredSchemes.length}</strong> matching agriculture schemes
            </span>
          </div>

          {filteredSchemes.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-card)',
                border: '1px border-dashed var(--color-border)',
              }}
            >
              <Filter size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: 'var(--font-size-lg)' }}>No matching schemes found</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                Try adjusting your search terms or filter criteria.
              </p>
              <Button
                variant="outline"
                size="sm"
                style={{ marginTop: '16px' }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedState('All');
                  setSelectedDeadlineStatus('All');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid-2 gap-md">
              {paginatedSchemes.map((scheme) => {
                const isSaved = bookmarks.includes(scheme.id);
                return (
                  <div
                    key={scheme.id}
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-card)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: 'var(--shadow-xs)',
                      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                    }}
                  >
                    <div>
                      {/* Top Badges & Bookmark button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                              fontWeight: '600',
                            }}
                          >
                            {scheme.category}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--color-surface)',
                              color: 'var(--color-text-secondary)',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            {scheme.state}
                          </span>
                          {scheme.deadlineStatus === 'Ending Soon' && (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'var(--color-warning-bg)',
                                color: 'var(--color-warning)',
                                fontWeight: '600',
                              }}
                            >
                              <Clock size={10} style={{ display: 'inline', marginRight: '4px' }} />
                              Ending Soon
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleBookmarkToggle(e, scheme.id)}
                          aria-label="Toggle Bookmark"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: isSaved ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            padding: '4px',
                          }}
                        >
                          {isSaved ? <BookmarkCheck size={22} fill="var(--color-accent)" /> : <Bookmark size={22} />}
                        </button>
                      </div>

                      <h3
                        style={{
                          fontSize: 'var(--font-size-md)',
                          marginBottom: '8px',
                          color: 'var(--color-text-primary)',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/schemes/${scheme.id}`)}
                      >
                        {scheme.title}
                      </h3>

                      <p
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-secondary)',
                          lineHeight: '1.5',
                          marginBottom: '16px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {scheme.description}
                      </p>

                      {/* Key Benefit Banner */}
                      <div
                        style={{
                          padding: '10px 12px',
                          backgroundColor: 'var(--color-surface)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-primary)',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <ShieldCheck size={16} />
                        <span>Benefit: {scheme.benefit}</span>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--color-border)',
                      }}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/eligibility?schemeId=${scheme.id}`)}
                      >
                        Check Eligibility
                      </Button>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {scheme.applicationUrl && (
                          <a
                            href={scheme.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--color-surface)',
                              border: '1px solid var(--color-border)',
                              fontSize: '12px',
                              color: 'var(--color-primary)',
                              textDecoration: 'none',
                              fontWeight: '600',
                            }}
                          >
                            <ExternalLink size={14} /> Official Site
                          </a>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ChevronRight}
                          iconPosition="right"
                          onClick={() => navigate(`/schemes/${scheme.id}`)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
