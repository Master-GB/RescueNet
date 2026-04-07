import React from "react";

export default function GlassContainer({ className = "", ...props }) {
  return (
    <div
      className={`glass-panel text-on-surface ${className}`}
      {...props}
    />
  );
}
