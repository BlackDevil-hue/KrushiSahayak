import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSchemes, getBookmarkedSchemeIds, toggleBookmarkSchemeId, evaluateEligibility } from '../hooks/useSchemes';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  FileCheck,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  User,
  Info,
} from 'lucide-react';

export default function EligibilityPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const toast = useToast();

  const initialSchemeId = searchParams.get('schemeId') || 'pm-kisan';

  const [formData, setFormData] = useState({
    schemeId: initialSchemeId,
    state: profile?.state || 'Uttar Pradesh',
    district: profile?.district || 'Gorakhpur',
    landSize: profile?.landSize || '2.5',
    farmerType: profile?.farmerType || 'Smallholder',
    income: '150000',
    crop: profile?.crops || 'Wheat, Paddy',
    aadhaarLinked: true,
    bankLinked: true,
  });

  const [evaluationResult, setEvaluationResult] = useState(null);

  // Keep schemeId in sync with URL searchParams
  useEffect(() => {
    const urlSchemeId = searchParams.get('schemeId');
    if (urlSchemeId && urlSchemeId !== formData.schemeId) {
      setFormData((prev) => ({ ...prev, schemeId: urlSchemeId }));
    }
  }, [searchParams]);

  const currentScheme = SCHEMES_DATA?.find((s) => s.id === formData.schemeId) || SCHEMES_DATA?.[0];

  // Sync evaluation on form submit or scheme change
  const handleEvaluate = (e) => {
    if (e) e.preventDefault();
    if (currentScheme) {
      const result = evaluateEligibility(formData, currentScheme);
      setEvaluationResult(result);
    }
  };

  useEffect(() => {
    handleEvaluate();
  }, [formData.schemeId, SCHEMES_DATA]);

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Page Title Header */}
        <header
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFF',
            padding: '28px',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', opacity: 0.9 }}>
            <Sparkles size={20} style={{ color: 'var(--color-accent)' }} />
            <span>AI Powered Rule Evaluation Engine</span>
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', color: '#FFF', margin: 0 }}>
            Interactive Subsidy & Scheme Eligibility Checker
          </h1>
          <p style={{ color: 'var(--color-primary-light)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            Check whether your land size, state, income, and documents match government scheme criteria.
          </p>
        </header>

        {/* Main Content Layout: Form on Left, Results on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Interactive Form Card */}
          <form
            onSubmit={handleEvaluate}
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ fontSize: 'var(--font-size-lg)', margin: 0, color: 'var(--color-primary)' }}>
              Farmer & Land Details
            </h3>

            {/* Scheme Selector */}
            <Select
              label="Select Government Scheme"
              value={formData.schemeId}
              onChange={(e) => setFormData((prev) => ({ ...prev, schemeId: e.target.value }))}
              options={(SCHEMES_DATA || []).map((s) => ({ value: s.id, label: s.title || s.name || s.id }))}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select
                label="State"
                value={formData.state}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                options={[
                  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
                  { value: 'Punjab', label: 'Punjab' },
                  { value: 'Maharashtra', label: 'Maharashtra' },
                  { value: 'Rajasthan', label: 'Rajasthan' },
                  { value: 'Haryana', label: 'Haryana' },
                  { value: 'Bihar', label: 'Bihar' },
                  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
                  { value: 'Gujarat', label: 'Gujarat' },
                ]}
              />

              <Input
                label="Landholding (Acres)"
                type="number"
                step="0.1"
                value={formData.landSize}
                onChange={(e) => setFormData((prev) => ({ ...prev, landSize: e.target.value }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select
                label="Farmer Category"
                value={formData.farmerType}
                onChange={(e) => setFormData((prev) => ({ ...prev, farmerType: e.target.value }))}
                options={[
                  { value: 'Marginal', label: 'Marginal (< 2.5 Acres)' },
                  { value: 'Smallholder', label: 'Smallholder (2.5 - 5 Acres)' },
                  { value: 'Medium', label: 'Medium (5 - 10 Acres)' },
                  { value: 'Large', label: 'Large (> 10 Acres)' },
                ]}
              />

              <Input
                label="Annual Income (₹)"
                type="number"
                value={formData.income}
                onChange={(e) => setFormData((prev) => ({ ...prev, income: e.target.value }))}
              />
            </div>

            {/* Checkbox Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '4px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.aadhaarLinked}
                  onChange={(e) => setFormData((prev) => ({ ...prev, aadhaarLinked: e.target.checked }))}
                />
                Aadhaar card linked with active mobile number
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.bankLinked}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bankLinked: e.target.checked }))}
                />
                Active Bank account linked with Aadhaar (DBT Enabled)
              </label>
            </div>

            <Button type="submit" variant="primary" size="md" icon={Sparkles}>
              Re-Evaluate Eligibility
            </Button>
          </form>

          {/* Results Card */}
          {evaluationResult && (
            <div
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {/* Status Header Badge & Score */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor:
                    evaluationResult.status === 'Eligible'
                      ? 'var(--color-success-bg)'
                      : evaluationResult.status === 'Partially Eligible'
                      ? 'var(--color-warning-bg)'
                      : 'var(--color-error-bg)',
                  border: `1px solid ${
                    evaluationResult.status === 'Eligible'
                      ? 'var(--color-success)'
                      : evaluationResult.status === 'Partially Eligible'
                      ? 'var(--color-warning)'
                      : 'var(--color-error)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {evaluationResult.status === 'Eligible' && <CheckCircle2 size={36} style={{ color: 'var(--color-success)' }} />}
                  {evaluationResult.status === 'Partially Eligible' && <AlertTriangle size={36} style={{ color: 'var(--color-warning)' }} />}
                  {evaluationResult.status === 'Not Eligible' && <XCircle size={36} style={{ color: 'var(--color-error)' }} />}
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>
                      Evaluation Outcome
                    </div>
                    <h3
                      style={{
                        fontSize: 'var(--font-size-xl)',
                        margin: 0,
                        color:
                          evaluationResult.status === 'Eligible'
                            ? 'var(--color-success)'
                            : evaluationResult.status === 'Partially Eligible'
                            ? 'var(--color-warning)'
                            : 'var(--color-error)',
                      }}
                    >
                      {evaluationResult.status}
                    </h3>
                  </div>
                </div>

                {/* Score Circle Gauge */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: 'bold',
                      color:
                        evaluationResult.score >= 80
                          ? 'var(--color-success)'
                          : evaluationResult.score >= 50
                          ? 'var(--color-warning)'
                          : 'var(--color-error)',
                    }}
                  >
                    {evaluationResult.score}%
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Match Score</span>
                </div>
              </div>

              {/* Progress score bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '4px' }}>
                  <span>Match Confidence</span>
                  <span>{evaluationResult.score} / 100</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${evaluationResult.score}%`,
                      backgroundColor:
                        evaluationResult.score >= 80
                          ? 'var(--color-success)'
                          : evaluationResult.score >= 50
                          ? 'var(--color-warning)'
                          : 'var(--color-error)',
                      transition: 'width 500ms ease',
                    }}
                  />
                </div>
              </div>

              {/* Rule Breakdown List */}
              <div>
                <h4 style={{ fontSize: 'var(--font-size-md)', marginBottom: '12px' }}>Rules Evaluation Breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {evaluationResult.reasons.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: `3px solid ${item.passed ? 'var(--color-success)' : 'var(--color-error)'}`,
                        fontSize: 'var(--font-size-xs)',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: item.passed ? 'var(--color-success)' : 'var(--color-error)', marginBottom: '2px' }}>
                        {item.passed ? '✓ Passed' : '✗ Failed'}: {item.rule}
                      </div>
                      <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{item.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Documents Warning */}
              {evaluationResult.missingDocs.length > 0 && (
                <div
                  style={{
                    padding: '14px',
                    backgroundColor: 'var(--color-warning-bg)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-warning)',
                  }}
                >
                  <h4 style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-warning)', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                    Missing / Action Items Needed
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {evaluationResult.missingDocs.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={FileCheck}
                  onClick={() => navigate(`/checklist?schemeId=${formData.schemeId}`)}
                >
                  Generate Document Checklist
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={MessageSquare}
                  onClick={() => navigate(`/chat?prompt=Help me prepare documents for ${currentScheme.title}`)}
                >
                  Ask AI Chat Assistant
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
