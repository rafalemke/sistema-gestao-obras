import { useState } from "react";
import { useAuth } from "../store/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try { await login(email, password); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 48, width: 400,
        boxShadow: "0 25px 80px #0005",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#1d4ed8,#0284c7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, margin: "0 auto 16px",
          }}>🏗️</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>GestãoObras</h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: "6px 0 0" }}>Sistema Estadual de Obras Públicas</p>
        </div>
        <form onSubmit={handle}>
          <Input label="E-mail" value={email} onChange={setEmail} type="email" required />
          <Input label="Senha" value={password} onChange={setPassword} type="password" required />
          {error && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "#fee2e2", borderRadius: 8 }}>{error}</div>}
          <Button onClick={() => {}} disabled={loading} style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}