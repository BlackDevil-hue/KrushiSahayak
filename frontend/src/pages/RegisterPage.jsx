import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, MapPin, Wheat, Scale, ShieldCheck, CheckCircle2, Save } from 'lucide-react';
import { useSchemes } from '../hooks/useSchemes';

export default function RegisterPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const { user, profile, updateProfile, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: profile?.name || user?.name || '',
    phone: profile?.phone || user?.phone || '',
    state: profile?.state || '',
    district: profile?.district || '',
    cropTypes: profile?.cropTypes || [],
    landSize: profile?.landSize || '',
    incomeBracket: profile?.incomeBracket || '',
    category: profile?.category || 'General',
    gender: profile?.gender || 'Male',
    age: profile?.age || '',
    farmerType: profile?.farmerType || 'Smallholder',
    language: profile?.language || 'hi',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const availableCrops = [
    'Wheat',
    'Rice',
    'Cotton',
    'Sugarcane',
    'Pulses',
    'Maize',
    'Mustard',
    'Soybean',
    'Vegetables',
    'Fruits',
    'Spices',
  ];

  const statesList = [
    'Punjab',
    'Haryana',
    'Uttar Pradesh',
    'Madhya Pradesh',
    'Maharashtra',
    'Rajasthan',
    'Bihar',
    'West Bengal',
    'Karnataka',
    'Tamil Nadu',
    'Gujarat',
    'Andhra Pradesh',
    'Telangana',
    'Odisha',
  ];

  // Auto-calculate recommended farmer type based on land size
  useEffect(() => {
    if (formData.landSize) {
      const acreage = parseFloat(formData.landSize);
      if (!isNaN(acreage)) {
        if (acreage < 2.5) {
          setFormData((prev) => ({ ...prev, farmerType: 'Marginal' }));
        } else if (acreage >= 2.5 && acreage < 5.0) {
          setFormData((prev) => ({ ...prev, farmerType: 'Smallholder' }));
        } else if (acreage >= 5.0 && acreage <= 10.0) {
          setFormData((prev) => ({ ...prev, farmerType: 'Medium' }));
        } else if (acreage > 10.0) {
          setFormData((prev) => ({ ...prev, farmerType: 'Large' }));
        }
      }
    }
  }, [formData.landSize]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleCrop = (crop) => {
    setFormData((prev) => {
      const exists = prev.cropTypes.includes(crop);
      const updated = exists
        ? prev.cropTypes.filter((c) => c !== crop)
        : [...prev.cropTypes, crop];
      return { ...prev, cropTypes: updated };
    });
    if (errors.cropTypes) {
      setErrors((prev) => ({ ...prev, cropTypes: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim() || formData.phone.length < 10)
      newErrors.phone = 'Valid 10-digit phone number is required';
    if (!formData.state) newErrors.state = 'Please select your state';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.landSize || isNaN(formData.landSize) || parseFloat(formData.landSize) <= 0)
      newErrors.landSize = 'Valid land size in acres is required';
    if (formData.cropTypes.length === 0)
      newErrors.cropTypes = 'Select at least one crop type';
    if (!formData.incomeBracket) newErrors.incomeBracket = 'Income bracket is required';
    if (!formData.age || isNaN(formData.age) || parseInt(formData.age, 10) < 18)
      newErrors.age = 'Age must be 18 or above';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form before submitting', 'Form Error');
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile(formData);
      toast.success('Farmer profile saved successfully!', 'Registration Complete');
      // Replace location to Dashboard immediately
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to save profile', 'Server Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 0 48px 0' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User style={{ color: 'var(--color-primary)' }} />
            {profile ? 'Manage Farmer Profile' : 'Farmer Registration & Profile'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Complete your profile to receive personalized government scheme recommendations, crop advisories, and local market alerts.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Section 1: Basic Information */}
            <Card title="1. Personal Details" icon={User} elevation="shadow-sm" padding="lg">
              <div className="grid-2 gap-md">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ramesh Singh"
                  required
                  error={errors.name}
                />
                <Input
                  label="Mobile Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  required
                  error={errors.phone}
                />
              </div>

              <div className="grid-3 gap-md" style={{ marginTop: '16px' }}>
                <Input
                  label="Age (Years)"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="e.g. 42"
                  min="18"
                  max="100"
                  required
                  error={errors.age}
                />
                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                  ]}
                />
                <Select
                  label="Social Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  options={[
                    { value: 'General', label: 'General' },
                    { value: 'OBC', label: 'OBC (Other Backward Class)' },
                    { value: 'SC', label: 'SC (Scheduled Caste)' },
                    { value: 'ST', label: 'ST (Scheduled Tribe)' },
                  ]}
                />
                <Select
                  label="Preferred Language (फसल व योजना भाषा)"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  options={[
                    { value: 'hi', label: 'Hindi (हिंदी)' },
                    { value: 'mr', label: 'Marathi (मराठी)' },
                    { value: 'en', label: 'English' },
                    { value: 'gu', label: 'Gujarati (ગુજરાતી)' },
                    { value: 'ta', label: 'Tamil (தமிழ்)' },
                    { value: 'te', label: 'Telugu (తెలుగు)' },
                    { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
                  ]}
                />
              </div>
            </Card>

            {/* Section 2: Location & Landholding */}
            <Card title="2. Location & Land Details" icon={MapPin} elevation="shadow-sm" padding="lg">
              <div className="grid-2 gap-md">
                <Select
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  options={statesList}
                  placeholder="Select State"
                  required
                  error={errors.state}
                />
                <Input
                  label="District / Block"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="e.g. Ludhiana / Karnal"
                  required
                  error={errors.district}
                />
              </div>

              <div className="grid-3 gap-md" style={{ marginTop: '16px' }}>
                <Input
                  label="Land Size (Acres)"
                  name="landSize"
                  type="number"
                  step="0.1"
                  value={formData.landSize}
                  onChange={handleInputChange}
                  placeholder="e.g. 3.5"
                  required
                  error={errors.landSize}
                  helperText="Total agricultural land owned or leased"
                />

                <Select
                  label="Farmer Classification"
                  name="farmerType"
                  value={formData.farmerType}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Marginal', label: 'Marginal (< 2.5 acres)' },
                    { value: 'Smallholder', label: 'Smallholder (2.5 - 5 acres)' },
                    { value: 'Medium', label: 'Medium (5 - 10 acres)' },
                    { value: 'Large', label: 'Large (> 10 acres)' },
                  ]}
                  helperText="Auto-suggested based on land size"
                />

                <Select
                  label="Annual Household Income"
                  name="incomeBracket"
                  value={formData.incomeBracket}
                  onChange={handleInputChange}
                  placeholder="Select Income Bracket"
                  options={[
                    { value: '< 1 Lakh', label: '< ₹1 Lakh per year' },
                    { value: '1-3 Lakhs', label: '₹1 - 3 Lakhs per year' },
                    { value: '3-5 Lakhs', label: '₹3 - 5 Lakhs per year' },
                    { value: '> 5 Lakhs', label: '> ₹5 Lakhs per year' },
                  ]}
                  required
                  error={errors.incomeBracket}
                />
              </div>
            </Card>

            {/* Section 3: Crops Cultivated */}
            <Card title="3. Primary Crops Cultivated" icon={Wheat} elevation="shadow-sm" padding="lg">
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Select all major crops you grow to receive customized APMC price alerts and disease advisories:
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {availableCrops.map((crop) => {
                  const isSelected = formData.cropTypes.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleCrop(crop)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-background)',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                        fontWeight: isSelected ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: 'var(--font-size-sm)',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {isSelected && <CheckCircle2 size={16} />}
                      {crop}
                    </button>
                  );
                })}
              </div>
              {errors.cropTypes && <div className="form-error" style={{ marginTop: '12px' }}>{errors.cropTypes}</div>}
            </Card>

            {/* Submit Action Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '16px',
                padding: '16px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                icon={Save}
                iconPosition="left"
              >
                Save Farmer Profile
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
