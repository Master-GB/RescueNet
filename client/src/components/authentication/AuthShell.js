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
      className="min-h-screen text-auth-text-strong px-4 py-8 md:px-8 bg-auth-bg relative overflow-hidden"
    >
      {/* Decorative light theme background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center relative z-10">
        <div className="grid w-full max-w-5xl gap-6 md:grid-cols-[1.2fr_1fr]">
          <section className="hidden rounded-3xl bg-auth-surface-glass backdrop-blur-xl p-10 md:flex flex-col justify-center border border-auth-surface-glass-border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            <p className="text-xs uppercase tracking-[0.18em] text-secondary-container font-semibold">Emergency Response Suite</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight text-auth-text">
              Security-first access for rapid, coordinated relief.
            </h2>
            <p className="mt-6 max-w-md text-base text-auth-text-soft leading-relaxed">
              RescueNet keeps authentication strict so every action is tied to a verified responder, agency, or citizen account.
            </p>
          </section>

          <section className="bg-auth-surface rounded-3xl p-8 sm:p-10 shadow-auth-shell-panel border border-auth-border-subtle flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-container font-bold">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-auth-text">{title}</h1>
            {subtitle ? <p className="mt-3 text-sm text-auth-text-soft leading-relaxed">{subtitle}</p> : null}

            <div className="mt-8">{children}</div>

            {footer ? <div className="mt-8 border-t border-auth-border-subtle pt-6 text-sm">{footer}</div> : null}
          </section>
        </div>
      </div>
    </div>
  );
}
