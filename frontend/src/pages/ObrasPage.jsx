import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../store/AuthContext";
import { apiFetch } from "../services/api";

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toast from "../components/ui/Toast";
import Modal from "../components/ui/Modal";

import { STATUS_OBRA_LABELS, STATUS_OBRA_COLORS, fmt } from "../utils/helpers";


// ─── OBRAS LIST ────────────────────────────────────────────────────────────────
export default function ObrasPage({ onSelect }) {
  const { can } = useAuth();
  const [obras, setObras] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    apiFetch(`/obras?${params}`).then(setObras).finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>Obras</h2>
        {can(["admin", "gestor"]) && <Button onClick={() => setShowForm(true)}>+ Nova Obra</Button>}
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Input label="" value={search} onChange={setSearch} style={{ flex: 1, minWidth: 200, marginBottom: 0 }}
            type="text" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 14, background: "#f8fafc" }}>
            <option value="">Todos os status</option>
            {Object.entries(STATUS_OBRA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </Card>
      {loading ? <p style={{ color: "#94a3b8" }}>Carregando...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {obras.map(o => (
            <Card key={o.id} style={{ cursor: "pointer", transition: "box-shadow .15s" }}
              onClick={() => onSelect(o)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <Badge label={STATUS_OBRA_LABELS[o.status]} color={STATUS_OBRA_COLORS[o.status]} />
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{o.contrato || "Sem contrato"}</span>
                  </div>
                  <h3 style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{o.nome}</h3>
                  <div style={{ fontSize: 13, color: "#64748b", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {o.municipio && <span>📍 {o.municipio}</span>}
                    {o.gestor && <span>👤 {o.gestor.nome}</span>}
                    {o.secretaria && <span>🏛️ {o.secretaria}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#1d4ed8" }}>{fmt(o.valor_contratado)}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Valor contratado</div>
                </div>
              </div>
            </Card>
          ))}
          {!obras.length && <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>Nenhuma obra encontrada.</p>}
        </div>
      )}
      {showForm && <ObraFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); setToast({ msg: "Obra cadastrada!", type: "success" }); }} />}
    </div>
  );
}

export function ObraFormModal({ onClose, onSaved, obra }) {
  const [users, setUsers] = useState([]);
  const [f, setF] = useState({
    nome: obra?.nome || "", contrato: obra?.contrato || "",
    numero_sei: obra?.numero_sei || "", descricao: obra?.descricao || "",
    valor_contratado: obra?.valor_contratado || "", valor_licitado: obra?.valor_licitado || "",
    empresa_contratada: obra?.empresa_contratada || "", cnpj_empresa: obra?.cnpj_empresa || "",
    municipio: obra?.municipio || "", secretaria: obra?.secretaria || "",
    gestor_id: obra?.gestor_id || "", fiscal_id: obra?.fiscal_id || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { apiFetch("/users").then(setUsers).catch(() => {}); }, []);

  const save = async () => {
    if (!f.nome) { setError("Nome é obrigatório"); return; }
    setSaving(true); setError("");
    try {
      const body = { ...f };
      if (body.valor_contratado) body.valor_contratado = parseFloat(body.valor_contratado);
      if (body.valor_licitado) body.valor_licitado = parseFloat(body.valor_licitado);
      if (body.gestor_id) body.gestor_id = parseInt(body.gestor_id);
      if (body.fiscal_id) body.fiscal_id = parseInt(body.fiscal_id);
      if (!body.gestor_id) delete body.gestor_id;
      if (!body.fiscal_id) delete body.fiscal_id;
      if (obra) await apiFetch(`/obras/${obra.id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await apiFetch("/obras", { method: "POST", body: JSON.stringify(body) });
      onSaved();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const u = (k) => (v) => setF(p => ({ ...p, [k]: v }));
  const userOpts = users.reduce((a, u) => ({ ...a, [u.id]: u.nome }), {});

  return (
    <Modal title={obra ? "Editar Obra" : "Nova Obra"} onClose={onClose} width={700}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Input label="Nome da Obra" value={f.nome} onChange={u("nome")} required style={{ gridColumn: "1/-1" }} />
        <Input label="Contrato" value={f.contrato} onChange={u("contrato")} />
        <Input label="Número SEI" value={f.numero_sei} onChange={u("numero_sei")} />
        <Input label="Valor Contratado (R$)" value={f.valor_contratado} onChange={u("valor_contratado")} type="number" />
        <Input label="Valor Licitado (R$)" value={f.valor_licitado} onChange={u("valor_licitado")} type="number" />
        <Input label="Empresa Contratada" value={f.empresa_contratada} onChange={u("empresa_contratada")} />
        <Input label="CNPJ" value={f.cnpj_empresa} onChange={u("cnpj_empresa")} />
        <Input label="Município" value={f.municipio} onChange={u("municipio")} />
        <Input label="Secretaria" value={f.secretaria} onChange={u("secretaria")} />
        <Input label="Gestor" value={f.gestor_id} onChange={u("gestor_id")} options={userOpts} />
        <Input label="Fiscal" value={f.fiscal_id} onChange={u("fiscal_id")} options={userOpts} />
        <Input label="Descrição" value={f.descricao} onChange={u("descricao")} type="textarea" style={{ gridColumn: "1/-1" }} />
      </div>
      {error && <div style={{ color: "#dc2626", fontSize: 13, padding: "8px 12px", background: "#fee2e2", borderRadius: 8, marginBottom: 12 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </div>
    </Modal>
  );
}