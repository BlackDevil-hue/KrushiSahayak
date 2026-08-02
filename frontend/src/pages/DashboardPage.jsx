import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import ExternalLinkModal from '../components/ExternalLinkModal';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  Landmark,
  Stethoscope,
  ExternalLink,
  ChevronRight,
  User,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {

  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [externalModal, setExternalModal] = useState({
    isOpen: false,
    targetUrl: '',
    portalName: '',
    description: '',
  });

  const openPortal = (url, name, desc) => {
    setExternalModal({
      isOpen: true,
      targetUrl: url,
      portalName: name,
      description: desc,
    });
  };

  const farmerName = profile?.name || user?.name || 'Farmer';
  const locationText = profile?.district && profile?.state ? `${profile.district}, ${profile.state}` : 'India';

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Welcome Header Banner */}
        <section
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9, fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>
              <Sprout size={18} style={{ color: 'var(--color-accent)' }} />
              Welcome to KrishiSahayak Dashboard
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', color: '#FFFFFF', margin: 0 }}>
              Namaste, {farmerName}!
            </h1>
            <p style={{ color: 'var(--color-primary-light)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
              Location: <strong>{locationText}</strong> | Landholding: <strong>{profile?.landSize || '2.5'} Acres</strong> ({profile?.farmerType || 'Smallholder'})
            </p>
          </div>

          <Button
            variant="accent"
            size="md"
            icon={User}
            onClick={() => navigate('/register')}
          >
            Edit Profile
          </Button>
        </section>

        {/* Farmer Profile Status Banner */}
        {(!profile || !profile.state) && (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning)',
              borderRadius: 'var(--radius-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={22} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                  Complete Your Farmer Profile
                </strong>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                  Please fill out state, district, crop types, and landholding to get accurate subsidy matching.
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
              Complete Profile Now
            </Button>
          </div>
        )}

        {/* Quick Action Hub */}
        <section className="grid-4 gap-md">
          <Card
            hoverable
            title="Govt Schemes"
            subtitle="Explore 120+ Subsidy Schemes"
            icon={Landmark}
            onClick={() => navigate('/schemes')}
          >
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              PM-KISAN, PMFBY, KCC, Fertilizer Subsidies matched for your profile.
            </p>
          </Card>



          <Card
            hoverable
            title="AI Advisory"
            subtitle="Crop Disease & Soil Health"
            icon={Stethoscope}
            onClick={() => navigate('/advisory')}
          >
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Upload crop images for pest diagnosis or consult expert agronomists.
            </p>
          </Card>


        </section>

        {/* Quick Portal External Redirect Links */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>Official Government Portals</h3>
          <div className="grid-3 gap-md">
            <Card
              elevation="outline"
              title="PM-KISAN Samman Nidhi"
              subtitle="Direct Benefit Transfer Portal"
              actions={
                <Button
                  variant="text"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() =>
                    openPortal(
                      'https://pmkisan.gov.in',
                      'PM-KISAN Portal',
                      'Official Direct Benefit Transfer portal for Indian Farmers.'
                    )
                  }
                />
              }
            >
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Check installment status, e-KYC status, and beneficiary lists.
              </p>
            </Card>



            <Card
              elevation="outline"
              title="PM Fasal Bima Yojana"
              subtitle="Crop Insurance Portal"
              actions={
                <Button
                  variant="text"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() =>
                    openPortal(
                      'https://pmfby.gov.in',
                      'PMFBY Portal',
                      'Official Pradhan Mantri Fasal Bima Yojana crop insurance portal.'
                    )
                  }
                />
              }
            >
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Calculate premium rates, file claim applications, and track claim status.
              </p>
            </Card>
          </div>
        </section>

        {/* Modal for External Redirect */}
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
