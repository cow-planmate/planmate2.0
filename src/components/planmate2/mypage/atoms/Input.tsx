import { Check, TriangleAlert } from 'lucide-react';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isValid?: boolean | null;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  isValid, 
  rightElement, 
  className = '', 
  ...props 
}) => {
  const borderClass = isValid === true ? 'border-green-500 bg-green-50/30' : 
                      isValid === false ? 'border-red-500 bg-red-50/30' : 
                      'border-gray-100 focus:border-[#1344FF] bg-gray-50';

  return (
    <div className="relative w-full">
      <input
        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all font-medium ${borderClass} ${className}`}
        {...props}
      />
      {isValid !== undefined && isValid !== null && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValid ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <TriangleAlert className="w-5 h-5 text-red-500" />
          )}
        </div>
      )}
      {rightElement && !isValid && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  );
};
