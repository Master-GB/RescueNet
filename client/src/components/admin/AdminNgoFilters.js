import React, { useCallback } from "react";

const APPROVAL_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const NGO_TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "food-bank", label: "Food Bank" },
  { value: "medical", label: "Medical" },
  { value: "shelter", label: "Shelter" },
  { value: "rescue", label: "Rescue" },
  { value: "relief", label: "Relief" },
  { value: "other", label: "Other" },
];

const AVAILABILITY_OPTIONS = [
  { value: "", label: "All availability" },
  { value: "AVAILABLE", label: "Available" },
  { value: "BUSY", label: "Busy" },
  { value: "OFFLINE", label: "Offline" },
];

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest first" },
  { value: "createdAt-asc", label: "Oldest first" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
];

export default function AdminNgoFilters({
  searchValue,
  filters,
  sortBy,
  isRefreshing,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onClearFilters,
  onRefresh,
}) {
  const handleSearchChange = useCallback((event) => {
    onSearchChange(event.target.value);
  }, [onSearchChange]);

  const handleStatusChange = useCallback((event) => {
    onFilterChange("approvalStatus", event.target.value);
  }, [onFilterChange]);

  const handleTypeChange = useCallback((event) => {
    onFilterChange("type", event.target.value);
  }, [onFilterChange]);

  const handleAvailabilityChange = useCallback((event) => {
    onFilterChange("availabilityStatus", event.target.value);
  }, [onFilterChange]);

  const handleSortChange = useCallback((event) => {
    onSortChange(event.target.value);
  }, [onSortChange]);

  return (
    <section className="rounded-2xl border border-auth-border bg-auth-surface p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">
            Search NGOs
          </label>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search by organization, registration number, or email"
            className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none placeholder:text-auth-placeholder"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">
            Status
          </label>
          <select
            value={filters.approvalStatus}
            onChange={handleStatusChange}
            className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
          >
            {APPROVAL_STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all-status"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">
            Type
          </label>
          <select
            value={filters.type}
            onChange={handleTypeChange}
            className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
          >
            {NGO_TYPE_OPTIONS.map((option) => (
              <option key={option.value || "all-type"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">
            Availability
          </label>
          <select
            value={filters.availabilityStatus}
            onChange={handleAvailabilityChange}
            className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
          >
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value || "all-availability"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-[220px]">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">
            Sort
          </label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-lg border border-auth-border bg-auth-bg px-4 py-2 text-sm font-semibold text-auth-text transition hover:bg-auth-border-subtle"
          >
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}
