import { toast, Slide } from "react-toastify";

export function ErrorToast(str) {
  return toast.error(str, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Slide,
    className: "font-pretendard text-gray-700 sm:w-[400px] break-keep",
  });
}

export function SuccessToast(str) {
  return toast.success(str, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Slide,
    className: "font-pretendard text-gray-700 sm:w-[400px] break-keep",
  });
}

export function WarningToast(str) {
  return toast.warning(str, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Slide,
    className: "font-pretendard text-gray-700 sm:w-[400px] break-keep",
  });
}

export function ServerDownToast() {
  return toast.error(ServerDown, {
    toastId: "server-down",
    autoClose: false,
    theme: "colored",
    closeButton: false,
  });
}

function ServerDown({ closeToast }) {
  const handleRefresh = () => {
    closeToast();
    window.location.reload();
  };

  return (
    <div className="flex flex-col w-full font-pretendard">
      <h3 className="text-sm font-semibold text-white">서버 연결 오류</h3>
      <div className="flex items-center justify-between">
        <p className="text-sm text-white break-keep">
          일시적인 오류이거나 서버 점검이 진행 중일 수 있습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>
        <div className="ml-1.5 flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            className={
              "break-keep transition-all text-xs border rounded-md px-4 py-2 text-white active:scale-[.95] bg-transparent"
            }
          >
            새로고침
          </button>
          <button
            type="button"
            onClick={closeToast}
            aria-label="서버 연결 오류 알림 닫기"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/60 bg-transparent text-xl leading-none text-white transition-all hover:bg-white/10 active:scale-[.95]"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}
