import React from "react";

export default function EmptyState({ title = "No results", note, actionLabel, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 12px", opacity: 0.9 }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
      {note && <p style={{ margin: "8px 0 0", fontSize: 14 }}>{note}</p>}
      {onAction && (
        <button
          style={{ marginTop: 12, padding: "8px 12px", borderRadius: 10, border: "1px solid #00000020", cursor: "pointer" }}
          onClick={onAction}
        >
          {actionLabel || "Reset"}
        </button>
      )}
    </div>
  );
}
