import React from 'react';

interface FormItemProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  helperText?: string;
  isError?: boolean;
}

export const FormItem: React.FC<FormItemProps> = ({ 
  label, 
  children, 
  className = '', 
  helperText,
  isError 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {helperText && (
        <p className={`text-[11px] mt-1 font-medium ${isError ? 'text-red-500' : 'text-green-600'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};
