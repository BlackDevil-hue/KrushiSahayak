import React, { useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  MapPin,
  Sprout,
  ShieldCheck,
  Save,
  CheckCircle,
  Smartphone,
  Landmark,
  FileText,
} from 'lucide-react';
import { useSchemes } from '../hooks/useSchemes';

export default function ProfilePage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const { user, profile, updateProfile, loading } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: profile?.name || user?.name || 'Ramesh Kumar',
    phone: profile?.phone || user?.phone || '9876543210',
    state: profile?.state || 'Uttar Pradesh',
    district: profile?.district || 'Gorakhpur',
    village: profile?.village || 'Ramgarh',
    landSize: profile?.landSize || '2.5',
    farmerType: profile?.farmerType || 'Smallholder',
    crops: profile?.crops || 'Wheat, Paddy, Sugarcane',
    aadhaarNumber: profile?.aadhaarNumber || 'XXXX-XXXX-4589',
    bankAccount: profile?.bankAccount || 'XXXX-XXXX-9821',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Farmer profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Header Banner */}
        <header
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFF',
            borderRadius: 'var(--radius-card)',
            padding: '28px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-accent)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
            >
              {formData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', color: '#FFF', margin: 0 }}>
                {formData.name}
              </h1>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-light)', marginTop: '4px' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {formData.district}, {formData.state} | {formData.landSize} Acres ({formData.farmerType})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#FFF',
                fontSize: 'var(--font-size-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={16} /> Aadhaar Verified
            </span>
          </div>
        </header>

        {/* Profile Form Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <h3 style={{ fontSize: 'var(--font-size-lg)', margin: 0, color: 'var(--color-primary)' }}>
            Personal & Agriculture Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Mobile Number"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
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
              label="District"
              value={formData.district}
              onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
            />
            <Input
              label="Village / Tehsil"
              value={formData.village}
              onChange={(e) => setFormData((prev) => ({ ...prev, village: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Landholding (Acres)"
              type="number"
              step="0.1"
              value={formData.landSize}
              onChange={(e) => setFormData((prev) => ({ ...prev, landSize: e.target.value }))}
            />
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
          </div>

          <Input
            label="Primary Crops Grown"
            value={formData.crops}
            onChange={(e) => setFormData((prev) => ({ ...prev, crops: e.target.value }))}
            placeholder="e.g. Wheat, Paddy, Cotton, Pulses"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Aadhaar Card Number (Masked)"
              value={formData.aadhaarNumber}
              disabled
            />
            <Input
              label="Bank Account Number (Linked)"
              value={formData.bankAccount}
              disabled
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              disabled={loading}
            >
              {loading ? 'Saving Profile...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
