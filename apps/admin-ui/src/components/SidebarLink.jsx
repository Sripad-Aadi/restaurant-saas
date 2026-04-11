import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarLink = ({ to, icon: Icon, children }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors mb-1 ${
          isActive
            ? 'bg-primary/20 text-primary'
            : 'text-text-muted hover:text-white hover:bg-dark-surface'
        }`
      }
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </NavLink>
  );
};

export default SidebarLink;
