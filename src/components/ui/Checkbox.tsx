import React from 'react';
import { clsx } from 'clsx';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  onChange?: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helperText,
  onChange,
  className,
  id,
  checked,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className={clsx(
            'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
            error && 'border-red-300 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="ml-2 block text-sm text-gray-700">
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Checkbox; 