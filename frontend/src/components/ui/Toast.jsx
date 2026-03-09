import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, padding: "14px 20px",
      background: type === "error" ? "#fee2e2" : "#dcfce7",
      color: type === "error" ? "#dc2626" : "#16a34a",
      borderRadius: 10, boxShadow: "0 4px 20px #0002", fontWeight: 600,
      fontSize: 14, zIndex: 2000, maxWidth: 360,
    }}>{message}</div>
  );
}