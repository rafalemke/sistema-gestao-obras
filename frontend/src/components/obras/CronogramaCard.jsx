import { useState } from "react";
import { apiFetch } from "../../services/api";

// Componentes de UI genéricos
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

// Helpers
import { fmt } from "../../utils/helpers";


// ─── CRONOGRAMA CARD ──────────────────────────────────────────────────────────
export default function CronogramaCard({ cronograma, can, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const totalPrevisto = cronograma.itens.reduce((s, i) => s + (parseFloat(i.percentual_previsto) || 0), 0);
  const totalRealizado = cronograma.itens.reduce((s, i) => s + (parseFloat(i.percentual_realizado) || 0), 0);
  const avgRealizado = cronograma.itens.length ? (totalRealizado / cronograma.itens.length).toFixed(1) : 0;

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setExpanded(v => !v)}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Cronograma v{cronograma.versao}</span>
          {cronograma.is_vigente && <span style={{ marginLeft: 8, background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>VIGENTE</span>}
          <span style={{ marginLeft: 8, fontSize: 13, color: "#94a3b8" }}>{cronograma.descricao}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>{avgRealizado}% realizado</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{cronograma.itens.length} itens</div>
          </div>
          <span style={{ color: "#94a3b8" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["#", "Descrição", "Und", "Qtd", "Valor Total", "% Previsto", "% Realizado"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cronograma.itens.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 10px", color: "#94a3b8" }}>{item.ordem || i + 1}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 600 }}>{item.descricao}</td>
                  <td style={{ padding: "8px 10px" }}>{item.unidade || "—"}</td>
                  <td style={{ padding: "8px 10px" }}>{item.quantidade || "—"}</td>
                  <td style={{ padding: "8px 10px" }}>{fmt(item.valor_total)}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <ProgressBar value={item.percentual_previsto} color="#3b82f6" />
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <ProgressBar value={item.percentual_realizado} color="#10b981" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {can(["admin", "gestor", "fiscal"]) && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button size="sm" variant="secondary" onClick={() => setShowEdit(true)}>Editar Cronograma</Button>
              {!cronograma.is_vigente && (
                <Button size="sm" variant="success" onClick={async () => {
                  await apiFetch(`/cronogramas/${cronograma.id}`, { method: "PATCH", body: JSON.stringify({ is_vigente: true }) });
                  onRefresh();
                }}>Definir como Vigente</Button>
              )}
            </div>
          )}
        </div>
      )}
      {showEdit && (
        <CronogramaFormModal cronograma={cronograma} obraId={cronograma.obra_id} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); onRefresh(); }} />
      )}
    </Card>
  );
}

function ProgressBar({ value, color }) {
  const pct = Math.min(100, Math.max(0, parseFloat(value) || 0));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 36 }}>{pct}%</span>
    </div>
  );
}

function CronogramaFormModal({ cronograma, obraId, onClose, onSaved }) {
  const [f, setF] = useState({
    descricao: cronograma?.descricao || "",
    data_inicio: cronograma?.data_inicio || "",
    data_fim: cronograma?.data_fim || "",
  });
  const [itens, setItens] = useState(cronograma?.itens?.length ? cronograma.itens.map(i => ({ ...i })) : [
    { descricao: "", unidade: "", quantidade: "", valor_total: "", percentual_previsto: "", ordem: 1 }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addItem = () => setItens(p => [...p, { descricao: "", unidade: "", quantidade: "", valor_total: "", percentual_previsto: "", ordem: p.length + 1 }]);
  const updItem = (i, k, v) => setItens(p => p.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

  const save = async () => {
    setSaving(true); setError("");
    try {
      const body = {
        ...f,
        obra_id: obraId,
        itens: itens.map(i => ({
          descricao: i.descricao,
          unidade: i.unidade || null,
          quantidade: i.quantidade ? parseFloat(i.quantidade) : null,
          valor_total: i.valor_total ? parseFloat(i.valor_total) : null,
          percentual_previsto: i.percentual_previsto ? parseFloat(i.percentual_previsto) : 0,
          ordem: parseInt(i.ordem) || 0,
        })).filter(i => i.descricao),
      };
      if (cronograma) await apiFetch(`/cronogramas/${cronograma.id}`, { method: "PATCH", body: JSON.stringify(f) });
      else await apiFetch("/cronogramas", { method: "POST", body: JSON.stringify(body) });
      onSaved();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const u = (k) => (v) => setF(p => ({ ...p, [k]: v }));

  return (
    <Modal title={cronograma ? "Editar Cronograma" : "Novo Cronograma"} onClose={onClose} width={800}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
        <Input label="Descrição" value={f.descricao} onChange={u("descricao")} style={{ gridColumn: "1/-1" }} />
        <Input label="Data Início" value={f.data_inicio} onChange={u("data_inicio")} type="date" />
        <Input label="Data Fim" value={f.data_fim} onChange={u("data_fim")} type="date" />
      </div>
      {!cronograma && (
        <>
          <h4 style={{ fontWeight: 700, margin: "8px 0" }}>Itens do Cronograma</h4>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 8 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["#", "Descrição", "Unidade", "Qtd", "Valor Total", "% Previsto"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itens.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: "4px 6px" }}><input value={item.ordem} onChange={e => updItem(i, "ordem", e.target.value)} style={{ width: 40, border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 6px" }} /></td>
                  <td style={{ padding: "4px 6px" }}><input value={item.descricao} onChange={e => updItem(i, "descricao", e.target.value)} style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 6px" }} /></td>
                  <td style={{ padding: "4px 6px" }}><input value={item.unidade} onChange={e => updItem(i, "unidade", e.target.value)} style={{ width: 60, border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 6px" }} /></td>
                  <td style={{ padding: "4px 6px" }}><input type="number" value={item.quantidade} onChange={e => updItem(i, "quantidade", e.target.value)} style={{ width: 70, border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 6px" }} /></td>
                  <td style={{ padding: "4px 6px" }}><input type="number" value={item.valor_total} onChange={e => updItem(i, "valor_total", e.target.value)} style={{ width: 100, border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 6px" }} /></td>
                  <td style={{ padding: "4px 6px" }}><input type="number" value={item.percentual_previsto} onChange={e => updItem(i, "percentual_previsto", e.target.value)} style={{ width: 70, border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 6px" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button size="sm" variant="secondary" onClick={addItem}>+ Adicionar Item</Button>
        </>
      )}
      {error && <div style={{ color: "#dc2626", fontSize: 13, padding: "8px 12px", background: "#fee2e2", borderRadius: 8, margin: "8px 0" }}>{error}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </div>
    </Modal>
  );
}