import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import { useToast } from '../context/ToastContext';
import { useSchemes, getBookmarkedSchemeIds, toggleBookmarkSchemeId, evaluateEligibility } from '../hooks/useSchemes';
import {
  FileCheck,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function ChecklistPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const schemeId = searchParams.get('schemeId') || 'pm-kisan';
  const scheme = SCHEMES_DATA.find((s) => s.id === schemeId) || SCHEMES_DATA[0];

  const defaultItems = [
    { id: '1', name: 'Aadhaar Card (Linked with Mobile)', required: true, completed: true, status: 'Verified' },
    { id: '2', name: 'Land Record Extract (Khasra / Khatauni / 7-12)', required: true, completed: false, status: 'Pending' },
    { id: '3', name: 'Active Bank Passbook (DBT Enabled)', required: true, completed: true, status: 'Verified' },
    { id: '4', name: 'Passport Size Photograph (Recent)', required: false, completed: false, status: 'Pending' },
    { id: '5', name: 'Soil Test Report (Optional)', required: false, completed: false, status: 'Optional' },
  ];

  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem(`krishi_checklist_${schemeId}`);
      return saved ? JSON.parse(saved) : defaultItems;
    } catch (e) {
      return defaultItems;
    }
  });

  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(`krishi_checklist_${schemeId}`, JSON.stringify(checklist));
    } catch (e) {
      console.error(e);
    }
  }, [checklist, schemeId]);

  const toggleCheck = (id) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed, status: !item.completed ? 'Verified' : 'Pending' } : item
      )
    );
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      required: false,
      completed: false,
      status: 'Pending',
    };
    setChecklist((prev) => [...prev, newItem]);
    setNewItemName('');
    toast.success('Added custom document to checklist!');
  };

  const removeItem = (id) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
    toast.info('Item removed.');
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const progressPercent = Math.round((completedCount / (checklist.length || 1)) * 100);

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <header
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '4px' }}>
                <FileCheck size={22} />
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Target Scheme: {scheme.title}
                </span>
              </div>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', margin: 0, color: 'var(--color-text-primary)' }}>
                Application Document Verification Checklist
              </h1>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => toast.info('Checklist exported for printing!')}
            >
              Export Printable Checklist
            </Button>
          </div>

          {/* Dynamic Progress Bar */}
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                Checklist Readiness: {completedCount} of {checklist.length} Verified
              </span>
              <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {progressPercent}%
              </span>
            </div>

            <div style={{ height: '10px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  backgroundColor: progressPercent === 100 ? 'var(--color-success)' : 'var(--color-primary)',
                  transition: 'width 300ms ease',
                }}
              />
            </div>
          </div>
        </header>

        {/* Add Custom Document Form */}
        <form
          onSubmit={handleAddItem}
          style={{
            display: 'flex',
            gap: '12px',
            backgroundColor: 'var(--color-surface-elevated)',
            padding: '16px',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              type="text"
              placeholder="Add another required document (e.g. Irrigation NOC, Caste Certificate)..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" size="md" icon={Plus}>
            Add Item
          </Button>
        </form>

        {/* Checklist Items Container */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: item.completed ? 'var(--color-success-bg)' : 'var(--color-surface)',
                border: `1px solid ${item.completed ? 'var(--color-success)' : 'var(--color-border)'}`,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ color: item.completed ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {item.completed ? <CheckSquare size={22} /> : <Square size={22} />}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      textDecoration: item.completed ? 'line-through' : 'none',
                      color: item.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    }}
                  >
                    {item.name}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {item.required ? 'Mandatory Requirement' : 'Optional Support Doc'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: item.completed ? 'var(--color-success)' : 'var(--color-surface-variant)',
                    color: item.completed ? '#FFF' : 'var(--color-text-secondary)',
                    fontWeight: 'bold',
                  }}
                >
                  {item.status}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
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
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
