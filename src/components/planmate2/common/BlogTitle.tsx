import { useLayoutEffect, useRef } from 'react';

interface BlogTitleProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

export function BlogTitle({ id, value, onChange, placeholder, required }: BlogTitleProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const resize = () => {
      if (!ref.current) return;
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [value]);

  return <textarea ref={ref} id={id} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} maxLength={255} required={required} rows={1} className="block w-full resize-none overflow-hidden bg-transparent text-2xl font-bold leading-tight tracking-[-0.03em] text-[#16181d] outline-none placeholder:text-[#c0c5ce] sm:text-4xl" />;
}
