interface PageLoadingProps {
  message?: string;
  overlay?: boolean;
  className?: string;
}

/** 페이지 전환 및 페이지 단위 데이터 로딩에 사용하는 공통 로딩 화면 */
export default function PageLoading({
  message = '페이지를 불러오는 중이에요',
  overlay = false,
  className = '',
}: PageLoadingProps) {
  const positioning = overlay
    ? 'fixed inset-0 z-[9999] bg-white/90 backdrop-blur-[2px]'
    : 'min-h-[calc(100vh-70px)] bg-[#f8f9fa]';

  return (
    <div
      className={`${positioning} flex w-full items-center justify-center px-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <span
          className="h-7 w-7 animate-spin rounded-full border-2 border-[#1344FF]/15 border-t-[#1344FF] motion-reduce:animate-none"
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-[#666666]">{message}</span>
      </div>
    </div>
  );
}
