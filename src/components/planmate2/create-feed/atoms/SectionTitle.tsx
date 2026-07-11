import React from 'react';

interface SectionTitleProps {
  title: string;
  required?: boolean;
  children?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, required, children }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-black text-[#1a1a1a]">
      {title} {required && <span className="text-red-500">*</span>}
    </h2>
    {children}
  </div>
);
