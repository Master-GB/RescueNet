import React from "react";

export default function Card({ className = "", ...props }) {
  return (
    <div
      className={`bg-surface-container-high rounded-lg p-6 text-on-surface ${className}`}
      {...props}
    />
  );
}
