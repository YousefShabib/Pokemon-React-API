import React from "react";

export default function Status({ type = "info", children }) {
  const cls = `status ${type === "error" ? "error" : ""}`;
  return <div className={cls}>{children}</div>;
}
