import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';
import { useSchemes, getBookmarkedSchemeIds, toggleBookmarkSchemeId, evaluateEligibility } from '../hooks/useSchemes';
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Landmark,
  Sparkles,
} from 'lucide-react';

export default function BookmarksPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const navigate = useNavigate();
  const toast = useToast();

  const [bookmarkedIds, setBookmarkedIds] = useState(() => getBookmarkedSchemeIds());

  const savedSchemes = SCHEMES_DATA.filter((s) => bookmarkedIds.includes(s.id));

  const handleRemoveBookmark = (id) => {
    const updated = toggleBookmarkSchemeId(id);
    setBookmarkedIds(updated);
    toast.info('Removed from saved bookmarks.');
  };

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <header
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
              <Bookmark size={22} fill="var(--color-accent)" />
              <h1 style={{ fontSize: 'var(--font-size-2xl)', margin: 0, color: 'var(--color-text-primary)' }}>
                Saved Government Schemes ({savedSchemes.length})
              </h1>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
              Quick access to your bookmarked agricultural schemes and subsidy programs.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate('/schemes')}>
            Explore More Schemes
          </Button>
        </header>

        {savedSchemes.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 24px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px border-dashed var(--color-border)',
            }}
          >
            <Bookmark size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: 'var(--font-size-lg)' }}>No saved schemes yet</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
              Click the bookmark icon on any scheme card to save it here for offline reference.
            </p>
            <Button
              variant="primary"
              size="md"
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/schemes')}
            >
              Browse Schemes Catalog
            </Button>
          </div>
        ) : (
          <div className="grid-2 gap-md">
            {savedSchemes.map((scheme) => (
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
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        fontWeight: 'bold',
                      }}
                    >
                      {scheme.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(scheme.id)}
                      title="Remove Bookmark"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-error)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3
                    style={{ fontSize: 'var(--font-size-md)', cursor: 'pointer', margin: '4px 0 8px 0' }}
                    onClick={() => navigate(`/schemes/${scheme.id}`)}
                  >
                    {scheme.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.5',
                      marginBottom: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {scheme.description}
                  </p>

                  <div
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'bold',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>{scheme.benefit}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
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
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ChevronRight}
                    iconPosition="right"
                    onClick={() => navigate(`/schemes/${scheme.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
