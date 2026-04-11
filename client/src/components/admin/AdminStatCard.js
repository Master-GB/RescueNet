import React, { memo } from "react";
import { Loader2 } from "lucide-react";

const TONE_CLASS_MAP = {
  neutral: "border-auth-border bg-auth-surface",
  warning: "border-auth-warning-border bg-auth-warning-bg",
  success: "border-auth-success-border bg-auth-success-bg",
  danger: "border-auth-danger-border bg-auth-danger-bg",
};

function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "neutral",
  isLoading = false,
}) {
  const toneClasses = TONE_CLASS_MAP[tone] || TONE_CLASS_MAP.neutral;

  return (
    <article className={`rounded-xl border p-4 shadow-sm ${toneClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">
            {title}
          </p>
          {isLoading ? (
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-auth-text-soft">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <p className="mt-2 text-2xl font-bold text-auth-text-strong">{value}</p>
          )}
        </div>

        {Icon ? (
          <div className="rounded-lg border border-auth-border bg-auth-bg p-2 text-auth-text-soft">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-xs text-auth-text-soft">{subtitle}</p>
    </article>
  );
}

export default memo(AdminStatCard);
