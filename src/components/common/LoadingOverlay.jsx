export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="flex gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-100"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  );
}
