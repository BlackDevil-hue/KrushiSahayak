import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { ExternalLink, ShieldAlert } from 'lucide-react';

export default function ExternalLinkModal({
  isOpen,
  onClose,
  targetUrl,
  portalName = 'Official Government Portal',
  description = 'You are about to be redirected to an external government portal.',
}) {
  const handleProceed = () => {
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="External Portal Navigation"
      size="md"
      footerActions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={ExternalLink} iconPosition="right" onClick={handleProceed}>
            Proceed to Site
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldAlert size={28} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>{portalName}</h4>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {description}
          </p>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              wordBreak: 'break-all',
              color: 'var(--color-primary)',
              fontFamily: 'monospace',
            }}
          >
            {targetUrl}
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
            Note: KrishiSahayak is not responsible for external content or privacy policies.
          </p>
        </div>
      </div>
    </Modal>
  );
}
