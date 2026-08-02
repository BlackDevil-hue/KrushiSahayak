import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Clock,
  ShieldCheck,
  Eye,
  RefreshCw,
} from 'lucide-react';

import { useSchemes } from '../hooks/useSchemes';

export default function DocumentExplainerPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const navigate = useNavigate();
  const toast = useToast();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleFileUpload = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setIsProcessing(true);
    toast.info(`Processing ${file.name} with AI OCR...`);

    // Simulate authentic OCR Extraction & AI Summarization
    setTimeout(() => {
      setIsProcessing(false);
      setExtractedData({
        documentTitle: file.name.replace(/\.[^/.]+$/, '') || 'Government Circular Document',
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        rawOcrText: `PRADHAN MANTRI KRISHI SINCHAYEE YOJANA (PMKSY) - PER DROP MORE CROP GUIDELINES 2026.
Department of Agriculture and Farmers Welfare, Govt of India.
Section 3.1: Financial Assistance & Subsidy: Small and Marginal farmers shall receive up to 55% subsidy for installation of drip & sprinkler micro-irrigation systems. Other general category farmers receive 45%.
Section 4.2: Mandatory Documents: 
1. Land ownership 7/12 extract or 8A certificate
2. Aadhaar card of applicant farmer
3. Bank passbook copy with IFSC
4. Water source verification certificate
Deadline for application submission is 30th August 2026.`,
        summary: {
          schemeName: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
          category: 'Micro-Irrigation Subsidy',
          subsidyBenefit: '55% Subsidy for Small/Marginal Farmers, 45% for Others',
          deadline: '30th August 2026',
          extractedEligibility: [
            'Applicant must own cultivable land with valid 7/12 land record',
            'Must have an operational water source (borewell, well, or canal)',
            'Maximum land ceiling covered under subsidy is 5.0 Hectares',
          ],
          extractedDocuments: [
            'Land ownership 7/12 extract or 8A certificate',
            'Aadhaar card of applicant farmer',
            'Bank passbook copy with IFSC Code',
            'Water source electricity / verification certificate',
          ],
        },
      });
      toast.success('OCR Text & AI Summary extracted successfully!');
    }, 1500);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <FileText size={24} style={{ color: 'var(--color-primary)' }} />
            <h1 style={{ fontSize: 'var(--font-size-2xl)', margin: 0, color: 'var(--color-primary)' }}>
              PDF & Image Document Explainer (OCR + AI)
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            Upload government notices, application forms, or land documents in PDF or Image format to automatically extract benefits, eligibility rules, and required documents.
          </p>
        </header>

        {/* Dropzone Upload Box */}
        {!extractedData && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              border: '2px dashed var(--color-primary)',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--color-surface)',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UploadCloud size={32} />
              </div>

              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>
                  Drag & Drop Document File Here or <span style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Browse</span>
                </h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Supports PDF, PNG, JPG (Govt circulars, land records, policy pamphlets)
                </p>
              </div>

              {isProcessing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  <Sparkles size={18} className="pulse-animation" />
                  <span>Processing document OCR & generating AI breakdown...</span>
                </div>
              )}
            </label>
          </div>
        )}

        {/* Extracted Results View */}
        {extractedData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
                  File: {extractedData.documentTitle} ({extractedData.fileSize})
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={() => {
                  setSelectedFile(null);
                  setExtractedData(null);
                }}
              >
                Upload Another Document
              </Button>
            </div>

            <div className="grid-2 gap-md">
              {/* AI Key Insights Breakdown */}
              <div
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                  <Sparkles size={20} />
                  <h3 style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>AI Extracted Key Insights</h3>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 'bold' }}>IDENTIFIED SCHEME</span>
                  <h4 style={{ fontSize: 'var(--font-size-md)', margin: '2px 0 0 0', color: 'var(--color-primary)' }}>
                    {extractedData.summary.schemeName}
                  </h4>
                  <div style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px', color: 'var(--color-text-secondary)' }}>
                    <strong>Subsidy:</strong> {extractedData.summary.subsidyBenefit}
                  </div>
                </div>

                {/* Eligibility extracted */}
                <div>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    Extracted Eligibility Rules
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 'var(--font-size-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {extractedData.summary.extractedEligibility.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>

                {/* Required Documents extracted */}
                <div>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    Extracted Document Checklist
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 'var(--font-size-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {extractedData.summary.extractedDocuments.map((doc, i) => (
                      <li key={i}>{doc}</li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={FileCheck}
                  onClick={() => {
                    toast.success('Extracted document items saved to your checklist!');
                    navigate('/checklist');
                  }}
                >
                  Save to My Document Checklist
                </Button>
              </div>

              {/* Raw OCR Text View */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={18} />
                  Raw OCR Extracted Text
                </h3>
                <textarea
                  readOnly
                  value={extractedData.rawOcrText}
                  style={{
                    width: '100%',
                    height: '240px',
                    padding: '12px',
                    fontSize: 'var(--font-size-xs)',
                    fontFamily: 'monospace',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    resize: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
