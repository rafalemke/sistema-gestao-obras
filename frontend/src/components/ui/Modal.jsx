export default function Modal({ title, children, onClose, width = 600 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0007", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28, width, maxWidth: "100%",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px #0003",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}