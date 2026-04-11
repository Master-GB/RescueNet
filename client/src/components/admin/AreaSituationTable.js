import React, { useState } from 'react';
import { Edit2, EyeOff, Power, PowerOff } from 'lucide-react';

const SITUATION_STATUSES = {
  safe: { color: 'bg-green-100 text-green-800', icon: '✓' },
  warning: { color: 'bg-yellow-100 text-yellow-800', icon: '' },
  danger: { color: 'bg-red-100 text-red-800', icon: '' },
  monitor: { color: 'bg-blue-100 text-blue-800', icon: '' },
};

const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const ACTIVE_STATUS_COLORS = {
  true: { color: 'bg-green-100 text-green-800', icon: 'Active', label: 'Active' },
  false: { color: 'bg-gray-100 text-gray-800', icon: 'Inactive', label: 'Inactive' },
};

const AreaSituationTable = ({
  situations,
  onEdit,
  onDeactivate,
  isLoading,
  selectedId,
  setSelectedId,
}) => {

  const handleDeactivateClick = async (id) => {
    console.log('Deactivating situation with ID:', id);
    try {
      await onDeactivate(id);
    } catch (error) {
      console.error('Failed to deactivate situation:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (situations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 mb-3">
          <EyeOff size={48} className="mx-auto opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Situations Found</h3>
        <p className="text-gray-500">Create a new area situation to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Active Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Region
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Authority
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Valid Until
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {situations.map((situation) => {
              console.log('Situation data:', situation);
              const statusInfo = SITUATION_STATUSES[situation.status] || SITUATION_STATUSES.safe;
              const severityColor = SEVERITY_COLORS[situation.severity] || SEVERITY_COLORS.low;
              const activeStatusInfo = ACTIVE_STATUS_COLORS[situation.isActive] || ACTIVE_STATUS_COLORS.true;

              return (
                <tr
                  key={situation.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedId === situation.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedId(situation.id)}
                >
                  <td className="px-6 py-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{situation.title}</h3>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {situation.message}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.icon} {situation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${activeStatusInfo.color}`}>
                      {situation.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${severityColor}`}>
                      {situation.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {situation.region || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {situation.authority}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(situation.validUntil)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(situation);
                        }}
                        disabled={isLoading}
                        className="p-2 text-green-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Edit situation"
                      >
                        <Edit2 size={18} />
                      </button>
                      {situation.isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeactivateClick(situation.id);
                          }}
                          disabled={isLoading}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Deactivate situation"
                        >
                          <PowerOff size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AreaSituationTable;
