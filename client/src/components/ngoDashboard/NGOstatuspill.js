import React from 'react';

const NGOstatuspill = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return 'bg-tertiary text-[#0b0b0b]'; // Greenish
      case 'BUSY':
        return 'bg-secondary text-[#0b0b0b]'; // Tealish
      case 'OFFLINE':
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  return (
    <div className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${getStatusStyles(status)}`}>
      {status || 'OFFLINE'}
    </div>
  );
};

export default NGOstatuspill;
