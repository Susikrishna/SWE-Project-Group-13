import './App.css'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './components/LoginPage'
import Home from './pages/Home'
import GenericMfePage from './components/GenericMfePage'
import ApiTester from './pages/ApiTester'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          {/* Dynamic route matching MFE modules from the DB config */}
          <Route path="/dashboard" element={<ProtectedRoute><GenericMfePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><GenericMfePage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><GenericMfePage /></ProtectedRoute>} />
          
          <Route path="/api-tester" element={
            <ProtectedRoute><ApiTester /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

