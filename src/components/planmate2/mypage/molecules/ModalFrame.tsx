import { X } from 'lucide-react';
import React from 'react';

interface ModalFrameProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  headerType?: 'gradient' | 'standard';
  closeOnOverlayClick?: boolean;
}

export const ModalFrame: React.FC<ModalFrameProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  headerType = 'standard',
  closeOnOverlayClick = true,
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div className={`relative bg-white rounded-3xl w-full ${maxWidthClasses[maxWidth]} shadow-2xl animate-in zoom-in duration-200`}>
        {headerType === 'gradient' ? (
          <div className="relative h-32 bg-gradient-to-r from-[#1344FF] to-[#3B82F6] rounded-t-3xl overflow-hidden">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all shadow-sm z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          title && (
            <div className="p-8 pb-0 flex items-center justify-between">
              <div>
                {typeof title === 'string' ? (
                  <h2 className="text-2xl font-black text-[#1a1a1a]">{title}</h2>
                ) : (
                  <div className="text-2xl font-black text-[#1a1a1a]">{title}</div>
                )}
                {subtitle && <p className="text-gray-400 text-sm font-medium mt-1">{subtitle}</p>}
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          )
        )}
        <div className={`relative ${headerType === 'gradient' ? 'pt-16 pb-8 px-8' : 'p-8'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
