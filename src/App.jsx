import React, { useEffect } from 'react';
import Router from "./shared/Router.jsx";
import "tailwindcss/tailwind.css";
import './App.css'
import { ServerDownToast } from "./components/common/Toast";
import useServerStatusStore from "./store/ServerStatus";
import Maintenance from "./pages/Maintenance";
import ConfirmModal from "./components/common/ConfirmModal";
import AppOrWebPrompt from "./components/common/AppOrWebPrompt";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  destinationQueryKeys,
  fetchDestinationList,
} from "./utils/destinationCache";

const queryClient = new QueryClient();

function App() {
  const { isServerDown } = useServerStatusStore();
  const isMaintenance = import.meta.env.VITE_MAINTENANCE === "true";

  useEffect(() => {
    if (isServerDown) {
      ServerDownToast();
    }
  }, [isServerDown]);

  useEffect(() => {
    if (isMaintenance) return;

    // 기본 여행지 목록은 앱 최초 진입 시 로컬 캐시를 사용해 ETag로 한 번만 재검증합니다.
    void queryClient.prefetchQuery({
      queryKey: destinationQueryKeys.featured,
      queryFn: fetchDestinationList,
      staleTime: 0,
      gcTime: Infinity,
    });
  }, [isMaintenance]);

  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ConfirmModal />
      <AppOrWebPrompt />
    </QueryClientProvider>
  )
}

export default App;
