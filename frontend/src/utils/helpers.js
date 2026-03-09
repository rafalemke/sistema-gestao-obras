// ─── Helpers ─────────────────────────────────────────────────────────────────
export const STATUS_OBRA_LABELS = {
  em_elaboracao: "Em Elaboração", licitacao: "Licitação",
  contratada: "Contratada", em_execucao: "Em Execução",
  paralisada: "Paralisada", concluida: "Concluída",
  rescindida: "Rescindida", cancelada: "Cancelada",
};
export const STATUS_OBRA_COLORS = {
  em_elaboracao: "#6366f1", licitacao: "#f59e0b", contratada: "#3b82f6",
  em_execucao: "#10b981", paralisada: "#ef4444", concluida: "#059669",
  rescindida: "#dc2626", cancelada: "#6b7280",
};
export const STATUS_BM_LABELS = {
  elaboracao: "Elaboração", enviado: "Enviado", em_analise: "Em Análise",
  aprovado: "Aprovado", pago: "Pago", glosado: "Glosado", cancelado: "Cancelado",
};
export const STATUS_BM_COLORS = {
  elaboracao: "#6366f1", enviado: "#3b82f6", em_analise: "#f59e0b",
  aprovado: "#10b981", pago: "#059669", glosado: "#ef4444", cancelado: "#6b7280",
};

export const fmt = (v) => v != null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v) : "—";
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";
