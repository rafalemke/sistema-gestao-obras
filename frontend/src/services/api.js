const API = "http://localhost:8000/api/v1";

function getToken() { return localStorage.getItem("token"); }

export async function apiFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  });
  if (res.status === 401) { localStorage.clear(); window.location.reload(); }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erro na requisição");
  }
  return res.status === 204 ? null : res.json();
}