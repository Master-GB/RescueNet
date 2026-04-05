import React from "react";

export default function AuthShell({
  eyebrow = "RescueNet",
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div
      className="min-h-screen text-on-surface px-4 py-8 md:px-8"
      style={{
        background:
          "radial-gradient(1200px 520px at -10% -20%, var(--surface-container-high), transparent 58%), radial-gradient(1000px 520px at 110% -10%, var(--surface-container), transparent 52%), linear-gradient(135deg, var(--surface) 0%, var(--surface-container-low) 100%)",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl gap-6 md:grid-cols-[1.2fr_1fr]">
          <section className="hidden rounded-2xl bg-surface-container-low p-8 md:block ghost-outline">
            <p className="text-xs uppercase tracking-[0.18em] text-secondary">Emergency Response Suite</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight">
              Security-first access for rapid, coordinated relief.
            </h2>
            <p className="mt-4 max-w-md text-sm text-on-surface opacity-80">
              RescueNet keeps authentication strict so every action is tied to a verified responder, agency, or citizen account.
            </p>
          </section>

          <section className="glass-panel rounded-2xl p-6 shadow-ambient sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-on-surface opacity-80">{subtitle}</p> : null}

            <div className="mt-6">{children}</div>

            {footer ? <div className="mt-6 border-t border-surface-bright pt-4 text-sm">{footer}</div> : null}
          </section>
        </div>
      </div>
    </div>
  );
}
