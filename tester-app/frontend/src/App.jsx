import { useState, useEffect } from 'react'
import './App.css'
import Dashboard from './Pages/Dashboard'
import Login from './Pages/Login'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("tester_token") || "");

  const handleLogin = (newToken) => {
    localStorage.setItem("tester_token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("tester_token");
    setToken("");
  };

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return <Dashboard token={token} onLogout={handleLogout} />
}

export default App
