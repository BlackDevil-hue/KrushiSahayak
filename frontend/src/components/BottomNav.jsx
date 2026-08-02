import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Landmark, Sparkles, MessageSquare, User } from 'lucide-react';

export default function BottomNav() {
  const tabs = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Schemes', path: '/schemes', icon: Landmark },
    { label: 'Eligibility', path: '/eligibility', icon: Sparkles },
    { label: 'AI Chat', path: '/chat', icon: MessageSquare },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'var(--color-surface-elevated)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 'var(--z-bottom-nav)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              flex: 1,
              height: '100%',
              textDecoration: 'none',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '11px',
              fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
              transition: 'color var(--transition-fast)',
            })}
          >
            {({ isActive }) => (
              <>
                <div
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color var(--transition-fast)',
                  }}
                >
                  <Icon size={20} style={{ color: isActive ? 'var(--color-primary)' : 'currentColor' }} />
                </div>
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        );
      })}

      <style>{`
        @media (min-width: 768px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
