const VolunteerSectionHeader = ({ title, subtitle, actionText }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
      <div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {actionText && (
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 mr-4">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default VolunteerSectionHeader;
