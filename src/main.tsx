import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// StrictMode 제거 — Klleon SDK는 글로벌 상태를 사용하므로
// StrictMode의 double-mount가 destroy/init 사이클을 깨뜨림
createRoot(document.getElementById('root')!).render(<App />)
