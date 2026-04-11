import React, { memo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";

const PIE_COLORS = [
  "var(--primary)",
  "var(--secondary)",
  "var(--tertiary)",
  "var(--warning)",
  "var(--danger)",
  "var(--primary-container)",
];

const tooltipStyle = {
  border: "1px solid var(--auth-border)",
  borderRadius: "0.5rem",
  background: "var(--auth-surface)",
  color: "var(--auth-text)",
};

function ChartPanelLoader({ label }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-auth-border bg-auth-surface px-4 py-6 shadow-sm">
      <div className="inline-flex items-center gap-2 text-auth-text-soft">
        <Loader2 className="h-5 w-5 animate-spin" />
        {label}
      </div>
    </div>
  );
}

function EmptyChartState({ title, message }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-auth-border bg-auth-surface px-4 py-6 text-center shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-auth-text-strong">{title}</h3>
        <p className="mt-2 text-sm text-auth-text-soft">{message}</p>
      </div>
    </div>
  );
}

function AdminDashboardCharts({ statusData, trendData, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanelLoader label="Loading status chart..." />
        <ChartPanelLoader label="Loading trend chart..." />
      </div>
    );
  }

  const hasStatusData = Array.isArray(statusData) && statusData.length > 0;
  const hasTrendData = Array.isArray(trendData) && trendData.some((point) => point.total > 0);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {hasStatusData ? (
        <section className="rounded-2xl border border-auth-border bg-auth-surface p-4 shadow-sm">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-auth-text-strong">Request Status Breakdown</h3>
            <p className="text-sm text-auth-text-soft">Distribution across all fetched help requests.</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={56}
                  paddingAngle={3}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`${entry.label}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : (
        <EmptyChartState
          title="No status data"
          message="No help request records were available for status aggregation."
        />
      )}

      {hasTrendData ? (
        <section className="rounded-2xl border border-auth-border bg-auth-surface p-4 shadow-sm">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-auth-text-strong">Requests Over Last 7 Days</h3>
            <p className="text-sm text-auth-text-soft">Daily request volume based on createdAt timestamps.</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 8, right: 16, left: -16, bottom: 8 }}>
                <XAxis dataKey="label" tick={{ fill: "var(--auth-text-soft)", fontSize: 12 }} axisLine={{ stroke: "var(--auth-border)" }} tickLine={{ stroke: "var(--auth-border)" }} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--auth-text-soft)", fontSize: 12 }} axisLine={{ stroke: "var(--auth-border)" }} tickLine={{ stroke: "var(--auth-border)" }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Requests"]} />
                <Legend />
                <Bar dataKey="total" name="Requests" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : (
        <EmptyChartState
          title="No trend data"
          message="No recent requests were found in the last 7 days."
        />
      )}
    </div>
  );
}

export default memo(AdminDashboardCharts);
