import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { initializeAuth } from './shared/auth/tokenStore'

const root = createRoot(document.getElementById('root'))

const renderApp = async () => {
  // 만료 토큰으로 초기 API/SSE 요청이 한꺼번에 나가기 전에 세션을 먼저 복원한다.
  await initializeAuth()
  root.render(<App />)
}

void renderApp()
