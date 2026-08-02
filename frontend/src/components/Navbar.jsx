import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Landmark, TrendingUp, CloudSun, Stethoscope, User } from 'lucide-react';

export default function Navbar() {
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Govt Schemes', path: '/schemes', icon: Landmark },
    { label: 'Market Prices', path: '/market', icon: TrendingUp },
    { label: 'Advisory', path: '/advisory', icon: Stethoscope },
    { label: 'Weather', path: '/weather', icon: CloudSun },
    { label: 'Farmer Profile', path: '/register', icon: User },
  ];

  return (
    <nav
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 16px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '8px',
          maxWidth: '1440px',
          margin: '0 auto',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
