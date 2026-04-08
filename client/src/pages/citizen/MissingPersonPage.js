import React, { useState, useContext } from "react";
import { Search, Plus, Filter, AlertTriangle } from "lucide-react";
import { MissingPersonProvider } from "../../contexts/MissingPersonContext";
import { useMissingPerson } from "../../contexts/MissingPersonContext";
import useMissingPersonData from "../../hooks/missingPerson/useMissingPersonData";
import MissingPersonCard from "../../components/missingPerson/MissingPersonCard";
import ReportMissingPersonForm from "../../components/missingPerson/ReportMissingPersonForm";
import MissingPersonDetailModal from "../../components/missingPerson/MissingPersonDetailModal";

import { AuthContext } from "../../contexts/AuthContext";

const MissingPersonContent = () => {
  const { user } = useContext(AuthContext);
  const { foundPerson, removeReport } = useMissingPerson();
  const {
    missingPersons,
    loading,
    error,
    searchInput,
    setSearchInput,
    filters,
    currentPage,
    pagination,
    selectedPerson,
    setSelectedPerson,
    handleSearch,
    handleFilterChange,
    handlePageChange,
  } = useMissingPersonData();

  const [showForm, setShowForm] = useState(false);
  const [editPerson, setEditPerson] = useState(null);

  const handleEdit = (person) => {
    setEditPerson(person);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      await removeReport(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditPerson(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Missing Persons</h1>
            <p className="text-sm text-gray-500">Help find missing people in your community</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or location..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition"
            >
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">All Status</option>
              <option value="missing">Missing</option>
              <option value="found">Found</option>
              <option value="investigating">Investigating</option>
            </select>

            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange("gender", e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Report Button */}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition"
          >
            <Plus size={16} />
            Report Missing
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{missingPersons.length}</span> of{" "}
          <span className="font-semibold text-gray-700">{pagination.total || missingPersons.length}</span> records
        </p>
        <div className="flex items-center gap-1.5 text-sm text-red-500">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {missingPersons.filter((p) => p.status !== "found").length} currently missing
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && missingPersons.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No records found</h3>
          <p className="text-sm text-gray-400">Try adjusting your filters or report a new case.</p>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && missingPersons.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {missingPersons.map((person) => (
            <MissingPersonCard
              key={person._id}
              person={person}
              onView={setSelectedPerson}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onFound={foundPerson}
              isOwner={user?._id === person.reportedBy || user?.role === "admin"}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(Math.ceil(pagination.total / pagination.limit))].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                currentPage === i + 1
                  ? "bg-red-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ReportMissingPersonForm
          onClose={handleFormClose}
          editData={editPerson}
        />
      )}

      {selectedPerson && (
        <MissingPersonDetailModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
};

// Wrap with provider
const MissingPersonPage = () => (
  <MissingPersonProvider>
    <MissingPersonContent />
  </MissingPersonProvider>
);

export default MissingPersonPage;