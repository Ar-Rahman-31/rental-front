// src/components/ui/ErrorMessage.jsx
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-red-50 border border-red-200 rounded-xl">
      <AlertCircle className="h-10 w-10 text-red-500 mb-3" aria-hidden="true" />
      <p className="text-red-800">{message}</p>
      {onRetry && <Button variant="outline" className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}