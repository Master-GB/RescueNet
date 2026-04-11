import React from 'react';
import { 
  ChevronRight
} from 'lucide-react';

const QuickActionCard = ({ 
  title, 
  description, 
  buttonText, 
  variant = "default", 
  icon,
  status,
  progress,
  onClick 
}) => {
  const getCardStyles = () => {
    const baseStyles = "relative overflow-hidden rounded-3xl shadow-lg border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2";
    
    switch (variant) {
      case "emergency":
        return `${baseStyles} bg-gradient-to-br from-red-500 via-red-600 to-rose-700 border-red-400 shadow-red-200`;
      case "primary":
        return `${baseStyles} bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 border-blue-400 shadow-blue-200`;
      case "success":
        return `${baseStyles} bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-400 shadow-emerald-200`;
      case "warning":
        return `${baseStyles} bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-700 border-amber-400 shadow-amber-200`;
      default:
        return `${baseStyles} bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 border-slate-300 hover:border-slate-400`;
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg ";
    
    switch (variant) {
      case "emergency":
        return `${baseStyles} bg-white text-red-600 hover:bg-red-50 shadow-red-100 animate-pulse`;
      case "primary":
        return `${baseStyles} bg-white text-blue-600 hover:bg-blue-50 shadow-blue-100`;
      case "success":
        return `${baseStyles} bg-white text-emerald-600 hover:bg-emerald-50 shadow-emerald-100`;
      case "warning":
        return `${baseStyles} bg-white text-amber-600 hover:bg-amber-50 shadow-amber-100`;
      default:
        return `${baseStyles} bg-slate-800 text-white hover:bg-slate-700`;
    }
  };

  const getTitleStyles = () => {
    const baseStyles = "text-xl font-bold mb-3";
    
    switch (variant) {
      case "emergency":
      case "primary":
      case "success":
      case "warning":
        return `${baseStyles} text-white`;
      default:
        return `${baseStyles} text-slate-800`;
    }
  };

  const getDescriptionStyles = () => {
    const baseStyles = "text-sm leading-relaxed mb-4";
    
    switch (variant) {
      case "emergency":
      case "primary":
      case "success":
      case "warning":
        return `${baseStyles} text-white/90`;
      default:
        return `${baseStyles} text-slate-600`;
    }
  };

  const getIconStyles = () => {
    const baseStyles = "w-8 h-8";
    
    switch (variant) {
      case "emergency":
        return `${baseStyles} text-white animate-bounce-slow`;
      case "primary":
        return `${baseStyles} text-white animate-bounce-slow`;
      case "success":
        return `${baseStyles} text-white animate-bounce-slow`;
      case "warning":
        return `${baseStyles} text-white animate-bounce-slow`;
      default:
        return `${baseStyles} text-slate-600`;
    }
  };

  return (
    <div className={getCardStyles()} onClick={onClick}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
      </div>
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
              {icon && React.createElement(icon, { className: getIconStyles() })}
            </div>
            <div>
              <h3 className={getTitleStyles()}>{title}</h3>
              {status && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-xs text-white/80 font-medium">{status}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Indicator */}
          {progress !== undefined && (
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{progress}%</div>
              <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Description */}
        <p className={getDescriptionStyles()}>{description}</p>
        
        {/* Action Button */}
        <button 
          className={getButtonStyles()}
          onClick={onClick}
        >
          {buttonText}
          <ChevronRight className="w-4 h-4 " />
        </button>
        
        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default QuickActionCard;