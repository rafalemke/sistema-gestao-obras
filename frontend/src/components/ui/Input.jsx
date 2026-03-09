export default function Input({ label, value, onChange, type = "text", required, options, style = {} }) {
  const inputStyle = {
    width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
    padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box",
    background: "#f8fafc", marginTop: 4,
  };
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block" }}>{label}{required && " *"}</label>}
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
          <option value="">Selecione...</option>
          {Object.entries(options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} style={inputStyle} />
      )}
    </div>
  );
}