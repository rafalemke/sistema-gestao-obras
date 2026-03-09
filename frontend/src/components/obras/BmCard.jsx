import { useState } from "react";
import { apiFetch } from "../../services/api"; // Note que volta duas pastas (../../)

// Componentes de UI genéricos
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import StatusTimeline from "../ui/StatusTimeline";

// Helpers
import { 
  STATUS_BM_LABELS, 
  STATUS_BM_COLORS, 
  fmt, 
  fmtDate 
} from "../../utils/helpers";


// ─── BM CARD ──────────────────────────────────────────────────────────────────
export default function BMCard({ bm, obraId, onRefresh, can }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [showStatus, setShowStatus] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const loadDetail = async () => {
    if (!detail) {
      const d = await apiFetch(`/boletins/${bm.id}`);
      setDetail(d);
    }
    setExpanded(v => !v);
  };

  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={loadDetail}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>BM #{bm.numero_bm}</span>
          <Badge label={STATUS_BM_LABELS[bm.status]} color={STATUS_BM_COLORS[bm.status]} />
          {bm.fonte_verba && <span style={{ fontSize: 12, color: "#94a3b8" }}>{bm.fonte_verba}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700, color: "#1d4ed8" }}>{fmt(bm.valor)}</span>
          <span style={{ color: "#94a3b8" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && detail && (
        <div style={{ marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12, fontSize: 13, color: "#475569" }}>
            {detail.numero_sei && <span>SEI: {detail.numero_sei}</span>}
            {detail.periodo_inicio && <span>Período: {fmtDate(detail.periodo_inicio)} – {fmtDate(detail.periodo_fim)}</span>}
            {detail.data_emissao && <span>Emissão: {fmtDate(detail.data_emissao)}</span>}
          </div>
          <h5 style={{ margin: "0 0 10px", fontWeight: 700 }}>Histórico de Status</h5>
          <StatusTimeline history={detail.status_history} labels={STATUS_BM_LABELS} colors={STATUS_BM_COLORS} />
          {can(["admin", "gestor", "fiscal"]) && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button size="sm" variant="secondary" onClick={() => setShowEdit(true)}>Editar</Button>
              <Button size="sm" onClick={() => setShowStatus(true)}>Alterar Status</Button>
            </div>
          )}
        </div>
      )}
      {showStatus && (
        <StatusChangeModal
          title={`Status BM #${bm.numero_bm}`}
          currentStatus={bm.status}
          labels={STATUS_BM_LABELS}
          onClose={() => setShowStatus(false)}
          onSave={async (status, obs) => {
            await apiFetch(`/boletins/${bm.id}/status`, { method: "PATCH", body: JSON.stringify({ status, observacao: obs }) });
            setShowStatus(false); setDetail(null); setExpanded(false); onRefresh();
          }}
        />
      )}
      {showEdit && (
        <BMFormModal bm={bm} obraId={obraId} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); setDetail(null); onRefresh(); }} />
      )}
    </Card>
  );
}

export function BMFormModal({ bm, obraId, onClose, onSaved }) {
  const [f, setF] = useState({
    numero_bm: bm?.numero_bm || "",
    numero_sei: bm?.numero_sei || "",
    periodo_inicio: bm?.periodo_inicio || "",
    periodo_fim: bm?.periodo_fim || "",
    data_emissao: bm?.data_emissao || "",
    valor: bm?.valor || "",
    fonte_verba: bm?.fonte_verba || "",
    observacao: bm?.observacao || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const u = (k) => (v) => setF(p => ({ ...p, [k]: v }));
  const FONTE_OPTS = { tesouro_estadual: "Tesouro Estadual", federal: "Federal", bid: "BID", bird: "BIRD", convenio: "Convênio", outro: "Outro" };

  const save = async () => {
    setSaving(true); setError("");
    try {
      const body = { ...f, numero_bm: parseInt(f.numero_bm) };
      if (body.valor) body.valor = parseFloat(body.valor);
      if (!body.fonte_verba) delete body.fonte_verba;
      if (bm) await apiFetch(`/boletins/${bm.id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await apiFetch("/boletins", { method: "POST", body: JSON.stringify({ ...body, obra_id: obraId }) });
      onSaved();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <Modal title={bm ? "Editar BM" : "Novo Boletim de Medição"} onClose={onClose} width={600}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Input label="Número BM" value={f.numero_bm} onChange={u("numero_bm")} type="number" required />
        <Input label="Número SEI" value={f.numero_sei} onChange={u("numero_sei")} />
        <Input label="Período Início" value={f.periodo_inicio} onChange={u("periodo_inicio")} type="date" />
        <Input label="Período Fim" value={f.periodo_fim} onChange={u("periodo_fim")} type="date" />
        <Input label="Data Emissão" value={f.data_emissao} onChange={u("data_emissao")} type="date" />
        <Input label="Valor (R$)" value={f.valor} onChange={u("valor")} type="number" />
        <Input label="Fonte da Verba" value={f.fonte_verba} onChange={u("fonte_verba")} options={FONTE_OPTS} style={{ gridColumn: "1/-1" }} />
        <Input label="Observação" value={f.observacao} onChange={u("observacao")} type="textarea" style={{ gridColumn: "1/-1" }} />
      </div>
      {error && <div style={{ color: "#dc2626", fontSize: 13, padding: "8px 12px", background: "#fee2e2", borderRadius: 8, marginBottom: 12 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </div>
    </Modal>
  );
}