import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Landmark,
  Sparkles,
  MessageSquare,
  FileText,
  FileCheck,
  Bookmark,
  Bell,
  Search,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Govt Schemes', path: '/schemes', icon: Landmark },
    { label: 'Check Eligibility', path: '/eligibility', icon: Sparkles },
    { label: 'AI Voice Chat', path: '/chat', icon: MessageSquare },
    { label: 'OCR Explainer', path: '/explainer', icon: FileText },
    { label: 'Doc Checklist', path: '/checklist', icon: FileCheck },
    { label: 'Saved Schemes', path: '/bookmarks', icon: Bookmark },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Farmer Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: collapsed ? '72px' : '260px',
        backgroundColor: 'var(--color-surface-elevated)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: '64px',
        transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 'var(--z-sidebar)',
      }}
    >
      {/* Collapse Toggle */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main Navigation List */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: collapsed ? '12px' : '10px 14px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  })}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ fontSize: 'var(--font-size-sm)' }}>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Profile Summary Card */}
      {isAuthenticated && !collapsed && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Farmer User'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                {profile?.state ? `${profile.state}, India` : 'Registered Farmer'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              color: 'var(--color-error)',
              fontSize: '11px',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .desktop-sidebar {
            display: none !important;
          }
        }
        .sidebar-link:hover:not(.active) {
          background-color: var(--color-surface) !important;
          color: var(--color-text-primary) !important;
        }
      `}</style>
    </aside>
  );
}
