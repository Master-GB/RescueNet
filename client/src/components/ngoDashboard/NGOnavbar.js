import React, { useMemo, useState } from 'react';
import NGOstatuspill from './NGOstatuspill';
import NGOprofilepop from './NGOprofilepop';
import useAuth from '../../hooks/useAuth';
import ProfileAvatar from '../common/ProfileAvatar';

const NGOnavbar = ({ ngoData, handleStatusToggle }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useAuth();

  const avatarFallbackLetter = useMemo(() => {
    const letter = typeof user?.name === 'string' ? user.name.trim().slice(0, 1) : '';
    return letter ? letter.toUpperCase() : 'N';
  }, [user?.name]);

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
            className="rounded-full border border-auth-border bg-auth-bg p-1 text-auth-text-soft transition hover:text-auth-text"
            aria-label="Profile"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <ProfileAvatar
              imageUrl={user?.profileImageUrl}
              fallbackText={avatarFallbackLetter}
              alt="NGO profile image"
              wrapperClassName="h-8 w-8"
              imageClassName="h-8 w-8 rounded-full object-cover border border-auth-border"
              fallbackClassName="h-8 w-8 rounded-full bg-auth-bg border border-auth-border text-primary flex items-center justify-center text-xs font-bold"
              fallbackIconClassName="h-4 w-4 text-primary"
            />
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
