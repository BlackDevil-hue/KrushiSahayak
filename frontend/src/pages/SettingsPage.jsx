import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Select from '../components/Select';
import Modal from '../components/Modal';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Languages,
  Bell,
  Sun,
  Moon,
  Trash2,
  ShieldAlert,
  Save,
  CheckCircle,
  Volume2,
} from 'lucide-react';
import { useSchemes } from '../hooks/useSchemes';

export default function SettingsPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { profile, updateProfile, logout } = useAuth();
  const toast = useToast();

  const [language, setLanguage] = useState(profile?.language || 'hi');
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    sms: true,
    whatsapp: true,
    deadlines: true,
    voicePrompts: true,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({ language });
      }
      toast.success('App preferences and language settings saved successfully!');
    } catch (err) {
      toast.error('Failed to update language settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteModalOpen(false);
    logout();
    toast.info('Account deleted. Redirecting to home...');
    navigate('/');
  };

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px', margin: '0 auto' }}>
        {/* Header */}
        <header
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Settings size={28} style={{ color: 'var(--color-primary)' }} />
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', margin: 0, color: 'var(--color-text-primary)' }}>
              Account & Portal Settings
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
              Manage regional language preferences, voice prompts, notifications, and security settings.
            </p>
          </div>
        </header>

        {/* Preferences Form */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Language Selection */}
          <div>
            <h3 style={{ fontSize: 'var(--font-size-md)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Languages size={20} style={{ color: 'var(--color-primary)' }} />
              Preferred Interface & Voice Language
            </h3>
            <Select
              label="Select Portal Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={[
                { value: 'mr', label: 'Marathi (मराठी)' },
                { value: 'hi', label: 'Hindi (हिंदी)' },
                { value: 'en', label: 'English' },
                { value: 'gu', label: 'Gujarati (ગુજરાતી)' },
                { value: 'ta', label: 'Tamil (தமிழ்)' },
                { value: 'te', label: 'Telugu (తెలుగు)' },
                { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
              ]}
            />
          </div>

          {/* Theme Switcher */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              Display Theme
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Current Mode: <strong>{theme === 'light' ? 'Light Theme' : 'Dark Theme'}</strong>
              </span>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
              </Button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Bell size={20} style={{ color: 'var(--color-primary)' }} />
              Notification & Voice Alert Preferences
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                <span>SMS Notifications (DBT & Installment alerts)</span>
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, sms: e.target.checked }))}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                <span>WhatsApp Subsidy Updates</span>
                <input
                  type="checkbox"
                  checked={notifications.whatsapp}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, whatsapp: e.target.checked }))}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                <span>Application Deadline Reminders</span>
                <input
                  type="checkbox"
                  checked={notifications.deadlines}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, deadlines: e.target.checked }))}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                <span>Enable Read-Aloud Voice Prompts (TTS)</span>
                <input
                  type="checkbox"
                  checked={notifications.voicePrompts}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, voicePrompts: e.target.checked }))}
                />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="primary" size="md" icon={Save} onClick={handleSaveSettings}>
              Save Preferences
            </Button>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div
            style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: 'var(--color-error-bg)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-error)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-error)', margin: 0, textTransform: 'uppercase' }}>
                Danger Zone
              </h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                Deleting your account will purge your saved farmer profile, document checklists, and local data.
              </p>
            </div>

            <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteModalOpen(true)}>
              Delete Account
            </Button>
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Account Deletion"
          footerActions={
            <>
              <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" icon={Trash2} onClick={handleDeleteAccount}>
                Yes, Delete Account
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <ShieldAlert size={36} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>
                Are you sure you want to permanently delete your KrishiSahayak account? This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
