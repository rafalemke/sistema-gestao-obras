import { useState, useEffect } from "react";
import { useAuth } from "../store/AuthContext";
import { apiFetch } from "../services/api";

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toast from "../components/ui/Toast";
import Modal from "../components/ui/Modal";


// ─── USERS PAGE ───────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { can } = useAuth();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => apiFetch("/users").then(setUsers);
  useEffect(() => { load(); }, []);

  const ROLE_LABELS = { admin: "Administrador", gestor: "Gestor", fiscal: "Fiscal", visualizador: "Visualizador" };
  const ROLE_COLORS = { admin: "#dc2626", gestor: "#1d4ed8", fiscal: "#0284c7", visualizador: "#64748b" };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>Usuários</h2>
        {can(["admin"]) && <Button onClick={() => setShowForm(true)}>+ Novo Usuário</Button>}
      </div>
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
              {["Nome", "E-mail", "Matrícula", "Perfil", "Setor", "Status", ""].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#475569" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{u.nome}</td>
                <td style={{ padding: "10px 12px", color: "#64748b", fontSize: 13 }}>{u.email}</td>
                <td style={{ padding: "10px 12px", color: "#64748b", fontSize: 13 }}>{u.matricula || "—"}</td>
                <td style={{ padding: "10px 12px" }}><Badge label={ROLE_LABELS[u.role]} color={ROLE_COLORS[u.role]} /></td>
                <td style={{ padding: "10px 12px", color: "#64748b", fontSize: 13 }}>{u.setor || "—"}</td>
                <td style={{ padding: "10px 12px" }}>
                  <Badge label={u.ativo ? "Ativo" : "Inativo"} color={u.ativo ? "#10b981" : "#ef4444"} />
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {can(["admin"]) && <Button size="sm" variant="ghost" onClick={() => setEditUser(u)}>Editar</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {(showForm || editUser) && (
        <UserFormModal user={editUser} onClose={() => { setShowForm(false); setEditUser(null); }} onSaved={() => { setShowForm(false); setEditUser(null); load(); setToast({ msg: editUser ? "Usuário atualizado!" : "Usuário criado!", type: "success" }); }} />
      )}
    </div>
  );
}

function UserFormModal({ user, onClose, onSaved }) {
  const [f, setF] = useState({
    nome: user?.nome || "", email: user?.email || "",
    matricula: user?.matricula || "", role: user?.role || "visualizador",
    setor: user?.setor || "", password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const u = (k) => (v) => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true); setError("");
    try {
      const body = { ...f };
      if (!body.password) delete body.password;
      if (!body.matricula) delete body.matricula;
      if (user) await apiFetch(`/users/${user.id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await apiFetch("/users", { method: "POST", body: JSON.stringify(body) });
      onSaved();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const ROLE_OPTS = { admin: "Administrador", gestor: "Gestor", fiscal: "Fiscal", visualizador: "Visualizador" };

  return (
    <Modal title={user ? "Editar Usuário" : "Novo Usuário"} onClose={onClose} width={500}>
      <Input label="Nome completo" value={f.nome} onChange={u("nome")} required />
      <Input label="E-mail" value={f.email} onChange={u("email")} type="email" required />
      <Input label="Matrícula" value={f.matricula} onChange={u("matricula")} />
      <Input label="Perfil" value={f.role} onChange={u("role")} options={ROLE_OPTS} />
      <Input label="Setor" value={f.setor} onChange={u("setor")} />
      <Input label={user ? "Nova Senha (deixe em branco para manter)" : "Senha"} value={f.password} onChange={u("password")} type="password" />
      {error && <div style={{ color: "#dc2626", fontSize: 13, padding: "8px 12px", background: "#fee2e2", borderRadius: 8, marginBottom: 12 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </div>
    </Modal>
  );
}