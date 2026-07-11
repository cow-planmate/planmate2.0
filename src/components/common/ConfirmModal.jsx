import React, { useEffect, useState } from 'react';
import useConfirmStore from '../../store/Confirm.jsx';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ConfirmModal() {
  const { isOpen, message, confirm, cancel } = useConfirmStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setRender(false);
      }, 300); // 300ms transition matching toastify defaults
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!render) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-start pointer-events-auto transition-colors duration-300 ${isAnimating ? 'bg-black/30' : 'bg-transparent'}`}>
      <div
        className={`mt-6 font-pretendard text-gray-700 bg-white rounded-md shadow-lg sm:w-[400px] w-[90%] break-keep flex flex-col p-5 transform transition-all duration-300 ease-in-out ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
          }`}
      >
        <div className='flex gap-3'>
          <div className='text-main font-bold text-3xl'><FontAwesomeIcon icon={faCircleQuestion} /></div>
          <div className="text-base mb-6 text-gray-700 whitespace-pre-wrap">
            {message}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={cancel}
            className="px-5 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors focus:outline-none"
          >
            취소
          </button>
          <button
            onClick={confirm}
            className="px-5 py-2 text-sm font-medium bg-main text-white rounded hover:bg-mainDark transition-colors shadow-sm focus:outline-none"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
