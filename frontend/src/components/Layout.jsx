import { useAuth } from "../store/AuthContext";
import Button from "./ui/Button";


// ─── LAYOUT ───────────────────────────────────────────────────────────────────
export default function Layout({ children, page, setPage }) {
  const { user, logout, can } = useAuth();
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "obras", label: "Obras", icon: "🏗️" },
    ...(can(["admin"]) ? [{ id: "users", label: "Usuários", icon: "👥" }] : []),
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#f1f5f9" }}>
      {/* Sidebar */}
      <div style={{
        width: 240, background: "#0f172a", color: "#fff",
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1d4ed8,#0284c7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏗️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>GestãoObras</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Sistema Estadual</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: page === n.id ? "#1e293b" : "transparent",
              color: page === n.id ? "#fff" : "#94a3b8",
              fontWeight: page === n.id ? 700 : 400, fontSize: 14, marginBottom: 2,
              transition: "all .15s",
            }}>
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: "1px solid #1e293b" }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.nome}</div>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "capitalize" }}>{user?.role} · {user?.setor || "—"}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} style={{ color: "#94a3b8", width: "100%" }}>Sair</Button>
        </div>
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: 28, overflowY: "auto", maxWidth: "calc(100vw - 240px)" }}>
        {children}
      </div>
    </div>
  );
}