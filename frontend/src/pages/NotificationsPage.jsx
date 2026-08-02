import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  Landmark,
  ShieldAlert,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useSchemes } from '../hooks/useSchemes';

export default function NotificationsPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const navigate = useNavigate();
  const toast = useToast();

  const initialNotifications = [
    {
      id: '1',
      title: 'PM-KISAN 17th Installment Announced',
      message: 'Direct Benefit Transfer of ₹2,000 for verified Aadhaar-linked accounts scheduled for next week.',
      category: 'Scheme Updates',
      date: '2 Hours Ago',
      read: false,
      link: '/schemes/pm-kisan',
    },
    {
      id: '2',
      title: 'PMFBY Kharif Enrollment Deadline Approaching',
      message: 'Enrollment deadline for Kharif 2026 crop insurance ends on August 31st. Complete your application now.',
      category: 'Deadline Reminders',
      date: '1 Day Ago',
      read: false,
      link: '/schemes/pmfby',
    },
    {
      id: '3',
      title: 'PM-KUSUM Solar Pump Subsidy Window Open',
      message: 'Uttar Pradesh State Agriculture Department released 10,000 new solar pump quotas.',
      category: 'Scheme Updates',
      date: '3 Days Ago',
      read: true,
      link: '/schemes/pm-kusum',
    },
    {
      id: '4',
      title: 'System Security Update: Mobile e-KYC mandatory',
      message: 'Please re-verify your Aadhaar OTP on the farmer profile tab to ensure smooth subsidy disbursements.',
      category: 'System',
      date: '5 Days Ago',
      read: true,
      link: '/profile',
    },
  ];

  const [notifications, setNotifications] = useState(initialNotifications);
  const [filterTab, setFilterTab] = useState('All');

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const markSingleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info('Notification deleted.');
  };

  const filtered = notifications.filter((n) => {
    if (filterTab === 'All') return true;
    return n.category === filterTab;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Bell size={24} style={{ color: 'var(--color-primary)' }} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-error)',
                    }}
                  />
                )}
              </div>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', margin: 0, color: 'var(--color-text-primary)' }}>
                Notifications & Deadline Alerts
              </h1>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
              Stay updated on subsidy release dates, scheme deadlines, and account alerts.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>
        </header>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['All', 'Deadline Reminders', 'Scheme Updates', 'System'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: filterTab === tab ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                color: filterTab === tab ? '#FFF' : 'var(--color-text-secondary)',
                fontWeight: filterTab === tab ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: 'var(--font-size-xs)',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <Bell size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                No notifications in this category.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => markSingleRead(item.id)}
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderLeft: `4px solid ${
                    !item.read
                      ? 'var(--color-primary)'
                      : 'var(--color-border)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  boxShadow: !item.read ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
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
                      {item.category}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{item.date}</span>
                    {!item.read && (
                      <span style={{ fontSize: '10px', color: 'var(--color-error)', fontWeight: 'bold' }}>• UNREAD</span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 'var(--font-size-md)', margin: '4px 0', color: 'var(--color-text-primary)' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {item.message}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.link && (
                    <Button
                      variant="text"
                      size="sm"
                      icon={ChevronRight}
                      onClick={() => navigate(item.link)}
                    >
                      View
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
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
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
