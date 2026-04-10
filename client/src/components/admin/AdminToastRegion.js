import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

const toneMap = {
  success: {
    container: "bg-primary/20 text-on-surface border-primary/40",
    icon: CheckCircle2,
  },
  error: {
    container: "bg-danger/20 text-on-surface border-danger/40",
    icon: XCircle,
  },
  warning: {
    container: "bg-warning/20 text-on-surface border-warning/40",
    icon: AlertTriangle,
  },
  info: {
    container: "bg-secondary/20 text-on-surface border-secondary/40",
    icon: Info,
  },
};

export default function AdminToastRegion({ toasts, onDismiss }) {
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
    <div className="fixed top-24 right-4 z-[1400] space-y-3 w-[min(420px,calc(100vw-2rem))]">
      {toasts.map((toast) => {
        const tone = toneMap[toast.type] || toneMap.info;
        const Icon = tone.icon;

        return (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 shadow-ambient ${tone.container}`}
          >
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{toast.title}</p>
                <p className="text-xs mt-1 text-on-surface/80">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-on-surface/70 hover:text-on-surface"
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
