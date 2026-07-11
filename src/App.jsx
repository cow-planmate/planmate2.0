import React, { useEffect } from 'react';
import Router from "./shared/Router.jsx";
import "tailwindcss/tailwind.css";
import './App.css'
import { ServerDownToast } from "./components/common/Toast";
import useServerStatusStore from "./store/ServerStatus";
import Maintenance from "./pages/Maintenance";
import ConfirmModal from "./components/common/ConfirmModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const { isServerDown } = useServerStatusStore();
  const isMaintenance = import.meta.env.VITE_MAINTENANCE === "true";

  useEffect(() => {
    if (isServerDown) {
      ServerDownToast();
    }
  }, [isServerDown]);

  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ConfirmModal />
    </QueryClientProvider>
  )
}

export default App;