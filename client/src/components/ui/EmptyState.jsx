// src/components/ui/EmptyState.jsx
import { Car, CalendarX } from 'lucide-react';

export function EmptyState({ icon: Icon = Car, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon className="h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}