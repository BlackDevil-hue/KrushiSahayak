import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Sprout, User, LogOut, LogIn, Menu, X, UserPlus, Home, LayoutDashboard, Sparkles, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';

export default function Header({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--color-surface-elevated)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-header)',
        boxShadow: 'var(--shadow-sm)',
        width: '100%',
      }}
    >
      {/* Brand & Hamburger Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '6px',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sprout size={20} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
            KrishiSahayak
          </span>
        </Link>
      </div>

      {/* Right Controls (Theme Toggle & Auth) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            padding: '8px',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color var(--transition-fast)',
          }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} style={{ color: 'var(--color-accent)' }} />}
        </button>

        {/* User Auth Quick Action */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontSize: '11px',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              <User size={13} />
              <span>{user?.name?.split(' ')[0] || 'Farmer'}</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Button variant="outline" size="sm" icon={LogIn} onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Hamburger Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--color-surface-elevated)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            gap: '16px',
            boxShadow: 'var(--shadow-lg)',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              icon={LogIn}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
            >
              Login with Phone / OTP
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={UserPlus}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/register');
              }}
            >
              Register Farmer Profile
            </Button>
            <Button
              variant="danger"
              size="lg"
              fullWidth
              icon={LogOut}
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
                navigate('/');
              }}
            >
              Logout Session
            </Button>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }} />

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Home Page', path: '/', icon: Home },
              { label: 'Farmer Dashboard', path: '/dashboard', icon: LayoutDashboard },
              { label: 'Govt Scheme Finder', path: '/schemes', icon: Sprout },
              { label: 'Check Eligibility', path: '/eligibility', icon: Sparkles },
              { label: 'AI Voice Chat Assistant', path: '/chat', icon: MessageSquare },
              { label: 'Farmer Profile & Settings', path: '/profile', icon: User },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(item.path);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '15px',
                    fontWeight: '600',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={18} style={{ color: 'var(--color-primary)' }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
