import React, { useState } from 'react';
import { User } from 'lucide-react';
import NGOstatuspill from './NGOstatuspill';
import NGOprofilepop from './NGOprofilepop';

const NGOnavbar = ({ ngoData, handleStatusToggle }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="sticky top-20 z-[1300] rounded-2xl border border-auth-border bg-auth-surface px-5 py-4 shadow-sm">
      {/* Logo */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center font-bold text-xl tracking-tight text-auth-text-strong">
          <span className="mr-2 rounded-sm bg-auth-bg p-1 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#252228" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </span>
          RescueNet NGO
        </div>

        <div className="relative flex items-center space-x-4">
          <NGOstatuspill status={ngoData?.availabilityStatus} />

          <button
            className="rounded-full border border-auth-border bg-auth-bg p-2 text-auth-text-soft transition hover:text-auth-text"
            aria-label="Profile"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="flex items-center space-x-2">
               <User size={20} className="text-primary"/>
            </div>
          </button>

          {/* Profile Popover */}
          <NGOprofilepop
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            ngoData={ngoData}
            onToggleStatus={handleStatusToggle}
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-auth-text-soft">
        Use the sidebar for Task Management and Donation Campaign navigation.
      </p>
    </nav>
  );
};

export default NGOnavbar;
