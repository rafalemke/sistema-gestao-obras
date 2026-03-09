import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../store/AuthContext";
import { apiFetch } from "../services/api";

// Componentes de UI genéricos
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toast from "../components/ui/Toast";
import Modal from "../components/ui/Modal";
import StatusTimeline from "../components/ui/StatusTimeline";

import { ObraFormModal } from "./ObrasPage";

// Componentes específicos de Obras
import BMCard from "../components/obras/BMCard";
import CronogramaCard from "../components/obras/CronogramaCard";

// Helpers
import { 
  STATUS_OBRA_LABELS, 
  STATUS_OBRA_COLORS, 
  fmt, 
  fmtDate 
} from "../utils/helpers";


// ─── OBRA DETAIL ───────────────────────────────────────────────────────────────
export default function ObraDetail({ obra: initialObra, onBack }) {
  const { can } = useAuth();
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBMForm, setShowBMForm] = useState(false);
  const [showCronForm, setShowCronForm] = useState(false);
  const [boletins, setBoletins] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [toast, setToast] = useState(null);

  const reload = useCallback(async () => {
    const o = await apiFetch(`/obras/${obra.id}`);
    setObra(o);
    if (tab === "boletins") apiFetch(`/boletins/obra/${obra.id}`).then(setBoletins).catch(() => {});
    if (tab === "cronogramas") apiFetch(`/cronogramas/obra/${obra.id}`).then(setCronogramas).catch(() => {});
  }, [initialObra.id, tab]);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/obras/${initialObra.id}`)
      .then(data => { setObra(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [initialObra.id]);
  
  useEffect(() => {
  if (!obra) return;
  if (tab === "boletins") apiFetch(`/boletins/obra/${initialObra.id}`).then(setBoletins).catch(() => {});
  if (tab === "cronogramas") apiFetch(`/cronogramas/obra/${initialObra.id}`).then(setCronogramas).catch(() => {});
}, [tab, initialObra.id, obra]);

  const tabs = [
    { id: "info", label: "Informações" },
    { id: "historico", label: "Histórico de Status" },
    { id: "boletins", label: "Boletins de Medição" },
    { id: "cronogramas", label: "Cronogramas" },
  ];

  if (loading || !obra) return <p style={{ color: "#94a3b8", padding: 40 }}>Carregando obra...</p>;

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Button variant="ghost" onClick={onBack} size="sm">← Voltar</Button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>{obra.nome}</h2>
            <Badge label={STATUS_OBRA_LABELS[obra.status]} color={STATUS_OBRA_COLORS[obra.status]} />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{obra.contrato && `Contrato: ${obra.contrato}`} {obra.numero_sei && `· SEI: ${obra.numero_sei}`}</p>
        </div>
        {can(["admin", "gestor", "fiscal"]) && (
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>✏️ Editar</Button>
            <Button size="sm" onClick={() => setShowStatusModal(true)}>Alterar Status</Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #e2e8f0", marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 14, borderBottom: tab === t.id ? "2px solid #1d4ed8" : "2px solid transparent",
            color: tab === t.id ? "#1d4ed8" : "#64748b", marginBottom: -2,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "info" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <h4 style={{ margin: "0 0 14px", fontWeight: 700 }}>Financeiro</h4>
            <InfoRow label="Valor Contratado" value={fmt(obra.valor_contratado)} />
            <InfoRow label="Valor Licitado" value={fmt(obra.valor_licitado)} />
            <InfoRow label="Valor Aditivos" value={fmt(obra.valor_aditivos)} />
          </Card>
          <Card>
            <h4 style={{ margin: "0 0 14px", fontWeight: 700 }}>Responsáveis</h4>
            <InfoRow label="Gestor" value={obra.gestor?.nome || "—"} />
            <InfoRow label="Fiscal" value={obra.fiscal?.nome || "—"} />
            <InfoRow label="Empresa" value={obra.empresa_contratada || "—"} />
            <InfoRow label="CNPJ" value={obra.cnpj_empresa || "—"} />
          </Card>
          <Card>
            <h4 style={{ margin: "0 0 14px", fontWeight: 700 }}>Prazos</h4>
            <InfoRow label="Início" value={fmtDate(obra.data_inicio)} />
            <InfoRow label="Fim Previsto" value={fmtDate(obra.data_fim_prevista)} />
            <InfoRow label="Fim Real" value={fmtDate(obra.data_fim_real)} />
          </Card>
          <Card>
            <h4 style={{ margin: "0 0 14px", fontWeight: 700 }}>Localização</h4>
            <InfoRow label="Município" value={obra.municipio || "—"} />
            <InfoRow label="Endereço" value={obra.endereco || "—"} />
            <InfoRow label="Secretaria" value={obra.secretaria || "—"} />
          </Card>
          {obra.descricao && (
            <Card style={{ gridColumn: "1/-1" }}>
              <h4 style={{ margin: "0 0 10px", fontWeight: 700 }}>Descrição</h4>
              <p style={{ color: "#475569", lineHeight: 1.6, margin: 0 }}>{obra.descricao}</p>
            </Card>
          )}
        </div>
      )}

      {tab === "historico" && (
        <Card>
          <h4 style={{ margin: "0 0 18px", fontWeight: 700 }}>Histórico de Status</h4>
          <StatusTimeline history={obra.status_history} labels={STATUS_OBRA_LABELS} colors={STATUS_OBRA_COLORS} />
        </Card>
      )}

      {tab === "boletins" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Boletins de Medição</h4>
            {can(["admin", "gestor", "fiscal"]) && <Button size="sm" onClick={() => setShowBMForm(true)}>+ Novo BM</Button>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {boletins.map(bm => (
              <BMCard key={bm.id} bm={bm} obraId={obra.id} onRefresh={() => apiFetch(`/boletins/obra/${obra.id}`).then(setBoletins)} can={can} />
            ))}
            {!boletins.length && <p style={{ color: "#94a3b8" }}>Nenhum boletim cadastrado.</p>}
          </div>
        </div>
      )}

      {tab === "cronogramas" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Cronogramas</h4>
            {can(["admin", "gestor", "fiscal"]) && <Button size="sm" onClick={() => setShowCronForm(true)}>+ Novo Cronograma</Button>}
          </div>
          {cronogramas.map(c => <CronogramaCard key={c.id} cronograma={c} can={can} onRefresh={() => apiFetch(`/cronogramas/obra/${obra.id}`).then(setCronogramas)} />)}
          {!cronogramas.length && <p style={{ color: "#94a3b8" }}>Nenhum cronograma cadastrado.</p>}
        </div>
      )}

      {showStatusModal && (
        <StatusChangeModal
          title="Alterar Status da Obra"
          currentStatus={obra.status}
          labels={STATUS_OBRA_LABELS}
          onClose={() => setShowStatusModal(false)}
          onSave={async (status, obs) => {
            await apiFetch(`/obras/${obra.id}/status`, { method: "PATCH", body: JSON.stringify({ status, observacao: obs }) });
            setShowStatusModal(false);
            reload();
            setToast({ msg: "Status atualizado!", type: "success" });
          }}
        />
      )}
      {showEditModal && (
        <ObraFormModal obra={obra} onClose={() => setShowEditModal(false)} onSaved={() => { setShowEditModal(false); reload(); setToast({ msg: "Obra atualizada!", type: "success" }); }} />
      )}
      {showBMForm && (
        <BMFormModal obraId={obra.id} onClose={() => setShowBMForm(false)} onSaved={() => { setShowBMForm(false); apiFetch(`/boletins/obra/${obra.id}`).then(setBoletins); setToast({ msg: "BM cadastrado!", type: "success" }); }} />
      )}
      {showCronForm && (
        <CronogramaFormModal obraId={obra.id} onClose={() => setShowCronForm(false)} onSaved={() => { setShowCronForm(false); apiFetch(`/cronogramas/obra/${obra.id}`).then(setCronogramas); setToast({ msg: "Cronograma criado!", type: "success" }); }} />
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}
function StatusChangeModal({ title, currentStatus, labels, onClose, onSave }) {
  const [status, setStatus] = useState(currentStatus);
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <Modal title={title} onClose={onClose} width={440}>
      <Input label="Novo Status" value={status} onChange={setStatus} options={labels} />
      <Input label="Observação" value={obs} onChange={setObs} type="textarea" />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={async () => { setSaving(true); await onSave(status, obs); setSaving(false); }} disabled={saving}>
          {saving ? "Salvando..." : "Confirmar"}
        </Button>
      </div>
    </Modal>
  );
}