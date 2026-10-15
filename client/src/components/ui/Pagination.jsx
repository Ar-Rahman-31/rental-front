// src/components/ui/Pagination.jsx
import React from 'react';

export function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = [];
  const delta = 1;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= delta) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button onClick={() => onChange(current - 1)} disabled={current === 1} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50">Prev</button>
      {pages.map((p, i) => (
        <React.Fragment key={i}>
          {p === '…' && <span className="px-2 text-gray-400">…</span>}
          {p !== '…' && (
            <button
              onClick={() => onChange(p)}
              className={`px-3 py-1 rounded ${p === current ? 'bg-primary-600 text-white' : 'border border-gray-300'}`}
            >
              {p}
            </button>
          )}
        </React.Fragment>
      ))}
      <button onClick={() => onChange(current + 1)} disabled={current === total} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50">Next</button>
    </nav>
  );
}