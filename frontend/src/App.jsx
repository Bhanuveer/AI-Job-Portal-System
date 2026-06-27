import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Routes will be added feature by feature */}
          <Route path="/" element={<div className="p-8 text-center text-slate-600 text-xl">JobPilot — Initialized ✓</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
