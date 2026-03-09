import { useState } from "react";
// Importe os contextos e serviços
import { AuthProvider, useAuth } from "./store/AuthContext";

// Importe as páginas
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ObrasPage from "./pages/ObrasPage";
import ObraDetail from "./pages/ObraDetail";
import UsersPage from "./pages/UsersPage";

// Importe os componentes de UI que ficaram no App (ex: Button, Badge)

import Layout from "./components/Layout";




// ─── APP ──────────────────────────────────────────────────────────────────────
function App() {
  const { user } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [selectedObra, setSelectedObra] = useState(null);

  if (!user) return <LoginPage />;

  const handleSelectObra = (obra) => { setSelectedObra(obra); setPage("obra_detail"); };
  const handleBackToObras = () => { setSelectedObra(null); setPage("obras"); };

  return (
    <Layout page={page} setPage={(p) => { setPage(p); setSelectedObra(null); }}>
      {page === "dashboard" && <DashboardPage onNavigate={setPage} />}
      {page === "obras" && <ObrasPage onSelect={handleSelectObra} />}
      {page === "obra_detail" && selectedObra && <ObraDetail obra={selectedObra} onBack={handleBackToObras} />}
      {page === "users" && <UsersPage />}
    </Layout>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}