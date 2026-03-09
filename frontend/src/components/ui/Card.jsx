export default function Card({ children, style = {}, ...props }) {
  return (
    <div 
      style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px #0001", padding: 24, ...style }} 
      {...props}
    >
      {children}
    </div>
  );
}