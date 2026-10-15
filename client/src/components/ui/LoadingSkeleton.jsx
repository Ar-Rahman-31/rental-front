// src/components/ui/LoadingSkeleton.jsx
export function LoadingSkeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} aria-hidden="true" />;
}