export default function Button({ children, onClick, variant = "primary", disabled, style = {}, size = "md" }) {
  const base = {
    border: "none", cursor: disabled ? "not-allowed" : "pointer", borderRadius: 8,
    fontWeight: 600, transition: "all .15s", opacity: disabled ? 0.6 : 1,
    padding: size === "sm" ? "6px 14px" : "10px 20px",
    fontSize: size === "sm" ? 13 : 14,
  };
  const variants = {
    primary: { background: "#1d4ed8", color: "#fff" },
    secondary: { background: "#f1f5f9", color: "#334155" },
    danger: { background: "#fee2e2", color: "#dc2626" },
    success: { background: "#dcfce7", color: "#16a34a" },
    ghost: { background: "transparent", color: "#6b7280" },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>{children}</button>;
}