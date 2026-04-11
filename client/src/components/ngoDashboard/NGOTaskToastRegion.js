import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

const toneMap = {
  success: {
    container: "border-success/30 bg-success/10 text-auth-text",
    icon: CheckCircle2,
  },
  error: {
    container: "border-danger/30 bg-danger/10 text-auth-text",
    icon: XCircle,
  },
  warning: {
    container: "border-warning/30 bg-warning/10 text-auth-text",
    icon: AlertTriangle,
  },
  info: {
    container: "border-secondary/30 bg-secondary/10 text-auth-text",
    icon: Info,
  },
};

export default function NGOTaskToastRegion({ toasts, onDismiss }) {
  useEffect(() => {
    const timers = toasts.map((toast) => {
      const timeout = toast.type === "error" ? 6000 : 4000;
      return setTimeout(() => {
        onDismiss(toast.id);
      }, timeout);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [onDismiss, toasts]);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-24 z-[1400] w-[min(420px,calc(100vw-2rem))] space-y-3">
      {toasts.map((toast) => {
        const tone = toneMap[toast.type] || toneMap.info;
        const Icon = tone.icon;

        return (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 shadow-lg ${tone.container}`}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="mt-1 text-xs text-auth-text-soft">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-auth-text-soft transition hover:text-auth-text"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
