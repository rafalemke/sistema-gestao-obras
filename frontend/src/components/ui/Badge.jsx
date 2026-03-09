export default function Badge({ label, color }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    }}>{label}</span>
  );
}