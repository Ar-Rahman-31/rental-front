// src/components/ui/Card.jsx
export function Card({ children, className = '', ...props }) {
  return <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`} {...props}>{children}</div>;
}