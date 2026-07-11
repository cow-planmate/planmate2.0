import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "py-3 px-6 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#1344FF] text-white shadow-lg shadow-blue-200 hover:bg-[#0031E5]",
    secondary: "bg-gray-100 text-gray-500 hover:bg-gray-200",
    danger: "bg-red-500 text-white shadow-lg shadow-red-100 hover:bg-red-600",
    outline: "bg-white border-2 border-gray-100 text-gray-600 hover:border-[#1344FF]/30",
    ghost: "bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
