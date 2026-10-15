// src/components/ui/Select.jsx
import { forwardRef } from 'react';

export const Select = forwardRef(({ label, options, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select ref={ref} className={`w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${className}`} {...props}>
      {options.map(opt => (typeof opt === 'string'
        ? <option key={opt} value={opt}>{opt}</option>
        : <option key={opt.value} value={opt.value}>{opt.label}</option>))}
    </select>
  </div>
));
Select.displayName = 'Select';