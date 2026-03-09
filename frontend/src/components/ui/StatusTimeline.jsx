import Badge from "./Badge";
import { fmtDate } from "../../utils/helpers";

// ─── Status History Timeline ──────────────────────────────────────────────────
export default function StatusTimeline({ history, labels, colors }) {
  if (!history?.length) return <p style={{ color: "#94a3b8", fontSize: 14 }}>Nenhum histórico.</p>;
  return (
    <div style={{ position: "relative", paddingLeft: 24 }}>
      <div style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 2, background: "#e2e8f0" }} />
      {history.map((h, i) => (
        <div key={h.id} style={{ marginBottom: 16, position: "relative" }}>
          <div style={{
            position: "absolute", left: -20, top: 4, width: 12, height: 12,
            borderRadius: "50%", background: colors[h.status_novo] || "#94a3b8",
            border: "2px solid #fff", boxShadow: "0 0 0 2px " + (colors[h.status_novo] || "#94a3b8") + "44",
          }} />
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {h.status_anterior && (
                <><Badge label={labels[h.status_anterior] || h.status_anterior} color={colors[h.status_anterior] || "#94a3b8"} />
                  <span style={{ color: "#94a3b8" }}>→</span></>
              )}
              <Badge label={labels[h.status_novo] || h.status_novo} color={colors[h.status_novo] || "#94a3b8"} />
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              {h.usuario?.nome || "—"} · {fmtDate(h.created_at)}
            </div>
            {h.observacao && <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, fontStyle: "italic" }}>"{h.observacao}"</div>}
          </div>
        </div>
      ))}
    </div>
  );
}