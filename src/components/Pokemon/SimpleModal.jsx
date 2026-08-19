import React from "react";

export default function SimpleModal({ open, onClose, children }) {
  if (!open) return null;

  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={onBackdrop}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
        display: "grid", placeItems: "center", zIndex: 50
      }}
    >
      <div
        style={{
          background: "var(--card-bg)", color: "var(--text)",
          borderRadius: 16, boxShadow: "var(--shadow)",
          width: "min(94vw, 760px)", padding: 18
        }}
      >
        {children}
      </div>
    </div>
  );
}
