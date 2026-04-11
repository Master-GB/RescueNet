import React from "react";
import {
  NGO_TASK_PRIORITY_OPTIONS,
  NGO_TASK_STATUS_OPTIONS,
} from "../../constants/ngoTaskConstants";

export default function NGOTaskFilters({
  searchValue,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isRefreshing,
}) {
  return (
    <section className="rounded-2xl border border-auth-border bg-auth-surface p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">
            Search tasks
          </label>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, location, contact, or message"
            className="w-full rounded-xl border border-auth-border bg-white px-3 py-2 text-sm text-auth-text outline-none transition focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(event) => onFilterChange("status", event.target.value)}
            className="w-full rounded-xl border border-auth-border bg-white px-3 py-2 text-sm text-auth-text outline-none transition focus:border-primary"
          >
            {NGO_TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(event) => onFilterChange("priority", event.target.value)}
            className="w-full rounded-xl border border-auth-border bg-white px-3 py-2 text-sm text-auth-text outline-none transition focus:border-primary"
          >
            {NGO_TASK_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-xl border border-auth-border bg-auth-surface px-3 py-2 text-xs font-semibold text-auth-text transition hover:bg-auth-bg"
          >
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}
