import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import Card from "../components/ui/Card";
import { STATUS_OBRA_LABELS, STATUS_OBRA_COLORS } from "../utils/helpers";

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
export default function DashboardPage({ onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiFetch("/obras/stats").then(setStats).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: "Total de Obras", value: stats.total, icon: "🏗️", color: "#1d4ed8" },
    { label: "Em Execução", value: stats.em_execucao, icon: "⚙️", color: "#10b981" },
    { label: "Paralisadas", value: stats.paralisada, icon: "⏸️", color: "#ef4444" },
    { label: "Concluídas", value: stats.concluida, icon: "✅", color: "#059669" },
  ] : [];

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 24 }}>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <Card key={c.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 8px", fontWeight: 600 }}>{c.label}</p>
                <p style={{ fontSize: 36, fontWeight: 800, color: c.color, margin: 0 }}>{c.value ?? "—"}</p>
              </div>
              <span style={{ fontSize: 28 }}>{c.icon}</span>
            </div>
          </Card>
        ))}
      </div>
      {stats && (
        <Card>
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: "#0f172a" }}>Distribuição por Status</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {Object.entries(STATUS_OBRA_LABELS).map(([k, v]) => (
              <div key={k} style={{
                padding: "10px 16px", borderRadius: 10, background: STATUS_OBRA_COLORS[k] + "11",
                border: `1.5px solid ${STATUS_OBRA_COLORS[k]}33`, minWidth: 100, textAlign: "center",
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: STATUS_OBRA_COLORS[k] }}>{stats[k] ?? 0}</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}