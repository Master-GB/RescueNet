import React from "react";
import {
  ADMIN_ASSIGNMENT_FILTER_OPTIONS,
  ADMIN_DISASTER_TYPE_OPTIONS,
  ADMIN_TASK_STATUS_OPTIONS,
  ADMIN_URGENCY_OPTIONS,
} from "../../constants/adminTaskConstants";

export default function AdminTaskFilters({
  searchValue,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isRefreshing,
}) {
  return (
    <section className="rounded-2xl bg-surface-container-low p-4 ghost-outline">
      <div className="grid gap-3 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs text-on-surface/70">Search requests</label>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, location, contact, or message"
            className="w-full rounded-xl border border-transparent bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-on-surface/70">Status</label>
          <select
            value={filters.status}
            onChange={(event) => onFilterChange("status", event.target.value)}
            className="w-full rounded-xl border border-transparent bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
          >
            <option value="">All statuses</option>
            {ADMIN_TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-on-surface/70">Disaster type</label>
          <select
            value={filters.disasterType}
            onChange={(event) => onFilterChange("disasterType", event.target.value)}
            className="w-full rounded-xl border border-transparent bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
          >
            {ADMIN_DISASTER_TYPE_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-on-surface/70">Urgency</label>
          <select
            value={filters.urgency}
            onChange={(event) => onFilterChange("urgency", event.target.value)}
            className="w-full rounded-xl border border-transparent bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
          >
            {ADMIN_URGENCY_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-on-surface/70">Assignment</label>
          <select
            value={filters.assignedTo}
            onChange={(event) => onFilterChange("assignedTo", event.target.value)}
            className="w-full rounded-xl border border-transparent bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
          >
            {ADMIN_ASSIGNMENT_FILTER_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-on-primary disabled:opacity-60"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button
          type="button"
          onClick={onClearFilters}
          className="rounded-xl bg-surface-variant px-3 py-2 text-xs font-semibold text-on-surface"
        >
          Clear filters
        </button>
      </div>
    </section>
  );
}
