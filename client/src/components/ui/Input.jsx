
// src/components/ui/Input.jsx

import { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      leftIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            className={`
              w-full rounded-lg border py-2 text-gray-900
              placeholder-gray-400
              focus:border-transparent focus:outline-none focus:ring-2
              focus:ring-primary-500
              ${leftIcon ? 'pl-10 pr-3' : 'px-3'}
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={
              error && id ? `${id}-error` : undefined
            }
            {...props}
          />
        </div>

        {error && (
          <p
            id={id ? `${id}-error` : undefined}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';