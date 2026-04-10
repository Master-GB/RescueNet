import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { User } from 'lucide-react';
import NGOstatuspill from './NGOstatuspill';
import NGOprofilepop from './NGOprofilepop';

const NGOnavbar = ({ ngoData, handleStatusToggle }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="bg-surface text-on-surface px-8 py-4 flex items-center justify-between z-40 sticky top-0">
      {/* Logo */}
      <div className="flex items-center font-bold text-xl text-on-surface tracking-tight">
        <span className="text-white bg-white p-1 rounded-sm mr-2 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#252228" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </span>
        RescueNet
      </div>

      {/* Navlinks */}
      <div className="space-x-8 lg:flex hidden text-sm">
         <NavLink 
          to="/ngo-dashboard" 
          className={({isActive}) => isActive ? 'border-b-2 border-primary text-primary pb-1 font-semibold' : 'hover:text-primary transition-colors pb-1'}
        >
          Task Management
        </NavLink>
        <NavLink 
          to="/ngo/campaigns" 
          className={({isActive}) => isActive ? 'border-b-2 border-primary text-primary pb-1 font-semibold' : 'text-secondary hover:text-primary transition-colors pb-1'}
        >
          Donation campaigns
        </NavLink>
      </div>

      <div className="flex items-center space-x-6 relative">
        <NGOstatuspill status={ngoData?.availabilityStatus} />
        
        <button 
          className="text-secondary hover:text-on-surface transition"
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
    </nav>
  );
};

export default NGOnavbar;
